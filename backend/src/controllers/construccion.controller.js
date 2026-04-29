"use strict";
import construccionService from "../services/construccion.service.js";
import { validarCrearVivienda, validarActualizarAvance } from "../validations/construccion.validation.js";

export const crearVivienda = async (req, res) => {
  try {
    const { error, value } = validarCrearVivienda(req.body);
    if (error) {
      return res.status(400).json({ mensaje: error.details[0].message });
    }

    const vivienda = await construccionService.crearVivienda(value);
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

    res.status(200).json({
      mensaje: "Construcción completada exitosamente",
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

    res.status(200).json({
      mensaje: "Construcción pausada exitosamente",
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
