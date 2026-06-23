import axios from './root.service.js';

export async function obtenerNotificaciones() {
    try {
        const response = await axios.get('/notificacion/');
        return response.data;
    } catch (error) {
        return error.response?.data || { message: 'Error al obtener notificaciones' };
    }
}

export async function marcarNotificacionLeida(id) {
    try {
        const response = await axios.patch(`/notificacion/${id}/leer`);
        return response.data;
    } catch (error) {
        return error.response?.data || { message: 'Error al marcar notificación' };
    }
}
