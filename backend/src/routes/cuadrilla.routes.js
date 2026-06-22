"use strict";
import { Router } from "express";
import {
  getCuadrillas,
  crearCuadrilla,
  actualizarCuadrilla,
  eliminarCuadrilla,
  getVoluntariosDisponibles,
  crearVoluntario,
  actualizarVoluntario,
} from "../controllers/cuadrilla.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdminOrJefeCuadrilla } from "../middlewares/authorization.middleware.js";

const router = Router();

router.use(authenticateJwt);
router.use(isAdminOrJefeCuadrilla);

router.get("/", getCuadrillas);
router.post("/", crearCuadrilla);
router.put("/:id", actualizarCuadrilla);
router.delete("/:id", eliminarCuadrilla);
router.get("/voluntarios-disponibles", getVoluntariosDisponibles);
router.post("/voluntarios", crearVoluntario);
router.put("/voluntarios/:id", actualizarVoluntario);

export default router;
