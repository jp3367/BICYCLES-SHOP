import { Customer } from "./customer.model.js";
import { Order } from "../orders/order.model.js";
import { OrderItem } from "../order-items/order-item.model.js";
import { Op } from "sequelize";
import { Bicycle } from "../bicycles/bicycle.model.js";

export class CustomerService {
    static async findAll() {
        return Customer.findAll({
            order: [["id", "ASC"]],
        });
    }
    static async findCustomersWithOrdersByNameSearch(searchTerm: string) {
        return Customer.findAll({
            where: { name: { [Op.like]: `%${searchTerm}%` } },
            include: [{ model: Order, as: "orders", required: true }],
        });
    }
    static async findById(id: number) {
        return Customer.findByPk(id);
    }
    static async emailExists(email: string) {
        const customer = await Customer.findOne({ where: { email } });
        return customer !== null;
    }

    // Find by email
    static async findByEmail(email: string) {
        return Customer.findOne({ where: { email } });
    }

    // Find Clients with orders and what they bought
    static async findWithOrders(id: number) {
        return Customer.findByPk(id, {
            include: [{
                model: Order, as: "orders",
                include: [{
                    model: OrderItem, as: "items",
                    include: [{ model: Bicycle, as: "bicycle", attributes: ["id", "model"] }],
                }],
            }],
            order: [[{ model: Order, as: "orders" }, "orderDate", "DESC"]],
        });
    }
    static async create(data: {
        name: string;
        email: string;
    }) {
        return Customer.create(data);
    }
    static async update(
        customer: Customer,
        data: {
            name?: string;
            email?: string;
        }
    ) {
        return customer.update(data);
    }
    static async delete(customer: Customer) {
        await customer.destroy();
    }
}
