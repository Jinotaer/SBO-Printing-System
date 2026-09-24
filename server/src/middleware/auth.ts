import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { verifyToken, type JwtPayload } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Missing authorization token");
  }

  const token = header.replace("Bearer ", "").trim();
  if (!token) throw new ApiError(401, "Missing authorization token");

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }
}
