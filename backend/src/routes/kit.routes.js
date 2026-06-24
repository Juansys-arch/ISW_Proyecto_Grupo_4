"use strict";
import { Router } from "express";
import {
  actualizarKit,
  crearKit,
  eliminarKit,
  marcarKitIncompleto,
  obtenerKitPorId,
  obtenerKits,
  verificarKitsIncompletos,
} from "../controllers/kit.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdminOrJefeCuadrilla } from "../middlewares/authorization.middleware.js";

const router = Router();

router.post("/", authenticateJwt, isAdminOrJefeCuadrilla, crearKit);
router.get("/verificar/incompletos", authenticateJwt, isAdminOrJefeCuadrilla, verificarKitsIncompletos);
router.get("/", authenticateJwt, isAdminOrJefeCuadrilla, obtenerKits);
router.get("/:id", authenticateJwt, isAdminOrJefeCuadrilla, obtenerKitPorId);
router.put("/:id", authenticateJwt, isAdminOrJefeCuadrilla, actualizarKit);
router.delete("/:id", authenticateJwt, isAdminOrJefeCuadrilla, eliminarKit);
router.post("/:id/marcar-incompleto", authenticateJwt, isAdminOrJefeCuadrilla, marcarKitIncompleto);

export default router;
