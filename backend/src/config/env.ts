import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config({
    path: path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "../../.env"
    ),
});

export const env = {
PORT: Number(process.env.PORT) || 3000,
DB_HOST: process.env.DB_HOST || "localhost",
DB_PORT: Number(process.env.DB_PORT) || 3306,
DB_NAME: process.env.DB_NAME || "dsw_products",
DB_USER: process.env.DB_USER || "root",
DB_PASSWORD: process.env.DB_PASSWORD || " ",
};