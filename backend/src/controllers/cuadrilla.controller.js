"use strict";
import { AppDataSource } from "../config/configDb.js";
import Cuadrilla from "../entity/cuadrilla.entity.js";
import User from "../entity/user.entity.js";
import Volunteer from "../entity/volunteer.entity.js";
import { In } from "typeorm";
import { filterVolunteersByAccess } from "../services/volunteer.service.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";
import { enviarNotificacionCuadrilla } from "../helpers/email.helper.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

const cuadrillaRepository = AppDataSource.getRepository(Cuadrilla);
const userRepository = AppDataSource.getRepository(User);

export async function getCuadrillas(req, res) {
  try {
    const whereCondition =
      req.user.rol === "jefe_cuadrilla"
        ? { jefeCuadrillaId: req.user.id }
        : {};

    const cuadrillas = await cuadrillaRepository.find({
      where: whereCondition,
      relations: ["jefeCuadrilla", "miembros"],
    });

    const safeCuadrillas = cuadrillas.map((c) => {
      if (c.jefeCuadrilla) {
        delete c.jefeCuadrilla.password;
      }
      if (c.miembros) {
        c.miembros = c.miembros.map((m) => {
          delete m.password;
          return m;
        });
      }
      return c;
    });

    handleSuccess(res, 200, "Cuadrillas encontradas", safeCuadrillas);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function crearCuadrilla(req, res) {
  try {
    const { nombre, miembrosIds } = req.body;
    let { jefeCuadrillaId } = req.body;

    if (req.user.rol === "jefe_cuadrilla") {
      jefeCuadrillaId = req.user.id;
    } else if (!jefeCuadrillaId) {
      return handleErrorClient(res, 400, "Debes especificar un jefe de cuadrilla.");
    }

    if (!nombre || nombre.trim() === "") {
      return handleErrorClient(res, 400, "El nombre de la cuadrilla es obligatorio.");
    }

    // Backend validation: Max 10 people
    if (miembrosIds && miembrosIds.length > 10) {
      return handleErrorClient(res, 400, "Una cuadrilla no puede tener más de 10 personas.");
    }

    // Verify members are volunteers
    if (miembrosIds && miembrosIds.length > 0) {
      const volunteers = await userRepository.find({
        where: { id: In(miembrosIds) },
      });

      const invalidMembers = volunteers.filter((v) => v.rol !== "voluntario" || v.status !== "approved");
      if (invalidMembers.length > 0) {
        return handleErrorClient(
          res,
          400,
          "Todos los miembros deben ser voluntarios aprobados."
        );
      }
    }

    const cuadrilla = cuadrillaRepository.create({
      nombre,
      jefeCuadrillaId,
    });

    const savedCuadrilla = await cuadrillaRepository.save(cuadrilla);

    if (miembrosIds && miembrosIds.length > 0) {
      await userRepository.update({ id: In(miembrosIds) }, { cuadrillaId: savedCuadrilla.id });

      // Fetch chief name
      const jefeUser = await userRepository.findOne({ where: { id: jefeCuadrillaId } });
      const jefeNombre = jefeUser ? jefeUser.nombreCompleto : "Por asignar";

      // Fetch member details to send emails
      const volunteers = await userRepository.find({ where: { id: In(miembrosIds) } });
      for (const vol of volunteers) {
        if (vol.email) {
          enviarNotificacionCuadrilla(vol.email, nombre, jefeNombre, vol.nombreCompleto)
            .catch((err) => console.error(`Error al enviar email a ${vol.email}:`, err));
        }
      }
    }

    // Fetch the complete cuadrilla with relations to return
    const completeCuadrilla = await cuadrillaRepository.findOne({
      where: { id: savedCuadrilla.id },
      relations: ["jefeCuadrilla", "miembros"],
    });

    if (completeCuadrilla.jefeCuadrilla) delete completeCuadrilla.jefeCuadrilla.password;
    if (completeCuadrilla.miembros) {
      completeCuadrilla.miembros = completeCuadrilla.miembros.map((m) => {
        delete m.password;
        return m;
      });
    }

    handleSuccess(res, 201, "Cuadrilla creada exitosamente", completeCuadrilla);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function actualizarCuadrilla(req, res) {
  try {
    const { id } = req.params;
    const { nombre, miembrosIds } = req.body;

    const cuadrilla = await cuadrillaRepository.findOne({
      where: { id: parseInt(id) },
    });

    if (!cuadrilla) {
      return handleErrorClient(res, 404, "Cuadrilla no encontrada");
    }

    if (req.user.rol === "jefe_cuadrilla" && cuadrilla.jefeCuadrillaId !== req.user.id) {
      return handleErrorClient(
        res,
        403,
        "No tienes permisos para modificar esta cuadrilla"
      );
    }

    if (!nombre || nombre.trim() === "") {
      return handleErrorClient(res, 400, "El nombre de la cuadrilla es obligatorio.");
    }

    // Backend validation: Max 10 people
    if (miembrosIds && miembrosIds.length > 10) {
      return handleErrorClient(res, 400, "Una cuadrilla no puede tener más de 10 personas.");
    }

    // Verify members are volunteers
    if (miembrosIds && miembrosIds.length > 0) {
      const volunteers = await userRepository.find({
        where: { id: In(miembrosIds) },
      });

      const invalidMembers = volunteers.filter((v) => v.rol !== "voluntario" || v.status !== "approved");
      if (invalidMembers.length > 0) {
        return handleErrorClient(
          res,
          400,
          "Todos los miembros deben ser voluntarios aprobados."
        );
      }
    }

    cuadrilla.nombre = nombre;
    await cuadrillaRepository.save(cuadrilla);

    // Get current members before updating to determine who is newly added
    const oldMembers = await userRepository.find({
      where: { cuadrillaId: cuadrilla.id },
      select: ["id"],
    });
    const oldMembersIds = oldMembers.map((m) => m.id);

    // Clear current members of this crew
    await userRepository.update({ cuadrillaId: cuadrilla.id }, { cuadrillaId: null });

    // Assign new members
    if (miembrosIds && miembrosIds.length > 0) {
      await userRepository.update({ id: In(miembrosIds) }, { cuadrillaId: cuadrilla.id });
    }

    // Determine who is newly added
    const newMiembrosIds = miembrosIds ? miembrosIds.filter((id) => !oldMembersIds.includes(id)) : [];

    if (newMiembrosIds.length > 0) {
      const jefeUser = await userRepository.findOne({ where: { id: cuadrilla.jefeCuadrillaId } });
      const jefeNombre = jefeUser ? jefeUser.nombreCompleto : "Por asignar";

      const newVolunteers = await userRepository.find({ where: { id: In(newMiembrosIds) } });
      for (const vol of newVolunteers) {
        if (vol.email) {
          enviarNotificacionCuadrilla(vol.email, nombre, jefeNombre, vol.nombreCompleto)
            .catch((err) => console.error(`Error al enviar email a ${vol.email}:`, err));
        }
      }
    }

    const updatedCuadrilla = await cuadrillaRepository.findOne({
      where: { id: cuadrilla.id },
      relations: ["jefeCuadrilla", "miembros"],
    });

    if (updatedCuadrilla.jefeCuadrilla) delete updatedCuadrilla.jefeCuadrilla.password;
    if (updatedCuadrilla.miembros) {
      updatedCuadrilla.miembros = updatedCuadrilla.miembros.map((m) => {
        delete m.password;
        return m;
      });
    }

    handleSuccess(res, 200, "Cuadrilla actualizada exitosamente", updatedCuadrilla);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function eliminarCuadrilla(req, res) {
  try {
    const { id } = req.params;

    const cuadrilla = await cuadrillaRepository.findOne({
      where: { id: parseInt(id) },
    });

    if (!cuadrilla) {
      return handleErrorClient(res, 404, "Cuadrilla no encontrada");
    }

    if (req.user.rol === "jefe_cuadrilla" && cuadrilla.jefeCuadrillaId !== req.user.id) {
      return handleErrorClient(
        res,
        403,
        "No tienes permisos para eliminar esta cuadrilla"
      );
    }

    await cuadrillaRepository.remove(cuadrilla);

    handleSuccess(res, 200, "Cuadrilla eliminada correctamente", cuadrilla);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getVoluntariosDisponibles(req, res) {
  try {
    const volunteerRepository = AppDataSource.getRepository(Volunteer);

    // Fetch all registered volunteers from the volunteers table who are not rejected
    let registeredVolunteers = await volunteerRepository.find({
      where: { status: In(["pending", "approved"]) }
    });

    // Filter registered volunteers by region of the logged-in user
    registeredVolunteers = filterVolunteersByAccess(registeredVolunteers, req.user);

    // For each volunteer, ensure they exist in the users table
    for (const vol of registeredVolunteers) {
      const existingUser = await userRepository.findOne({
        where: [{ email: vol.email }, { rut: vol.rut }]
      });

      if (!existingUser) {
        const hashedPassword = await encryptPassword("voluntario123");
        const newUser = userRepository.create({
          nombreCompleto: vol.nombreCompleto,
          rut: vol.rut,
          email: vol.email,
          password: hashedPassword,
          rol: "voluntario",
          status: "approved",
          region: vol.region || null
        });
        await userRepository.save(newUser);
      }
    }

    let voluntarios = await userRepository.find({
      where: { rol: "voluntario", status: "approved" },
      select: ["id", "nombreCompleto", "rut", "email", "cuadrillaId", "region"],
    });

    // Filter the final list of volunteers by region of the logged-in user
    voluntarios = filterVolunteersByAccess(voluntarios, req.user);

    handleSuccess(res, 200, "Voluntarios recuperados exitosamente", voluntarios);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function crearVoluntario(req, res) {
  try {
    const { nombreCompleto, rut, email } = req.body;

    if (!nombreCompleto || !rut || !email) {
      return handleErrorClient(res, 400, "Todos los campos son obligatorios.");
    }

    if (!email.endsWith("@gmail.cl") && !email.endsWith("@gmail.com")) {
      return handleErrorClient(res, 400, "El correo electrónico debe ser del dominio @gmail.cl o @gmail.com");
    }

    const volunteerRepository = AppDataSource.getRepository(Volunteer);

    const existingUser = await userRepository.findOne({
      where: [{ email }, { rut }],
    });

    const existingVolunteer = await volunteerRepository.findOne({
      where: [{ email }, { rut }],
    });

    if (existingUser || existingVolunteer) {
      return handleErrorClient(res, 400, "El correo o el RUT ya están registrados.");
    }

    const hashedPassword = await encryptPassword("voluntario123");
    const newVolunteer = userRepository.create({
      nombreCompleto,
      rut,
      email,
      password: hashedPassword,
      rol: "voluntario",
      status: "approved",
      region: req.user.region || null,
    });

    await userRepository.save(newVolunteer);
    delete newVolunteer.password;

    const newVolRecord = volunteerRepository.create({
      nombreCompleto,
      rut,
      email,
      rol: "voluntario",
      status: "approved",
      region: req.user.region || null,
    });
    await volunteerRepository.save(newVolRecord);

    handleSuccess(res, 201, "Voluntario creado exitosamente", newVolunteer);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function actualizarVoluntario(req, res) {
  try {
    const { id } = req.params;
    const { nombreCompleto, rut, email } = req.body;

    if (!nombreCompleto || !rut || !email) {
      return handleErrorClient(res, 400, "Todos los campos son obligatorios.");
    }

    if (!email.endsWith("@gmail.cl") && !email.endsWith("@gmail.com")) {
      return handleErrorClient(res, 400, "El correo electrónico debe ser del dominio @gmail.cl o @gmail.com");
    }

    const volunteer = await userRepository.findOne({
      where: { id: parseInt(id), rol: "voluntario" },
    });

    if (!volunteer) {
      return handleErrorClient(res, 404, "Voluntario no encontrado.");
    }

    const existingUser = await userRepository.findOne({
      where: [{ email }, { rut }],
    });

    if (existingUser && existingUser.id !== volunteer.id) {
      return handleErrorClient(res, 400, "El correo o el RUT ya están registrados por otro usuario.");
    }

    const volunteerRepository = AppDataSource.getRepository(Volunteer);
    const oldEmail = volunteer.email;
    const oldRut = volunteer.rut;

    const volRecord = await volunteerRepository.findOne({
      where: [{ email: oldEmail }, { rut: oldRut }],
    });

    if (volRecord) {
      const duplicateVolunteer = await volunteerRepository.findOne({
        where: [{ email }, { rut }],
      });
      if (duplicateVolunteer && duplicateVolunteer.id !== volRecord.id) {
        return handleErrorClient(res, 400, "El correo o el RUT ya están registrados por otro voluntario.");
      }
    }

    volunteer.nombreCompleto = nombreCompleto;
    volunteer.rut = rut;
    volunteer.email = email;

    await userRepository.save(volunteer);
    delete volunteer.password;

    if (volRecord) {
      volRecord.nombreCompleto = nombreCompleto;
      volRecord.rut = rut;
      volRecord.email = email;
      await volunteerRepository.save(volRecord);
    } else {
      const newVol = volunteerRepository.create({
        nombreCompleto,
        rut,
        email,
        rol: "voluntario",
        status: "approved",
        region: volunteer.region || null,
      });
      await volunteerRepository.save(newVol);
    }

    handleSuccess(res, 200, "Voluntario actualizado exitosamente", volunteer);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

