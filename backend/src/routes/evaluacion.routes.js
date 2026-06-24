"use strict";
import { Router } from "express";
import { crearEvaluacion, obtenerEvaluaciones } from "../controllers/evaluacion.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";

const router = Router();

router.use(authenticateJwt);

router.post("/", crearEvaluacion);
router.get("/", obtenerEvaluaciones);

export default router;
