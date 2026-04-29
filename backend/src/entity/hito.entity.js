"use strict";
import { EntitySchema }from "typeorm";

const HitoSchema = new EntitySchema({
  name: "Hito",
  tableName: "hitos",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    dias: {
      type: "int",
      nullable: false,
    },
    descripcion: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    estado: {
      type: "varchar",
      length: 20,
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
    alertaGenerada: {
      type: "boolean",
      default: false,
      nullable: false,
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
    vivienda: {
      type: "many-to-one",
      target: "Vivienda",
      joinColumn: {
        name: "vivienda_id",
      },
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
      name: "IDX_HITO_ESTADO",
      columns: ["estado"],
    },
  ],
});

export default HitoSchema;
