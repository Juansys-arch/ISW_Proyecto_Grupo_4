"use strict";
import { Router } from "express";
import {
  registerVolunteer,
  registerVolunteerOnSite,
  approveVolunteer,
  getPendingVolunteers,
  updateVolunteerDetails,
  getAllVolunteers,
  deleteVolunteer,
} from "../controllers/volunteer.controller.js";
import { isAdminOrCoordinator } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";

const router = Router();

// Registro público (web)
router.post("/register", registerVolunteer);

// Registro en sitio (requiere autenticación y rol admin/coordinator)
router.post("/register-onsite", authenticateJwt, isAdminOrCoordinator, registerVolunteerOnSite);

// Aprobar/rechazar voluntario (requiere autenticación y rol admin/coordinator)
router.put("/approve", authenticateJwt, isAdminOrCoordinator, approveVolunteer);

// Obtener todos los voluntarios (requiere autenticación y rol admin/coordinator)
router.get("/", authenticateJwt, isAdminOrCoordinator, getAllVolunteers);

// Obtener voluntarios pendientes (requiere autenticación y rol admin/coordinator)
router.get("/pending", authenticateJwt, isAdminOrCoordinator, getPendingVolunteers);

// Actualizar detalles del voluntario (requiere autenticación y rol admin/coordinator)
router.put("/details", authenticateJwt, isAdminOrCoordinator, updateVolunteerDetails);
router.put("/:id", authenticateJwt, isAdminOrCoordinator, updateVolunteerDetails);

// Eliminar voluntario (requiere autenticación y rol admin/coordinator)
router.delete("/:id", authenticateJwt, isAdminOrCoordinator, deleteVolunteer);

export default router;