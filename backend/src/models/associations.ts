
import { Bicycle } from "../modules/bicycles/bicycle.model.js";
import { Brand } from "../modules/brands/brand.model.js";
import { BicycleModel } from "../modules/bicycle-models/bicycle-model.model.js";
import { BicycleDetail } from "../modules/bicycle-details/bicycle-detail.model.js";
import { Customer } from "../modules/customers/customer.model.js";
import { Order } from "../modules/orders/order.model.js";
import { OrderItem } from "../modules/order-items/order-item.model.js";

export function defineAssociations() {
    Brand.hasMany(Bicycle, { foreignKey: "brandId", as: "bicycles" });
    Bicycle.belongsTo(Brand, { foreignKey: "brandId", as: "brand" });

    // The alias can't be "model" because Bicycle already has a "model" attribute
    BicycleModel.hasMany(Bicycle, { foreignKey: "modelId", as: "bicycles" });
    Bicycle.belongsTo(BicycleModel, { foreignKey: "modelId", as: "bicycleModel" });

    Bicycle.hasOne(BicycleDetail, { foreignKey: "bicycleId", as: "detail", onDelete: "CASCADE" });
    BicycleDetail.belongsTo(Bicycle, { foreignKey: "bicycleId", as: "bicycle" });

    Customer.hasMany(Order, { foreignKey: "customerId", as: "orders", onDelete: "RESTRICT" });
    Order.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });

    Order.belongsToMany(Bicycle, { through: OrderItem, foreignKey: "orderId", otherKey: "bicycleId", as: "bicycles" });
    Bicycle.belongsToMany(Order, { through: OrderItem, foreignKey: "bicycleId", otherKey: "orderId", as: "orders" });
    Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
    OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });
    Bicycle.hasMany(OrderItem, { foreignKey: "bicycleId", as: "orderItems" });
    OrderItem.belongsTo(Bicycle, { foreignKey: "bicycleId", as: "bicycle" });
}
