"use strict";
import {
  registerVolunteerService,
  registerVolunteerOnSiteService,
  approveVolunteerService,
  getPendingVolunteersService,
  updateVolunteerDetailsService,
  getAllVolunteersService,
  deleteVolunteerService,
} from "../services/volunteer.service.js";
import {
  volunteerRegisterValidation,
  volunteerOnSiteRegisterValidation,
  approveVolunteerValidation,
} from "../validations/volunteer.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function registerVolunteer(req, res) {
  try {
    const { body } = req;

    const { error } = volunteerRegisterValidation.validate(body);

    if (error) {
      return handleErrorClient(res, 400, "Error de validación", error.message);
    }

    const [newVolunteer, errorNewVolunteer] = await registerVolunteerService(body);

    if (errorNewVolunteer) return handleErrorClient(res, 400, "Error registrando al voluntario", errorNewVolunteer);

    handleSuccess(res, 201, "Voluntario registrado con éxito", newVolunteer);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function registerVolunteerOnSite(req, res) {
  try {
    const { body } = req;
    const userId = req.user.id; // Asumiendo que req.user tiene id

    const { error } = volunteerOnSiteRegisterValidation.validate(body);

    if (error) {
      return handleErrorClient(res, 400, "Error de validación", error.message);
    }

    const [newVolunteer, errorNewVolunteer] = await registerVolunteerOnSiteService(body, userId);

    if (errorNewVolunteer) return handleErrorClient(res, 400, "Error registrando al voluntario en sitio", errorNewVolunteer);

    handleSuccess(res, 201, "Voluntario registrado en sitio con éxito", newVolunteer);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function approveVolunteer(req, res) {
  try {
    const { body } = req;
    const approvedBy = req.user.id;

    const { error } = approveVolunteerValidation.validate(body);

    if (error) {
      return handleErrorClient(res, 400, "Error de validación", error.message);
    }

    const { volunteerId, action, rejectionReason, rolAsignado } = body;

    const [updatedVolunteer, errorUpdate] = await approveVolunteerService(volunteerId, action, rejectionReason, rolAsignado, approvedBy);

    if (errorUpdate) return handleErrorClient(res, 400, "Error procesando la aprobación", errorUpdate);

    handleSuccess(res, 200, "Voluntario procesado con éxito", updatedVolunteer);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getPendingVolunteers(req, res) {
  try {
    const [volunteers, errorVolunteers] = await getPendingVolunteersService();

    if (errorVolunteers) return handleErrorClient(res, 500, "Error obteniendo voluntarios pendientes", errorVolunteers);

    handleSuccess(res, 200, "Voluntarios pendientes obtenidos con éxito", volunteers);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateVolunteerDetails(req, res) {
  try {
    const id = req.params.id || req.query.id;
    const { body } = req;

    const volunteerId = Number(id);
    if (!Number.isInteger(volunteerId) || volunteerId <= 0) {
      return handleErrorClient(res, 400, "Error de validación", "ID de voluntario inválido.");
    }

    const [updatedVolunteer, errorUpdate] = await updateVolunteerDetailsService(volunteerId, body);

    if (errorUpdate) return handleErrorClient(res, 400, "Error actualizando detalles del voluntario", errorUpdate);

    handleSuccess(res, 200, "Detalles del voluntario actualizados con éxito", updatedVolunteer);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getAllVolunteers(req, res) {
  try {
    const [volunteers, errorVolunteers] = await getAllVolunteersService();

    if (errorVolunteers) return handleErrorClient(res, 500, "Error obteniendo voluntarios", errorVolunteers);

    handleSuccess(res, 200, "Voluntarios obtenidos con éxito", volunteers);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteVolunteer(req, res) {
  try {
    const id = req.params.id || req.query.id;
    const volunteerId = Number(id);

    if (!Number.isInteger(volunteerId) || volunteerId <= 0) {
      return handleErrorClient(res, 400, "Error de validación", "ID de voluntario inválido.");
    }

    const [deleted, errorDelete] = await deleteVolunteerService(volunteerId);
    if (errorDelete) return handleErrorClient(res, 400, "Error eliminando voluntario", errorDelete);

    handleSuccess(res, 200, "Voluntario eliminado con éxito", { id: volunteerId });
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}