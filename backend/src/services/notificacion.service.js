"use strict";
import { AppDataSource } from "../config/configDb.js";

const notificacionRepository = AppDataSource.getRepository("Notificacion");
const userRepository = AppDataSource.getRepository("User");

export async function notificarPorRoles({
  roles = ["encargado_inventario", "administrador"],
  tipo,
  mensaje,
  incidenciaId = null,
  materialId = null,
}) {
  try {
    const destinatarios = await userRepository.find({
      where: roles.map((rol) => ({ rol })),
      select: ["id"],
    });

    if (!destinatarios.length) return;

    const notificaciones = destinatarios.map((destinatario) => ({
      administradorId: destinatario.id,
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

export async function notificarAdministrador(datos) {
  return notificarPorRoles({
    ...datos,
    roles: ["encargado_inventario", "administrador"],
  });
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