import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required").default("mongodb://localhost:27017/sbo_printing_system"),
  CLIENT_URL: z.string().url().or(z.string().min(1)).default("http://localhost:5173"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 chars").default("dev-only-jwt-secret-change-in-production-32chars!"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  RECAPTCHA_SECRET: z.string().optional().default(""),
  RECAPTCHA_SITE_KEY: z.string().optional().default(""),
  RECAPTCHA_MIN_SCORE: z.coerce.number().min(0).max(1).optional().default(0.5),
  SMTP_HOST: z.string().optional().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().int().positive().optional().default(587),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  SMTP_FROM: z.string().optional().default(""),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Invalid environment variables:");
    for (const issue of error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }
  throw error;
}

export { env };
