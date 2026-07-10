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
    .valid("pendiente", "listo", "en_proceso", "resuelto")
    .optional(),
  nombrePaciente: Joi.string()
    .allow(null, "")
    .max(255)
    .optional(),
  rutPaciente: Joi.string()
    .pattern(/^\d{9}$/)
    .allow(null, "")
    .max(20)
    .optional(),
  ubicacionPaciente: Joi.string()
    .allow(null, "")
    .max(255)
    .optional(),
  observacionMedica: Joi.string()
    .allow(null, "")
    .max(1000)
    .optional(),
  equipoMedico: Joi.string()
    .allow(null, "")
    .max(100)
    .optional(),
}).unknown(false);

export const actualizarIncidenciaValidation = Joi.object({
  descripcion: Joi.string()
    .min(5)
    .max(1000)
    .optional()
    .messages({
      "string.min": "La descripción debe tener al menos 5 caracteres.",
      "string.max": "La descripción debe tener como máximo 1000 caracteres.",
    }),
  fecha: Joi.date()
    .iso()
    .optional()
    .messages({
      "date.base": "La fecha debe ser válida.",
    }),
  prioridad: Joi.string()
    .valid("baja", "media", "alta", "critica")
    .optional()
    .messages({
      "any.only": "La prioridad debe ser baja, media, alta o critica.",
    }),
  tipo: Joi.string()
    .valid("accidente", "falta_material", "conflicto", "otro")
    .optional()
    .messages({
      "any.only": "El tipo debe ser accidente, falta_material, conflicto u otro.",
    }),
  estado: Joi.string()
    .valid("pendiente", "listo", "en_proceso", "resuelto")
    .optional()
    .messages({
      "any.only": "El estado debe ser pendiente, listo, en_proceso o resuelto.",
    }),
  nombrePaciente: Joi.string()
    .allow(null, "")
    .max(255)
    .optional(),
  rutPaciente: Joi.string()
    .pattern(/^\d{9}$/)
    .allow(null, "")
    .max(20)
    .optional()
    .messages({
      "string.pattern.base": "El RUT debe tener exactamente 9 números.",
    }),
  ubicacionPaciente: Joi.string()
    .allow(null, "")
    .max(255)
    .optional(),
  observacionMedica: Joi.string()
    .allow(null, "")
    .max(1000)
    .optional(),
  equipoMedico: Joi.string()
    .allow(null, "")
    .max(100)
    .optional(),
}).unknown(false);

export const reporteEmergenciaValidation = Joi.object({
  nombrePaciente: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      "string.empty": "El nombre del paciente es requerido.",
      "any.required": "El nombre del paciente es requerido.",
      "string.min": "El nombre del paciente debe tener al menos 3 caracteres.",
    }),
  rutPaciente: Joi.string()
    .pattern(/^\d{9}$/)
    .required()
    .messages({
      "string.empty": "El RUT del paciente es requerido.",
      "any.required": "El RUT del paciente es requerido.",
      "string.pattern.base": "El RUT del paciente debe tener exactamente 9 números.",
    }),
  ubicacionPaciente: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      "string.empty": "La ubicación del paciente es requerida.",
      "any.required": "La ubicación del paciente es requerida.",
      "string.min": "La ubicación del paciente debe tener al menos 3 caracteres.",
    }),
  gravedad: Joi.string()
    .valid("baja", "media", "alta", "critica")
    .required()
    .messages({
      "any.only": "La gravedad debe ser baja, media, alta o critica.",
      "any.required": "La gravedad es requerida.",
    }),
  observacionMedica: Joi.string()
    .allow(null, "")
    .max(1000)
    .optional(),
  equipoMedico: Joi.string()
    .allow(null, "")
    .max(100)
    .optional(),
}).unknown(false);
