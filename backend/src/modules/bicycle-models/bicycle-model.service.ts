import { Model } from "./bicycle-model.model.js";
export class BicycleModelService {
    static async findAll() {
        return Model.findAll({
            order: [["id", "ASC"]],
        });
    }
    static async findById(id: number) {
        return Model.findByPk(id);
    }
    static async create(data: {
        name: string;
        year?: number | null;
    }) {
        return Model.create(data);
    }
    static async update(
        bicycleModel: Model,
        data: {
            name?: string;
            year?: number | null;
        }
    ) {
        return bicycleModel.update(data);
    }
    static async delete(bicycleModel: Model) {
        await bicycleModel.destroy();
    }
}
