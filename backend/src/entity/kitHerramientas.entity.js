"use strict";
import { EntitySchema } from "typeorm";

const KitHerramientasSchema = new EntitySchema({
    name: "KitHerramientas",
    tableName: "kit_herramientas",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: true,
        },
        codigoKit: {
            type: "varchar",
            length: 100,
            nullable: false,
            unique: true,
        },
        nombre: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        descripcion: {
            type: "text",
            nullable: true,
        },
        estado: {
            type: "varchar",
            length: 20,
            default: "disponible", // disponible, en_uso, dañado, faltante
            nullable: false,
        },
        cantidadItems: {
            type: "int",
            default: 0,
            nullable: false,
        },
        fechaCreacion: {
            type: "timestamp with time zone",
            default: () => "CURRENT_TIMESTAMP",
            nullable: false,
        },
        fechaActualizacion: {
            type: "timestamp with time zone",
            default: () => "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
            nullable: false,
        },
    },
});

export default KitHerramientasSchema;
