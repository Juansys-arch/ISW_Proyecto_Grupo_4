"use strict";
import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import construccionRoutes from "./construccion.routes.js";
import cuadrillaRoutes from "./cuadrilla.routes.js";
import evaluacionRoutes from "./evaluacion.routes.js";
import gestionRoutes from "./gestion.routes.js";
import incidenciaRoutes from "./incidencia.routes.js";
import inventarioRoutes from "./inventario.routes.js";
import kitRoutes from "./kit.routes.js";
import notificacionRoutes from "./notificacion.routes.js";
import transporteRoutes from "./transporte.routes.js";
import volunteerRoutes from "./volunteer.routes.js";

const router = Router();

router
  .use("/auth", authRoutes)
  .use("/user", userRoutes)
  .use("/construccion", construccionRoutes)
  .use("/cuadrilla", cuadrillaRoutes)
  .use("/evaluacion", evaluacionRoutes)
  .use("/gestion", gestionRoutes)
  .use("/incidencias", incidenciaRoutes)
  .use("/inventario", inventarioRoutes)
  .use("/kits", kitRoutes)
  .use("/notificaciones", notificacionRoutes)
  .use("/transporte", transporteRoutes)
  .use("/volunteers", volunteerRoutes);

export default router;
