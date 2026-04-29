"use strict";
import { AppDataSource } from "../config/configDb.js";
import Vivienda from "../entity/vivienda.entity.js";
import Hito from "../entity/hito.entity.js";
import User from "../entity/user.entity.js";

const viviendasRepository = AppDataSource.getRepository(Vivienda);
const hitosRepository = AppDataSource.getRepository(Hito);
const usersRepository = AppDataSource.getRepository(User);

class ConstruccionService {
  async crearVivienda(data) {
    try {
      const { direccion, numeroPropiedad, jefeCuadrillaId, fechaPlanificada, diasHito } = data;

      const jefeCuadrilla = jefeCuadrillaId
        ? await usersRepository.findOne({ where: { id: jefeCuadrillaId } })
        : null;

      const vivienda = viviendasRepository.create({
        direccion,
        numeroPropiedad,
        jefeCuadrilla,
        fechaPlanificada: fechaPlanificada ? new Date(fechaPlanificada) : null,
        diasHito,
        estado: "planificada",
      });

      await viviendasRepository.save(vivienda);
      return vivienda;
    } catch (error) {
      throw new Error(`Error al crear vivienda: ${error.message}`);
    }
  }

  async iniciarConstruccion(viviendasId) {
    try {
      const vivienda = await viviendasRepository.findOne({ 
        where: { id: viviendasId },
        relations: ["hitos"],
      });

      if (!vivienda) throw new Error("Vivienda no encontrada");

      vivienda.fechaInicio = new Date();
      vivienda.estado = "en_progreso";

      // Crear hito único según lo seleccionado en la creación de vivienda
      if (!vivienda.hitos || vivienda.hitos.length === 0) {
        const diasSeleccionados = vivienda.diasHito || 2;
        const hitoDia = {
          dias: diasSeleccionados,
          descripcion: `Hito ${diasSeleccionados} días`,
        };

        const fechaProgramada = new Date(vivienda.fechaInicio);
        fechaProgramada.setDate(fechaProgramada.getDate() + hitoDia.dias);

        const hito = hitosRepository.create({
          ...hitoDia,
          vivienda,
          fechaProgramada,
          estado: "pendiente",
          progreso: 0,
        });

        const hitoGuardado = await hitosRepository.save(hito);
        vivienda.hitos = [hitoGuardado];
        console.log(`✓ Hito creado: ${hitoDia.descripcion}, ID: ${hitoGuardado.id}`);
      }

      const viviendaGuardada = await viviendasRepository.save(vivienda);
      
      // Reload para asegurar que los hitos se cargan
      const resultado = await viviendasRepository.findOne({
        where: { id: viviendasId },
        relations: ["hitos"],
      });
      
      console.log(`✓ Vivienda guardada con ${resultado.hitos?.length || 0} hitos`);
      return resultado;
    } catch (error) {
      throw new Error(`Error al iniciar construcción: ${error.message}`);
    }
  }

  async actualizarAvanceHito(viviendaId, hitoId, progreso) {
    try {
      const hito = await hitosRepository.findOne({
        where: { id: hitoId },
        relations: ["vivienda"],
      });

      if (!hito) throw new Error("Hito no encontrado");
      if (hito.vivienda.id !== viviendaId) throw new Error("Hito no pertenece a esta vivienda");

      hito.progreso = progreso;
      if (progreso < 100) {
        hito.estado = "en_progreso";
      } else if (progreso === 100) {
        hito.estado = "completado";
        hito.fechaCompletada = new Date();
      }

      await hitosRepository.save(hito);

      // Actualizar avance general
      await this.actualizarAvanceGeneral(viviendaId);

      return hito;
    } catch (error) {
      throw new Error(`Error al actualizar hito: ${error.message}`);
    }
  }

  async actualizarAvanceGeneral(viviendaId) {
    try {
      const vivienda = await viviendasRepository.findOne({
        where: { id: viviendaId },
        relations: ["hitos"],
      });

      if (!vivienda) return;

      if (vivienda.hitos.length > 0) {
        const promedioAvance =
          vivienda.hitos.reduce((acc, h) => acc + h.progreso, 0) /
          vivienda.hitos.length;
        vivienda.avanceGeneral = Math.round(promedioAvance);
      }

      await viviendasRepository.save(vivienda);
    } catch (error) {
      console.error("Error al actualizar avance general:", error);
    }
  }

  async completarConstruccion(viviendaId) {
    try {
      const vivienda = await viviendasRepository.findOne({
        where: { id: viviendaId },
        relations: ["hitos"],
      });

      if (!vivienda) throw new Error("Vivienda no encontrada");

      vivienda.fechaTermino = new Date();
      vivienda.estado = "completada";
      vivienda.avanceGeneral = 100;

      // Completar todos los hitos
      vivienda.hitos.forEach((hito) => {
        hito.estado = "completado";
        hito.progreso = 100;
        hito.fechaCompletada = new Date();
      });

      await hitosRepository.save(vivienda.hitos);
      return await viviendasRepository.save(vivienda);
    } catch (error) {
      throw new Error(`Error al completar construcción: ${error.message}`);
    }
  }

  async pausarConstruccion(viviendaId) {
    try {
      const vivienda = await viviendasRepository.findOne({
        where: { id: viviendaId },
      });

      if (!vivienda) throw new Error("Vivienda no encontrada");

      vivienda.estado = "pausada";
      return await viviendasRepository.save(vivienda);
    } catch (error) {
      throw new Error(`Error al pausar construcción: ${error.message}`);
    }
  }

  async obtenerViviendas(estado = null) {
    try {
      const query = viviendasRepository.createQueryBuilder("v").leftJoinAndSelect("v.hitos", "h").leftJoinAndSelect("v.jefeCuadrilla", "j");

      if (estado) {
        query.where("v.estado = :estado", { estado });
      }

      return await query.getMany();
    } catch (error) {
      throw new Error(`Error al obtener viviendas: ${error.message}`);
    }
  }

  async obtenerVivienda(viviendaId) {
    try {
      const vivienda = await viviendasRepository.findOne({
        where: { id: viviendaId },
        relations: ["hitos", "jefeCuadrilla"],
      });

      if (!vivienda) throw new Error("Vivienda no encontrada");

      return vivienda;
    } catch (error) {
      throw new Error(`Error al obtener vivienda: ${error.message}`);
    }
  }

  async verificarRetrasos() {
    try {
      const viviendas = await viviendasRepository.find({
        where: { estado: "en_progreso" },
        relations: ["hitos"],
      });

      const ahora = new Date();
      let retrasos = [];

      for (const vivienda of viviendas) {
        for (const hito of vivienda.hitos) {
          if (hito.estado !== "completado" && hito.fechaProgramada < ahora) {
            hito.estado = "atrasado";
            hito.alertaGenerada = true;
            await hitosRepository.save(hito);

            retrasos.push({
              vivienda: vivienda.direccion,
              hito: hito.descripcion,
              retrasoHoras: Math.floor((ahora - hito.fechaProgramada) / (1000 * 60 * 60)),
            });
          }
        }
      }

      return retrasos;
    } catch (error) {
      throw new Error(`Error al verificar retrasos: ${error.message}`);
    }
  }

  async eliminarVivienda(viviendaId) {
    try {
      console.log(`Eliminando vivienda: ${viviendaId}`);
      
      const vivienda = await viviendasRepository.findOne({
        where: { id: viviendaId },
        relations: ["hitos"],
      });

      if (!vivienda) {
        throw new Error("Vivienda no encontrada");
      }

      console.log(`Vivienda encontrada: ${vivienda.direccion}, hitos: ${vivienda.hitos?.length || 0}`);

      // Eliminar hitos primero
      if (vivienda.hitos && vivienda.hitos.length > 0) {
        await hitosRepository.remove(vivienda.hitos);
        console.log(`Hitos eliminados`);
      }

      // Luego eliminar la vivienda
      await viviendasRepository.remove(vivienda);
      console.log(`Vivienda eliminada`);
      
      return { mensaje: "Vivienda eliminada exitosamente" };
    } catch (error) {
      console.error(`Error al eliminar vivienda: ${error.message}`);
      throw new Error(`Error al eliminar vivienda: ${error.message}`);
    }
  }
}

export default new ConstruccionService();
