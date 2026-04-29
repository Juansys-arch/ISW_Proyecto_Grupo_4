"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAuthorized } from "../middlewares/authorization.middleware.js";
import {crearMaterial,obtenerMateriales,obtenerMaterialPorId,actualizarMaterial,registrarMovimiento,obtenerMovimientos,solicitarMaterial,} from "../controllers/inventario.controller.js"; 
const router = Router();

router.use(authenticateJwt);
 

router.post(
  "/materiales",
  isAuthorized(["encargado_inventario", "administrador"]),
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
//movimientos
router.post(
  "/movimientos",
  isAuthorized(["encargado_inventario", "administrador"]),
  registrarMovimiento
);

router.get(
  "/movimientos",
  isAuthorized(["encargado_inventario", "administrador"]),
  obtenerMovimientos
);
///solicitudes
router.post(
  "/solicitudes",
  isAuthorized(["jefe_cuadrilla"]),
  solicitarMaterial
);



export default router;
 