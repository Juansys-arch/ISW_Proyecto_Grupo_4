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
