"use strict";

export function reporteMedicoTemplate(datosReporte, adminNombre, fecha) {
    return `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #ddd; border-radius:8px; overflow:hidden;">
      
      <div style="background:#003366; color:white; padding:20px; text-align:center;">
        <h2>🚑 Reporte Médico de Incidencia</h2>
      </div>

      <div style="padding:20px;">
        <table style="width:100%; border-collapse:collapse;">

          <tr>
            <td><strong>Paciente</strong></td>
            <td>${datosReporte.nombrePaciente}</td>
          </tr>

          <tr>
            <td><strong>RUT</strong></td>
            <td>${datosReporte.rutPaciente}</td>
          </tr>

          <tr>
            <td><strong>Ubicación</strong></td>
            <td>${datosReporte.ubicacionPaciente}</td>
          </tr>

          <tr>
            <td><strong>Gravedad</strong></td>
            <td>${datosReporte.gravedad}</td>
          </tr>

          <tr>
            <td><strong>Equipo Médico</strong></td>
            <td>${datosReporte.equipoMedico}</td>
          </tr>

          <tr>
            <td><strong>Observaciones</strong></td>
            <td>${datosReporte.observacionMedica}</td>
          </tr>

          <tr>
            <td><strong>Administrador</strong></td>
            <td>${adminNombre}</td>
          </tr>

          <tr>
            <td><strong>Fecha</strong></td>
            <td>${fecha}</td>
          </tr>

        </table>

        <hr>

        <p>
          Este reporte fue generado automáticamente por el Sistema de Gestión de Incidencias Médicas.
        </p>

      </div>

    </div>
  `;
}