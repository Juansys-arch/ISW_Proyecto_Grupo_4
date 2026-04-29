"use strict";
import { EntitySchema } from "typeorm";

const VolunteerSchema = new EntitySchema({
  name: "Volunteer",
  tableName: "volunteers",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    status: {
      type: "varchar",
      length: 20,
      default: 'pending',
      nullable: false,
    },
    rejectionReason: {
      type: "text",
      nullable: true,
    },
    approvedBy: {
      type: "int",
      nullable: true,
    },
    approvalDate: {
      type: "timestamp with time zone",
      nullable: true,
    },
    nombreCompleto: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    rut: {
      type: "varchar",
      length: 12,
      nullable: false,
      unique: true,
    },
    email: {
      type: "varchar",
      length: 255,
      nullable: false,
      unique: true,
    },
    fechaNacimiento: {
      type: "date",
      nullable: true,
    },
    genero: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    numeroContacto: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    password: {
      type: "varchar",
      nullable: true,
    },
    direccion: {
      type: "text",
      nullable: true,
    },
    disponibilidad: {
      type: "text",
      nullable: true,
    },
    habilidades: {
      type: "text",
      nullable: true,
    },
    experienciaPrevia: {
      type: "text",
      nullable: true,
    },
    capacitaciones: {
      type: "text",
      nullable: true,
    },
    rol: {
      type: "varchar",
      length: 50,
      nullable: false,
      default: 'voluntario',
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
  indices: [
    {
      name: "IDX_VOLUNTEER",
      columns: ["id"],
      unique: true,
    },
    {
      name: "IDX_VOLUNTEER_RUT",
      columns: ["rut"],
      unique: true,
    },
    {
      name: "IDX_VOLUNTEER_EMAIL",
      columns: ["email"],
      unique: true,
    },
  ],
});

export default VolunteerSchema;