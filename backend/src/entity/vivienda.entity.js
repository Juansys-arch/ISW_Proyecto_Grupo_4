"use strict";
import { EntitySchema } from "typeorm";

const ViviendasSchema = new EntitySchema({
  name: "Vivienda",
  tableName: "viviendas",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    direccion: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    numeroPropiedad: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    estado: {
      type: "varchar",
      length: 20,
      default: "planificada",
      nullable: false,
    },
    fechaInicio: {
      type: "timestamp with time zone",
      nullable: true,
    },
    fechaTermino: {
      type: "timestamp with time zone",
      nullable: true,
    },
    fechaPlanificada: {
      type: "timestamp with time zone",
      nullable: true,
    },
    avanceGeneral: {
      type: "int",
      default: 0,
      nullable: false,
    },
    diasHito: {
      type: "int",
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
      joinColumn: {
        name: "jefeCuadrilla_id",
      },
      nullable: true,
    },
    hitos: {
      type: "one-to-many",
      target: "Hito",
      inverseSide: "vivienda",
    },
  },
  indices: [
    {
      name: "IDX_VIVIENDA_ID",
      columns: ["id"],
      unique: true,
    },
    {
      name: "IDX_VIVIENDA_ESTADO",
      columns: ["estado"],
    },
  ],
});

export default ViviendasSchema;
