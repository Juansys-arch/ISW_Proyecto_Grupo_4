"use strict";

import {
  crearIncidenciaService,
  generarReporteEmergenciaConDatosService,
  obtenerIncidenciaPorIdService,
  obtenerIncidenciasService,
  actualizarIncidenciaService,
  eliminarIncidenciaService,
} from "../services/incidencia.service.js";
import {
  crearIncidenciaValidation,
  actualizarIncidenciaValidation,
  reporteEmergenciaValidation,
} from "../validations/incidencia.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function crearIncidencia(req, res) {
  try {
    const { body } = req;
    const { error } = crearIncidenciaValidation.validate(body);

    if (error) {
      return handleErrorClient(res, 400, "Error de validación", error.message);
    }

    const [incidencia, incidenciaError] = await crearIncidenciaService(body, req.user.id);

    if (incidenciaError) {
      return handleErrorClient(res, 400, "Error al registrar incidencia", incidenciaError);
    }

    handleSuccess(res, 201, "Incidencia registrada exitosamente", incidencia);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
export async function obtenerIncidencias(req, res) {
  try {
    const [incidencias, error] = await obtenerIncidenciasService();

    if (error) {
      return handleErrorClient(res, 400, "Error al obtener incidencias", error);
    }

    handleSuccess(res, 200, "Incidencias obtenidas exitosamente", incidencias);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function obtenerIncidenciaPorId(req, res) {
  try {
    const { id } = req.params;
    const [incidencia, error] = await obtenerIncidenciaPorIdService(parseInt(id));

    if (error) {
      return handleErrorClient(res, 404, "Error al obtener incidencia", error);
    }

    handleSuccess(res, 200, "Incidencia obtenida exitosamente", incidencia);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function generarReporteEmergencia(req, res) {
  try {
    const { id } = req.params;
    const datosReporte = req.body || {};
    if (Object.keys(datosReporte).length > 0) {
      const { error } = reporteEmergenciaValidation.validate(datosReporte);

      if (error) {
        return handleErrorClient(res, 400, "Error de validación", error.message);
      }
    }

    const [reporte, reporteError] = await generarReporteEmergenciaConDatosService(parseInt(id), req.user.id, datosReporte);

    if (reporteError) {
      return handleErrorClient(res, 400, "Error al generar reporte de emergencia", reporteError);
    }

    handleSuccess(res, 200, "Reporte de emergencia generado exitosamente", reporte);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function actualizarIncidencia(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;
    const { error } = actualizarIncidenciaValidation.validate(body);

    if (error) {
      return handleErrorClient(res, 400, "Error de validación", error.message);
    }

    const [incidencia, updateError] = await actualizarIncidenciaService(parseInt(id), body);

    if (updateError) {
      return handleErrorClient(res, 400, "Error al actualizar incidencia", updateError);
    }

    handleSuccess(res, 200, "Incidencia actualizada exitosamente", incidencia);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function eliminarIncidencia(req, res) {
  try {
    const { id } = req.params;
    const [incidencia, deleteError] = await eliminarIncidenciaService(parseInt(id));

    if (deleteError) {
      return handleErrorClient(res, 400, "Error al eliminar incidencia", deleteError);
    }

    handleSuccess(res, 200, "Incidencia eliminada exitosamente", incidencia);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}