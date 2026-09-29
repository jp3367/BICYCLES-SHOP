import { BicycleDetail } from "./bicycle-detail.model.js";
import { Bicycle } from "../bicycles/bicycle.model.js";

type FrameMaterial = "Aluminum" | "Steel" | "Carbon" | "Titanium";

const includeBicycle = {
    model: Bicycle,
    as: "bicycle",
    attributes: ["id", "model"],
};

export class BicycleDetailService {
    static async findAll() {
        return BicycleDetail.findAll({
            include: [includeBicycle],
            order: [["id", "ASC"]],
        });
    }
    static async findById(id: number) {
        return BicycleDetail.findByPk(id, {
            include: [includeBicycle],
        });
    }
    static async bicycleExists(bicycleId: number) {
        const bicycle = await Bicycle.findByPk(bicycleId);
        return bicycle !== null;
    }
    static async bicycleHasDetail(bicycleId: number) {
        const detail = await BicycleDetail.findOne({ where: { bicycleId } });
        return detail !== null;
    }
    static async create(data: {
        bicycleId: number;
        frameMaterial: FrameMaterial;
        wheelSize: number;
        weight: number;
        suspension?: string | null;
    }) {
        const detail = await BicycleDetail.create(data);
        return BicycleDetailService.findById(detail.id);
    }
    static async update(
        detail: BicycleDetail,
        data: {
            bicycleId?: number;
            frameMaterial?: FrameMaterial;
            wheelSize?: number;
            weight?: number;
            suspension?: string | null;
        }
    ) {
        await detail.update(data);
        return BicycleDetailService.findById(detail.id);
    }
    static async delete(detail: BicycleDetail) {
        await detail.destroy();
    }
}
