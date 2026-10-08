import type { Request, Response, NextFunction } from "express";
import { OrderService } from "./order.service.js";

const ORDER_STATUSES = ["pending", "paid", "cancelled", "shipped"];

export class OrderController {
    static async getAll(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const orders = await OrderService.findAll();
            res.json(orders);
        } catch (error) {
            next(error);
        }
    }
    static async getByCustomerId(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const customerId = Number(req.params.customerId);
            const orders = await OrderService.findByCustomerId(customerId);
            res.json(orders);
        }catch (error) {
            next(error);
        }
    }
    // EXAM 4
    static async getByBicyclePriceAndWeight(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const price = Number(req.params.price);
            const weight = Number(req.params.weight);
            if (Number.isNaN(price) || Number.isNaN(weight)) {
                res.status(400).json({
                    message: "price and weight must be numbers",
                });
                return;
            }
            const orders = await OrderService.findByBicyclePriceAndWeight(price, weight);
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
            const order = await OrderService.findById(id);
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
    static async create(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { customerId, orderDate, status } = req.body;
            if (customerId === undefined) {
                res.status(400).json({
                    message: "customerId is required",
                });
                return;
            }
            if (status !== undefined && !ORDER_STATUSES.includes(status)) {
                res.status(400).json({
                    message: `status must be one of: ${ORDER_STATUSES.join(", ")}`,
                });
                return;
            }
            if (!(await OrderService.customerExists(Number(customerId)))) {
                res.status(400).json({
                    message: "Customer not found",
                });
                return;
            }
            const order = await OrderService.create({
                customerId: Number(customerId),
                ...(orderDate !== undefined && { orderDate }),
                ...(status !== undefined && { status }),
            });
            res.status(201).json(order);
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
            const order = await OrderService.findById(id);
            if (!order) {
                res.status(404).json({
                    message: "Order not found",
                });
                return;
            }
            const { customerId, orderDate, status } = req.body;
            if (status !== undefined && !ORDER_STATUSES.includes(status)) {
                res.status(400).json({
                    message: `status must be one of: ${ORDER_STATUSES.join(", ")}`,
                });
                return;
            }
            if (customerId !== undefined && Number(customerId) !== order.customerId) {
                if (!(await OrderService.customerExists(Number(customerId)))) {
                    res.status(400).json({
                        message: "Customer not found",
                    });
                    return;
                }
            }
            const updatedOrder = await OrderService.update(order, {
                ...(customerId !== undefined && { customerId: Number(customerId) }),
                ...(orderDate !== undefined && { orderDate }),
                ...(status !== undefined && { status }),
            });
            res.json(updatedOrder);
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
            const order = await OrderService.findById(id);
            if (!order) {
                res.status(404).json({
                    message: "Order not found",
                });
                return;
            }
            await OrderService.delete(order);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
