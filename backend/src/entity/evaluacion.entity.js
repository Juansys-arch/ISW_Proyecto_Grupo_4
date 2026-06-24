"use strict";
import { EntitySchema } from "typeorm";

const EvaluacionSchema = new EntitySchema({
  name: "Evaluacion",
  tableName: "evaluaciones",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    jefeCuadrillaId: {
      type: "int",
      nullable: false,
    },
    cuadrillaId: {
      type: "int",
      nullable: false,
    },
    calificacion: {
      type: "int",
      nullable: false,
    },
    comentarios: {
      type: "text",
      nullable: true,
    },
    createdAt: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
      nullable: false,
    },
    updatedAt: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP",
      nullable: false,
    },
  },
  relations: {
    jefeCuadrilla: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "jefeCuadrillaId" },
      onDelete: "CASCADE",
    },
    cuadrilla: {
      type: "many-to-one",
      target: "Cuadrilla",
      joinColumn: { name: "cuadrillaId" },
      onDelete: "CASCADE",
    },
  },
});

export default EvaluacionSchema;
