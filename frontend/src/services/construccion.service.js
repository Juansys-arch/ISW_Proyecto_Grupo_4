import instance from "./root.service.js";

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
  iniciarConstruccion: async (viviendasId, fechaInicio = null) => {
    try {
      const body = fechaInicio ? { fechaInicio } : {};
      const response = await instance.patch(
        `/construccion/viviendas/${viviendasId}/iniciar`,
        body
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

  reanudarConstruccion: async (viviendasId) => {
    try {
      const response = await instance.patch(
        `/construccion/viviendas/${viviendasId}/reanudar`,
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
