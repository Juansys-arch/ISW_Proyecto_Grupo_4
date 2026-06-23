"use strict";
import { EntitySchema } from "typeorm";

const HitoSchema = new EntitySchema({
  name: "Hito",
  tableName: "hitos",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    descripcion: {
      type: "varchar",
      length: 250,
      nullable: false,
    },
    dias: {
      type: "int",
      nullable: false,
    },
    estado: {
      type: "enum",
      enum: ["pendiente", "en_progreso", "completado"],
      default: "pendiente",
      nullable: false,
    },
    progreso: {
      type: "int",
      default: 0,
      nullable: false,
    },
    fechaProgramada: {
      type: "timestamp with time zone",
      nullable: true,
    },
    fechaCompletada: {
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
    vivienda_id: {
      type: "uuid",
      nullable: false,
    },
  },
  relations: {
    vivienda: {
      type: "many-to-one",
      target: "Vivienda",
      joinColumn: {
        name: "vivienda_id",
      },
      nullable: false,
      onDelete: "CASCADE",
    },
  },
  indices: [
    {
      name: "IDX_HITO_ID",
      columns: ["id"],
      unique: true,
    },
    {
      name: "IDX_HITO_VIVIENDA",
      columns: ["vivienda_id"],
    },
  ],
});

export default HitoSchema;
