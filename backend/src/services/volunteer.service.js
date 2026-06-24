"use strict";
import Volunteer from "../entity/volunteer.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { handleErrorClient, handleErrorServer, handleSuccess } from "../handlers/responseHandlers.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";

export async function registerVolunteerService(volunteerData) {
  try {
    const volunteerRepository = AppDataSource.getRepository(Volunteer);

    const { nombreCompleto, rut, email, fechaNacimiento, genero, numeroContacto, direccion, disponibilidad } = volunteerData;

    const createErrorMessage = (dataInfo, message) => ({
      dataInfo,
      message
    });

    const existingEmailVolunteer = await volunteerRepository.findOne({
      where: { email },
    });

    if (existingEmailVolunteer) return [null, createErrorMessage("email", "Correo electrónico en uso")];

    const existingRutVolunteer = await volunteerRepository.findOne({
      where: { rut },
    });

    if (existingRutVolunteer) return [null, createErrorMessage("rut", "Rut ya asociado a una cuenta de voluntario")];

    const { region, comuna } = volunteerData;

    const newVolunteer = volunteerRepository.create({
      nombreCompleto,
      rut,
      email,
      fechaNacimiento,
      genero,
      numeroContacto,
      direccion,
      disponibilidad,
      region: region || null,
      comuna: comuna || null,
      status: "pending",
      rol: "voluntario",
    });

    await volunteerRepository.save(newVolunteer);

    const { ...dataVolunteer } = newVolunteer;

    return [dataVolunteer, null];
  } catch (error) {
    console.error("Error al registrar un voluntario", error);
    return [null, "Error interno del servidor"];
  }
}

export async function registerVolunteerOnSiteService(volunteerData, userId) {
  try {
    const volunteerRepository = AppDataSource.getRepository(Volunteer);

    const { nombreCompleto, rut, email, fechaNacimiento, genero, numeroContacto, direccion, disponibilidad } = volunteerData;

    const createErrorMessage = (dataInfo, message) => ({
      dataInfo,
      message
    });

    const existingEmailVolunteer = await volunteerRepository.findOne({
      where: { email },
    });

    if (existingEmailVolunteer) return [null, createErrorMessage("email", "Correo electrónico en uso")];

    const existingRutVolunteer = await volunteerRepository.findOne({
      where: { rut },
    });

    if (existingRutVolunteer) return [null, createErrorMessage("rut", "Rut ya asociado a una cuenta de voluntario")];

    const { region, comuna } = volunteerData;

    const newVolunteer = volunteerRepository.create({
      nombreCompleto,
      rut,
      email,
      fechaNacimiento,
      genero,
      numeroContacto,
      direccion,
      disponibilidad,
      region: region || null,
      comuna: comuna || null,
      status: "pending",
      rol: "voluntario",
      // Podríamos agregar un campo para quién registró
    });

    await volunteerRepository.save(newVolunteer);

    const { ...dataVolunteer } = newVolunteer;

    return [dataVolunteer, null];
  } catch (error) {
    console.error("Error al registrar un voluntario en sitio", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getAllVolunteersService() {
  try {
    const volunteerRepository = AppDataSource.getRepository(Volunteer);

    const volunteers = await volunteerRepository.find({
      select: ["id", "nombreCompleto", "rut", "email", "status", "rol", "createdAt", "fechaNacimiento", "genero", "numeroContacto"],
    });

    return [volunteers, null];
  } catch (error) {
    console.error("Error al obtener voluntarios:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function approveVolunteerService(volunteerId, action, rejectionReason, rolAsignado, approvedBy) {
  try {
    const volunteerRepository = AppDataSource.getRepository(Volunteer);

    const volunteer = await volunteerRepository.findOneBy({ id: volunteerId });

    if (!volunteer) {
      return [null, "Voluntario no encontrado"];
    }

    if (action === "approve") {
      volunteer.status = "approved";
      volunteer.approvedBy = approvedBy;
      volunteer.approvalDate = new Date();
      volunteer.rolAsignado = rolAsignado;
    } else if (action === "reject") {
      volunteer.status = "rejected";
      volunteer.rejectionReason = rejectionReason;
    }

    await volunteerRepository.save(volunteer);

    return [volunteer, null];
  } catch (error) {
    console.error("Error al aprobar/rechazar voluntario", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getPendingVolunteersService() {
  try {
    const volunteerRepository = AppDataSource.getRepository(Volunteer);

    const pendingVolunteers = await volunteerRepository.find({
      where: { status: "pending" },
    });

    return [pendingVolunteers, null];
  } catch (error) {
    console.error("Error al obtener voluntarios pendientes", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateVolunteerDetailsService(volunteerId, updateData) {
  try {
    const volunteerRepository = AppDataSource.getRepository(Volunteer);

    const volunteer = await volunteerRepository.findOneBy({ id: volunteerId });

    if (!volunteer) {
      return [null, "Voluntario no encontrado"];
    }

    const createErrorMessage = (dataInfo, message) => ({
      dataInfo,
      message,
    });

    if (updateData.email && updateData.email !== volunteer.email) {
      const existingEmailVolunteer = await volunteerRepository.findOne({
        where: { email: updateData.email },
      });
      if (existingEmailVolunteer) {
        return [null, createErrorMessage("email", "Correo electrónico en uso")];
      }
    }

    if (updateData.rut && updateData.rut !== volunteer.rut) {
      const existingRutVolunteer = await volunteerRepository.findOne({
        where: { rut: updateData.rut },
      });
      if (existingRutVolunteer) {
        return [null, createErrorMessage("rut", "Rut ya asociado a una cuenta de voluntario")];
      }
    }

    if (updateData.password) {
      updateData.password = await encryptPassword(updateData.password);
    }

    Object.assign(volunteer, updateData);
    volunteer.updatedAt = new Date();

    await volunteerRepository.save(volunteer);

    return [volunteer, null];
  } catch (error) {
    console.error("Error al actualizar detalles del voluntario", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteVolunteerService(volunteerId) {
  try {
    const volunteerRepository = AppDataSource.getRepository(Volunteer);

    const volunteer = await volunteerRepository.findOneBy({ id: volunteerId });

    if (!volunteer) {
      return [null, "Voluntario no encontrado"];
    }

    await volunteerRepository.remove(volunteer);

    return [true, null];
  } catch (error) {
    console.error("Error al eliminar voluntario", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getVolunteersByRegionService() {
  try {
    const volunteerRepository = AppDataSource.getRepository(Volunteer);

    const fs = await import("fs");
    const regionsPath = new URL("../data/chile-regions.json", import.meta.url);
    const regionsData = JSON.parse(fs.readFileSync(regionsPath, "utf8"));

    const volunteers = await volunteerRepository.find({
      select: [
        "id",
        "nombreCompleto",
        "rut",
        "email",
        "numeroContacto",
        "status",
        "direccion",
        "region",
        "comuna",
      ],
    });

    const normalizeText = (value) =>
      typeof value === "string"
        ? value.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "")
        : "";

    const result = regionsData.map((r) => ({
      region: r.region,
      comunas: r.comunas.map((comuna) => ({
        comuna,
        volunteers: [],
      })),
    }));

    const regionIndexByNormalizedName = new Map();
    result.forEach((regionObj, index) => {
      regionIndexByNormalizedName.set(normalizeText(regionObj.region), index);
    });

    const ensureRegionGroup = (regionName) => {
      const normalizedRegion = normalizeText(regionName) || "sin region asignada";
      let regionIndex = regionIndexByNormalizedName.get(normalizedRegion);

      if (regionIndex === undefined) {
        const newRegion = {
          region: regionName || "Sin región asignada",
          comunas: [],
        };
        result.push(newRegion);
        regionIndex = result.length - 1;
        regionIndexByNormalizedName.set(normalizedRegion, regionIndex);
      }

      return result[regionIndex];
    };

    const ensureComunaGroup = (regionObj, comunaName) => {
      const normalizedComuna = normalizeText(comunaName) || "sin comuna asignada";
      let comunaObj = regionObj.comunas.find((c) => normalizeText(c.comuna) === normalizedComuna);

      if (!comunaObj) {
        comunaObj = {
          comuna: comunaName || "Sin comuna asignada",
          volunteers: [],
        };
        regionObj.comunas.push(comunaObj);
      }

      return comunaObj;
    };

    volunteers.forEach((volunteer) => {
      const regionObj = ensureRegionGroup(volunteer.region);
      const comunaObj = ensureComunaGroup(regionObj, volunteer.comuna);
      comunaObj.volunteers.push(volunteer);
    });

    return [result, null];
  } catch (error) {
    console.error("Error al obtener voluntarios por región:", error);
    return [null, "Error interno del servidor"];
  }
}
export async function getRegionsListService() {
  try {
    const fs = await import("fs");
    const regionsPath = new URL("../data/chile-regions.json", import.meta.url);
    const regionsData = JSON.parse(fs.readFileSync(regionsPath, "utf8"));

    return [regionsData, null];
  } catch (error) {
    console.error("Error al leer lista de regiones:", error);
    return [null, "Error interno del servidor"];
  }
}