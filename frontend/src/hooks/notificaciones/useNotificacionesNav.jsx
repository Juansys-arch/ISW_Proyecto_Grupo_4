import { useState, useEffect } from 'react';
import { obtenerNotificaciones } from '@services/notificacion.service.js';

export function useNotificacionesNav() {
    const [notificaciones, setNotificaciones] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotificaciones = async () => {
        try {
            setLoading(true);
            const response = await obtenerNotificaciones();
            if (response.data && Array.isArray(response.data)) {
                setNotificaciones(response.data);
                const count = response.data.filter(n => !n.leida).length;
                setUnreadCount(count);
            }
        } catch (err) {
            console.error('Error al cargar notificaciones:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotificaciones();
        
        // Actualizar cada 30 segundos
        const interval = setInterval(fetchNotificaciones, 30000);
        
        return () => clearInterval(interval);
    }, []);

    return {
        notificaciones,
        unreadCount,
        loading,
        refrescar: fetchNotificaciones
    };
}
