"use strict";
import User from "../entity/user.entity.js";
import Cuadrilla from "../entity/cuadrilla.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";

async function createUsers() {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const defaultUsers = [
      {
        nombreCompleto: "Diego Alexis Salazar Jara",
        rut: "21.308.770-3",
        email: "administrador2024@gmail.cl",
        password: "admin1234",
        rol: "administrador",
  status: "approved",
      },
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
        
        const existingUser = await userRepository.findOne({
          where: { email: user.email },
        });

        if (!existingUser) {
          
          await userRepository.save(
            userRepository.create({
              ...user,
              password: await encryptPassword(user.password),
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