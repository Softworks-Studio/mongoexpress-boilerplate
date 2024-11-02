import { Router } from "express";
import { healthCheck } from "../../controllers/core/HealthController";

const router = Router();

router.get("/health", healthCheck);

export default router;


