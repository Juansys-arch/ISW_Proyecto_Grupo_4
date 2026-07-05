"use strict";

import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAuthorized } from "../middlewares/authorization.middleware.js";
import {
  crearIncidencia,
  generarReporteEmergencia,
  obtenerIncidenciaPorId,
  obtenerIncidencias,
  actualizarIncidencia,
  eliminarIncidencia,
} from "../controllers/incidencia.controller.js";

const router = Router();

router.use(authenticateJwt);

router.post(
  "/",
  isAuthorized(["jefe_cuadrilla"]),
  crearIncidencia,
);

router.get(
  "/",
  isAuthorized(["jefe_cuadrilla", "encargado_inventario", "administrador"]),
  obtenerIncidencias,
);

router.get(
  "/:id",
  isAuthorized(["jefe_cuadrilla", "encargado_inventario", "administrador"]),
  obtenerIncidenciaPorId,
);

router.put(
  "/:id",
  isAuthorized(["jefe_cuadrilla", "administrador"]),
  actualizarIncidencia,
);

router.delete(
  "/:id",
  isAuthorized(["jefe_cuadrilla", "administrador"]),
  eliminarIncidencia,
);

router.post(
  "/:id/reporte-emergencia",
  isAuthorized(["administrador"]),
  generarReporteEmergencia,
);

export default router;