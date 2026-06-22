"use strict";
import { AppDataSource } from "../config/configDb.js";
import Cuadrilla from "../entity/cuadrilla.entity.js";
import User from "../entity/user.entity.js";
import { In } from "typeorm";
import { encryptPassword } from "../helpers/bcrypt.helper.js";
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

    // Clear current members of this crew
    await userRepository.update({ cuadrillaId: cuadrilla.id }, { cuadrillaId: null });

    // Assign new members
    if (miembrosIds && miembrosIds.length > 0) {
      await userRepository.update({ id: In(miembrosIds) }, { cuadrillaId: cuadrilla.id });
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
    const voluntarios = await userRepository.find({
      where: { rol: "voluntario", status: "approved" },
      select: ["id", "nombreCompleto", "rut", "email", "cuadrillaId"],
    });

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

    if (!email.endsWith("@gmail.cl")) {
      return handleErrorClient(res, 400, "El correo electrónico debe ser del dominio @gmail.cl");
    }

    const existingUser = await userRepository.findOne({
      where: [{ email }, { rut }],
    });

    if (existingUser) {
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
    });

    await userRepository.save(newVolunteer);
    delete newVolunteer.password;

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

    if (!email.endsWith("@gmail.cl")) {
      return handleErrorClient(res, 400, "El correo electrónico debe ser del dominio @gmail.cl");
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

    volunteer.nombreCompleto = nombreCompleto;
    volunteer.rut = rut;
    volunteer.email = email;

    await userRepository.save(volunteer);
    delete volunteer.password;

    handleSuccess(res, 200, "Voluntario actualizado exitosamente", volunteer);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

