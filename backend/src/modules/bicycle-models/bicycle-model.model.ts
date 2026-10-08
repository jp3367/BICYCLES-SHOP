import {
    Model,
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
} from "sequelize";
import { sequelize } from "../../config/database.js";

// The entity is "Model" in the ERD, but the class can't be called Model
// because it would collide with Model imported from sequelize
export class BicycleModel extends Model<
    InferAttributes<BicycleModel>,
    InferCreationAttributes<BicycleModel>
> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare year: number | null;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

BicycleModel.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        year: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: "models",
        modelName: "BicycleModel",
        timestamps: true,
    }
);
