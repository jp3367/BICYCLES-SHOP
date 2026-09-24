import { app } from "./app.js";
import { sequelize } from "./config/database.js";
import { env } from "./config/env.js";

// Importamos los modelos para que Sequelize los registre.
import "./modules/bicycles/bicycle.model.js";
import "./modules/brands/brand.model.js";
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log("Conexión con MySQL establecida.");
        //En producción, una de las opciones
        //await sequelize.sync();

        //En desarrollo, para que se creen las tablas automáticamente
        await sequelize.sync({ force: true }).then (() => {
            console.log("Base de datos sincronizada.");
        });
        app.listen(env.PORT, () => {
            console.log(
                `Servidor funcionando en http://${env.DB_HOST}:${env.PORT}`
            );
        });
    } catch (error) {
        console.error(
            "No se pudo iniciar la aplicación:",
            error
        );
        process.exit(1);
    }
}
startServer();