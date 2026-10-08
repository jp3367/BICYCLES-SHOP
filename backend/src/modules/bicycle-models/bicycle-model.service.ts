import { BicycleModel } from "./bicycle-model.model.js";
export class BicycleModelService {
    static async findAll() {
        return BicycleModel.findAll({
            order: [["id", "ASC"]],
        });
    }
    static async findById(id: number) {
        return BicycleModel.findByPk(id);
    }
    static async create(data: {
        name: string;
        year?: number | null;
    }) {
        return BicycleModel.create(data);
    }
    static async update(
        bicycleModel: BicycleModel,
        data: {
            name?: string;
            year?: number | null;
        }
    ) {
        return bicycleModel.update(data);
    }
    static async delete(bicycleModel: BicycleModel) {
        await bicycleModel.destroy();
    }
}
