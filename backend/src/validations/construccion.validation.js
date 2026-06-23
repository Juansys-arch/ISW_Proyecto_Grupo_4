"use strict";
import Joi from "joi";

export const validarCrearVivienda = (data) => {
  const schema = Joi.object({
    direccion: Joi.string().min(5).max(250).required(),
    hitos: Joi.number().valid(2, 5).optional().default(2),
  });

  return schema.validate(data);
};

export const validarActualizarAvance = (data) => {
  const schema = Joi.object({
    progreso: Joi.number().min(0).max(100).required(),
  });

  return schema.validate(data);
};
