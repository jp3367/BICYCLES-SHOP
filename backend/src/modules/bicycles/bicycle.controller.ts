import type { Request, Response, NextFunction } from "express";
import { BicycleService } from "./bicycle.service.js";
export class BicycleController {
    static async getAll(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const bicycles = await BicycleService.findAll();
            res.json(bicycles);
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
            const bicycle = await BicycleService.findById(id);
            if (!bicycle) {
                res.status(404).json({
                    message: "Bicycle not found",
                });
                return;
            }
            res.json(bicycle);
        } catch (error) {
            next(error);
        }
    }
    static async getEagerlyById(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const id = Number(req.params.id);
            const bicycle = await BicycleService.findEagerlyById(id);
            if (!bicycle) {
                res.status(404).json({
                    message: "Bicycle not found",
                });
                return;
            }
            res.json(bicycle);
        } catch (error) {
            next(error);
        }
    }
    static async getAllEagerlyByFrameMaterial(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const frameMaterial = String(req.params.frameMaterial);

            const bicycles = await BicycleService.findAllEagerlyByFrameMaterial(frameMaterial);

            res.json(bicycles);
        } catch (error) {
            next(error);
        }
    }
    // EXAM 2
    static async getAllWithBrandAndModel(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const bicycles = await BicycleService.findAllWithBrandAndModel();
            res.json(bicycles);
        } catch (error) {
            next(error);
        }
    }
    // EXAM 3
    static async getByPriceGreaterThan(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const price = Number(req.params.price);
            if (Number.isNaN(price)) {
                res.status(400).json({
                    message: "price must be a number",
                });
                return;
            }
            const bicycles = await BicycleService.findByPriceGreaterThan(price);
            res.json(bicycles);
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
            const { brandId, modelId, model, description, price, stock } = req.body;
            if (brandId === undefined || modelId === undefined || price === undefined) {
                res.status(400).json({
                    message: "brandId, modelId and price are required",
                });
                return;
            }
            if (!(await BicycleService.brandExists(Number(brandId)))) {
                res.status(400).json({
                    message: "Brand not found",
                });
                return;
            }
            if (!(await BicycleService.modelExists(Number(modelId)))) {
                res.status(400).json({
                    message: "Model not found",
                });
                return;
            }
            const bicycle = await BicycleService.create({
                brandId: Number(brandId),
                modelId: Number(modelId),
                model,
                description,
                price,
                stock,
            });
            res.status(201).json(bicycle);
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
            const bicycle = await BicycleService.findById(id);
            if (!bicycle) {
                res.status(404).json({
                    message: "Bicycle not found",
                });
                return;
            }
            const { brandId, modelId, model, description, price, stock } = req.body;
            if (
                brandId !== undefined &&
                !(await BicycleService.brandExists(Number(brandId)))
            ) {
                res.status(400).json({
                    message: "Brand not found",
                });
                return;
            }
            if (
                modelId !== undefined &&
                !(await BicycleService.modelExists(Number(modelId)))
            ) {
                res.status(400).json({
                    message: "Model not found",
                });
                return;
            }
            const updatedBicycle = await BicycleService.update(bicycle, {
                ...(brandId !== undefined && { brandId: Number(brandId) }),
                ...(modelId !== undefined && { modelId: Number(modelId) }),
                ...(model !== undefined && { model }),
                ...(description !== undefined && { description }),
                ...(price !== undefined && { price }),
                ...(stock !== undefined && { stock }),
            });
            res.json(updatedBicycle);
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
            const bicycle = await BicycleService.findById(id);
            if (!bicycle) {
                res.status(404).json({
                    message: "Bicycle not found",
                });
                return;
            }
            await BicycleService.delete(bicycle);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
