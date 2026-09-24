import {Bicycle } from "../bicycles/bicycle.model.js";
import { Brand } from "./brand.model.js";

export function defineAssociations() {
    Brand.hasMany(Bicycle, {foreignKey: "brandId", as: "bicycles"});
    Brand.belongsTo(Brand,{foreignKey: "brandId", as: "brand"});
}