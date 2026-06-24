"use strict";
import { Router } from "express";
import {
  approveVolunteer,
  deleteVolunteer,
  getAllVolunteers,
  getPendingVolunteers,
  getRegionsList,
  getVolunteersByRegion,
  registerVolunteer,
  registerVolunteerOnSite,
  updateVolunteerDetails,
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

// Obtener voluntarios agrupados por regiones y comunas
router.get("/regions", authenticateJwt, isAdminOrCoordinator, getVolunteersByRegion);

// Obtener lista de regiones y comunas (solo lista)
router.get("/regions/list", authenticateJwt, isAdminOrCoordinator, getRegionsList);

// Obtener voluntarios pendientes (requiere autenticación y rol admin/coordinator)
router.get("/pending", authenticateJwt, isAdminOrCoordinator, getPendingVolunteers);

// Actualizar detalles del voluntario (requiere autenticación y rol admin/coordinator)
router.put("/details", authenticateJwt, isAdminOrCoordinator, updateVolunteerDetails);
router.put("/:id", authenticateJwt, isAdminOrCoordinator, updateVolunteerDetails);

// Eliminar voluntario (requiere autenticación y rol admin/coordinator)
router.delete("/:id", authenticateJwt, isAdminOrCoordinator, deleteVolunteer);

export default router;