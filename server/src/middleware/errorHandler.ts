import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction): void {
  // Zod validation errors
  if (error instanceof z.ZodError) {
    res.status(400).json({
      success: false,
      error: "Validation failed",
      details: error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
    return;
  }

  // Operational ApiError
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
    });
    return;
  }

  // Mongoose validation
  if (error !== null && typeof error === "object" && "name" in error && (error as { name: string }).name === "ValidationError") {
    const err = error as unknown as { message: string };
    res.status(400).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Mongoose duplicate key
  if (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code: number }).code === 11000
  ) {
    res.status(409).json({
      success: false,
      error: "Duplicate resource",
    });
    return;
  }

  // Mongoose CastError (invalid ObjectId)
  if (error !== null && typeof error === "object" && "name" in error && (error as { name: string }).name === "CastError") {
    res.status(400).json({
      success: false,
      error: "Invalid ID format",
    });
    return;
  }

  // Mongoose buffering timeout (DB disconnected)
  if (error instanceof Error && error.message.includes("buffering timed out")) {
    res.status(503).json({
      success: false,
      error: "Database unavailable — please try again shortly",
    });
    return;
  }

  // Unexpected errors
  const requestId = (req as unknown as { id?: string }).id;
  logger.error("Unhandled error", error as Error, {
    method: req.method,
    path: req.originalUrl,
    ...(requestId !== undefined ? { requestId } : {}),
  });

  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const message = error instanceof Error && process.env["NODE_ENV"] !== "production"
    ? error.message
    : "Internal server error";

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}
