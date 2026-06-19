import axios from './root.service.js';

export async function getCuadrillas() {
    try {
        const { data } = await axios.get('/cuadrillas');
        return data.data;
    } catch (error) {
        return error.response?.data || { message: "Error al obtener cuadrillas" };
    }
}

export async function getVoluntariosDisponibles() {
    try {
        const { data } = await axios.get('/cuadrillas/voluntarios-disponibles');
        return data.data;
    } catch (error) {
        return error.response?.data || { message: "Error al obtener voluntarios disponibles" };
    }
}

export async function crearCuadrilla(payload) {
    try {
        const { data } = await axios.post('/cuadrillas', payload);
        return data;
    } catch (error) {
        return error.response?.data || { message: "Error al crear cuadrilla" };
    }
}

export async function actualizarCuadrilla(id, payload) {
    try {
        const { data } = await axios.put(`/cuadrillas/${id}`, payload);
        return data;
    } catch (error) {
        return error.response?.data || { message: "Error al actualizar cuadrilla" };
    }
}

export async function eliminarCuadrilla(id) {
    try {
        const { data } = await axios.delete(`/cuadrillas/${id}`);
        return data;
    } catch (error) {
        return error.response?.data || { message: "Error al eliminar cuadrilla" };
    }
}

export async function crearVoluntario(payload) {
    try {
        const { data } = await axios.post('/cuadrillas/voluntarios', payload);
        return data;
    } catch (error) {
        return error.response?.data || { message: "Error al crear voluntario" };
    }
}

export async function actualizarVoluntario(id, payload) {
    try {
        const { data } = await axios.put(`/cuadrillas/voluntarios/${id}`, payload);
        return data;
    } catch (error) {
        return error.response?.data || { message: "Error al actualizar voluntario" };
    }
}

