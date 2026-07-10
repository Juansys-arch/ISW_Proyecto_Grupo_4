"use strict";

import { AppDataSource } from "../config/configDb.js";
import Incidencia from "../entity/incidencia.entity.js";
import Notificacion from "../entity/notificacion.entity.js";
import User from "../entity/user.entity.js";
import { notificarPorRoles } from "./notificacion.service.js";
import { enviarReporteMedicoJefeCuadrilla } from "../helpers/reporteMedico.helper.js";
import { sendEmail } from "./email.service.js";

const incidenciaRepository = AppDataSource.getRepository(Incidencia);
const notificacionRepository = AppDataSource.getRepository(Notificacion);
const userRepository = AppDataSource.getRepository(User);

export async function crearIncidenciaService(data, jefeCuadrillaId) {
  try {
    const incidencia = await incidenciaRepository.save({
      descripcion: data.descripcion,
      fecha: data.fecha,
      prioridad: data.prioridad,
      tipo: data.tipo,
      estado: data.estado ?? "pendiente",
      jefeCuadrillaId,
      nombrePaciente: data.nombrePaciente ?? null,
      rutPaciente: data.rutPaciente ?? null,
      ubicacionPaciente: data.ubicacionPaciente ?? null,
      observacionMedica: data.observacionMedica ?? null,
      equipoMedico: data.equipoMedico ?? null,
    });

    const requiereNotificacion =
      (data.tipo === "accidente" && ["alta", "critica"].includes(data.prioridad)) ||
      data.prioridad === "critica" ||
      data.tipo === "falta_material";

    if (requiereNotificacion) {
      const nombrePaciente = data.nombrePaciente || "No informado";
      const rutPaciente = data.rutPaciente || "No informado";
      const ubicacionPaciente = data.ubicacionPaciente || "No informada";
      const observacionMedica = data.observacionMedica || null;

      await notificarPorRoles({
        roles: ["encargado_inventario", "super_admin"],
        tipo: "incidencia_critica",
        mensaje: [
          `Se registró una incidencia ${data.prioridad} de tipo ${data.tipo}: ${data.descripcion}`,
          `Paciente: ${nombrePaciente}`,
          `RUT: ${rutPaciente}`,
          `Ubicación: ${ubicacionPaciente}`,
          observacionMedica ? `Observación médica: ${observacionMedica}` : null,
        ].filter(Boolean).join(" "),
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

export async function actualizarIncidenciaService(id, data) {
  try {
    const incidencia = await incidenciaRepository.findOne({ where: { id } });
    if (!incidencia) return [null, "Incidencia no encontrada"];

    if (data.descripcion !== undefined) incidencia.descripcion = data.descripcion;
    if (data.fecha !== undefined) incidencia.fecha = data.fecha;
    if (data.prioridad !== undefined) incidencia.prioridad = data.prioridad;
    if (data.tipo !== undefined) incidencia.tipo = data.tipo;
    if (data.estado !== undefined) incidencia.estado = data.estado;
    if (data.nombrePaciente !== undefined) incidencia.nombrePaciente = data.nombrePaciente;
    if (data.rutPaciente !== undefined) incidencia.rutPaciente = data.rutPaciente;
    if (data.ubicacionPaciente !== undefined) incidencia.ubicacionPaciente = data.ubicacionPaciente;
    if (data.observacionMedica !== undefined) incidencia.observacionMedica = data.observacionMedica;
    if (data.equipoMedico !== undefined) incidencia.equipoMedico = data.equipoMedico;

    const updatedIncidencia = await incidenciaRepository.save(incidencia);
    return [updatedIncidencia, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function eliminarIncidenciaService(id) {
  try {
    const incidencia = await incidenciaRepository.findOne({ where: { id } });
    if (!incidencia) return [null, "Incidencia no encontrada"];

    await incidenciaRepository.remove(incidencia);
    return [true, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function generarReporteEmergenciaConDatosService(incidenciaId, adminId, datosReporte) {
  try {
    const incidencia = await incidenciaRepository.findOne({
      where: { id: incidenciaId },
      relations: ["jefeCuadrilla"],
    });

    if (!incidencia) {
      return [null, "Incidencia no encontrada"];
    }

    const requiereAtencionMedica = incidencia.tipo === "accidente";

    if (!requiereAtencionMedica) {
      return [null, "Solo los accidentes pueden generar reporte de emergencia"];
    }

    incidencia.estado = "listo";
    if (datosReporte.nombrePaciente !== undefined) incidencia.nombrePaciente = datosReporte.nombrePaciente;
    if (datosReporte.rutPaciente !== undefined) incidencia.rutPaciente = datosReporte.rutPaciente;
    if (datosReporte.ubicacionPaciente !== undefined) incidencia.ubicacionPaciente = datosReporte.ubicacionPaciente;
    if (datosReporte.observacionMedica !== undefined) incidencia.observacionMedica = datosReporte.observacionMedica;
    if (datosReporte.equipoMedico !== undefined) incidencia.equipoMedico = datosReporte.equipoMedico;
    
    await incidenciaRepository.save(incidencia);

    const admins = await userRepository.find({
      where: [{ rol: "super_admin" }, { rol: "encargado_inventario" }],
      select: ["id", "nombreCompleto", "email"],
    });

    const nombrePaciente = datosReporte.nombrePaciente || incidencia.nombrePaciente || "No informado";
    const rutPaciente = datosReporte.rutPaciente || incidencia.rutPaciente || "No informado";
    const ubicacionPaciente = datosReporte.ubicacionPaciente || incidencia.ubicacionPaciente || "No informada";
    const observacionMedica = datosReporte.observacionMedica || incidencia.observacionMedica || null;
    const gravedad = datosReporte.gravedad || incidencia.prioridad;

    const mensaje = [
      "Reporte de emergencia médica generado.",
      `Incidencia #${incidencia.id}`,
      `Paciente: ${nombrePaciente}`,
      `RUT paciente: ${rutPaciente}`,
      `Ubicación del paciente: ${ubicacionPaciente}`,
      `Gravedad: ${gravedad}`,
      `Prioridad: ${incidencia.prioridad}`,
      `Descripción: ${incidencia.descripcion}`,
      observacionMedica ? `Observación médica: ${observacionMedica}` : null,
      `Reportado por: ${incidencia.jefeCuadrilla?.nombreCompleto || `ID ${incidencia.jefeCuadrillaId}`}`,
      "Acción sugerida: coordinar ambulancia o personal médico de inmediato.",
    ].filter(Boolean).join(" ");

    await notificacionRepository.save(
      admins.map((admin) =>
        notificacionRepository.create({
          tipo: "reporte_emergencia",
          mensaje,
          administradorId: admin.id,
          incidenciaId: incidencia.id,
          materialId: null,
          leida: false,
        }),
      ),
    );

    const [emailSent] = await sendEmail(
      process.env.EMERGENCY_MEDICAL_EMAIL || "ambulancia@servicio-medico.local",
      `Emergencia médica - incidencia #${incidencia.id}`,
      mensaje,
    );

    const adminGenerador = admins.find(a => a.id === adminId);
    let adminNombre = "Administrador";
    if (adminGenerador) {
      adminNombre = adminGenerador.nombreCompleto;
    } else {
      const adminDb = await userRepository.findOne({ where: { id: adminId }, select: ["nombreCompleto"] });
      if (adminDb) adminNombre = adminDb.nombreCompleto;
    }

    if (incidencia.jefeCuadrilla && incidencia.jefeCuadrilla.email) {
      enviarReporteMedicoJefeCuadrilla(
        incidencia.jefeCuadrilla.email,
        datosReporte,
        adminNombre
      ).catch(e => console.error("Fallo al enviar correo al Jefe de Cuadrilla:", e));
    }

    return [
      {
        incidencia,
        emailSent,
        mensaje,
        datosReporte,
        accionPor: adminId,
      },
      null,
    ];
  } catch (error) {
    return [null, error.message];
  }
}
