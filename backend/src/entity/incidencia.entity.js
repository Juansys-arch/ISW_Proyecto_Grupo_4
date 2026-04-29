"use strict";
import { EntitySchema } from "typeorm";
 
const IncidenciaSchema = new EntitySchema({
  name: "Incidencia",
  tableName: "incidencias",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    descripcion: {
      type: "text",
      nullable: false,
    },
    fecha: {
      type: "timestamp with time zone",
      nullable: false,
      default: () => "CURRENT_TIMESTAMP",
    },
    prioridad: {
      type: "varchar",
      length: 10,
      nullable: false,
      // valores: "baja" | "media" | "alta" | "critica"
    },
    tipo: {
      type: "varchar",
      length: 50,
      nullable: false,
      // valores: "accidente" | "falta_material" | "conflicto" | "otro"
    },
    estado: {
      type: "varchar",
      length: 20,
      default: "pendiente",
      nullable: false,
      // valores: "pendiente" | "en_proceso" | "resuelto"
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
      eager: false,
    },
  },
});
export default IncidenciaSchema;