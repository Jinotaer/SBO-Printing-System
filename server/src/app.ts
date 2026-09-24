import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { env } from "./config/env.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import apiRoutes from "./routes/index.js";

export function createApp(): express.Express {
  const app = express();

  // Security headers — configured to permit Google OAuth popup flow
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  // CORS — allow configured client URL or local dev ports
  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          origin === env.CLIENT_URL ||
          origin.includes("localhost") ||
          origin.includes("127.0.0.1")
        ) {
          callback(null, true);
        } else {
          callback(new Error("CORS not allowed for this origin"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Compression + body parsing
  app.use(compression());
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  // Logging — structured via morgan, skip in test
  if (env.NODE_ENV !== "test") {
    app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  }

  // Rate limiting — see middleware/rateLimiter.ts for Redis notes
  app.use("/api", apiLimiter);

  // Routes
  app.get("/", (_req, res) => {
    res.json({
      success: true,
      data: {
        message: "Printing Request Form System API",
        version: "1.0.0",
        docs: "/api/health",
      },
    });
  });

  app.use("/api", apiRoutes);

  // 404 + centralized error handler (order matters)
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
