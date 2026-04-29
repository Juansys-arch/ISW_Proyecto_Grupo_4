"use strict";
import Joi from "joi";

const domainEmailValidator = (value, helper) => {
  if (!value.endsWith("@gmail.cl")) {
    return helper.message(
      "El correo electrónico debe finalizar en @gmail.cl."
    );
  }
  return value;
};

export const volunteerRegisterValidation = Joi.object({
  nombreCompleto: Joi.string()
    .min(15)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
      "string.empty": "El nombre completo no puede estar vacío.",
      "any.required": "El nombre completo es obligatorio.",
      "string.base": "El nombre completo debe ser de tipo texto.",
      "string.min": "El nombre completo debe tener al menos 15 caracteres.",
      "string.max": "El nombre completo debe tener como máximo 50 caracteres.",
      "string.pattern.base": "El nombre completo solo puede contener letras y espacios.",
    }),
  rut: Joi.string()
    .min(9)
    .max(12)
    .required()
    .pattern(/^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/)
    .messages({
      "string.empty": "El rut no puede estar vacío.",
      "string.base": "El rut debe ser de tipo string.",
      "string.min": "El rut debe tener como mínimo 9 caracteres.",
      "string.max": "El rut debe tener como máximo 12 caracteres.",
      "string.pattern.base": "Formato rut inválido, debe ser xx.xxx.xxx-x o xxxxxxxx-x.",
    }),
  email: Joi.string()
    .min(15)
    .max(35)
    .email()
    .required()
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "any.required": "El correo electrónico es obligatorio.",
      "string.base": "El correo electrónico debe ser de tipo texto.",
      "string.email": "El correo electrónico debe tener un formato válido (ej. nombre@gmail.cl).",
      "string.min": "El correo electrónico debe tener al menos 15 caracteres.",
      "string.max": "El correo electrónico debe tener como máximo 35 caracteres.",
    })
    .custom(domainEmailValidator, "Validación dominio email"),
  fechaNacimiento: Joi.date()
    .required()
    .messages({
      "date.base": "La fecha de nacimiento debe ser una fecha válida.",
      "any.required": "La fecha de nacimiento es obligatoria.",
    }),
  genero: Joi.string()
    .valid('masculino', 'femenino', 'otro')
    .required()
    .messages({
      "any.only": "El género debe ser masculino, femenino u otro.",
      "any.required": "El género es obligatorio.",
    }),
  numeroContacto: Joi.string()
    .pattern(/^\+?56\d{8,9}$/)
    .required()
    .messages({
      "string.pattern.base": "El número de contacto debe ser un número chileno válido (ej. +56912345678).",
      "any.required": "El número de contacto es obligatorio.",
    }),
  direccion: Joi.string()
    .optional()
    .allow('')
    .messages({
      "string.base": "La dirección debe ser de tipo texto.",
    }),
  disponibilidad: Joi.string()
    .optional()
    .allow('')
    .messages({
      "string.base": "La disponibilidad debe ser de tipo texto.",
    }),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});

export const volunteerOnSiteRegisterValidation = Joi.object({
  // Similar pero sin password, y quizás campos opcionales
  nombreCompleto: Joi.string()
    .min(15)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
      "string.empty": "El nombre completo no puede estar vacío.",
      "any.required": "El nombre completo es obligatorio.",
      "string.base": "El nombre completo debe ser de tipo texto.",
      "string.min": "El nombre completo debe tener al menos 15 caracteres.",
      "string.max": "El nombre completo debe tener como máximo 50 caracteres.",
      "string.pattern.base": "El nombre completo solo puede contener letras y espacios.",
    }),
  rut: Joi.string()
    .min(9)
    .max(12)
    .required()
    .pattern(/^(?:(?:[1-9]\d{0}|[1-2]\d{1})(\.\d{3}){2}|[1-9]\d{6}|[1-2]\d{7}|29\.999\.999|29999999)-[\dkK]$/)
    .messages({
      "string.empty": "El rut no puede estar vacío.",
      "string.base": "El rut debe ser de tipo string.",
      "string.min": "El rut debe tener como mínimo 9 caracteres.",
      "string.max": "El rut debe tener como máximo 12 caracteres.",
      "string.pattern.base": "Formato rut inválido, debe ser xx.xxx.xxx-x o xxxxxxxx-x.",
    }),
  email: Joi.string()
    .min(15)
    .max(35)
    .email()
    .required()
    .messages({
      "string.empty": "El correo electrónico no puede estar vacío.",
      "any.required": "El correo electrónico es obligatorio.",
      "string.base": "El correo electrónico debe ser de tipo texto.",
      "string.email": "El correo electrónico debe tener un formato válido (ej. nombre@gmail.cl).",
      "string.min": "El correo electrónico debe tener al menos 15 caracteres.",
      "string.max": "El correo electrónico debe tener como máximo 35 caracteres.",
    })
    .custom(domainEmailValidator, "Validación dominio email"),
  fechaNacimiento: Joi.date()
    .required()
    .messages({
      "date.base": "La fecha de nacimiento debe ser una fecha válida.",
      "any.required": "La fecha de nacimiento es obligatoria.",
    }),
  genero: Joi.string()
    .valid('masculino', 'femenino', 'otro')
    .required()
    .messages({
      "any.only": "El género debe ser masculino, femenino u otro.",
      "any.required": "El género es obligatorio.",
    }),
  numeroContacto: Joi.string()
    .pattern(/^\+?56\d{8,9}$/)
    .required()
    .messages({
      "string.pattern.base": "El número de contacto debe ser un número chileno válido (ej. +56912345678).",
      "any.required": "El número de contacto es obligatorio.",
    }),
  direccion: Joi.string()
    .optional()
    .allow('')
    .messages({
      "string.base": "La dirección debe ser de tipo texto.",
    }),
  disponibilidad: Joi.string()
    .optional()
    .allow('')
    .messages({
      "string.base": "La disponibilidad debe ser de tipo texto.",
    }),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});

export const approveVolunteerValidation = Joi.object({
  volunteerId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El ID del voluntario debe ser un número.",
      "number.integer": "El ID del voluntario debe ser un entero.",
      "number.positive": "El ID del voluntario debe ser positivo.",
      "any.required": "El ID del voluntario es obligatorio.",
    }),
  action: Joi.string()
    .valid('approve', 'reject')
    .required()
    .messages({
      "any.only": "La acción debe ser 'approve' o 'reject'.",
      "any.required": "La acción es obligatoria.",
    }),
  rejectionReason: Joi.string()
    .when('action', { is: 'reject', then: Joi.required(), otherwise: Joi.optional() })
    .messages({
      "string.base": "La razón de rechazo debe ser de tipo texto.",
      "any.required": "La razón de rechazo es obligatoria cuando se rechaza.",
    }),
  rolAsignado: Joi.string()
    .when('action', { is: 'approve', then: Joi.required(), otherwise: Joi.optional() })
    .messages({
      "string.base": "El rol asignado debe ser de tipo texto.",
      "any.required": "El rol asignado es obligatorio cuando se aprueba.",
    }),
});