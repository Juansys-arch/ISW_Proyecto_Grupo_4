import axios from './root.service.js';

export async function obtenerNotificaciones() {
    try {
        const response = await axios.get('/notificaciones/');
        return response.data?.data ?? response.data ?? [];
    } catch (error) {
        return error.response?.data?.data ?? error.response?.data ?? [];
    }
}

export async function marcarNotificacionLeida(id) {
    try {
        const response = await axios.patch(`/notificaciones/${id}/leer`);
        return response.data?.data ?? response.data ?? { message: 'Notificación marcada' };
    } catch (error) {
        return error.response?.data?.data ?? error.response?.data ?? { message: 'Error al marcar notificación' };
    }
}
