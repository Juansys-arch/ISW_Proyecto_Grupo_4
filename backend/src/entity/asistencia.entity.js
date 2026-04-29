"use strict";
import { EntitySchema } from "typeorm";

const AsistenciaSchema = new EntitySchema({
  name: "Asistencia",
  tableName: "asistencia_voluntarios",
  columns: {
    id: { type: "int", primary: true, generated: true },
    voluntarioId: { type: "int", nullable: false },
    jefeCuadrillaId: { type: "int", nullable: false },
    fecha: { type: "date", nullable: false },
    asistio: { type: "boolean", default: false },
    puntoEncuentro: { type: "varchar", length: 100 },
    validadoTransporte: { type: "boolean", default: false },
  },
  relations: {
    voluntario: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "voluntarioId" },
    },
    jefeCuadrilla: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "jefeCuadrillaId" },
    },
  },
});
export default AsistenciaSchema;