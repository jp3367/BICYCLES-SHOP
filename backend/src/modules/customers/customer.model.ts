import {
   type CreationOptional,
    DataTypes,
   type InferAttributes,
    type InferCreationAttributes,
    Model
} from "sequelize";

import { sequelize } from "../../config/database.js";

export class Customer extends Model<
    InferAttributes<Customer>, InferCreationAttributes<Customer>
> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare email: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Customer.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true, primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING(160),
            allowNull: false,
            unique: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, { sequelize,
        tableName: "customers",
        modelName: "Customer",
     });