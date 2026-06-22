"use strict";
import { AppDataSource } from "../config/configDb.js";
import AsignacionHerramientas from "../entity/asignacionHerramientas.entity.js";
import Asistencia from "../entity/asistencia.entity.js";
import Incidencia from "../entity/incidencia.entity.js";
import Notificacion from "../entity/notificacion.entity.js";
import User from "../entity/user.entity.js";

const asignacionRepository = AppDataSource.getRepository(AsignacionHerramientas);
const asistenciaRepository = AppDataSource.getRepository(Asistencia);
const incidenciaRepository = AppDataSource.getRepository(Incidencia);
const notificacionRepository = AppDataSource.getRepository(Notificacion);
const userRepository = AppDataSource.getRepository(User);

// REQUISITO 1: Registro de entrega de herramientas
export async function registrarAsignacionService(data, jefeCuadrillaId) {
    try {
        const asignacion = asignacionRepository.create({
            ...data,
            jefeCuadrillaId,
            estado: "en_uso"
        });
        await asignacionRepository.save(asignacion);
        return [asignacion, null];
    } catch (error) {
        return [null, error.message];
    }
}

// REQUISITO 1: Registro de devolución con incidencia automática
export async function registrarDevolucionService(asignacionId, cantidadDevuelta) {
  try {
    const asignacion = await asignacionRepository.findOne({
      where: { id: asignacionId },
      relations: ["material", "jefeCuadrilla"]
    });

    if (!asignacion) return [null, "Acta no encontrada"];

    asignacion.cantidadDevuelta = cantidadDevuelta;
    asignacion.fechaDevolucion = new Date();
    asignacion.estado = (cantidadDevuelta < asignacion.cantidadEntregada) ? "incompleto" : "devuelto";

    await asignacionRepository.save(asignacion);

    // Si falta material, crear incidencia y notificar automáticamente
    if (asignacion.estado === "incompleto") {
      const falta = asignacion.cantidadEntregada - cantidadDevuelta;
      
      const incidencia = await incidenciaRepository.save({
        descripcion: `Falta de ${falta} unidad(es) de ${asignacion.material.nombre} (ID: ${asignacion.materialId}) devuelto por cuadrilla de ${asignacion.jefeCuadrilla.nombreCompleto}`,
        prioridad: "alta",
        tipo: "falta_material",
        estado: "pendiente",
        jefeCuadrillaId: asignacion.jefeCuadrillaId,
        fecha: new Date()
      });

      // Notificar al Encargado de Voluntarios
      const encargados = await userRepository.find({ where: { rol: "encargado_voluntarios" } });
      await Promise.all(encargados.map(enc => 
        notificacionRepository.save({
          mensaje: `ALERTA: Kit incompleto. Incidencia #${incidencia.id} generada automáticamente.`,
          tipo: "incidencia_critica",
          administradorId: enc.id,
          incidenciaId: incidencia.id
        })
      ));
    }

    return [asignacion, null];
  } catch (error) {
    return [null, error.message];
  }
}

// REQUISITO 3: Control de asistencia con validación de cupos
export async function registrarAsistenciaService(data, jefeCuadrillaId) {
  try {
    const fechaHoy = new Date().toISOString().split('T')[0];
    
    // Comparación con cupos asignados (Ejemplo: límite de 40 por bus)
    const totalAsistentes = await asistenciaRepository.count({ where: { fecha: fechaHoy } });
    if (totalAsistentes >= 40) {
      return [null, "Cupos de transporte agotados para hoy"];
    }

    const asistencia = asistenciaRepository.create({
      ...data,
      jefeCuadrillaId,
      fecha: fechaHoy,
      asistio: true
    });

    await asistenciaRepository.save(asistencia);
    return [asistencia, null];
  } catch (error) {
    return [null, error.message];
  }
}