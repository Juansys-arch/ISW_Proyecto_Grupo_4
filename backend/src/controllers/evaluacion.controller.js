"use strict";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { AppDataSource } from "../config/configDb.js";
import Evaluacion from "../entity/evaluacion.entity.js";

const evaluacionRepository = AppDataSource.getRepository(Evaluacion);

export async function crearEvaluacion(req, res) {
  try {
    const { cuadrillaId, calificacion, comentarios } = req.body;
    const jefeCuadrillaId = req.user.id; // Asumiendo que el JWT inyecta el req.user

    if (!cuadrillaId || calificacion === undefined) {
      return handleErrorClient(res, 400, "La cuadrilla y la calificación son obligatorias");
    }

    if (calificacion < 1 || calificacion > 5) {
      return handleErrorClient(res, 400, "La calificación debe estar entre 1 y 5");
    }

    const nuevaEvaluacion = evaluacionRepository.create({
      cuadrillaId,
      jefeCuadrillaId,
      calificacion,
      comentarios,
    });

    const evaluacionGuardada = await evaluacionRepository.save(nuevaEvaluacion);
    handleSuccess(res, 201, "Evaluación registrada exitosamente", evaluacionGuardada);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function obtenerEvaluaciones(req, res) {
  try {
    const evaluaciones = await evaluacionRepository.find({
      relations: ["cuadrilla", "jefeCuadrilla"],
    });
    handleSuccess(res, 200, "Evaluaciones obtenidas exitosamente", evaluaciones);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
