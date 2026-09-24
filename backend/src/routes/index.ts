import { Router } from "express";
import bicycleRoutes from "../modules/bicycles/bicycle.routes.js";
import brandRoutes from "../modules/brands/brand.routes.js";
const router = Router();
router.use("/bicycles", bicycleRoutes);
router.use("/brands", brandRoutes);
export default router;