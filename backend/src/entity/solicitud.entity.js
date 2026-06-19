"use strict";
import { EntitySchema } from "typeorm";

const SolicitudSchema = new EntitySchema({
  name: "Solicitud",
  tableName: "solicitudes",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    cantidad: {
      type: "int",
      nullable: false,
    },
    observacion: {
      type: "text",
      nullable: true,
    },
    ubicacion: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    estado: {
      type: "varchar",
      length: 30,
      default: "pendiente",
      nullable: false,
      // valores: pendiente | aceptada | en_camino | entregada
    },
    solicitanteId: {
      type: "int",
      nullable: false,
    },
    materialId: {
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
    solicitante: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "solicitanteId" },
      eager: true,
    },
    material: {
      type: "many-to-one",
      target: "Material",
      joinColumn: { name: "materialId" },
      eager: true,
    },
  },
});

export default SolicitudSchema;
