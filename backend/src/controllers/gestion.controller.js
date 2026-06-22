"use strict";
import { registrarAsignacionService, registrarDevolucionService, registrarAsistenciaService } from "../services/gestion.service.js";
import { handleSuccess, handleErrorClient } from "../handlers/responseHandlers.js";

export async function crearAsignacion(req, res) {
    const [result, error] = await registrarAsignacionService(req.body, req.user.id);
    if (error) return handleErrorClient(res, 400, error?.message || error);
    handleSuccess(res, 201, "Asignación creada correctamente", result);
}

export async function marcarDevolucion(req, res) {
    const { id } = req.params;
    const { cantidadDevuelta } = req.body;
    const [result, error] = await registrarDevolucionService(id, cantidadDevuelta);
    if (error) return handleErrorClient(res, 400, error?.message || error);
    handleSuccess(res, 200, "Devolución registrada correctamente", result);
}

export async function tomarAsistencia(req, res) {
    const [result, error] = await registrarAsistenciaService(req.body, req.user.id);
    if (error) return handleErrorClient(res, 400, error?.message || error);
    handleSuccess(res, 201, "Asistencia registrada correctamente", result);
}