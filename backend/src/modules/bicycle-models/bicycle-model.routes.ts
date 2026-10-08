import { Router } from "express";
import { BicycleModelController } from "./bicycle-model.controller.js";

const router = Router();

router.get("/", BicycleModelController.getAll);
router.get("/:id", BicycleModelController.getById);
router.post("/", BicycleModelController.create);
router.put("/:id", BicycleModelController.update);
router.delete("/:id", BicycleModelController.delete);

export default router;
