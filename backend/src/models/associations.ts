
import { Bicycle } from "../modules/bicycles/bicycle.model.js";
import { Brand } from "../modules/brands/brand.model.js";
import { Model } from "../modules/bicycle-models/bicycle-model.model.js";
import { BicycleDetail } from "../modules/bicycle-details/bicycle-detail.model.js";
import { Customer } from "../modules/customers/customer.model.js";
import { Order } from "../modules/orders/order.model.js";
import { OrderItem } from "../modules/order-items/order-item.model.js";

export function defineAssociations() {
    Brand.hasMany(Bicycle, { foreignKey: "brandId", as: "bicycles" }); //1:N
    Bicycle.belongsTo(Brand, { foreignKey: "brandId", as: "brand" });  //N:1

    // Model from bicycle-models
    Model.hasMany(Bicycle, { foreignKey: "modelId", as: "bicycles" }); //1:N
    Bicycle.belongsTo(Model, { foreignKey: "modelId", as: "bicycleModel" }); //N:1

    Bicycle.hasOne(BicycleDetail, { foreignKey: "bicycleId", as: "detail", onDelete: "CASCADE" }); //1:1
    BicycleDetail.belongsTo(Bicycle, { foreignKey: "bicycleId", as: "bicycle" }); //N:1

    Customer.hasMany(Order, { foreignKey: "customerId", as: "orders", onDelete: "RESTRICT" }); //1:N
    Order.belongsTo(Customer, { foreignKey: "customerId", as: "customer" }); //N:1

    Order.belongsToMany(Bicycle, { through: OrderItem, foreignKey: "orderId", otherKey: "bicycleId", as: "bicycles" }); //N:N
    Bicycle.belongsToMany(Order, { through: OrderItem, foreignKey: "bicycleId", otherKey: "orderId", as: "orders" }); //N:N
    Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" }); //1:N
    OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" }); //N:1
    Bicycle.hasMany(OrderItem, { foreignKey: "bicycleId", as: "orderItems" }); //1:N
    OrderItem.belongsTo(Bicycle, { foreignKey: "bicycleId", as: "bicycle" }); //N:1
}
