"use strict";
import { DataSource } from "typeorm";
import { DATABASE_URL, DB_USERNAME, HOST, PASSWORD, DATABASE } from "./configEnv.js";

// Función para parsear DATABASE_URL
function getDatabaseConfig() {
  if (DATABASE_URL) {
    // Usar DATABASE_URL si está disponible
    return {
      type: "postgres",
      url: DATABASE_URL,
      entities: ["src/entity/**/*.js"],
      synchronize: true,
      logging: false,
    };
  } else if (DB_USERNAME && PASSWORD && DATABASE && HOST) {
    // Usar variables individuales como fallback
    return {
      type: "postgres",
      host: `${HOST}`,
      port: 5432,
      username: `${DB_USERNAME}`,
      password: `${PASSWORD}`,
      database: `${DATABASE}`,
      entities: ["src/entity/**/*.js"],
      synchronize: true,
      logging: false,
    };
  } else {
    throw new Error("No DATABASE_URL o variables de BD individuales configuradas");
  }
}

export const AppDataSource = new DataSource(getDatabaseConfig());

export async function connectDB() {
  try {
    await AppDataSource.initialize();
    console.log("=> Conexión exitosa a la base de datos!");
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    process.exit(1);
  }
}