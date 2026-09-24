import rateLimit from "express-rate-limit";

/**
 * Rate limiting — Skill notes: MUST use a shared store (Redis / gateway / platform)
 * in production. In-memory is single-instance only and resets on deploy.
 *
 * This is a safe default for local dev. Swap `store` to RedisStore in production.
 *
 * Example with Redis:
 *   import { RedisStore } from "rate-limit-redis";
 *   import { createClient } from "redis";
 *   const redis = createClient({ url: process.env.REDIS_URL });
 *   store: new RedisStore({ sendCommand: (...args) => redis.sendCommand(args) })
 */

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 req per window per IP
  standardHeaders: true, // RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests, please try again later.",
  },
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests, please try again later.",
  },
});
