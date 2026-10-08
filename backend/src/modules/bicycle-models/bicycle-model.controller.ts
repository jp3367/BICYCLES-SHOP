import type { Request, Response, NextFunction } from "express";
import { ForeignKeyConstraintError } from "sequelize";
import { BicycleModelService } from "./bicycle-model.service.js";

export class BicycleModelController {
    static async getAll(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const models = await BicycleModelService.findAll();
            res.json(models);
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
            const bicycleModel = await BicycleModelService.findById(id);
            if (!bicycleModel) {
                res.status(404).json({
                    message: "Model not found",
                });
                return;
            }
            res.json(bicycleModel);
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
            const { name, year } = req.body;
            if (!name) {
                res.status(400).json({
                    message: "name is required",
                });
                return;
            }
            const bicycleModel = await BicycleModelService.create({ name, year });
            res.status(201).json(bicycleModel);
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
            const bicycleModel = await BicycleModelService.findById(id);
            if (!bicycleModel) {
                res.status(404).json({
                    message: "Model not found",
                });
                return;
            }
            const { name, year } = req.body;
            await BicycleModelService.update(bicycleModel, {
                ...(name !== undefined && { name }),
                ...(year !== undefined && { year }),
            });
            res.json(bicycleModel);
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
            const bicycleModel = await BicycleModelService.findById(id);
            if (!bicycleModel) {
                res.status(404).json({
                    message: "Model not found",
                });
                return;
            }
            await BicycleModelService.delete(bicycleModel);
            res.status(204).send();
        } catch (error) {
            if (error instanceof ForeignKeyConstraintError) {
                res.status(409).json({
                    message: "Cannot delete a model that has bicycles",
                });
                return;
            }
            next(error);
        }
    }
}
