"use strict";
import { DataSource } from "typeorm";
import { DATABASE, DATABASE_URL, DB_USERNAME, HOST, PASSWORD, DB_PORT } from "./configEnv.js";

import AsignacionHerramientas from "../entity/asignacionHerramientas.entity.js";
import Asistencia from "../entity/asistencia.entity.js";
import Incidencia from "../entity/incidencia.entity.js";
import Material from "../entity/material.entity.js";
import MovimientoInventario from "../entity/movimientoinventario.entity.js";
import Notificacion from "../entity/notificacion.entity.js";
import User from "../entity/user.entity.js";
import KitHerramientas from "../entity/kitHerramientas.entity.js";
import Transporte from "../entity/transporte.entity.js";
import Cuadrilla from "../entity/cuadrilla.entity.js";
import Vivienda from "../entity/vivienda.entity.js";
import Hito from "../entity/hito.entity.js";
import Solicitud from "../entity/solicitud.entity.js";
import Volunteer from "../entity/volunteer.entity.js";
import Evaluacion from "../entity/evaluacion.entity.js";

// Función para parsear DATABASE_URL
function getDatabaseConfig() {
  if (DATABASE_URL) {
    // Usar DATABASE_URL si está disponible
    return {
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
        Transporte,
        Cuadrilla,
        Vivienda,
        Hito,
        Solicitud,
        Volunteer,
        Evaluacion
      ],
      synchronize: true,
      logging: false,
    };
  } else if (DB_USERNAME && PASSWORD && DATABASE && HOST) {
    // Usar variables individuales como fallback
    return {
      type: "postgres",
      host: `${HOST}`,
      port: DB_PORT,
      username: `${DB_USERNAME}`,
      password: `${PASSWORD}`,
      database: `${DATABASE}`,
      entities: [
        AsignacionHerramientas,
        Asistencia,
        Incidencia,
        Material,
        MovimientoInventario,
        Notificacion,
        User,
        KitHerramientas,
        Transporte,
        Cuadrilla,
        Vivienda,
        Hito,
        Solicitud,
        Volunteer,
        Evaluacion
      ],
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