"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAuthorized } from "../middlewares/authorization.middleware.js";
import {
  obtenerNotificaciones,
  marcarNotificacionLeida,
} from "../controllers/notificacion.controller.js";

const router = Router();
router.use(authenticateJwt);
router.get("/",isAuthorized(["encargado_inventario", "administrador", "jefe_cuadrilla"]),
  obtenerNotificaciones
);
 
router.patch("/:id/leer",isAuthorized(["encargado_inventario", "administrador", "jefe_cuadrilla"]),
  marcarNotificacionLeida
);
 
export default router;