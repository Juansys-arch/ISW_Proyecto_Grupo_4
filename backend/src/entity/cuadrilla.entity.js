"use strict";
import { EntitySchema } from "typeorm";

const CuadrillaSchema = new EntitySchema({
  name: "Cuadrilla",
  tableName: "cuadrillas",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    jefeCuadrillaId: {
      type: "int",
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
    jefeCuadrilla: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "jefeCuadrillaId" },
      onDelete: "CASCADE",
    },
    miembros: {
      type: "one-to-many",
      target: "User",
      inverseSide: "cuadrilla",
    },
  },
});

export default CuadrillaSchema;
