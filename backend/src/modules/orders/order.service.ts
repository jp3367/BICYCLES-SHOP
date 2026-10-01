import { Order } from "./order.model.js";
import { Customer } from "../customers/customer.model.js";

type OrderStatus = "pending" | "paid" | "cancelled" | "shipped";

const includeCustomer = {
    model: Customer,
    as: "customer",
    attributes: ["id", "name", "email"],
};

export class OrderService {
    static async findAll() {
        return Order.findAll({
            include: [includeCustomer],
            order: [["id", "ASC"]],
        });
    }
    static async findById(id: number) {
        return Order.findByPk(id, {
            include: [includeCustomer],
        });
    }
    static async findByCustomerId(customerId: number) {
        return Order.findAll({
            where: { customerId },
            include: [{model: Customer, as: "customer", attributes: ["id", "name", "email"]}],
            order: [["orderDate", "ASC"]],
        });
    }
    static async customerExists(customerId: number) {
        const customer = await Customer.findByPk(customerId);
        return customer !== null;
    }
    static async create(data: {
        customerId: number;
        orderDate?: Date;
        status?: OrderStatus;
    }) {
        const order = await Order.create(data);
        return OrderService.findById(order.id);
    }
    static async update(
        order: Order,
        data: {
            customerId?: number;
            orderDate?: Date;
            status?: OrderStatus;
        }
    ) {
        await order.update(data);
        return OrderService.findById(order.id);
    }
    static async delete(order: Order) {
        await order.destroy();
    }
}
