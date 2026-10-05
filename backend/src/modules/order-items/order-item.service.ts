import { Op } from "sequelize";
import { OrderItem } from "./order-item.model.js";
import { Order } from "../orders/order.model.js";
import { Bicycle } from "../bicycles/bicycle.model.js";
import { Customer } from "../customers/customer.model.js";
import { Brand } from "../brands/brand.model.js";

const includeOrderAndBicycle = [
    {
        model: Order,
        as: "order",
        attributes: ["id", "customerId", "orderDate", "status"],
    },
    {
        model: Bicycle,
        as: "bicycle",
        attributes: ["id", "model", "price"],
    },
];

export class OrderItemService {
    static async findAll() {
        return OrderItem.findAll({
            include: includeOrderAndBicycle,
            order: [["id", "ASC"]],
        });
    }

    static async findById(id: number) {
        return OrderItem.findByPk(id, {
            include: includeOrderAndBicycle,
        });
    }
    static async findByOrderId(orderId: number) {
        return OrderItem.findAll({
            where: { orderId },
            include: [{ model: Bicycle, as: "bicycle", attributes: ["id", "model", "price"] }],
            order: [["id", "ASC"]],
        });
    }
    //New 
    static async findBrandwithBicycles(name: string) {
        return Order.findAll({
            include: [
                { model: Customer, as: "customer", attributes: ["id", "name"] },
                { model: OrderItem,as: "items", required: true, include: [{
                    model: Bicycle, as: "bicycle", required: true, include: [{ 
                        model: Brand, as: "brand", 
                        where: { name }, required: true },
                            ],
                        },
                    ],
                },
            ],
        });
    }

    static async findOrderWithBicycles(orderId: number) {
        return Order.findByPk(orderId, {
            include: [
                {
                    model: Bicycle,
                    as: "bicycles",
                    attributes: ["id", "model", "price"],
                    through: { attributes: ["quantity", "unitPrice"] },
                },
            ],
        });
    }
    static async findOrderSummaryByStatus(status: string, modelSearch?: string) {
        const orders = await Order.findAll({
            where: { status },
            attributes: ["id", "customerId", "orderDate", "status"],
            include: [
                {
                    model: OrderItem,
                    as: "items",
                    attributes: ["id", "quantity", "unitPrice"],
                    required: true,
                    include: [
                        {
                            model: Bicycle,
                            as: "bicycle",
                            attributes: ["id", "model", "price"],
                            required: true,
                            ...(modelSearch && {
                                where: { model: { [Op.like]: `%${modelSearch}%` } },
                            }),
                        },
                    ],
                },
            ],
            order: [
                ["orderDate", "DESC"],
                [{ model: OrderItem, as: "items" }, "id", "ASC"],
            ],
        });
        // Each order gets the total of its lines (quantity * unitPrice)
        return orders.map((order) => {
            const plain = order.toJSON() as unknown as {
                items: { quantity: number; unitPrice: string | number }[];
            };
            const total = plain.items.reduce(
                (sum, item) => sum + item.quantity * Number(item.unitPrice),
                0
            );
            return { ...plain, total: Number(total.toFixed(2)) };
        });
    }
    static async orderExists(orderId: number) {
        const order = await Order.findByPk(orderId);
        return order !== null;
    }
    static async findBicycle(bicycleId: number) {
        return Bicycle.findByPk(bicycleId);
    }
    static async create(data: {
        orderId: number;
        bicycleId: number;
        quantity: number;
        unitPrice: number;
    }) {
        const item = await OrderItem.create(data);
        return OrderItemService.findById(item.id);
    }
    static async update(
        item: OrderItem,
        data: {
            orderId?: number;
            bicycleId?: number;
            quantity?: number;
            unitPrice?: number;
        }
    ) {
        await item.update(data);
        return OrderItemService.findById(item.id);
    }
    static async delete(item: OrderItem) {
        await item.destroy();
    }
}
