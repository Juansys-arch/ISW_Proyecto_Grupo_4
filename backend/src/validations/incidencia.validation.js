"use strict";
import Joi from "joi";

export const crearIncidenciaValidation = Joi.object({
  descripcion: Joi.string()
    .min(5)
    .max(1000)
    .required()
    .messages({
      "string.empty": "La descripción es requerida.",
      "any.required": "La descripción es requerida.",
      "string.min": "La descripción debe tener al menos 5 caracteres.",
      "string.max": "La descripción debe tener como máximo 1000 caracteres.",
    }),
  fecha: Joi.date()
    .iso()
    .required()
    .messages({
      "date.base": "La fecha debe ser válida.",
      "any.required": "La fecha es requerida.",
    }),
  prioridad: Joi.string()
    .valid("baja", "media", "alta", "critica")
    .required()
    .messages({
      "any.only": "La prioridad debe ser baja, media, alta o critica.",
      "any.required": "La prioridad es requerida.",
    }),
  tipo: Joi.string()
    .valid("accidente", "falta_material", "conflicto", "otro")
    .required()
    .messages({
      "any.only": "El tipo debe ser accidente, falta_material, conflicto u otro.",
      "any.required": "El tipo es requerido.",
    }),
  estado: Joi.string()
    .valid("pendiente", "en_proceso", "resuelto")
    .optional(),
}).unknown(false);