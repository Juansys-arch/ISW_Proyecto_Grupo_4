import axios from "axios";
import cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Create axios instance with interceptor for authorization
const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = cookies.get('jwt-auth', { path: '/' });
    if(token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Disable Axios cache
    config.headers['Cache-Control'] = 'no-cache';
    return config;
  },
  (error) => Promise.reject(error)
);

export const construccionService = {
  // Viviendas
  obtenerViviendas: async (estado = null) => {
    try {
      const params = estado ? `?estado=${estado}` : "";
      const response = await instance.get(`/construccion/viviendas${params}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  obtenerVivienda: async (viviendasId) => {
    try {
      const response = await instance.get(`/construccion/viviendas/${viviendasId}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  crearVivienda: async (vivienda) => {
    try {
      const response = await instance.post(`/construccion/viviendas`, vivienda);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  eliminarVivienda: async (viviendasId) => {
    try {
      const response = await instance.delete(`/construccion/viviendas/${viviendasId}`);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar vivienda:", error);
      throw error.response?.data || error;
    }
  },

  // Acciones de construcción
  iniciarConstruccion: async (viviendasId) => {
    try {
      const response = await instance.patch(
        `/construccion/viviendas/${viviendasId}/iniciar`,
        {}
      );
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  completarConstruccion: async (viviendasId) => {
    try {
      const response = await instance.patch(
        `/construccion/viviendas/${viviendasId}/completar`,
        {}
      );
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  pausarConstruccion: async (viviendasId) => {
    try {
      const response = await instance.patch(
        `/construccion/viviendas/${viviendasId}/pausar`,
        {}
      );
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Hitos
  actualizarAvanceHito: async (viviendasId, hitoId, progreso) => {
    try {
      const response = await instance.patch(
        `/construccion/viviendas/${viviendasId}/hitos/${hitoId}/avance`,
        { progreso }
      );
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Verificación
  verificarRetrasos: async () => {
    try {
      const response = await instance.post(`/construccion/verificar-retrasos`, {});
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default construccionService;
