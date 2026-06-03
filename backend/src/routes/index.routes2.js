"use strict";
import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import studentRoutes from "./student.routes.js";
import inventarioRoutes from "./inventario.routes.js";
import gestionRoutes from "./gestion.routes.js";
import kitRoutes from "./kit.routes.js";
import transporteRoutes from "./transporte.routes.js";

const router = Router();

router
  .use("/auth", authRoutes)
  .use("/user", userRoutes)
  .use("/students", studentRoutes)
  .use("/inventario", inventarioRoutes)
  .use("/gestion", gestionRoutes)
  .use("/kits", kitRoutes)
  .use("/transporte", transporteRoutes);

export default router;