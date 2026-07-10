"use strict";

import { sendEmail } from "../services/email.service.js";
import { reporteMedicoTemplate } from "../templates/reporteMedico.templates.js";

export async function enviarReporteMedicoJefeCuadrilla(
    emailDestino,
    datosReporte,
    adminNombre
) {
    try {

        const subject = " Nuevo Reporte Médico de Incidencia";

        const fecha = new Date().toLocaleString("es-CL", {
            timeZone: "America/Santiago",
        });

        const text = `
Paciente: ${datosReporte.nombrePaciente}
RUT: ${datosReporte.rutPaciente}
Ubicación: ${datosReporte.ubicacionPaciente}
Gravedad: ${datosReporte.gravedad}
Equipo Médico: ${datosReporte.equipoMedico}
Observaciones: ${datosReporte.observacionMedica}

Administrador: ${adminNombre}
Fecha: ${fecha}
`;

        const html = reporteMedicoTemplate(
            datosReporte,
            adminNombre,
            fecha
        );

        return await sendEmail(
            emailDestino,
            subject,
            text,
            html
        );

    } catch (error) {
        console.error(error);
        return [null, error.message];
    }
}