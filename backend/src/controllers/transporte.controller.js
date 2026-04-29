"use strict";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";
import { AppDataSource } from "../config/configDb.js";
import Transporte from "../entity/transporte.entity.js";

const transporteRepository = AppDataSource.getRepository(Transporte);

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
      fechaJornada: fechaJornada || new Date().toISOString().split('T')[0],
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
    const transportes = await transporteRepository.find();
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
    const { estado, horaLlegada, abordajosRegistrados } = req.body;

    const transporte = await transporteRepository.findOne({ where: { id: parseInt(id) } });
    if (!transporte) {
      return handleErrorClient(res, 404, "Transporte no encontrado");
    }

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
