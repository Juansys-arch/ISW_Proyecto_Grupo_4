"use strict";
import { Router } from "express";
import { tomarAsistencia, crearAsignacion, marcarDevolucion } from "../controllers/gestion.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdminOrJefeCuadrilla } from "../middlewares/authorization.middleware.js";

const router = Router();
router.use(authenticateJwt);
router.use(isAdminOrJefeCuadrilla);

// Coincide con /gestion/asistencia
router.post("/asistencia", tomarAsistencia);

// CAMBIO: Se ajusta a /activos/control para coincidir con el servicio
router.post("/activos/control", crearAsignacion); 

router.patch("/herramientas/devolucion/:id", marcarDevolucion);

export default router;