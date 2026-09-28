import {
    Model,
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
} from "sequelize";
import { sequelize } from "../../config/database.js";

export class Bicycle extends Model<
    InferAttributes<Bicycle>,
    InferCreationAttributes<Bicycle>
> {
    declare id: CreationOptional<number>;
    declare brandId: number;
    declare model: string | null;
    declare description: string | null;
    declare price: number;
    declare stock: CreationOptional<number>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Bicycle.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        brandId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: { model: "brands", key: "id" },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        model: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        stock: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: "bicycles",
        timestamps: true,
    }
);