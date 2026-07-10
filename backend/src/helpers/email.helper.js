"use strict";
import { sendEmail } from "../services/email.service.js";
import { reporteMedicoTemplate } from "../templates/reporteMedico.templates.js";

// Función para enviar comprobante de transporte
export async function enviarComprobanteTransporte(emailDestino, transporte, puntoEncuentro) {
  try {
    const subject = `Comprobante de Transporte - ${transporte.numeroAutobus}`;

    const html = `
      <h2>Comprobante de Transporte</h2>
      <p><strong>Punto de Encuentro:</strong> ${puntoEncuentro}</p>
      <hr/>
      <h3>Detalles del Vehículo</h3>
      <ul>
        <li><strong>Número de Autobús:</strong> ${transporte.numeroAutobus}</li>
        <li><strong>Placa:</strong> ${transporte.placa}</li>
        <li><strong>Capacidad:</strong> ${transporte.capacidad} personas</li>
        <li><strong>Conductor:</strong> ${transporte.conductor}</li>
      </ul>
      <h3>Detalles del Viaje</h3>
      <ul>
        <li><strong>Ruta de Partida:</strong> ${transporte.rutaPartida}</li>
        <li><strong>Ruta de Destino:</strong> ${transporte.rutaDestino}</li>
        <li><strong>Hora de Partida:</strong> ${transporte.horaPartida || "Por confirmar"}</li>
        <li><strong>Fecha de Jornada:</strong> ${transporte.fechaJornada}</li>
        <li><strong>Abordajes Registrados:</strong> ${transporte.abordajosRegistrados}/${transporte.capacidad}</li>
      </ul>
      <hr/>
      <p><em>Este es un comprobante automático del sistema. Por favor, conserve esta información.</em></p>
    `;

    const text = `
      Comprobante de Transporte - ${transporte.numeroAutobus}
      Punto de Encuentro: ${puntoEncuentro}
      
      Autobús: ${transporte.numeroAutobus}
      Placa: ${transporte.placa}
      Capacidad: ${transporte.capacidad} personas
      Conductor: ${transporte.conductor}
      
      Partida desde: ${transporte.rutaPartida}
      Destino: ${transporte.rutaDestino}
      Hora de Partida: ${transporte.horaPartida || "Por confirmar"}
      Fecha: ${transporte.fechaJornada}
    `;

    return await sendEmail(emailDestino, subject, text, html);
  } catch (error) {
    console.error("Error al enviar comprobante de transporte:", error);
    return [null, error.message];
  }
}

// Función para enviar alerta de kits incompletos
export async function enviarAlertaKitIncompleto(emailDestino, kit, razon = "") {
  try {
    const subject = `⚠️ ALERTA: Kit Incompleto - ${kit.nombre}`;

    const html = `
      <div style="border: 3px solid red; padding: 15px; background-color: #ffe6e6;">
        <h2 style="color: red;">⚠️ ALERTA DE KIT INCOMPLETO</h2>
        <h3>${kit.nombre}</h3>
        <hr/>
        <ul>
          <li><strong>Código del Kit:</strong> ${kit.codigoKit}</li>
          <li><strong>Estado:</strong> <span style="color: red; font-weight: bold;">FALTANTE/INCOMPLETO</span></li>
          <li><strong>Cantidad de Items:</strong> ${kit.cantidadItems}</li>
          <li><strong>Razón:</strong> ${razon || "No especificada"}</li>
          <li><strong>Fecha de Alerta:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <hr/>
        <p style="color: red; font-weight: bold;">Por favor, revise y complete el kit de inmediato.</p>
      </div>
    `;

    const text = `
      ⚠️ ALERTA: KIT INCOMPLETO
      ${kit.nombre}
      
      Código: ${kit.codigoKit}
      Estado: FALTANTE/INCOMPLETO
      Cantidad de Items: ${kit.cantidadItems}
      Razón: ${razon || "No especificada"}
      
      Por favor, revise y complete el kit de inmediato.
    `;

    return await sendEmail(emailDestino, subject, text, html);
  } catch (error) {
    console.error("Error al enviar alerta de kit incompleto:", error);
    return [null, error.message];
  }
}

// Función para notificar a un voluntario que ha sido agregado a una cuadrilla
export async function enviarNotificacionCuadrilla(emailDestino, nombreCuadrilla, nombreJefe, nombreVoluntario) {
  try {
    const subject = `Incorporación a la Cuadrilla: ${nombreCuadrilla}`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2b6cb0; margin-bottom: 20px;">¡Hola, ${nombreVoluntario}!</h2>
        <p>Te informamos que has sido asignado/a exitosamente a la cuadrilla <strong>${nombreCuadrilla}</strong>.</p>
        <p>A partir de este momento, formas parte de este equipo para las próximas actividades de voluntariado.</p>
        <div style="background-color: #f7fafc; padding: 15px; border-left: 4px solid #2b6cb0; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #4a5568;">Detalles de la Cuadrilla:</p>
          <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #4a5568;">
            <li><strong>Nombre de la Cuadrilla:</strong> ${nombreCuadrilla}</li>
            <li><strong>Jefe de Cuadrilla:</strong> ${nombreJefe}</li>
          </ul>
        </div>
        <p>Si tienes alguna duda, puedes contactar al Jefe de tu Cuadrilla.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 0.85em; color: #a0aec0; text-align: center;">Este es un mensaje automático del Sistema de Gestión de Voluntariado.</p>
      </div>
    `;

    const text = `
      ¡Hola, ${nombreVoluntario}!
      
      Te informamos que has sido asignado/a exitosamente a la cuadrilla "${nombreCuadrilla}".
      
      Detalles:
      - Nombre de la Cuadrilla: ${nombreCuadrilla}
      - Jefe de Cuadrilla: ${nombreJefe}
      
      Si tienes alguna duda, puedes contactar al Jefe de tu Cuadrilla.
      
      Este es un mensaje automático del Sistema de Gestión de Voluntariado.
    `;

    return await sendEmail(emailDestino, subject, text, html);
  } catch (error) {
    console.error("Error al enviar notificación de cuadrilla:", error);
    return [null, error.message];
  }
}
