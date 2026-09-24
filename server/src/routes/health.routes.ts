import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

// GET /api/health — liveness probe
router.get("/", (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    success: true,
    data: {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbStatus,
    },
  });
});

export default router;
