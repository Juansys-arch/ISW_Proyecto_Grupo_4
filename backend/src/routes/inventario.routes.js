"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAuthorized } from "../middlewares/authorization.middleware.js";
import { actualizarEstadoSolicitud,actualizarMaterial,crearMaterial,obtenerMateriales,obtenerMaterialPorId,obtenerMisSolicitudes,obtenerMovimientos, obtenerSolicitudes, registrarMovimiento, solicitarMaterial } from "../controllers/inventario.controller.js"; 
const router = Router();

router.use(authenticateJwt);
 

router.post(
  "/materiales",
  isAuthorized(["encargado_inventario", "super_admin"]),
  crearMaterial
);
 
router.get(
  "/materiales",
  isAuthorized(["encargado_inventario", "super_admin", "jefe_cuadrilla"]),
  obtenerMateriales
);

router.get("/materiales/:id",
  isAuthorized(["encargado_inventario", "super_admin", "jefe_cuadrilla"]),
  obtenerMaterialPorId
);

router.patch(
  "/materiales/:id",
  isAuthorized(["encargado_inventario", "super_admin"]),
  actualizarMaterial
);

router.get(
  "/solicitudes",
  isAuthorized(["encargado_inventario", "super_admin"]),
  obtenerSolicitudes
);

router.get(
  "/solicitudes/mis",
  isAuthorized(["jefe_cuadrilla", "super_admin"]),
  obtenerMisSolicitudes
);

router.patch(
  "/solicitudes/:id/estado",
  isAuthorized(["encargado_inventario", "super_admin"]),
  actualizarEstadoSolicitud
);

router.post(
  "/solicitudes",
  isAuthorized(["jefe_cuadrilla", "super_admin"]),
  solicitarMaterial
);

router.post(
  "/movimientos",
  isAuthorized(["encargado_inventario", "super_admin"]),
  registrarMovimiento
);

router.get(
  "/movimientos",
  isAuthorized(["encargado_inventario", "super_admin", "jefe_cuadrilla"]),
  obtenerMovimientos
);

export default router;
 