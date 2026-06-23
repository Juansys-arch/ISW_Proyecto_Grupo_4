import { useState, useEffect } from "react";
import { obtenerNotificaciones, marcarNotificacionLeida } from "@services/notificacion.service";

export function useNotificacionesNav() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarNotificaciones();
    // Recargar cada 30 segundos
    const intervalo = setInterval(cargarNotificaciones, 30000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const usuario = JSON.parse(sessionStorage.getItem("usuario"));
      if (usuario?.id) {
        const data = await obtenerNotificaciones();
        setNotificaciones(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeida = async (id) => {
    try {
      await marcarNotificacionLeida(id);
      await cargarNotificaciones();
    } catch (error) {
      console.error("Error al marcar como leída:", error);
    }
  };

  return {
    notificaciones,
    loading,
    cargarNotificaciones,
    marcarComoLeida,
    unreadCount: notificaciones.filter(n => !n.leida).length,
    refrescar: cargarNotificaciones
  };
}
