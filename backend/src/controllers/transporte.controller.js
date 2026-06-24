"use strict";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { AppDataSource } from "../config/configDb.js";
import Transporte from "../entity/transporte.entity.js";

const transporteRepository = AppDataSource.getRepository(Transporte);
import { sendEmail } from "../helpers/email.helper.js";

export async function crearTransporte(req, res) {
  try {
    const { numeroAutobus, placa, capacidad, conductor, rutaPartida, rutaDestino, horaPartida, fechaJornada } = req.body;

    if (!numeroAutobus || !placa || !capacidad || !conductor) {
      return handleErrorClient(res, 400, "Campos obligatorios faltantes");
    }

    const placaExistente = await transporteRepository.findOne({ where: { placa } });
    if (placaExistente) {
      return handleErrorClient(res, 400, "La placa ya está registrada");
    }

    const nuevoTransporte = transporteRepository.create({
      numeroAutobus,
      placa,
      capacidad,
      conductor,
      rutaPartida: rutaPartida || "Punto de encuentro",
      rutaDestino: rutaDestino || "Sitio de obra",
      horaPartida,
      fechaJornada: fechaJornada || new Date().toISOString().split("T")[0],
      estado: "disponible",
      abordajosRegistrados: 0,
    });

    const transporteGuardado = await transporteRepository.save(nuevoTransporte);
    handleSuccess(res, 201, "Transporte registrado exitosamente", transporteGuardado);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function obtenerTransportes(req, res) {
  try {
    const { buscar } = req.query;
    let query = transporteRepository.createQueryBuilder("transporte");

    if (buscar) {
      query = query.where(
        "transporte.numeroAutobus ILIKE :buscar OR transporte.placa ILIKE :buscar OR transporte.conductor ILIKE :buscar",
        { buscar: `%${buscar}%` }
      );
    }

    const transportes = await query.getMany();
    handleSuccess(res, 200, "Transportes obtenidos exitosamente", transportes);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function obtenerTransportePorId(req, res) {
  try {
    const { id } = req.params;
    const transporte = await transporteRepository.findOne({ where: { id: parseInt(id) } });

    if (!transporte) {
      return handleErrorClient(res, 404, "Transporte no encontrado");
    }

    handleSuccess(res, 200, "Transporte obtenido exitosamente", transporte);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function actualizarTransporte(req, res) {
  try {
    const { id } = req.params;
    const { numeroAutobus, placa, capacidad, conductor, rutaPartida, rutaDestino, horaPartida, fechaJornada, estado, horaLlegada, abordajosRegistrados } = req.body;

    const transporte = await transporteRepository.findOne({ where: { id: parseInt(id) } });
    if (!transporte) {
      return handleErrorClient(res, 404, "Transporte no encontrado");
    }

    // Verificar si la nueva placa ya existe (si se cambió)
    if (placa && placa !== transporte.placa) {
      const placaExistente = await transporteRepository.findOne({ where: { placa } });
      if (placaExistente) {
        return handleErrorClient(res, 400, "La placa ya está registrada");
      }
    }

    if (numeroAutobus) transporte.numeroAutobus = numeroAutobus;
    if (placa) transporte.placa = placa;
    if (capacidad) transporte.capacidad = capacidad;
    if (conductor) transporte.conductor = conductor;
    if (rutaPartida) transporte.rutaPartida = rutaPartida;
    if (rutaDestino) transporte.rutaDestino = rutaDestino;
    if (horaPartida) transporte.horaPartida = horaPartida;
    if (fechaJornada) transporte.fechaJornada = fechaJornada;
    if (estado) transporte.estado = estado;
    if (horaLlegada) transporte.horaLlegada = horaLlegada;
    if (abordajosRegistrados !== undefined) transporte.abordajosRegistrados = abordajosRegistrados;

    const transporteActualizado = await transporteRepository.save(transporte);
    handleSuccess(res, 200, "Transporte actualizado exitosamente", transporteActualizado);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function registrarAbordaje(req, res) {
  try {
    const { id } = req.params;
    const transporte = await transporteRepository.findOne({ where: { id: parseInt(id) } });

    if (!transporte) {
      return handleErrorClient(res, 404, "Transporte no encontrado");
    }

    transporte.abordajosRegistrados += 1;

    if (transporte.abordajosRegistrados >= transporte.capacidad) {
      transporte.estado = "en_ruta";
    }

    const transporteActualizado = await transporteRepository.save(transporte);
    handleSuccess(res, 200, `Abordaje registrado (${transporteActualizado.abordajosRegistrados}/${transporteActualizado.capacidad})`, transporteActualizado);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function eliminarTransporte(req, res) {
  try {
    const { id } = req.params;
    const transporte = await transporteRepository.findOne({ where: { id: parseInt(id) } });

    if (!transporte) {
      return handleErrorClient(res, 404, "Transporte no encontrado");
    }

    await transporteRepository.remove(transporte);
    handleSuccess(res, 200, "Transporte eliminado exitosamente", {});
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

// Actualizar estado del transporte (para finalizar jornada)
export async function finalizarJornada(req, res) {
  try {
    const { id } = req.params;
    const { horaLlegada } = req.body;

    const transporte = await transporteRepository.findOne({ where: { id: parseInt(id) } });
    if (!transporte) {
      return handleErrorClient(res, 404, "Transporte no encontrado");
    }

    transporte.estado = "finalizado";
    if (horaLlegada) {
      transporte.horaLlegada = horaLlegada;
    }

    const transporteActualizado = await transporteRepository.save(transporte);
    handleSuccess(res, 200, "Jornada finalizada exitosamente", transporteActualizado);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }

export async function enviarComprobanteTransporte(req, res) {
  try {
    const { id } = req.params;
    const { correoPuntoEncuentro } = req.body;
    
    if (!correoPuntoEncuentro) {
      return handleErrorClient(res, 400, "Debe proporcionar el correo del punto de encuentro");
    }

    const transporte = await transporteRepository.findOne({ where: { id: parseInt(id) } });
    if (!transporte) {
      return handleErrorClient(res, 404, "Transporte no encontrado");
    }

    const mensaje = `
      Comprobante de Transporte Logístico - TECHO
      --------------------------------------------
      ID de Transporte: ${transporte.id}
      Bus: ${transporte.numeroAutobus}
      Placa: ${transporte.placa}
      Conductor: ${transporte.conductor}
      Ruta: ${transporte.rutaPartida} -> ${transporte.rutaDestino}
      Hora de Partida: ${transporte.horaPartida}
      Fecha: ${transporte.fechaJornada}
      Abordajes Confirmados: ${transporte.abordajosRegistrados} / ${transporte.capacidad}
      --------------------------------------------
      Este es un comprobante automático exclusivo para el punto de encuentro.
    `;

    const [emailSent] = await sendEmail(
      correoPuntoEncuentro,
      `Comprobante de Abordaje - Bus ${transporte.numeroAutobus}`,
      mensaje
    );

    if (emailSent) {
      handleSuccess(res, 200, "Comprobante enviado exitosamente", { transporteId: transporte.id });
    } else {
      handleErrorServer(res, 500, "No se pudo enviar el comprobante por correo");
    }
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
