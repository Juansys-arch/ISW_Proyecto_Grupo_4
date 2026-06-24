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
    numeroProyecto: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    beneficiario: {
      type: "varchar",
      length: 150,
      nullable: false,
    },
    ci: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    telefono: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    direccion: {
      type: "varchar",
      length: 250,
      nullable: false,
    },
    areaTerreno: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
    },
    areaConstruccion: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
    },
    descripcion: {
      type: "text",
      nullable: true,
    },
    estado: {
      type: "enum",
      enum: ["no_iniciada", "en_progreso", "completada", "completada_con_firma", "pausada"],
      default: "no_iniciada",
      nullable: false,
    },
    firmaGarantiaUrl: {
      type: "text",
      nullable: true,
    },
    fechaInicio: {
      type: "timestamp with time zone",
      nullable: true,
    },
    fechaCompletacion: {
      type: "timestamp with time zone",
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
