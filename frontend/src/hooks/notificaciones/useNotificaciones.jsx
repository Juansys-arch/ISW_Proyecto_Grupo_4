import { useState, useEffect } from "react";
import { obtenerNotificaciones, marcarNotificacionLeida } from "@services/notificacion.service";

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarNotificaciones();
    // Recargar cada 30 segundos
    const intervalo = setInterval(cargarNotificaciones, 30000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const usuario = JSON.parse(sessionStorage.getItem("usuario"));
      if (usuario?.id) {
        const data = await obtenerNotificaciones();
        setNotificaciones(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
      setError("No se pudieron cargar las notificaciones");
    } finally {
      setLoading(false);
    }
  };

  const marcarLeida = async (id) => {
    try {
      await marcarNotificacionLeida(id);
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Error al marcar como leída:", err);
      setError("No se pudo marcar la notificación");
    }
  };

  return {
    notificaciones,
    loading,
    error,
    marcarLeida,
    cargarNotificaciones,
    unreadCount: notificaciones.filter(n => !n.leida).length
  };
}
