"use strict";
import { AppDataSource } from "../config/configDb.js";

const notificacionRepository = AppDataSource.getRepository("Notificacion");
const userRepository = AppDataSource.getRepository("User");

// Busca todos los administradores y les crea una notificación
export async function notificarAdministrador({ tipo, mensaje, incidenciaId = null, materialId = null }) {
  try {
    const administradores = await userRepository.find({
      where: { rol: "encargado_inventario" },
      select: ["id"],
    });

    if (!administradores.length) return;

    const notificaciones = administradores.map((admin) => ({
      administradorId: admin.id,
      tipo,
      mensaje,
      incidenciaId,
      materialId,
      leida: false,
    }));

    await notificacionRepository.save(notificaciones);
  } catch (error) {
    console.error("Error al generar notificación:", error.message);
  }
}

export async function obtenerNotificacionesService(administradorId) {
  try {
    const notificaciones = await notificacionRepository.find({
      where: { administradorId },
      order: { createdAt: "DESC" },
    });
    return [notificaciones, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function marcarNotificacionLeidaService(id, administradorId) {
  try {
    const notificacion = await notificacionRepository.findOne({
      where: { id, administradorId },
    });
    if (!notificacion) return [null, "Notificación no encontrada"];

    await notificacionRepository.update(id, { leida: true });
    return [{ message: "Notificación marcada como leída" }, null];
  } catch (error) {
    return [null, error.message];
  }
}