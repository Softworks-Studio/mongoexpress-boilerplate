import { Router } from "express";
import CoreRoute from "./core/CoreRoute";

const router = Router();

router.use("/core", CoreRoute);

export default router;
