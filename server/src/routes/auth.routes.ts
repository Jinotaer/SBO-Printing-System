import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/ApiResponse.js";
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  recaptchaSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";
import { MongooseUserRepository } from "../repositories/user.repository.js";
import { AuthService } from "../services/auth.service.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { strictLimiter } from "../middleware/rateLimiter.js";
import { verifyRecaptcha } from "../utils/recaptcha.js";

const router = Router();
const service = new AuthService(new MongooseUserRepository());

// POST /api/auth/register — public, strict rate limit
router.post(
  "/register",
  strictLimiter,
  asyncHandler(async (req, res) => {
    const dto = registerSchema.parse(req.body);
    const result = await service.register(dto);
    const userJson = result.user.toJSON() as unknown as Record<string, unknown>;
    res.status(201).json(
      successResponse({
        user: userJson,
        token: result.token,
      })
    );
  })
);

// POST /api/auth/login — public, strict rate limit
router.post(
  "/login",
  strictLimiter,
  asyncHandler(async (req, res) => {
    const dto = loginSchema.parse(req.body);
    const result = await service.login(dto);
    const userJson = result.user.toJSON() as unknown as Record<string, unknown>;
    res.json(
      successResponse({
        user: userJson,
        token: result.token,
      })
    );
  })
);

// POST /api/auth/google — real Google OAuth (ID token verification), strict rate limit
// reCAPTCHA verified if RECAPTCHA_SECRET is set
router.post(
  "/google",
  strictLimiter,
  asyncHandler(async (req, res) => {
    const dto = googleAuthSchema.parse(req.body);
    if (dto.recaptchaToken) {
      await verifyRecaptcha(dto.recaptchaToken, req.ip);
    } else if (process.env["RECAPTCHA_SECRET"]) {
      // Enforce when secret is configured
      await verifyRecaptcha("", req.ip);
    }
    const result = await service.googleLogin(dto.idToken);
    const userJson = result.user.toJSON() as unknown as Record<string, unknown>;
    res.json(
      successResponse({
        user: userJson,
        token: result.token,
      })
    );
  })
);

// POST /api/auth/verify-recaptcha — standalone verification (for login/register forms)
router.post(
  "/verify-recaptcha",
  strictLimiter,
  asyncHandler(async (req, res) => {
    const dto = recaptchaSchema.parse(req.body);
    await verifyRecaptcha(dto.recaptchaToken, req.ip);
    res.json(successResponse({ verified: true }));
  })
);

// GET /api/auth/me — protected
router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!.userId;
    const user = await service.me(userId);
    const userJson = user.toJSON() as unknown as Record<string, unknown>;
    res.json(successResponse({ user: userJson }));
  })
);

// POST /api/auth/logout — client discards token; server endpoint for consistency
router.post(
  "/logout",
  requireAuth,
  asyncHandler(async (_req: AuthRequest, res) => {
    res.json(successResponse({ message: "Logged out" }));
  })
);

// POST /api/auth/forgot-password — public, rate-limited
router.post(
  "/forgot-password",
  strictLimiter,
  asyncHandler(async (req, res) => {
    const dto = forgotPasswordSchema.parse(req.body);
    const result = await service.forgotPassword(dto.email);
    res.json(successResponse(result));
  })
);

// POST /api/auth/reset-password — public, rate-limited
router.post(
  "/reset-password",
  strictLimiter,
  asyncHandler(async (req, res) => {
    const dto = resetPasswordSchema.parse(req.body);
    const result = await service.resetPassword(dto.token, dto.password);
    res.json(successResponse(result));
  })
);

export default router;
