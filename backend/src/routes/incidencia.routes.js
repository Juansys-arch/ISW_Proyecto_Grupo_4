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
  isAuthorized(["jefe_cuadrilla", "encargado_inventario", "super_admin"]),
  obtenerIncidencias,
);

router.get(
  "/:id",
  isAuthorized(["jefe_cuadrilla", "encargado_inventario", "super_admin"]),
  obtenerIncidenciaPorId,
);

router.put(
  "/:id",
  isAuthorized(["jefe_cuadrilla", "super_admin"]),
  actualizarIncidencia,
);

router.delete(
  "/:id",
  isAuthorized(["jefe_cuadrilla", "super_admin"]),
  eliminarIncidencia,
);

router.post(
  "/:id/reporte-emergencia",
  isAuthorized(["super_admin"]),
  generarReporteEmergencia,
);

export default router;