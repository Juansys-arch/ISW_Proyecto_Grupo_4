"use strict";
import { Router } from "express";
import {
  crearTransporte,
  obtenerTransportes,
  obtenerTransportePorId,
  actualizarTransporte,
  registrarAbordaje,
  eliminarTransporte,
} from "../controllers/transporte.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdminOrJefeCuadrilla } from "../middlewares/authorization.middleware.js";

const router = Router();

router.post("/", authenticateJwt, isAdminOrJefeCuadrilla, crearTransporte);
router.get("/", authenticateJwt, isAdminOrJefeCuadrilla, obtenerTransportes);
router.get("/:id", authenticateJwt, isAdminOrJefeCuadrilla, obtenerTransportePorId);
router.put("/:id", authenticateJwt, isAdminOrJefeCuadrilla, actualizarTransporte);
router.post("/:id/abordaje", authenticateJwt, isAdminOrJefeCuadrilla, registrarAbordaje);
router.delete("/:id", authenticateJwt, isAdminOrJefeCuadrilla, eliminarTransporte);

export default router;
