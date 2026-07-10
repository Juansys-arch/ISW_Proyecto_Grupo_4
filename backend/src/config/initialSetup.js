"use strict";
import User from "../entity/user.entity.js";
import Cuadrilla from "../entity/cuadrilla.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";

const normalizeEmail = (value = "") => String(value).trim().toLowerCase();

async function createUsers() {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const regionalAdminUsers = [
      {
        nombreCompleto: "Administrador Regional Arica y Parinacota",
        rut: "13.111.111-1",
        email: "admin.region.arica@gmail.cl",
        password: "adminregion1234",
        rol: "admin_region",
        region: "Arica y Parinacota",
        status: "approved",
      },
      {
        nombreCompleto: "Administrador Regional Tarapacá",
        rut: "13.111.111-2",
        email: "admin.region.tarapaca@gmail.cl",
        password: "adminregion1234",
        rol: "admin_region",
        region: "Tarapacá",
        status: "approved",
      },
      {
        nombreCompleto: "Administrador Regional Antofagasta",
        rut: "13.111.111-3",
        email: "admin.region.antofagasta@gmail.cl",
        password: "adminregion1234",
        rol: "admin_region",
        region: "Antofagasta",
        status: "approved",
      },
      {
        nombreCompleto: "Administrador Regional Atacama",
        rut: "13.111.111-4",
        email: "admin.region.atacama@gmail.cl",
        password: "adminregion1234",
        rol: "admin_region",
        region: "Atacama",
        status: "approved",
      },
      {
        nombreCompleto: "Administrador Regional Coquimbo",
        rut: "13.111.111-5",
        email: "admin.region.coquimbo@gmail.cl",
        password: "adminregion1234",
        rol: "admin_region",
        region: "Coquimbo",
        status: "approved",
      },
      {
        nombreCompleto: "Administrador Regional Valparaíso",
        rut: "13.111.111-6",
        email: "admin.region.valparaiso@gmail.cl",
        password: "adminregion1234",
        rol: "admin_region",
        region: "Valparaíso",
        status: "approved",
      },
      {
        nombreCompleto: "Administrador Regional Metropolitana de Santiago",
        rut: "13.111.111-7",
        email: "admin.region.metropolitana@gmail.cl",
        password: "adminregion1234",
        rol: "admin_region",
        region: "Metropolitana de Santiago",
        status: "approved",
      },
      {
        nombreCompleto: "Administrador Regional O’Higgins",
        rut: "13.111.111-8",
        email: "admin.region.ohiggins@gmail.cl",
        password: "adminregion1234",
        rol: "admin_region",
        region: "O’Higgins",
        status: "approved",
      },
      {
        nombreCompleto: "Administrador Regional Maule",
        rut: "13.111.111-9",
        email: "admin.region.maule@gmail.cl",
        password: "adminregion1234",
        rol: "admin_region",
        region: "Maule",
        status: "approved",
      },
      {
        nombreCompleto: "Administrador Regional Ñuble",
        rut: "13.111.111-0",
        email: "admin.region.nuble@gmail.cl",
        password: "adminregion1234",
        rol: "admin_region",
        region: "Ñuble",
        status: "approved",
      },
      {
        nombreCompleto: "Administrador Regional Biobío",
        rut: "13.222.222-1",
        email: "admin.region.biobio@gmail.cl",
        password: "adminregion1234",
        rol: "admin_region",
        region: "Biobío",
        status: "approved",
      },
      {
        nombreCompleto: "Administrador Regional La Araucanía",
        rut: "13.222.222-2",
        email: "admin.region.laaraucania@gmail.cl",
        password: "adminregion1234",
        rol: "admin_region",
        region: "La Araucanía",
        status: "approved",
      },
      {
        nombreCompleto: "Administrador Regional Los Ríos",
        rut: "13.222.222-3",
        email: "admin.region.losrios@gmail.cl",
        password: "adminregion1234",
        rol: "admin_region",
        region: "Los Ríos",
        status: "approved",
      },
      {
        nombreCompleto: "Administrador Regional Los Lagos",
        rut: "13.222.222-4",
        email: "admin.region.loslagos@gmail.cl",
        password: "adminregion1234",
        rol: "admin_region",
        region: "Los Lagos",
        status: "approved",
      },
      {
        nombreCompleto: "Administrador Regional Aysén",
        rut: "13.222.222-5",
        email: "admin.region.aysen@gmail.cl",
        password: "adminregion1234",
        rol: "admin_region",
        region: "Aysén",
        status: "approved",
      },
      {
        nombreCompleto: "Administrador Regional Magallanes y de la Antártica Chilena",
        rut: "13.222.222-6",
        email: "admin.region.magallanes@gmail.cl",
        password: "adminregion1234",
        rol: "admin_region",
        region: "Magallanes y de la Antártica Chilena",
        status: "approved",
      },
    ];

    const defaultUsers = [
      {
        nombreCompleto: "Diego Alexis Salazar Jara",
        rut: "21.308.770-3",
        email: "administrador2024@gmail.cl",
        password: "admin1234",
        rol: "super_admin",
        status: "approved",
      },
      ...regionalAdminUsers,
      {
        nombreCompleto: "Luis Alberto Paredes Rojas",
        rut: "19.876.543-2",
        email: "jefe.cuadrilla2024@gmail.cl",
        password: "jefe1234",
        rol: "jefe_cuadrilla",
        status: "approved",
      },
      {
        nombreCompleto: "Camila Andrea Fuentes Rivas",
        rut: "18.654.321-0",
        email: "encargado.inventario2024@gmail.cl",
        password: "inventario1234",
        rol: "encargado_inventario",
        status: "approved",
      },

      {
        nombreCompleto: "Voluntario Demo 1",
        rut: "11.111.111-1",
        email: "voluntario1@gmail.cl",
        password: "voluntario123",
        rol: "voluntario",
        status: "approved",
      },
      {
        nombreCompleto: "Voluntario Demo 2",
        rut: "22.222.222-2",
        email: "voluntario2@gmail.cl",
        password: "voluntario123",
        rol: "voluntario",
        status: "approved",
      },

      {
        nombreCompleto: "Diego Sebastián Ampuero Belmar",
        rut: "21.151.897-9",
        email: "usuario1.2024@gmail.cl",
        password: "user1234",
        rol: "usuario",
      },
      {
        nombreCompleto: "Alexander Benjamín Marcelo Carrasco Fuentes",
        rut: "20.630.735-8",
        email: "usuario2.2024@gmail.cl",
        password: "user1234",
        rol: "usuario",
      },
      {
        nombreCompleto: "Pablo Andrés Castillo Fernández",
        rut: "20.738.450-K",
        email: "usuario3.2024@gmail.cl",
        password: "user1234",
        rol: "usuario",
      },
    ];

    await Promise.all(
      defaultUsers.map(async (user) => {
        const normalizedUser = {
          ...user,
          email: normalizeEmail(user.email),
        };

        const existingUserByEmail = await userRepository
          .createQueryBuilder("user")
          .where("LOWER(user.email) = LOWER(:email)", { email: normalizedUser.email })
          .getOne();

        const existingUserByRut = normalizedUser.rut
          ? await userRepository.findOne({ where: { rut: normalizedUser.rut } })
          : null;

        const existingUser = existingUserByEmail || existingUserByRut;

        if (existingUser) {
          Object.assign(existingUser, {
            ...normalizedUser,
            password: await encryptPassword(normalizedUser.password),
          });
          await userRepository.save(existingUser);
        } else {
          await userRepository.save(
            userRepository.create({
              ...normalizedUser,
              password: await encryptPassword(normalizedUser.password),
            }),
          );
        }
      }),
    );

    console.log("* => Usuarios (incluyendo voluntarios demo) creados exitosamente");

    // Crear cuadrilla por defecto
    const cuadrillaRepository = AppDataSource.getRepository(Cuadrilla);
    const jefe = await userRepository.findOne({ where: { email: "jefe.cuadrilla2024@gmail.cl" } });
    if (jefe) {
      const existingCuadrilla = await cuadrillaRepository.findOne({ where: { nombre: "Cuadrilla por Defecto" } });
      if (!existingCuadrilla) {
        const defaultCuadrilla = await cuadrillaRepository.save(
          cuadrillaRepository.create({
            nombre: "Cuadrilla por Defecto",
            jefeCuadrillaId: jefe.id,
          })
        );
        console.log("* => Cuadrilla por Defecto creada exitosamente");

        const volunteer1 = await userRepository.findOne({ where: { email: "voluntario1@gmail.cl" } });
        const volunteer2 = await userRepository.findOne({ where: { email: "voluntario2@gmail.cl" } });

        if (volunteer1) {
          volunteer1.cuadrillaId = defaultCuadrilla.id;
          await userRepository.save(volunteer1);
        }
        if (volunteer2) {
          volunteer2.cuadrillaId = defaultCuadrilla.id;
          await userRepository.save(volunteer2);
        }
        console.log("* => Voluntarios demo asignados a Cuadrilla por Defecto");
      }
    }
  } catch (error) {
    console.error("Error al crear usuarios en initialSetup:", error);
  }
}

export { createUsers };