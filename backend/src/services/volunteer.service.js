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

function normalizeText(value) {
  return typeof value === "string"
    ? value.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "")
    : "";
}

function getAccessScope(user) {
  const role = normalizeText(user?.rol);

  if (role === "super_admin" || role === "administrador") {
    return { canAccessAll: true };
  }

  if (role === "admin_region") {
    const region = String(user?.region || "").trim();
    return { canAccessAll: false, allowedRegion: region };
  }

  return { canAccessAll: true };
}

function filterVolunteersByAccess(volunteers = [], user) {
  const scope = getAccessScope(user);

  if (scope.canAccessAll) return volunteers;
  if (!scope.allowedRegion) return [];

  return volunteers.filter((volunteer) => normalizeText(volunteer?.region) === normalizeText(scope.allowedRegion));
}

export async function getAllVolunteersService(user) {
  try {
    const volunteerRepository = AppDataSource.getRepository(Volunteer);

    const volunteers = await volunteerRepository.find({
      select: [
        "id",
        "nombreCompleto",
        "rut",
        "email",
        "status",
        "rol",
        "createdAt",
        "fechaNacimiento",
        "genero",
        "numeroContacto",
        "direccion",
        "region",
        "comuna",
        "disponibilidad",
      ],
    });

    return [filterVolunteersByAccess(volunteers, user), null];
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

export async function getPendingVolunteersService(user) {
  try {
    const volunteerRepository = AppDataSource.getRepository(Volunteer);

    const pendingVolunteers = await volunteerRepository.find({
      where: { status: "pending" },
    });

    return [filterVolunteersByAccess(pendingVolunteers, user), null];
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

export async function getVolunteersByRegionService(user) {
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

    const scope = getAccessScope(user);

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

    const visibleVolunteers = filterVolunteersByAccess(volunteers, user);

    visibleVolunteers.forEach((volunteer) => {
      const normalizedStatus = String(volunteer?.status || '').trim().toLowerCase();
      if (['rejected', 'rechazado'].includes(normalizedStatus)) {
        return;
      }

      const regionObj = ensureRegionGroup(volunteer.region);
      const comunaObj = ensureComunaGroup(regionObj, volunteer.comuna);
      comunaObj.volunteers.push(volunteer);
    });

    if (!scope.canAccessAll && scope.allowedRegion) {
      const normalizedAllowedRegion = normalizeText(scope.allowedRegion);
      return [result.filter((regionObj) => normalizeText(regionObj.region) === normalizedAllowedRegion), null];
    }

    return [result, null];
  } catch (error) {
    console.error("Error al obtener voluntarios por región:", error);
    return [null, "Error interno del servidor"];
  }
}
export async function getRegionsListService(user) {
  try {
    const fallbackRegions = [
      { region: "Arica y Parinacota", comunas: ["Arica", "Camarones", "Putre", "General Lagos"] },
      { region: "Tarapacá", comunas: ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"] },
      { region: "Antofagasta", comunas: ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama"] },
      { region: "Atacama", comunas: ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"] },
      { region: "Coquimbo", comunas: ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"] },
      { region: "Valparaíso", comunas: ["Valparaíso", "Concón", "Viña del Mar", "Quilpué", "Villa Alemana", "San Antonio", "Cartagena", "El Quisco", "El Tabo", "Algarrobo", "Quintero", "Puchuncaví", "Casablanca", "Juan Fernández", "San Felipe", "Los Andes", "Catemu", "Quillota", "La Cruz", "Llaillay", "Panquehue", "Putaendo", "Santa María", "Rinconada", "Calle Larga", "Nogales", "Olmué", "Limache", "Petorca", "La Ligua", "Cabildo", "Zapallar", "Papudo"] },
      { region: "Metropolitana de Santiago", comunas: ["Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"] },
      { region: "O’Higgins", comunas: ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "Santa Cruz", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "San Fernando", "Chépica"] },
      { region: "Maule", comunas: ["Talca", "Curicó", "Linares", "Cauquenes", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Chanco", "Pelluhue", "Molina", "Romeral", "Sagrada Familia", "Hualañé", "Licantén", "Vichuquén", "Rauco", "Teno", "Villa Alegre", "Yerbas Buenas"] },
      { region: "Ñuble", comunas: ["Chillán", "Chillán Viejo", "Bulnes", "Cobquecura", "Coelemu", "Coihueco", "Quillón", "San Carlos", "San Fabián", "San Ignacio", "El Carmen", "Pemuco", "Ninhue", "Portezuelo", "Ránquil", "Yungay"] },
      { region: "Biobío", comunas: ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualpén", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Lebu", "Los Álamos", "Tirúa", "Laja", "Nacimiento", "Negrete", "Quilaco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío"] },
      { region: "La Araucanía", comunas: ["Temuco", "Padre Las Casas", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"] },
      { region: "Los Ríos", comunas: ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"] },
      { region: "Los Lagos", comunas: ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"] },
      { region: "Aysén", comunas: ["Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Chile Chico", "Río Ibáñez"] },
      { region: "Magallanes y de la Antártica Chilena", comunas: ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel"] },
    ];

    const scope = getAccessScope(user);
    if (!scope.canAccessAll && scope.allowedRegion) {
      const normalizedAllowedRegion = normalizeText(scope.allowedRegion);
      return [fallbackRegions.filter((region) => normalizeText(region.region) === normalizedAllowedRegion), null];
    }

    return [fallbackRegions, null];
  } catch (error) {
    console.error("Error al leer lista de regiones:", error);
    return [null, "Error interno del servidor"];
  }
}