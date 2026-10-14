import {
    Model as SequelizeModel,
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
} from "sequelize";
import { sequelize } from "../../config/database.js";

// Sequelize's Model is imported as SequelizeModel so this class can be called Model (as in the ERD)
export class Model extends SequelizeModel<
    InferAttributes<Model>,
    InferCreationAttributes<Model>
> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare year: number | null;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Model.init(
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
        modelName: "Model",
        timestamps: true,
    }
);
