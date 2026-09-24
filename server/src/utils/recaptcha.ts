import { env } from "../config/env.js";
import { ApiError } from "./ApiError.js";

interface RecaptchaVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export async function verifyRecaptcha(token: string, remoteIp?: string): Promise<void> {
  if (!token || typeof token !== "string") {
    throw new ApiError(400, "reCAPTCHA token is required. Please complete the captcha.");
  }

  // Dev bypass: if no secret configured, warn and skip verification (allows local dev without keys)
  if (!env.RECAPTCHA_SECRET) {
    console.warn("[recaptcha] RECAPTCHA_SECRET not set — skipping verification for development.");
    return;
  }

  const params = new URLSearchParams({
    secret: env.RECAPTCHA_SECRET,
    response: token,
  });
  if (remoteIp) params.set("remoteip", remoteIp);

  let res: Response;
  try {
    res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
  } catch (err) {
    throw new ApiError(503, `reCAPTCHA verification failed: ${(err as Error).message}`);
  }

  let data: RecaptchaVerifyResponse;
  try {
    data = (await res.json()) as RecaptchaVerifyResponse;
  } catch {
    throw new ApiError(503, "Invalid reCAPTCHA verification response");
  }

  if (!data.success) {
    const codes = data["error-codes"]?.join(", ") || "unknown";
    throw new ApiError(400, `reCAPTCHA verification failed: ${codes}`);
  }

  // For reCAPTCHA v3, also check score if present
  if (typeof data.score === "number" && data.score < env.RECAPTCHA_MIN_SCORE) {
    throw new ApiError(400, `reCAPTCHA score too low (${data.score}). Please try again.`);
  }
}
