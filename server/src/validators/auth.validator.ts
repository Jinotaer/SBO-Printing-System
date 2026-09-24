import { z } from "zod";

const buksuEmailRegex = /^[a-zA-Z0-9._%+-]+@student\.buksu\.edu\.ph$/i;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    studentId: z.string().trim().min(3, "Student ID required").max(20),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email")
      .regex(buksuEmailRegex, "Only @student.buksu.edu.ph emails are allowed"),
    password: z.string().min(6, "Password must be at least 6 characters").max(100).optional(),
    department: z.string().trim().max(100).optional().default("College of Technologies (COT)"),
    role: z.string().trim().max(100).optional().default("SBO Printing Assistant"),
    provider: z.enum(["google", "password"]).optional().default("google"),
  })
  .superRefine((data, ctx) => {
    if (data.provider === "password" && !data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is required for password provider",
        path: ["password"],
      });
    }
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email")
    .regex(buksuEmailRegex, "Only @student.buksu.edu.ph emails are allowed"),
  // password optional for Google SSO simulation — if missing, we do email-only lookup (dev convenience)
  // but in real password flow it will be required
  password: z.string().min(1).optional(),
  // alternative: allow Google login without password when explicitly requested
  googleLogin: z.boolean().optional().default(false),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(10, "Google ID token is required"),
  // optional access_token fallback (not used for verification, idToken is preferred)
  accessToken: z.string().optional(),
  // reCAPTCHA token — required when RECAPTCHA_SECRET is set, optional in dev
  recaptchaToken: z.string().min(10).optional(),
});

export const recaptchaSchema = z.object({
  recaptchaToken: z.string().min(10, "reCAPTCHA token is required"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email")
    .regex(buksuEmailRegex, "Only @student.buksu.edu.ph emails are allowed"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type GoogleAuthDto = z.infer<typeof googleAuthSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
