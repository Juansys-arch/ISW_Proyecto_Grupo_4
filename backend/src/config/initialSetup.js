"use strict";
import User from "../entity/user.entity.js";
import { AppDataSource } from "./configDb.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

async function createUsers() {
  try {
    const userRepository = AppDataSource.getRepository(User);

    const defaultUsers = [
      {
        nombreCompleto: "Diego Alexis Salazar Jara",
        rut: "21.308.770-3",
        email: "administrador2024@gmail.cl",
        telefono: "+56912345678",
        password: "admin1234",
        rol: "administrador",
  status: "approved",
      },
      {
        nombreCompleto: "Luis Alberto Paredes Rojas",
        rut: "19.876.543-2",
        email: "jefe.cuadrilla2024@gmail.cl",
        telefono: "+56923456789",
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
        nombreCompleto: "Diego SebastiÃ¡n Ampuero Belmar",
        rut: "21.151.897-9",
        email: "usuario1.2024@gmail.cl",
        password: "user1234",
        rol: "usuario",
      },
      {
        nombreCompleto: "Alexander BenjamÃ­n Marcelo Carrasco Fuentes",
        rut: "20.630.735-8",
        email: "usuario2.2024@gmail.cl",
        password: "user1234",
        rol: "usuario",
      },
      {
        nombreCompleto: "Pablo AndrÃ©s Castillo FernÃ¡ndez",
        rut: "20.738.450-K",
        email: "usuario3.2024@gmail.cl",
        password: "user1234",
        rol: "usuario",
      },
      {
        nombreCompleto: "Felipe Andrés Henríquez Zapata",
        rut: "20.976.635-3",
        email: "usuario4.2024@gmail.cl",
        password: "user1234",
        rol: "usuario",
      },
      {
        nombreCompleto: "Diego Alexis Meza Ortega",
        rut: "21.172.447-1",
        email: "usuario5.2024@gmail.cl",
        password: "user1234",
        rol: "usuario",
      },
      {
        nombreCompleto: "Juan Pablo Rosas Martin",
        rut: "20.738.415-1",
        email: "usuario6.2024@gmail.cl",
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

async function createVolunteers() {
  try {
    const volunteerRepository = AppDataSource.getRepository(Volunteer);

    const regionsPath = fileURLToPath(new URL("../data/chile-regions.json", import.meta.url));
    const regionsRaw = fs.readFileSync(regionsPath, "utf8");
    const regions = JSON.parse(regionsRaw);

    const existingVolunteers = await volunteerRepository.find({ select: ["email", "rut"] });
    const existingEmails = new Set(existingVolunteers.map((v) => v.email));
    const existingRuts = new Set(existingVolunteers.map((v) => v.rut));

    const getSlug = (value) =>
      value
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .replace(/[^a-zA-Z0-9]+/g, "")
        .toLowerCase();

    let counter = 1;
    const existingRutNumbers = [...existingRuts]
      .map((rut) => parseInt(rut.split("-")[0], 10))
      .filter((num) => Number.isFinite(num));
    if (existingRutNumbers.length > 0) {
      counter = Math.max(...existingRutNumbers) - 20000000 + 1;
      if (counter < 1) counter = 1;
    }

    for (const r of regions) {
      const regionSlug = getSlug(r.region);
      const regionName = r.region;

      for (const comuna of r.comunas) {
        const comunaSlug = getSlug(comuna);

        for (let i = 1; i <= 3; i++) {
          const email = `vol.${regionSlug}.${comunaSlug}.${i}@gmail.cl`;

          if (existingEmails.has(email)) continue;

          let rut;
          do {
            rut = `${20000000 + counter}-0`;
            counter++;
          } while (existingRuts.has(rut));

          existingEmails.add(email);
          existingRuts.add(rut);

          const nombreCompleto = `Voluntario ${i} ${comuna}`;

          const newVol = volunteerRepository.create({
            nombreCompleto,
            rut,
            email,
            fechaNacimiento: new Date(1990, 0, 1),
            genero: 'otro',
            numeroContacto: '+56900000000',
            direccion: `${comuna}, ${regionName}`,
            region: regionName,
            comuna: comuna,
            disponibilidad: 'indefinida',
            status: 'approved',
            rol: 'voluntario',
            password: await encryptPassword('vol1234'),
          });

          await volunteerRepository.save(newVol);
        }
      }
    }

    console.log('* => Voluntarios seed creados exitosamente');
  } catch (error) {
    console.error('Error al crear voluntarios:', error);
  }
}

export { createVolunteers };

async function assignComunasToVolunteers() {
  try {
    const volunteerRepository = AppDataSource.getRepository(Volunteer);

    const regionsPath = fileURLToPath(new URL("../data/chile-regions.json", import.meta.url));
    const regionsRaw = fs.readFileSync(regionsPath, "utf8");
    const regions = JSON.parse(regionsRaw);

    const volunteers = await volunteerRepository.find();

    for (const v of volunteers) {
      if (v.comuna && v.comuna.trim() !== "") continue;

      const textToSearch = `${v.direccion || ""} ${v.email || ""}`.toLowerCase();
      let matched = false;

      for (const r of regions) {
        for (const comuna of r.comunas) {
          const name = comuna.toLowerCase();
          if (textToSearch.includes(name)) {
            v.comuna = comuna;
            v.region = r.region;
            await volunteerRepository.save(v);
            matched = true;
            break;
          }
        }
        if (matched) break;
      }

      if (!matched) {
        v.comuna = 'No asignada';
        v.region = v.region || null;
        await volunteerRepository.save(v);
      }
    }

    console.log('* => AsignaciÃ³n de comunas completada');
  } catch (error) {
    console.error('Error al asignar comunas a voluntarios:', error);
  }
}

export { assignComunasToVolunteers };
