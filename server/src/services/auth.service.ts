import crypto from "node:crypto";
import { ApiError } from "../utils/ApiError.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { verifyGoogleIdToken } from "../utils/googleAuth.js";
import { emailService } from "./email.service.js";
import type { UserRepository } from "../repositories/user.repository.js";
import type { RegisterDto, LoginDto } from "../validators/auth.validator.js";
import type { UserDoc } from "../models/User.model.js";

export interface AuthResult {
  user: UserDoc;
  token: string;
}

export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new ApiError(409, "An account with this BukSU email already exists");
    }

    // Google-only flow: no password required. For password provider hash the password, otherwise generate a random placeholder.
    const rawPassword = dto.password ?? crypto.randomBytes(32).toString("hex");
    const passwordHash = await hashPassword(rawPassword);
    const user = await this.userRepo.create({
      name: dto.name,
      studentId: dto.studentId,
      email: dto.email,
      passwordHash,
      department: dto.department,
      role: dto.role,
      provider: dto.provider ?? "google",
    });

    const token = signToken({ userId: (user._id as unknown as string).toString(), email: user.email, role: user.role });

    return { user, token };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    // Google SSO simulation (legacy email-only fallback): if googleLogin true or password missing, allow email-only lookup
    // Kept for backward compat with mock modal, but real Google flow should use googleLogin() below
    const isGoogleLogin = dto.googleLogin === true || dto.password === undefined || dto.password === "";

    if (isGoogleLogin) {
      const user = await this.userRepo.findByEmail(dto.email);
      if (!user) {
        throw new ApiError(404, `The email "${dto.email}" is not yet registered. Please register first.`);
      }
      const token = signToken({ userId: (user._id as unknown as string).toString(), email: user.email, role: user.role });
      return { user, token };
    }

    // Password flow
    const user = await this.userRepo.findByEmailWithPassword(dto.email);
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    if (!user.passwordHash) {
      throw new ApiError(401, "This account was created with Google. Please sign in with Google.");
    }

    const ok = await verifyPassword(dto.password!, user.passwordHash);
    if (!ok) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Fetch clean user without passwordHash for response
    const cleanUser = await this.userRepo.findByEmail(dto.email);
    if (!cleanUser) throw new ApiError(500, "User not found after auth");

    const token = signToken({ userId: (cleanUser._id as unknown as string).toString(), email: cleanUser.email, role: cleanUser.role });
    return { user: cleanUser, token };
  }

  /**
   * Real Google OAuth login — verifies ID token via google-auth-library,
   * enforces @student.buksu.edu.ph domain, then issues app JWT.
   * If user not found, throws 404 so frontend can redirect to registration.
   */
  async googleLogin(idToken: string): Promise<AuthResult> {
    const payload = await verifyGoogleIdToken(idToken);

    const existing = await this.userRepo.findByEmail(payload.email);
    if (!existing) {
      throw new ApiError(404, `The email "${payload.email}" is not yet registered. Please register first.`);
    }

    // Optionally update avatar/name from Google if missing?
    // Keep existing record as source of truth — do not overwrite department/role

    const token = signToken({
      userId: (existing._id as unknown as string).toString(),
      email: existing.email,
      role: existing.role,
    });
    return { user: existing, token };
  }

  /**
   * Optional Google auto-provisioning — creates account from verified Google profile
   * if you want "Sign in with Google" to auto-register. Not used by default.
   */
  async googleLoginOrCreate(idToken: string): Promise<AuthResult & { isNew: boolean }> {
    const payload = await verifyGoogleIdToken(idToken);
    const existing = await this.userRepo.findByEmail(payload.email);
    if (existing) {
      const token = signToken({
        userId: (existing._id as unknown as string).toString(),
        email: existing.email,
        role: existing.role,
      });
      return { user: existing, token, isNew: false };
    }

    // Auto-create — derive studentId from email prefix or sub as fallback
    const placeholderHash = await hashPassword(crypto.randomBytes(32).toString("hex"));
    const studentId = `GOOGLE-${payload.sub.slice(-8).toUpperCase()}`;
    const createPayload: {
      name: string;
      studentId: string;
      email: string;
      passwordHash: string;
      department?: string;
      role?: string;
      avatar?: string;
      provider?: "google" | "password";
    } = {
      name: payload.name,
      studentId,
      email: payload.email,
      passwordHash: placeholderHash,
      department: "College of Technologies (COT)",
      role: "SBO Printing Assistant",
      provider: "google",
    };
    if (payload.picture !== undefined) createPayload.avatar = payload.picture;
    const user = await this.userRepo.create(createPayload);
    const token = signToken({
      userId: (user._id as unknown as string).toString(),
      email: user.email,
      role: user.role,
    });
    return { user, token, isNew: true };
  }

  async me(userId: string): Promise<UserDoc> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw ApiError.notFound("User not found");
    return user;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new ApiError(404, `No admin account found associated with "${email}". Please register first.`);
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.userRepo.setResetPasswordToken(email, tokenHash, expires);

    const clientUrl = process.env["CLIENT_URL"] || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

    await emailService.sendPasswordResetEmail(user.email, user.name, resetUrl);

    return {
      message: `A password reset link & security instructions have been sent to ${email}.`,
    };
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<{ message: string }> {
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const user = await this.userRepo.findByResetToken(tokenHash);

    if (!user) {
      throw new ApiError(400, "Password reset token is invalid or has expired. Please request a new one.");
    }

    const newPasswordHash = await hashPassword(newPassword);
    await this.userRepo.resetPassword((user._id as unknown as string).toString(), newPasswordHash);

    return {
      message: "Password has been successfully reset. You can now log in with your new password.",
    };
  }
}
