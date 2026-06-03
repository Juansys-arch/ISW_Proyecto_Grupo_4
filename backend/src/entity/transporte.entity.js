"use strict";
import { EntitySchema } from "typeorm";

const TransporteSchema = new EntitySchema({
    name: "Transporte",
    tableName: "transporte",
    columns: {
        id: {
            type: "int",
            primary: true,
            generated: true,
        },
        numeroAutobus: {
            type: "varchar",
            length: 50,
            nullable: false,
        },
        placa: {
            type: "varchar",
            length: 50,
            nullable: false,
            unique: true,
        },
        capacidad: {
            type: "int",
            nullable: false,
        },
        conductor: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        estado: {
            type: "varchar",
            length: 20,
            default: "disponible", // disponible, en_ruta, mantenimiento
            nullable: false,
        },
        rutaPartida: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        rutaDestino: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        horaPartida: {
            type: "time",
            nullable: true,
        },
        horaLlegada: {
            type: "time",
            nullable: true,
        },
        abordajosRegistrados: {
            type: "int",
            default: 0,
            nullable: false,
        },
        fechaJornada: {
            type: "date",
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

export default TransporteSchema;
