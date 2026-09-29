import { Bicycle } from "./bicycle.model.js";
import { Brand } from "../brands/brand.model.js";
import { BicycleDetail } from "../bicycle-details/bicycle-detail.model.js";

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
