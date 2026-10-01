import { app } from "./app.js";
import { sequelize } from "./config/database.js";
import { env } from "./config/env.js";
import { defineAssociations } from "./models/associations.js";

import "./modules/bicycles/bicycle.model.js";
import "./modules/brands/brand.model.js";
import "./modules/bicycle-details/bicycle-detail.model.js";
import "./modules/customers/customer.model.js";
import "./modules/orders/order.model.js";
async function startServer() {
    try {
        defineAssociations();

        await sequelize.authenticate();
        console.log("MySQL connection established.");

        await sequelize.sync({ force: true }).then (() => {
            console.log("Database synchronized.");
        });
        app.listen(env.PORT, () => {
            console.log(
                `Server running at http://${env.DB_HOST}:${env.PORT}`
            );
        });
    } catch (error) {
        console.error(
            "Could not start the application:",
            error
        );
        process.exit(1);
    }
}
startServer();