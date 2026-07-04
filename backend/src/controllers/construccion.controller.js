"use strict";
import construccionService from "../services/construccion.service.js";
import { validarActualizarAvance, validarCrearVivienda } from "../validations/construccion.validation.js";
import { notificarPorRoles } from "../services/notificacion.service.js";

export const crearVivienda = async (req, res) => {
  try {
    const { error, value } = validarCrearVivienda(req.body);
    if (error) {
      return res.status(400).json({ mensaje: error.details[0].message });
    }

    const vivienda = await construccionService.crearVivienda(value);

    // Crear notificación solo para encargados de inventario y jefes de cuadrilla
    await notificarPorRoles({
      roles: ["encargado_inventario", "jefe_cuadrilla"],
      tipo: "construccion",
      mensaje: `Nueva vivienda creada en ${vivienda.direccion}`
    });

    res.status(201).json({
      mensaje: "Vivienda creada exitosamente",
      data: vivienda,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const iniciarConstruccion = async (req, res) => {
  try {
    const { viviendasId } = req.params;
    const vivienda = await construccionService.iniciarConstruccion(viviendasId);

    // Crear notificación
    await notificarPorRoles({
      roles: ["administrador", "encargado_inventario", "jefe_cuadrilla"],
      tipo: "construccion",
      mensaje: `La construcción en ${vivienda.direccion} ha sido INICIADA`
    });

    res.status(200).json({
      mensaje: "Construcción iniciada exitosamente",
      data: vivienda,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const actualizarAvanceHito = async (req, res) => {
  try {
    const { viviendasId, hitoId } = req.params;
    const { error, value } = validarActualizarAvance(req.body);

    if (error) {
      return res.status(400).json({ mensaje: error.details[0].message });
    }

    const hito = await construccionService.actualizarAvanceHito(
      viviendasId,
      hitoId,
      value.progreso
    );

    res.status(200).json({
      mensaje: "Avance actualizado exitosamente",
      data: hito,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const completarConstruccion = async (req, res) => {
  try {
    const { viviendasId } = req.params;
    const vivienda = await construccionService.completarConstruccion(viviendasId);

    // Crear notificación
    await notificarPorRoles({
      roles: ["administrador", "encargado_inventario", "jefe_cuadrilla"],
      tipo: "construccion",
      mensaje: `La construcción en ${vivienda.direccion} ha sido COMPLETADA`
    });

    res.status(200).json({
      mensaje: "Construcción completada exitosamente",
      data: vivienda,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const firmarGarantia = async (req, res) => {
  try {
    const { viviendasId } = req.params;
    const { firmaBase64 } = req.body;
    
    if (!firmaBase64) {
      return res.status(400).json({ mensaje: "Debe proporcionar una firma digital" });
    }

    const vivienda = await construccionService.firmarGarantia(viviendasId, firmaBase64);

    res.status(200).json({
      mensaje: "Firma de garantía registrada exitosamente",
      data: vivienda,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const pausarConstruccion = async (req, res) => {
  try {
    const { viviendasId } = req.params;
    const vivienda = await construccionService.pausarConstruccion(viviendasId);

    // Crear notificación
    await notificarPorRoles({
      roles: ["administrador", "encargado_inventario", "jefe_cuadrilla"],
      tipo: "construccion",
      mensaje: `La construcción en ${vivienda.direccion} ha sido PAUSADA`
    });

    res.status(200).json({
      mensaje: "Construcción pausada exitosamente",
      data: vivienda,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const reanudarConstruccion = async (req, res) => {
  try {
    const { viviendasId } = req.params;
    const vivienda = await construccionService.reanudarConstruccion(viviendasId);

    // Crear notificación
    await notificarPorRoles({
      roles: ["administrador", "encargado_inventario", "jefe_cuadrilla"],
      tipo: "construccion",
      mensaje: `La construcción en ${vivienda.direccion} ha sido REANUDADA`
    });

    res.status(200).json({
      mensaje: "Construcción reanudada exitosamente",
      data: vivienda,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerViviendas = async (req, res) => {
  try {
    const { estado } = req.query;
    const viviendas = await construccionService.obtenerViviendas(estado);

    res.status(200).json({
      mensaje: "Viviendas obtenidas exitosamente",
      total: viviendas.length,
      data: viviendas,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerVivienda = async (req, res) => {
  try {
    const { viviendasId } = req.params;
    const vivienda = await construccionService.obtenerVivienda(viviendasId);

    res.status(200).json({
      mensaje: "Vivienda obtenida exitosamente",
      data: vivienda,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verificarRetrasos = async (req, res) => {
  try {
    const retrasos = await construccionService.verificarRetrasos();

    res.status(200).json({
      mensaje: "Verificación de retrasos completada",
      total: retrasos.length,
      data: retrasos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const eliminarVivienda = async (req, res) => {
  try {
    const { viviendasId } = req.params;
    await construccionService.eliminarVivienda(viviendasId);

    res.status(200).json({
      mensaje: "Vivienda eliminada exitosamente",
      data: null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
