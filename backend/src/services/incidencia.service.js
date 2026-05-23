"use strict";

import { AppDataSource } from "../config/configDb.js";
import Incidencia from "../entity/incidencia.entity.js";
import { notificarPorRoles } from "./notificacion.service.js";

const incidenciaRepository = AppDataSource.getRepository(Incidencia);

export async function crearIncidenciaService(data, jefeCuadrillaId) {
  try {
    const incidencia = await incidenciaRepository.save({
      descripcion: data.descripcion,
      fecha: data.fecha,
      prioridad: data.prioridad,
      tipo: data.tipo,
      estado: data.estado ?? "pendiente",
      jefeCuadrillaId,
    });

    const requiereNotificacion =
      data.prioridad === "critica" || data.tipo === "falta_material";

    if (requiereNotificacion) {
      await notificarPorRoles({
        roles: ["encargado_inventario", "administrador"],
        tipo: "incidencia_critica",
        mensaje: `Se registró una incidencia ${data.prioridad} de tipo ${data.tipo}: ${data.descripcion}`,
        incidenciaId: incidencia.id,
      });
    }

    return [incidencia, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function obtenerIncidenciasService() {
  try {
    const incidencias = await incidenciaRepository.find({
      order: { fecha: "DESC" },
      relations: ["jefeCuadrilla"],
    });

    return [incidencias, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function obtenerIncidenciaPorIdService(id) {
  try {
    const incidencia = await incidenciaRepository.findOne({
      where: { id },
      relations: ["jefeCuadrilla"],
    });

    if (!incidencia) return [null, "Incidencia no encontrada"];

    return [incidencia, null];
  } catch (error) {
    return [null, error.message];
  }
}