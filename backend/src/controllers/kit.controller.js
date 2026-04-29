"use strict";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";
import { AppDataSource } from "../config/configDb.js";
import KitHerramientas from "../entity/kitHerramientas.entity.js";

const kitRepository = AppDataSource.getRepository(KitHerramientas);

export async function crearKit(req, res) {
  try {
    const { codigoKit, nombre, descripcion, cantidadItems } = req.body;

    if (!codigoKit || !nombre) {
      return handleErrorClient(res, 400, "Código y nombre del kit son obligatorios");
    }

    const kitExistente = await kitRepository.findOne({ where: { codigoKit } });
    if (kitExistente) {
      return handleErrorClient(res, 400, "El código del kit ya existe");
    }

    const nuevoKit = kitRepository.create({
      codigoKit,
      nombre,
      descripcion,
      cantidadItems: cantidadItems || 0,
      estado: "disponible",
    });

    const kitGuardado = await kitRepository.save(nuevoKit);
    handleSuccess(res, 201, "Kit creado exitosamente", kitGuardado);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function obtenerKits(req, res) {
  try {
    const kits = await kitRepository.find();
    handleSuccess(res, 200, "Kits obtenidos exitosamente", kits);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function obtenerKitPorId(req, res) {
  try {
    const { id } = req.params;
    const kit = await kitRepository.findOne({ where: { id: parseInt(id) } });

    if (!kit) {
      return handleErrorClient(res, 404, "Kit no encontrado");
    }

    handleSuccess(res, 200, "Kit obtenido exitosamente", kit);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function actualizarKit(req, res) {
  try {
    const { id } = req.params;
    const { nombre, descripcion, estado, cantidadItems } = req.body;

    const kit = await kitRepository.findOne({ where: { id: parseInt(id) } });
    if (!kit) {
      return handleErrorClient(res, 404, "Kit no encontrado");
    }

    if (nombre) kit.nombre = nombre;
    if (descripcion) kit.descripcion = descripcion;
    if (estado) kit.estado = estado;
    if (cantidadItems !== undefined) kit.cantidadItems = cantidadItems;

    const kitActualizado = await kitRepository.save(kit);
    handleSuccess(res, 200, "Kit actualizado exitosamente", kitActualizado);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function eliminarKit(req, res) {
  try {
    const { id } = req.params;
    const kit = await kitRepository.findOne({ where: { id: parseInt(id) } });

    if (!kit) {
      return handleErrorClient(res, 404, "Kit no encontrado");
    }

    await kitRepository.remove(kit);
    handleSuccess(res, 200, "Kit eliminado exitosamente", {});
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
