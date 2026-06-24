"use strict";
import { AppDataSource } from "../config/configDb.js";
import Vivienda from "../entity/vivienda.entity.js";
import Hito from "../entity/hito.entity.js";

class ConstruccionService {
  getViviendasRepository() {
    return AppDataSource.getRepository(Vivienda);
  }

  getHitosRepository() {
    return AppDataSource.getRepository(Hito);
  }

  async crearVivienda(data) {
    try {
      const { direccion, hitos: numHitos = 2 } = data;
      const viviendasRepository = this.getViviendasRepository();
      const hitosRepository = this.getHitosRepository();
      
      // Generar valores por defecto para campos requeridos
      const numeroProyecto = `VVDA-${Date.now()}`; // Generar número único
      const beneficiario = "Por definir";
      const ci = "00000000"; // Placeholder

      const vivienda = viviendasRepository.create({
        numeroProyecto,
        beneficiario,
        ci,
        direccion,
        estado: "no_iniciada",
      });

      await viviendasRepository.save(vivienda);

      // Crear hitos para la vivienda
      const diasPorHito = 7; // Cada hito dura 7 días
      const hitosData = Array.from({ length: numHitos }, (_, i) => ({
        descripcion: `Hito ${i + 1}`,
        dias: diasPorHito,
        estado: "pendiente",
        progreso: 0,
        vivienda: vivienda,
      }));

      await hitosRepository.save(hitosData);

      // Recargar vivienda con hitos
      const viviendasConHitos = await viviendasRepository.findOne({
        where: { id: vivienda.id },
        relations: ["hitos"]
      });

      return viviendasConHitos;
    } catch (error) {
      throw new Error(`Error al crear vivienda: ${error.message}`);
    }
  }

  async obtenerViviendas(estado = null) {
    try {
      const viviendasRepository = this.getViviendasRepository();
      if (estado) {
        return await viviendasRepository.find({
          where: { estado },
          relations: ["hitos"],
          order: { createdAt: "DESC" }
        });
      }
      return await viviendasRepository.find({
        relations: ["hitos"],
        order: { createdAt: "DESC" }
      });
    } catch (error) {
      throw new Error(`Error al obtener viviendas: ${error.message}`);
    }
  }

  async obtenerVivienda(viviendaId) {
    try {
      const viviendasRepository = this.getViviendasRepository();
      const vivienda = await viviendasRepository.findOne({
        where: { id: viviendaId },
        relations: ["hitos"]
      });

      if (!vivienda) throw new Error("Vivienda no encontrada");

      return vivienda;
    } catch (error) {
      throw new Error(`Error al obtener vivienda: ${error.message}`);
    }
  }

  async iniciarConstruccion(viviendaId) {
    try {
      const viviendasRepository = this.getViviendasRepository();
      const vivienda = await viviendasRepository.findOne({
        where: { id: viviendaId },
      });

      if (!vivienda) throw new Error("Vivienda no encontrada");
      
      if (vivienda.estado !== "no_iniciada") {
        throw new Error("La construcción ya fue iniciada");
      }

      vivienda.fechaInicio = new Date();
      vivienda.estado = "en_progreso";

      const resultado = await viviendasRepository.save(vivienda);
      return resultado;
    } catch (error) {
      throw new Error(`Error al iniciar construcción: ${error.message}`);
    }
  }

  async completarConstruccion(viviendaId) {
    try {
      const viviendasRepository = this.getViviendasRepository();
      const vivienda = await viviendasRepository.findOne({
        where: { id: viviendaId },
      });

      if (!vivienda) throw new Error("Vivienda no encontrada");

      if (vivienda.estado !== "en_progreso") {
        throw new Error("Solo se pueden completar viviendas en progreso");
      }

      vivienda.fechaCompletacion = new Date();
      vivienda.estado = "completada";

      const resultado = await viviendasRepository.save(vivienda);
      return resultado;
    } catch (error) {
      throw new Error(`Error al completar construcción: ${error.message}`);
    }
  }

  async pausarConstruccion(viviendaId) {
    try {
      const viviendasRepository = this.getViviendasRepository();
      const vivienda = await viviendasRepository.findOne({
        where: { id: viviendaId },
      });

      if (!vivienda) throw new Error("Vivienda no encontrada");

      if (vivienda.estado !== "en_progreso") {
        throw new Error("Solo se pueden pausar viviendas en progreso");
      }

      vivienda.estado = "pausada";
      const resultado = await viviendasRepository.save(vivienda);

      return resultado;
    } catch (error) {
      throw new Error(`Error al pausar construcción: ${error.message}`);
    }
  }

  async firmarGarantia(id, firmaBase64) {
    try {
      const viviendasRepository = this.getViviendasRepository();
      const vivienda = await this.obtenerVivienda(id);
      vivienda.estado = "completada_con_firma";
      vivienda.firmaGarantiaUrl = firmaBase64;
      return await viviendasRepository.save(vivienda);
    } catch (error) {
      throw new Error(`Error al firmar garantía: ${error.message}`);
    }
  }

  async actualizarVivienda(viviendaId, data) {
    try {
      const viviendasRepository = this.getViviendasRepository();
      const vivienda = await viviendasRepository.findOne({
        where: { id: viviendaId },
      });

      if (!vivienda) throw new Error("Vivienda no encontrada");

      Object.assign(vivienda, data);

      const resultado = await viviendasRepository.save(vivienda);
      return resultado;
    } catch (error) {
      throw new Error(`Error al actualizar vivienda: ${error.message}`);
    }
  }

  async eliminarVivienda(viviendaId) {
    try {
      const viviendasRepository = this.getViviendasRepository();
      const vivienda = await viviendasRepository.findOne({
        where: { id: viviendaId },
      });

      if (!vivienda) throw new Error("Vivienda no encontrada");

      await viviendasRepository.remove(vivienda);
      return { mensaje: "Vivienda eliminada correctamente" };
    } catch (error) {
      throw new Error(`Error al eliminar vivienda: ${error.message}`);
    }
  }

  async actualizarAvanceHito(viviendaId, hitoId, progreso) {
    try {
      const hitosRepository = this.getHitosRepository();
      const hito = await hitosRepository.findOne({
        where: { id: hitoId },
      });

      if (!hito) throw new Error("Hito no encontrado");

      hito.progreso = progreso;
      
      if (progreso === 100) {
        hito.estado = "completado";
        hito.fechaCompletada = new Date();
      } else if (progreso > 0) {
        hito.estado = "en_progreso";
      }

      const resultado = await hitosRepository.save(hito);
      return resultado;
    } catch (error) {
      throw new Error(`Error al actualizar avance del hito: ${error.message}`);
    }
  }

  async verificarRetrasos() {
    try {
      const viviendasRepository = this.getViviendasRepository();
      const viviendas = await viviendasRepository.find({
        where: { estado: "en_progreso" },
        relations: ["hitos"]
      });

      const ahora = new Date();
      const retrasos = [];

      for (const vivienda of viviendas) {
        if (vivienda.hitos && vivienda.hitos.length > 0) {
          for (const hito of vivienda.hitos) {
            if (hito.estado === "pendiente" || hito.estado === "en_progreso") {
              if (hito.fechaProgramada && new Date(hito.fechaProgramada) < ahora) {
                retrasos.push({
                  viviendaId: vivienda.id,
                  hitoId: hito.id,
                  descripcion: hito.descripcion,
                  direccion: vivienda.direccion,
                });
              }
            }
          }
        }
      }

      return retrasos;
    } catch (error) {
      throw new Error(`Error al verificar retrasos: ${error.message}`);
    }
  }
}

export default new ConstruccionService();
