"use strict";
import { EntitySchema } from "typeorm";

const AsignacionHerramientasSchema = new EntitySchema({
  name: "AsignacionHerramientas",
  tableName: "asignacion_herramientas",
  columns: {
    id: { type: "int", primary: true, generated: true },
    jefeCuadrillaId: { type: "int", nullable: false },
    materialId: { type: "int", nullable: false },
    cantidadEntregada: { type: "int", nullable: false },
    cantidadDevuelta: { type: "int", nullable: true },
    fechaEntrega: { type: "timestamp", default: () => "CURRENT_TIMESTAMP" },
    fechaDevolucion: { type: "timestamp", nullable: true },
    estado: { 
        type: "varchar", 
        length: 20, 
        default: "en_uso" // "en_uso" | "devuelto" | "incompleto" 
    },
  },
  relations: {
    jefeCuadrilla: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "jefeCuadrillaId" },
    },
    material: {
      type: "many-to-one",
      target: "Material",
      joinColumn: { name: "materialId" },
    },
  },
});
export default AsignacionHerramientasSchema;