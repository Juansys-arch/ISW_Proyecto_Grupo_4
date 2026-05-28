"use strict";
import Joi from "joi";

export const crearMaterialValidation = Joi.object({
    nombre: Joi.string()
    .required()
    .messages({
        "string.empty":"El nombre de este material es requerido",
        "any.required":"El nombre de este materil es requerido",
    }),
    descripcion: Joi.string()
    .allow(null, "")
    .optional(),
    unidadMedida: Joi.string()
    .required()
    .messages({
        "string.empty":"La unidad de medida es requerida",
        "any.required":"La unidad de medida es requerida",
    }),
    stockMinimo: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
        "string.empty":"El stock mínimo no puede estar vacío",
        "number.base":"El stock mínimo debe ser un número",
        "number.min":"El stock mínimo no puede ser negativo",
    }),
   
});
export const actualizarMaterialValidation = Joi.object({
  nombre: Joi.string().max(255).optional(),
  descripcion: Joi.string().allow(null, "").optional(),
  unidadMedida: Joi.string().max(50).optional(),
  stockMinimo: Joi.number().integer().min(0).optional().messages({
    "number.min": "El stock mínimo no puede ser negativo",
  }),
});


// Movimiento: aceptar EITHER materialId (existente) OR materialNombre (crear nuevo)
const movimientoBase = Joi.object({
    tipo: Joi.string().valid("entrada", "salida").required().messages({
        "any.only": "el tipo de este movimiento debe ser entrada o salida",
        "any.required": "el tipo de este movimiento es requerido",
    }),
    cantidad: Joi.number().integer().min(1).required().messages({
        "number.min": "La cantidad debe ser mayor o igual a 1",
        "any.required": "la cantidad es requerida",
    }),
    observacion: Joi.string().allow(null, "").optional(),
});

export const movimientoValidation = Joi.alternatives().try(
    movimientoBase.keys({
        materialId: Joi.number().integer().required().messages({
            "number.base": "El ID del material debe ser un número",
            "any.required": "El ID del material es requerido",
        }),
    }),
    movimientoBase.keys({
        materialNombre: Joi.string().min(1).required().messages({
            "string.base": "El nombre del material debe ser texto",
            "any.required": "El nombre del material es requerido cuando no se usa materialId",
        }),
        descripcion: Joi.string().allow(null, "").optional(),
        unidadMedida: Joi.string().max(50).optional(),
    }),
);

export const solicitudMaterialValidation = Joi.object({
    materialId: Joi.number()
    .integer()
    .required()
    .messages({
        "number.base":"El ID del material debe ser un número",
        "any.required":"El ID del material es requerido"
    }),
    cantidad: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
        "number.base":"La cantidad debe ser un número",
        "number.min":"La cantidad debe ser mayor o igual a 1",
        "any.required":"La cantidad es requerida"
    }),
    observacion: Joi.string()
    .allow(null, "")
    .optional(),
    ubicacion: Joi.string().max(255).allow(null, "").optional(),
});