import type { Request, Response, NextFunction } from "express";
import { BicycleDetailService } from "./bicycle-detail.service.js";

const FRAME_MATERIALS = ["Aluminum", "Steel", "Carbon", "Titanium"];

export class BicycleDetailController {
    static async getAll(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const details = await BicycleDetailService.findAll();
            res.json(details);
        } catch (error) {
            next(error);
        }
    }
    static async getById(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const id = Number(req.params.id);
            const detail = await BicycleDetailService.findById(id);
            if (!detail) {
                res.status(404).json({
                    message: "Bicycle detail not found",
                });
                return;
            }
            res.json(detail);
        } catch (error) {
            next(error);
        }
    }
    static async create(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { bicycleId, frameMaterial, wheelSize, weight, suspension } = req.body;
            if (
                bicycleId === undefined ||
                frameMaterial === undefined ||
                wheelSize === undefined ||
                weight === undefined
            ) {
                res.status(400).json({
                    message: "bicycleId, frameMaterial, wheelSize and weight are required",
                });
                return;
            }
            if (!FRAME_MATERIALS.includes(frameMaterial)) {
                res.status(400).json({
                    message: `frameMaterial must be one of: ${FRAME_MATERIALS.join(", ")}`,
                });
                return;
            }
            if (!(await BicycleDetailService.bicycleExists(Number(bicycleId)))) {
                res.status(400).json({
                    message: "Bicycle not found",
                });
                return;
            }
            if (await BicycleDetailService.bicycleHasDetail(Number(bicycleId))) {
                res.status(409).json({
                    message: "This bicycle already has a detail",
                });
                return;
            }
            const detail = await BicycleDetailService.create({
                bicycleId: Number(bicycleId),
                frameMaterial,
                wheelSize,
                weight,
                suspension,
            });
            res.status(201).json(detail);
        } catch (error) {
            next(error);
        }
    }
    static async update(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const id = Number(req.params.id);
            const detail = await BicycleDetailService.findById(id);
            if (!detail) {
                res.status(404).json({
                    message: "Bicycle detail not found",
                });
                return;
            }
            const { bicycleId, frameMaterial, wheelSize, weight, suspension } = req.body;
            if (frameMaterial !== undefined && !FRAME_MATERIALS.includes(frameMaterial)) {
                res.status(400).json({
                    message: `frameMaterial must be one of: ${FRAME_MATERIALS.join(", ")}`,
                });
                return;
            }
            if (bicycleId !== undefined && Number(bicycleId) !== detail.bicycleId) {
                if (!(await BicycleDetailService.bicycleExists(Number(bicycleId)))) {
                    res.status(400).json({
                        message: "Bicycle not found",
                    });
                    return;
                }
                if (await BicycleDetailService.bicycleHasDetail(Number(bicycleId))) {
                    res.status(409).json({
                        message: "This bicycle already has a detail",
                    });
                    return;
                }
            }
            const updatedDetail = await BicycleDetailService.update(detail, {
                ...(bicycleId !== undefined && { bicycleId: Number(bicycleId) }),
                ...(frameMaterial !== undefined && { frameMaterial }),
                ...(wheelSize !== undefined && { wheelSize }),
                ...(weight !== undefined && { weight }),
                ...(suspension !== undefined && { suspension }),
            });
            res.json(updatedDetail);
        } catch (error) {
            next(error);
        }
    }
    static async delete(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const id = Number(req.params.id);
            const detail = await BicycleDetailService.findById(id);
            if (!detail) {
                res.status(404).json({
                    message: "Bicycle detail not found",
                });
                return;
            }
            await BicycleDetailService.delete(detail);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
