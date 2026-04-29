"use strict";
import {
  obtenerNotificacionesService,
  marcarNotificacionLeidaService,
} from "../services/notificacion.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function obtenerNotificaciones(req, res) {
  try {
    const administradorId = req.user.id;
    const [notificaciones, error] = await obtenerNotificacionesService(administradorId);
    if (error)
      return handleErrorClient(res, 400, "Error al obtener notificaciones", error);

    handleSuccess(res, 200, "Notificaciones obtenidas exitosamente", notificaciones);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function marcarNotificacionLeida(req, res) {
  try {
    const { id } = req.params;
    const administradorId = req.user.id;

    const [result, error] = await marcarNotificacionLeidaService(parseInt(id), administradorId);
    if (error)
      return handleErrorClient(res, 400, "Error al marcar notificación", error);

    handleSuccess(res, 200, "Notificación marcada como leída", result);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}