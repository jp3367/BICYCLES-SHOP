import type { Request, Response, NextFunction } from "express";
import { OrderItemService } from "./order-item.service.js";

const ORDER_STATUSES = ["pending", "paid", "cancelled", "shipped"];

export class OrderItemController {
    static async getAll(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const items = await OrderItemService.findAll();
            res.json(items);
        } catch (error) {
            next(error);
        }
    }
    static async getByOrderId(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const orderId = Number(req.params.orderId);
            const items = await OrderItemService.findByOrderId(orderId);
            res.json(items);
        } catch (error) {
            next(error);
        }
    }
    static async getOrderWithBicycles(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const orderId = Number(req.params.orderId);
            const order = await OrderItemService.findOrderWithBicycles(orderId);
            if (!order) {
                res.status(404).json({
                    message: "Order not found",
                });
                return;
            }
            res.json(order);
        } catch (error) {
            next(error);
        }
    }
    static async getOrderSummaryByStatus(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const status = String(req.params.status);
            if (!ORDER_STATUSES.includes(status)) {
                res.status(400).json({
                    message: `status must be one of: ${ORDER_STATUSES.join(", ")}`,
                });
                return;
            }
            const model = typeof req.query.model === "string" ? req.query.model : undefined;
            const orders = await OrderItemService.findOrderSummaryByStatus(status, model);
            res.json(orders);
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
            const item = await OrderItemService.findById(id);
            if (!item) {
                res.status(404).json({
                    message: "Order item not found",
                });
                return;
            }
            res.json(item);
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
            const { orderId, bicycleId, quantity, unitPrice } = req.body;
            if (orderId === undefined || bicycleId === undefined || quantity === undefined) {
                res.status(400).json({
                    message: "orderId, bicycleId and quantity are required",
                });
                return;
            }
            if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
                res.status(400).json({
                    message: "quantity must be an integer greater than 0",
                });
                return;
            }
            if (unitPrice !== undefined && Number(unitPrice) < 0) {
                res.status(400).json({
                    message: "unitPrice must be 0 or greater",
                });
                return;
            }
            if (!(await OrderItemService.orderExists(Number(orderId)))) {
                res.status(400).json({
                    message: "Order not found",
                });
                return;
            }
            const bicycle = await OrderItemService.findBicycle(Number(bicycleId));
            if (!bicycle) {
                res.status(400).json({
                    message: "Bicycle not found",
                });
                return;
            }
            // If no unitPrice is sent, the current bicycle price is used
            const item = await OrderItemService.create({
                orderId: Number(orderId),
                bicycleId: Number(bicycleId),
                quantity: Number(quantity),
                unitPrice: unitPrice !== undefined ? Number(unitPrice) : Number(bicycle.price),
            });
            res.status(201).json(item);
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
            const item = await OrderItemService.findById(id);
            if (!item) {
                res.status(404).json({
                    message: "Order item not found",
                });
                return;
            }
            const { orderId, bicycleId, quantity, unitPrice } = req.body;
            if (quantity !== undefined && (!Number.isInteger(Number(quantity)) || Number(quantity) < 1)) {
                res.status(400).json({
                    message: "quantity must be an integer greater than 0",
                });
                return;
            }
            if (unitPrice !== undefined && Number(unitPrice) < 0) {
                res.status(400).json({
                    message: "unitPrice must be 0 or greater",
                });
                return;
            }
            if (orderId !== undefined && Number(orderId) !== item.orderId) {
                if (!(await OrderItemService.orderExists(Number(orderId)))) {
                    res.status(400).json({
                        message: "Order not found",
                    });
                    return;
                }
            }
            if (bicycleId !== undefined && Number(bicycleId) !== item.bicycleId) {
                if (!(await OrderItemService.findBicycle(Number(bicycleId)))) {
                    res.status(400).json({
                        message: "Bicycle not found",
                    });
                    return;
                }
            }
            const updatedItem = await OrderItemService.update(item, {
                ...(orderId !== undefined && { orderId: Number(orderId) }),
                ...(bicycleId !== undefined && { bicycleId: Number(bicycleId) }),
                ...(quantity !== undefined && { quantity: Number(quantity) }),
                ...(unitPrice !== undefined && { unitPrice: Number(unitPrice) }),
            });
            res.json(updatedItem);
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
            const item = await OrderItemService.findById(id);
            if (!item) {
                res.status(404).json({
                    message: "Order item not found",
                });
                return;
            }
            await OrderItemService.delete(item);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
