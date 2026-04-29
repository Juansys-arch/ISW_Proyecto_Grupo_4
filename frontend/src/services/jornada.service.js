import axios from './root.service';

export const postAsistencia = async (data) => {
    try {
        const response = await axios.post('/gestion/asistencia', data);
        return response.data;
    } catch (error) {
        return error?.response?.data || { status: 'Error', message: error.message };
    }
};

export const getAsistencias = async (params = {}) => {
    try {
        const response = await axios.get('/gestion/asistencia', { params });
        return response.data;
    } catch (error) {
        return { status: 'Error', message: error?.response?.data?.message || error.message };
    }
};

export const postHerramientas = async (data) => {
    try {
        const response = await axios.post('/gestion/activos/control', data);
        return response.data;
    } catch (error) {
        return error?.response?.data || { status: 'Error', message: error.message };
    }
};

export const getHerramientas = async (params = {}) => {
    try {
        const response = await axios.get('/gestion/activos', { params });
        return response.data;
    } catch (error) {
        return { status: 'Error', message: error?.response?.data?.message || error.message };
    }
};

export const postBitacora = async (data) => {
    try {
        const response = await axios.post('/gestion/bitacora', data);
        return response.data;
    } catch (error) {
        return error?.response?.data || { status: 'Error', message: error.message };
    }
};

export const getBitacora = async (params = {}) => {
    try {
        const response = await axios.get('/gestion/bitacora', { params });
        return response.data;
    } catch (error) {
        return { status: 'Error', message: error?.response?.data?.message || error.message };
    }
};

export const crearKit = async (data) => {
    try {
        const response = await axios.post('/kits', data);
        return response.data;
    } catch (error) {
        return error?.response?.data || { status: 'Error', message: error.message };
    }
};

export const obtenerKits = async (params = {}) => {
    try {
        const response = await axios.get('/kits', { params });
        return response.data;
    } catch (error) {
        return { status: 'Error', message: error?.response?.data?.message || error.message };
    }
};

export const obtenerKitPorId = async (id) => {
    try {
        const response = await axios.get(`/kits/${id}`);
        return response.data;
    } catch (error) {
        return { status: 'Error', message: error?.response?.data?.message || error.message };
    }
};

export const actualizarKit = async (id, data) => {
    try {
        const response = await axios.put(`/kits/${id}`, data);
        return response.data;
    } catch (error) {
        return error?.response?.data || { status: 'Error', message: error.message };
    }
};

export const eliminarKit = async (id) => {
    try {
        const response = await axios.delete(`/kits/${id}`);
        return response.data;
    } catch (error) {
        return error?.response?.data || { status: 'Error', message: error.message };
    }
};

export const crearTransporte = async (data) => {
    try {
        const response = await axios.post('/transporte', data);
        return response.data;
    } catch (error) {
        return error?.response?.data || { status: 'Error', message: error.message };
    }
};

export const obtenerTransportes = async (params = {}) => {
    try {
        const response = await axios.get('/transporte', { params });
        return response.data;
    } catch (error) {
        return { status: 'Error', message: error?.response?.data?.message || error.message };
    }
};

export const obtenerTransportePorId = async (id) => {
    try {
        const response = await axios.get(`/transporte/${id}`);
        return response.data;
    } catch (error) {
        return { status: 'Error', message: error?.response?.data?.message || error.message };
    }
};

export const actualizarTransporte = async (id, data) => {
    try {
        const response = await axios.put(`/transporte/${id}`, data);
        return response.data;
    } catch (error) {
        return error?.response?.data || { status: 'Error', message: error.message };
    }
};

export const registrarAbordaje = async (id) => {
    try {
        const response = await axios.post(`/transporte/${id}/abordaje`);
        return response.data;
    } catch (error) {
        return error?.response?.data || { status: 'Error', message: error.message };
    }
};

export const eliminarTransporte = async (id) => {
    try {
        const response = await axios.delete(`/transporte/${id}`);
        return response.data;
    } catch (error) {
        return error?.response?.data || { status: 'Error', message: error.message };
    }
};