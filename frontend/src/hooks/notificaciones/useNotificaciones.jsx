import { useState, useEffect } from 'react';
import { obtenerNotificaciones, marcarNotificacionLeida } from '@services/notificacion.service.js';

export function useNotificaciones() {
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotificaciones = async () => {
        try {
            setLoading(true);
            const response = await obtenerNotificaciones();
            if (response.data) {
                setNotificaciones(response.data);
            }
            setError(null);
        } catch (err) {
            setError('Error al cargar las notificaciones');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const marcarLeida = async (id) => {
        try {
            await marcarNotificacionLeida(id);
            // Actualizar el estado local
            setNotificaciones(prev =>
                prev.map(notif =>
                    notif.id === id ? { ...notif, leida: true } : notif
                )
            );
        } catch (err) {
            console.error('Error al marcar notificación:', err);
        }
    };

    useEffect(() => {
        fetchNotificaciones();
    }, []);

    return {
        notificaciones,
        loading,
        error,
        marcarLeida,
        refrescar: fetchNotificaciones
    };
}
