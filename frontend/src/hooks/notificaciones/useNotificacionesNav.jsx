import { useState, useEffect, useCallback } from "react";
import { obtenerNotificaciones, marcarNotificacionLeida } from "@services/notificacion.service";

export function useNotificacionesNav() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargarNotificaciones = useCallback(async () => {
    try {
      setLoading(true);
      const usuario = JSON.parse(sessionStorage.getItem("usuario") || "null");
      if (!usuario?.id) {
        setNotificaciones([]);
        return;
      }

      const data = await obtenerNotificaciones();
      const lista = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setNotificaciones(lista);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
      setNotificaciones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarNotificaciones();
    const intervalo = setInterval(cargarNotificaciones, 10000);
    return () => clearInterval(intervalo);
  }, [cargarNotificaciones]);

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
