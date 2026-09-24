import {
    Model,
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
} from "sequelize";
import { sequelize } from "../../config/database.js";
export class Brand extends Model<
    InferAttributes<Brand>,
    InferCreationAttributes<Brand>
> {
    declare id: CreationOptional<number>;
    declare brandId: number;
    declare name: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Brand.init(
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
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: "brands",
        timestamps: true,
    }
);