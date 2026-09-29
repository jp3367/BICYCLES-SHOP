import { Router } from "express";
import bicycleRoutes from "../modules/bicycles/bicycle.routes.js";
import brandRoutes from "../modules/brands/brand.routes.js";
import bicycleDetailRoutes from "../modules/bicycle-details/bicycle-detail.routes.js";
const router = Router();
router.use("/bicycles", bicycleRoutes);
router.use("/brands", brandRoutes);
router.use("/bicycle-details", bicycleDetailRoutes);
export default router;