import { Router } from "express";
import healthRoutes from "./health.routes.js";
import printingRequestRoutes from "./printingRequest.routes.js";
import authRoutes from "./auth.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/printing-requests", printingRequestRoutes);

export default router;
