"use strict";
import { AppDataSource } from "../config/configDb.js";
import Vivienda from "../entity/vivienda.entity.js";
import Hito from "../entity/hito.entity.js";
import { notificarPorRoles } from "./notificacion.service.js";

class ConstruccionService {
  getViviendasRepository() {
    return AppDataSource.getRepository(Vivienda);
  }

  getHitosRepository() {
    return AppDataSource.getRepository(Hito);
  }

  async crearVivienda(data) {
    try {
      const { direccion, beneficiario, region, comuna, hitos: numHitos = 2 } = data;
      const viviendasRepository = this.getViviendasRepository();
      const hitosRepository = this.getHitosRepository();
      const cantidadHitos = Number(numHitos) || 2;

      // Generar valores por defecto para campos requeridos
      const numeroProyecto = `VVDA-${Date.now()}`; // Generar número único
      const ci = "00000000"; // Placeholder

      const vivienda = viviendasRepository.create({
        numeroProyecto,
        beneficiario,
        region,
        comuna,
        ci,
        direccion,
        estado: "no_iniciada",
      });

      await viviendasRepository.save(vivienda);

      // Crear hitos para la vivienda con la duración indicada por la opción seleccionada
      const diasPorHito = cantidadHitos;
      const hitosData = Array.from({ length: cantidadHitos }, (_, i) => ({
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

      const hitosRepository = this.getHitosRepository();
      const hitos = await hitosRepository.find({
        where: { vivienda: { id: viviendaId } },
      });

      for (const hito of hitos) {
        if (!hito.fechaProgramada) {
          const fechaProgramada = new Date(vivienda.fechaInicio);
          fechaProgramada.setDate(fechaProgramada.getDate() + (hito.dias || 0));
          hito.fechaProgramada = fechaProgramada;
          await hitosRepository.save(hito);
        }
      }

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

      if (vivienda.estado === "atrasada") {
        throw new Error("No se puede completar una vivienda atrasada. Por favor, reanuda la construcción primero");
      }

      if (vivienda.estado !== "en_progreso" && vivienda.estado !== "pausada") {
        throw new Error("Solo se pueden completar viviendas en progreso o pausadas");
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

      if (vivienda.estado === "atrasada") {
        throw new Error("No se puede pausar una vivienda atrasada. Por favor, reanuda la construcción primero");
      }

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

  async reanudarConstruccion(viviendaId) {
    try {
      const viviendasRepository = this.getViviendasRepository();
      const vivienda = await viviendasRepository.findOne({
        where: { id: viviendaId },
        relations: ["hitos"]
      });

      if (!vivienda) throw new Error("Vivienda no encontrada");

      if (vivienda.estado !== "pausada" && vivienda.estado !== "atrasada") {
        throw new Error("Solo se pueden reanudar viviendas pausadas o atrasadas");
      }

      const estadoAnterior = vivienda.estado;
      vivienda.estado = "en_progreso";
      const resultado = await viviendasRepository.save(vivienda);

      const hitosRepository = this.getHitosRepository();
      const hitos = await hitosRepository.find({
        where: { vivienda: { id: viviendaId } },
      });

      // Si se estaba reanudando desde "atrasada", recalcular todas las fechas de hitos
      if (estadoAnterior === "atrasada") {
        const ahora = new Date();
        for (const hito of hitos) {
          if (hito.estado === "pendiente" || hito.estado === "en_progreso") {
            // Recalcular fecha programada desde hoy
            const fechaProgramada = new Date(ahora);
            fechaProgramada.setDate(fechaProgramada.getDate() + (hito.dias || 7));
            hito.fechaProgramada = fechaProgramada;
            await hitosRepository.save(hito);
          }
        }
      } else {
        // Si es desde "pausada", solo asignar fechas a hitos sin fecha
        for (const hito of hitos) {
          if (!hito.fechaProgramada) {
            const fechaProgramada = new Date(vivienda.fechaInicio || new Date());
            fechaProgramada.setDate(fechaProgramada.getDate() + (hito.dias || 0));
            hito.fechaProgramada = fechaProgramada;
            await hitosRepository.save(hito);
          }
        }
      }

      return resultado;
    } catch (error) {
      throw new Error(`Error al reanudar construcción: ${error.message}`);
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
      // Verificar viviendas en estado "no_iniciada" o "en_progreso" que tengan hitos pendientes
      const viviendas = await viviendasRepository.find({
        where: [
          { estado: "no_iniciada" },
          { estado: "en_progreso" }
        ],
        relations: ["hitos"]
      });

      const ahora = new Date();
      const retrasos = [];

      for (const vivienda of viviendas) {
        let viviendaAtrasada = false;

        if (vivienda.hitos && vivienda.hitos.length > 0) {
          for (const hito of vivienda.hitos) {
            // Si el hito ya está completado, no verificar retrasos
            if (hito.estado === "completado") {
              continue;
            }

            let fechaProgramada = hito.fechaProgramada;


            // Verificar si el hito está atrasado
            const estaAtrasado =
              fechaProgramada
              && new Date(fechaProgramada) < ahora
              && (hito.estado === "pendiente" || hito.estado === "en_progreso");

            if (estaAtrasado) {
              viviendaAtrasada = true;
              retrasos.push({
                viviendaId: vivienda.id,
                hitoId: hito.id,
                descripcion: hito.descripcion,
                direccion: vivienda.direccion,
              });

              // Solo notificar si no se ha notificado antes
              const yaNotificada = retrasos.filter(r => r.viviendaId === vivienda.id).length === 1;
              if (yaNotificada) {
                await notificarPorRoles({
                  roles: ["super_admin", "encargado_inventario", "jefe_cuadrilla"],
                  tipo: "construccion",
                  mensaje: `La construcción en ${vivienda.direccion} está atrasada.`
                });
              }
            }
          }
        }

        // Cambiar estado a atrasada si algún hito está atrasado
        if (viviendaAtrasada && vivienda.estado !== "atrasada") {
          vivienda.estado = "atrasada";
          await viviendasRepository.save(vivienda);
          console.log(`✓ Vivienda marcada como atrasada: ${vivienda.direccion}`);
        }
      }

      return retrasos;
    } catch (error) {
      console.error("Error en verificarRetrasos:", error);
      throw new Error(`Error al verificar retrasos: ${error.message}`);
    }
  }
}

export default new ConstruccionService();
