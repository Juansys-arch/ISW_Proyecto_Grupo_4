"use strict";
import { EntitySchema } from "typeorm";
 
const NotificacionSchema = new EntitySchema({
  name: "Notificacion",
  tableName: "notificaciones",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    mensaje: {
      type: "text",
      nullable: false,
    },
    tipo: {
      type: "varchar",
      length: 30,
      nullable: false,
      // valores: "stock_bajo" | "incidencia_critica" | "sin_stock"
    },
    leida: {
      type: "boolean",
      default: false,
      nullable: false,
    },
    administradorId: {
      type: "int",
      nullable: false,
    },
    // referencia opcional al origen de la notificación
    incidenciaId: {
      type: "int",
      nullable: true,
    },
    materialId: {
      type: "int",
      nullable: true,
    },
    createdAt: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
      nullable: false,
    },
  },
  relations: {
    administrador: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "administradorId" },
      eager: false,
    },
  },
});
export default NotificacionSchema;