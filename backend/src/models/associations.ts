
import { Bicycle } from "../modules/bicycles/bicycle.model.js";
import { Brand } from "../modules/brands/brand.model.js";
import { BicycleDetail } from "../modules/bicycle-details/bicycle-detail.model.js";
import { Customer } from "../modules/customers/customer.model.js";
import { Order } from "../modules/orders/order.model.js";

export function defineAssociations() {
    Brand.hasMany(Bicycle, { foreignKey: "brandId", as: "bicycles" });
    Bicycle.belongsTo(Brand, { foreignKey: "brandId", as: "brand" });

    Bicycle.hasOne(BicycleDetail, { foreignKey: "bicycleId", as: "detail", onDelete: "CASCADE" });
    BicycleDetail.belongsTo(Bicycle, { foreignKey: "bicycleId", as: "bicycle" });

    Customer.hasMany(Order, { foreignKey: "customerId", as: "orders", onDelete: "RESTRICT" });
    Order.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });
}
