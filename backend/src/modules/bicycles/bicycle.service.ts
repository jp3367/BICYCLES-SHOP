import { Bicycle } from "./bicycle.model.js";
export class BicycleService {
    static async findAll() {
        return Bicycle.findAll({
            order: [["id", "ASC"]],
        });
    } static async findById(id: number) {
        return Bicycle.findByPk(id);
    }
    static async create(data: {
        brand: string;
        model: string | null;
        price: number;
        stock?: number;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        return Bicycle.create(data);
    }
    static async update(
        bicycle: Bicycle,
        data: {
            brand?: string;
            model?: string | null;
            price?: number;
            stock?: number;
        }
    ) {
        return bicycle.update(data);
    }
    static async delete(bicycle: Bicycle) {
        await bicycle.destroy();
    }
}