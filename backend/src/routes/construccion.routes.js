"use strict";
import { Router } from "express";
import {
  crearVivienda,
  iniciarConstruccion,
  actualizarAvanceHito,
  completarConstruccion,
  pausarConstruccion,
  obtenerViviendas,
  obtenerVivienda,
  verificarRetrasos,
  eliminarVivienda,
} from "../controllers/construccion.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAuthorized } from "../middlewares/authorization.middleware.js";

const router = Router();

// Rutas públicas (requieren autenticación)
router.get("/viviendas", authenticateJwt, obtenerViviendas);
router.get("/viviendas/:viviendasId", authenticateJwt, obtenerVivienda);

// Rutas protegidas - Solo administrador puede crear y eliminar viviendas
router.post("/viviendas", authenticateJwt, isAuthorized(["administrador"]), crearVivienda);
router.delete("/viviendas/:viviendasId", authenticateJwt, isAuthorized(["administrador"]), eliminarVivienda);
// Solo jefe de cuadrilla puede iniciar construcción
router.patch("/viviendas/:viviendasId/iniciar", authenticateJwt, isAuthorized(["jefe_cuadrilla"]), iniciarConstruccion);
router.patch("/viviendas/:viviendasId/completar", authenticateJwt, isAuthorized(["jefe_cuadrilla", "administrador"]), completarConstruccion);
router.patch("/viviendas/:viviendasId/pausar", authenticateJwt, isAuthorized(["jefe_cuadrilla", "administrador"]), pausarConstruccion);

// Rutas para actualizar avance (usuarios normales pueden participar)
router.patch("/viviendas/:viviendasId/hitos/:hitoId/avance", authenticateJwt, isAuthorized(["usuario", "jefe_cuadrilla", "administrador"]), actualizarAvanceHito);

// Verificación de retrasos (solo administrador)
router.post("/verificar-retrasos", authenticateJwt, isAuthorized(["administrador"]), verificarRetrasos);

export default router;
