"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAuthorized } from "../middlewares/authorization.middleware.js";
import { actualizarEstadoSolicitud,actualizarMaterial,crearMaterial,obtenerMateriales,obtenerMaterialPorId,obtenerMisSolicitudes,obtenerMovimientos, obtenerSolicitudes, registrarMovimiento, solicitarMaterial } from "../controllers/inventario.controller.js"; 
const router = Router();

router.use(authenticateJwt);
 

router.post(
  "/materiales",
  isAuthorized(["jefe_cuadrilla"]),
  crearMaterial
);
 
router.get(
  "/materiales",
  isAuthorized(["encargado_inventario", "administrador", "jefe_cuadrilla"]),
  obtenerMateriales
);

router.get("/materiales/:id",
  isAuthorized(["encargado_inventario", "administrador", "jefe_cuadrilla"]),
  obtenerMaterialPorId
);

router.patch(
  "/materiales/:id",
  isAuthorized(["encargado_inventario", "administrador"]),
  actualizarMaterial
);

router.get(
  "/solicitudes",
  isAuthorized(["encargado_inventario", "administrador"]),
  obtenerSolicitudes
);

router.get(
  "/solicitudes/mis",
  isAuthorized(["jefe_cuadrilla", "administrador"]),
  obtenerMisSolicitudes
);

router.patch(
  "/solicitudes/:id/estado",
  isAuthorized(["encargado_inventario", "administrador"]),
  actualizarEstadoSolicitud
);



export default router;
 