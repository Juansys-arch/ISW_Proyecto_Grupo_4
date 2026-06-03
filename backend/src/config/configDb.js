"use strict";
import { DataSource } from "typeorm";
import { DATABASE_URL } from "./configEnv.js";

import AsignacionHerramientas from "../entity/asignacionHerramientas.entity.js";
import Asistencia from "../entity/asistencia.entity.js";
import Incidencia from "../entity/incidencia.entity.js";
import Material from "../entity/material.entity.js";
import MovimientoInventario from "../entity/movimientoinventario.entity.js";
import Notificacion from "../entity/notificacion.entity.js";
import User from "../entity/user.entity.js";
import KitHerramientas from "../entity/kitHerramientas.entity.js";
import Transporte from "../entity/transporte.entity.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: DATABASE_URL,
  entities: [
    AsignacionHerramientas,
    Asistencia,
    Incidencia,
    Material,
    MovimientoInventario,
    Notificacion,
    User,
    KitHerramientas,
    Transporte
  ],
  synchronize: true,
  logging: false,
});

export async function connectDB() {
  try {
    await AppDataSource.initialize();
    console.log("=> Conexión exitosa a la base de datos!");
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    process.exit(1);
  }
}