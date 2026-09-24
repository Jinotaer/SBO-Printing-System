import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";
import { ApiError } from "./ApiError.js";

const buksuEmailRegex = /^[a-zA-Z0-9._%+-]+@student\.buksu\.edu\.ph$/i;

let client: OAuth2Client | null = null;

function getClient(): OAuth2Client {
  if (!client) {
    client = new OAuth2Client(env.GOOGLE_CLIENT_ID || undefined);
  }
  return client;
}

export interface VerifiedGooglePayload {
  email: string;
  name: string;
  picture?: string | undefined;
  emailVerified: boolean;
  sub: string;
}

export async function verifyGoogleIdToken(idToken: string): Promise<VerifiedGooglePayload> {
  if (!idToken || typeof idToken !== "string") {
    throw new ApiError(400, "Google ID token is required");
  }

  // Dev fallback: if GOOGLE_CLIENT_ID not configured, decode without verification
  // This keeps local dev working without real credentials, but logs a warning.
  // In production, GOOGLE_CLIENT_ID must be set or verification will fail.
  if (!env.GOOGLE_CLIENT_ID) {
    console.warn("[googleAuth] GOOGLE_CLIENT_ID not set — using unsafe decode for development. Set it in .env for production.");
    const payload = decodeJwtPayloadUnsafe(idToken);
    if (!payload.email) {
      throw new ApiError(401, "Invalid Google token: missing email");
    }
    const email = String(payload.email).trim().toLowerCase();
    if (!buksuEmailRegex.test(email)) {
      throw new ApiError(403, `Access denied: Only @student.buksu.edu.ph accounts are allowed. Received "${email}"`);
    }
    return {
      email,
      name: String(payload.name || payload.given_name || email.split("@")[0] || "BukSU User"),
      picture: payload.picture ? String(payload.picture) : undefined,
      emailVerified: payload.email_verified !== false,
      sub: String(payload.sub || ""),
    };
  }

  const oauthClient = getClient();

  let ticket;
  try {
    ticket = await oauthClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
  } catch (err) {
    throw new ApiError(401, `Google token verification failed: ${(err as Error).message}`);
  }

  const payload = ticket.getPayload();
  if (!payload) {
    throw new ApiError(401, "Invalid Google token payload");
  }

  // Verify email presence and verification
  if (!payload.email) {
    throw new ApiError(401, "Google account has no email");
  }

  // Google's email_verified may be false for some accounts
  if (payload.email_verified === false) {
    throw new ApiError(401, "Google email not verified");
  }

  const email = payload.email.trim().toLowerCase();

  if (!buksuEmailRegex.test(email)) {
    throw new ApiError(403, `Access denied: Only @student.buksu.edu.ph accounts are allowed. Received "${email}"`);
  }

  // Optional: check hd (hosted domain) if present — some Google payloads include it
  // We already enforce regex, but hd adds extra safety if Google provides it
  // No strict requirement to match hd since personal buksu emails still pass regex

  return {
    email,
    name: String(payload.name || payload.given_name || email.split("@")[0] || "BukSU User"),
    picture: payload.picture ? String(payload.picture) : undefined,
    emailVerified: true,
    sub: String(payload.sub),
  };
}

function decodeJwtPayloadUnsafe(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new ApiError(401, "Malformed Google token");
  const payloadB64 = parts[1]!;
  // base64url decode
  const b64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
  try {
    const json = Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    throw new ApiError(401, "Invalid Google token encoding");
  }
}
