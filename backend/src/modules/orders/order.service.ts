import { Order } from "./order.model.js";
import { Customer } from "../customers/customer.model.js";
import { Bicycle } from "../bicycles/bicycle.model.js";
import { BicycleDetail } from "../bicycle-details/bicycle-detail.model.js";
import { Op } from "sequelize";

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

    // find order by a date range
    static async findByDateRange(from: Date, to: Date) {
        return Order.findAll({
            where: { orderDate: { [Op.between]: [from, to] }},
            include: [includeCustomer],
            order: [["orderDate", "ASC"]],
        });
    }

    // find the last order a client made
    static async findLastOrderByCustomer(customerId: number) {
        return Order.findOne({
            where: { customerId },
            order: [["orderDate", "DESC"]],
        });
    }

    // EXAM 4: Orders that include bicycles with price < maxPrice and weight > minWeight
    // The weight is not in Bicycle, it is in BicycleDetail -> Order -> Bicycle -> BicycleDetail
    static async findByBicyclePriceAndWeight(maxPrice: number, minWeight: number) {
        return Order.findAll({
            include: [
                includeCustomer,
                {
                    model: Bicycle,
                    as: "bicycles",
                    required: true, // INNER JOIN: only orders that have a bicycle that matches
                    where: { price: { [Op.lt]: maxPrice } }, //Op.lt = less than (<)
                    attributes: ["id", "model", "price"],
                    through: { attributes: ["quantity", "unitPrice"] }, // columns of OrderItem
                    include: [
                        {
                            model: BicycleDetail,
                            as: "detail",
                            required: true,
                            where: { weight: { [Op.gt]: minWeight } }, //Op.gt = greater than (>)
                            attributes: ["weight"],
                        },
                    ],
                },
            ],
            order: [["id", "ASC"]],
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
