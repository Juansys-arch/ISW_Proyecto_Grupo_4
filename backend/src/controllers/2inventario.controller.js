"use strict";
import {crearMaterialService,obtenerMaterialesService,obtenerMaterialPorIdService,actualizarMaterialService,registrarMovimientoService,obtenerMovimientosService,solicitarMaterialService,} from "../services/inventario.service.js";
import {crearMaterialValidation,actualizarMaterialValidation,movimientoValidation,solicitudMaterialValidation,} from "../validations/inventario.validation.js";
import {handleErrorClient,handleErrorServer,handleSuccess,} from "../handlers/responseHandlers.js";

/// Materiales
export async function crearMaterial(req, res) {
  try {
    const { body } = req;
    const { error } = crearMaterialValidation.validate(body);
    if (error)
      return handleErrorClient(res, 400, "Error de validación", error.message);

    const [material, errorMaterial] = await crearMaterialService(body);
    if (errorMaterial)
      return handleErrorClient(res, 400, "Error al crear material", errorMaterial);

    handleSuccess(res, 201, "Material creado exitosamente", material);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function obtenerMateriales(req, res) {
  try {
    const [materiales, error] = await obtenerMaterialesService();
    if (error)
      return handleErrorClient(res, 400, "Error al obtener materiales", error);

    handleSuccess(res, 200, "Materiales obtenidos exitosamente", materiales);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function obtenerMaterialPorId(req, res) {
  try {
    const { id } = req.params;
    const [material, error] = await obtenerMaterialPorIdService(parseInt(id));
    if (error)
      return handleErrorClient(res, 404, "Error al obtener material", error);

    handleSuccess(res, 200, "Material obtenido exitosamente", material);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function actualizarMaterial(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;
    const { error } = actualizarMaterialValidation.validate(body);
    if (error)
      return handleErrorClient(res, 400, "Error de validación", error.message);

    const [material, errorMaterial] = await actualizarMaterialService(parseInt(id), body);
    if (errorMaterial)
      return handleErrorClient(res, 400, "Error al actualizar material", errorMaterial);

    handleSuccess(res, 200, "Material actualizado exitosamente", material);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

///

export async function registrarMovimiento(req, res) {
  try {
    const { body } = req;
    const responsableId = req.user.id;

    const { error } = movimientoValidation.validate(body);
    if (error)
      return handleErrorClient(res, 400, "Error de validación", error.message);

    const [movimiento, errorMovimiento] = await registrarMovimientoService(body, responsableId);
    if (errorMovimiento)
      return handleErrorClient(res, 400, "Error al registrar movimiento", errorMovimiento);

    handleSuccess(res, 201, "Movimiento registrado exitosamente", movimiento);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function obtenerMovimientos(req, res) {
  try {
    const { materialId } = req.query;
    const [movimientos, error] = await obtenerMovimientosService(
      materialId ? parseInt(materialId) : null
    );
    if (error)
      return handleErrorClient(res, 400, "Error al obtener movimientos", error);

    handleSuccess(res, 200, "Movimientos obtenidos exitosamente", movimientos);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function solicitarMaterial(req, res) {
  try {
    const { body } = req;
    const { error } = solicitudMaterialValidation.validate(body);

    if (error)
      return handleErrorClient(res, 400, "Error de validación", error.message);

    const [solicitud, solicitudError] = await solicitarMaterialService(body, req.user);

    if (solicitudError)
      return handleErrorClient(res, 400, "Error al solicitar material", solicitudError);

    handleSuccess(res, 201, "Solicitud enviada al administrador", solicitud);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}