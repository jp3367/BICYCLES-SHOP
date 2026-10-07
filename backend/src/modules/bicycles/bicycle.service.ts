import { Bicycle } from "./bicycle.model.js";
import { Brand } from "../brands/brand.model.js";
import { BicycleDetail } from "../bicycle-details/bicycle-detail.model.js";
import { Op } from "sequelize";

const includeBrand = {
    model: Brand,
    as: "brand",
    attributes: ["id", "name"],
};

export class BicycleService {
    static async findAll() {
        return Bicycle.findAll({
            include: [includeBrand],
            order: [["id", "ASC"]],
        });
    }
    static async findById(id: number) {
        return Bicycle.findByPk(id, {
            include: [includeBrand],
        });
    }

    //Bicycles by brandId
    static async findByBrandId(brandId: number) {
        return Bicycle.findAll({
            where: { brandId },
            include: [includeBrand],
            order: [["id", "ASC"]],
        });
    }

    //Find bicycles between price range
    static async findByPriceRange(minPrice: number, maxPrice: number) {
        return Bicycle.findAll({
            where: { price: { $between: [minPrice, maxPrice] } },
            include: [includeBrand],
            order: [["price", "ASC"]],
        });
    }

    // Find biycles with low stock
    static async findLowStock (maxStock: number) {
        return Bicycle.findAll({
            where: { stock: {[Op.lte]: maxStock} },
            attributes: ["id", "model", "stock"],
            include: [includeBrand],
            order: [["stock", "ASC"]],
        });
    }

    //  Find bicycles by brand name
    static async findByBrandName(name: string) {
        return Bicycle.findAll({
            include: [{model: Brand, as: "brand", where: { name }, required: true}]
        })
    }
    // Find bicycles with suspension and wheel size
    static async findWithSuspensionAndWheel (minWheel: number) {
        return Bicycle.findAll({
            include: [{
                model: BicycleDetail,
                as: "detail",
                required: true,
                where: {
                    suspension: {[Op.ne]: null}, //Op. ne = not equal (!=)
                    wheelSize: {[Op.gte]: minWheel}//Op. gte = greater than or equal (>=)
                }
            }]
        })
    }

    static async findEagerlyById(id: number) {
        return Bicycle.findByPk(id, {
            include: [includeBrand],
        });
    }
    static async findAllEagerlyByFrameMaterial(frameMaterial: string) {
        return Bicycle.findAll({
            include: [
                {
                    model: BicycleDetail,
                    as: "detail",
                    where: { frameMaterial },
                },
            ],
            order: [["id", "ASC"]],
        });
    }
    static async brandExists(brandId: number) {
        const brand = await Brand.findByPk(brandId);
        return brand !== null;
    }
    static async create(data: {
        brandId: number;
        model?: string | null;
        description?: string | null;
        price: number;
        stock?: number;
    }) {
        const bicycle = await Bicycle.create(data);
        return BicycleService.findById(bicycle.id);
    }
    static async update(
        bicycle: Bicycle,
        data: {
            brandId?: number;
            model?: string | null;
            description?: string | null;
            price?: number;
            stock?: number;
        }
    ) {
        await bicycle.update(data);
        return BicycleService.findById(bicycle.id);
    }
    static async delete(bicycle: Bicycle) {
        await bicycle.destroy();
    }
}
