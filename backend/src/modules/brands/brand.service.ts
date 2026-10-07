import { Bicycle } from "../bicycles/bicycle.model.js";
import { Brand } from "./brand.model.js";
export class BrandService {
    static async findAll() {
        return Brand.findAll({
            order: [["id", "ASC"]],
        });
    }
    static async findById(id: number) {
        return Brand.findByPk(id);
    }
    static async create(data: { 
        name: string;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        return Brand.create(data);
    }
    static async update(
        brand: Brand,
        data: {
            name?: string;
        }
    ) {
        return brand.update(data);
    }
    static async delete(brand: Brand) {
        await brand.destroy();
    }
    
    //Brand with all bicycles
    static async findWithBicycles(id: number) {
        return Brand.findByPk(id, {
            include: [{ model: Bicycle, as: "bicycles", attributes: ["id", "model", "price", "stock"] }],
        });

    }
    //Find brand by name
    static async findByName(name: string) {
        return Brand.findOne({
            where: { name },
        });
    }
}