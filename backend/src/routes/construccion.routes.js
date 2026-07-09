"use strict";
import { Router } from "express";
import {
  actualizarAvanceHito,
  completarConstruccion,
  crearVivienda,
  debugViviendas,
  eliminarVivienda,
  firmarGarantia,
  iniciarConstruccion,
  obtenerVivienda,
  obtenerViviendas,
  pausarConstruccion,
  reanudarConstruccion,
  verificarRetrasos,
} from "../controllers/construccion.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAuthorized } from "../middlewares/authorization.middleware.js";

const router = Router();

// Rutas públicas (requieren autenticación)
router.get("/viviendas", authenticateJwt, obtenerViviendas);
router.get("/viviendas/:viviendasId", authenticateJwt, obtenerVivienda);

// Rutas protegidas - Solo administrador puede crear y eliminar viviendas
router.post("/viviendas", authenticateJwt, isAuthorized(["super_admin"]), crearVivienda);
router.delete("/viviendas/:viviendasId", authenticateJwt, isAuthorized(["super_admin"]), eliminarVivienda);
// Solo jefe de cuadrilla puede iniciar construcción
router.patch("/viviendas/:viviendasId/iniciar", authenticateJwt, isAuthorized(["jefe_cuadrilla"]), iniciarConstruccion);
router.patch("/viviendas/:viviendasId/completar", authenticateJwt, isAuthorized(["jefe_cuadrilla", "super_admin"]), completarConstruccion);
router.patch("/viviendas/:viviendasId/pausar", authenticateJwt, isAuthorized(["jefe_cuadrilla", "super_admin"]), pausarConstruccion);
router.patch("/viviendas/:viviendasId/reanudar", authenticateJwt, isAuthorized(["jefe_cuadrilla", "super_admin"]), reanudarConstruccion);

router.post(
  "/:viviendasId/firma-garantia",
  authenticateJwt,
  isAuthorized(["jefe_cuadrilla", "super_admin"]),
  firmarGarantia
);

// Rutas para actualizar avance (usuarios normales pueden participar)
router.patch("/viviendas/:viviendasId/hitos/:hitoId/avance", authenticateJwt, isAuthorized(["usuario", "jefe_cuadrilla", "super_admin"]), actualizarAvanceHito);

// Verificación de retrasos (solo administrador)
router.post(
  "/verificar-retrasos",
  authenticateJwt,
  isAuthorized(["super_admin", "administrador"]),
  verificarRetrasos
);
router.get(
  "/debug/viviendas",
  authenticateJwt,
  isAuthorized(["super_admin", "administrador"]),
  debugViviendas
);

export default router;
