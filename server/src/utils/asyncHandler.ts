import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps async route handlers to forward errors to the centralized error handler.
 * Avoids try/catch in every controller.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req, res, next) => {
    void fn(req, res, next).catch(next);
  };
}
