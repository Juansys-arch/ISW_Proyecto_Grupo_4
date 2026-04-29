"use strict";
import { AppDataSource } from "./configDb.js";

const viviendasRepository = AppDataSource.getRepository("Vivienda");
const hitosRepository = AppDataSource.getRepository("Hito");
const notificacionRepository = AppDataSource.getRepository("Notificacion");
const userRepository = AppDataSource.getRepository("User");

/**
 * Temporizador: Verificar retrasos en viviendas cada X milisegundos
 * Genera alertas para viviendas atrasadas
 */
export function iniciarCronJobs() {
  try {
    // Ejecutar cada 10 segundos (10000 ms)
    // Cambiar este valor para ejecutar más o menos frecuente
    const INTERVALO_VERIFICACION = 10 * 1000; // 10 segundos

    setInterval(async () => {
      try {
        console.log("📋 [VERIFICACIÓN] Verificando retrasos en viviendas...");
        
        const viviendas = await viviendasRepository.find({
          where: { estado: "en_progreso" },
          relations: ["hitos"],
        });

        const ahora = new Date();
        let retrasos = [];
        let notificacionesGeneradas = [];

        for (const vivienda of viviendas) {
          for (const hito of vivienda.hitos) {
            // Verificar si el hito está vencido y no ha completado
            if (
              hito.estado !== "completado" &&
              hito.fechaProgramada &&
              hito.fechaProgramada < ahora &&
              !hito.alertaGenerada
            ) {
              // Actualizar el estado del hito
              hito.estado = "atrasado";
              hito.alertaGenerada = true;
              await hitosRepository.save(hito);

              const retrasoHoras = Math.floor(
                (ahora - hito.fechaProgramada) / (1000 * 60 * 60)
              );

              retrasos.push({
                vivienda: vivienda.direccion,
                hito: hito.descripcion,
                retrasoHoras,
              });

              // Generar notificación para administradores
              const administradores = await userRepository.find({
                where: { rol: "administrador" },
                select: ["id"],
              });

              if (administradores.length > 0) {
                const notificaciones = administradores.map((admin) => ({
                  administradorId: admin.id,
                  tipo: "retraso",
                  mensaje: `⚠️ La vivienda en ${vivienda.direccion} está retrasada. ${hito.descripcion} vencido hace ${retrasoHoras} horas.`,
                  leida: false,
                }));

                await notificacionRepository.save(notificaciones);
                notificacionesGeneradas.push(...notificaciones);
              }

              console.log(
                `  ⚠️ Retraso detectado: ${vivienda.direccion} - ${hito.descripcion} (${retrasoHoras}h)`
              );
            }
          }
        }

        if (retrasos.length > 0) {
          console.log(
            `✅ [VERIFICACIÓN] Se detectaron ${retrasos.length} retrasos y se generaron ${notificacionesGeneradas.length} notificaciones`
          );
        } else {
          console.log("✅ [VERIFICACIÓN] No hay retrasos detectados");
        }
      } catch (error) {
        console.error("❌ [VERIFICACIÓN] Error al verificar retrasos:", error.message);
      }
    }, INTERVALO_VERIFICACION);

    console.log(`✅ Temporizador iniciado: verificará cada ${INTERVALO_VERIFICACION / 1000} segundos`);
  } catch (error) {
    console.error("❌ Error al iniciar temporizador:", error.message);
  }
}

export default iniciarCronJobs;
