import { useState, useCallback } from "react";
import construccionService from "../../services/construccion.service";
import { showAlert } from "../../helpers/sweetAlert";

export const useViviendas = () => {
  const [viviendas, setViviendas] = useState([]);
  const [viviendaActual, setViviendaActual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarViviendas = useCallback(async (estado = null) => {
    try {
      setLoading(true);
      setError(null);
      const data = await construccionService.obtenerViviendas(estado);
      setViviendas(data);
    } catch (err) {
      setError(err.mensaje || "Error al cargar viviendas");
      showAlert("error", "Error", err.mensaje || "No se pudieron cargar las viviendas");
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarVivienda = useCallback(async (viviendasId) => {
    try {
      setLoading(true);
      const data = await construccionService.obtenerVivienda(viviendasId);
      setViviendaActual(data);
    } catch (err) {
      setError(err.mensaje || "Error al cargar vivienda");
      showAlert("error", "Error", err.mensaje || "No se pudo cargar la vivienda");
    } finally {
      setLoading(false);
    }
  }, []);

  const crearVivienda = useCallback(async (viviendaData) => {
    try {
      setLoading(true);
      const nuevaVivienda = await construccionService.crearVivienda(viviendaData);
      console.log("Vivienda creada:", nuevaVivienda);
      // Recargar la lista completa para asegurar que aparece la nueva vivienda
      const viviendaActualizada = await construccionService.obtenerViviendas();
      setViviendas(viviendaActualizada);
      showAlert("success", "Éxito", "Vivienda creada exitosamente");
      return nuevaVivienda;
    } catch (err) {
      setError(err.mensaje || "Error al crear vivienda");
      showAlert("error", "Error", err.mensaje || "No se pudo crear la vivienda");
    } finally {
      setLoading(false);
    }
  }, []);

  const iniciar = useCallback(async (viviendasId) => {
    try {
      setLoading(true);
      const vivienda = await construccionService.iniciarConstruccion(viviendasId);
      // Reload the viviendas list to get updated data
      const viviendaActualizada = await construccionService.obtenerViviendas();
      setViviendas(viviendaActualizada);
      showAlert("success", "Éxito", "Construcción iniciada");
    } catch (err) {
      showAlert("error", "Error", err.mensaje || "Error al iniciar construcción");
    } finally {
      setLoading(false);
    }
  }, []);

  const completar = useCallback(async (viviendasId) => {
    try {
      setLoading(true);
      const vivienda = await construccionService.completarConstruccion(viviendasId);
      // Reload the viviendas list to get updated data
      const viviendaActualizada = await construccionService.obtenerViviendas();
      setViviendas(viviendaActualizada);
      showAlert("success", "Éxito", "Construcción completada");
    } catch (err) {
      showAlert("error", "Error", err.mensaje || "Error al completar construcción");
    } finally {
      setLoading(false);
    }
  }, []);

  const pausar = useCallback(async (viviendasId) => {
    try {
      setLoading(true);
      const vivienda = await construccionService.pausarConstruccion(viviendasId);
      // Reload the viviendas list to get updated data
      const viviendaActualizada = await construccionService.obtenerViviendas();
      setViviendas(viviendaActualizada);
      showAlert("success", "Éxito", "Construcción pausada");
    } catch (err) {
      showAlert("error", "Error", err.mensaje || "Error al pausar construcción");
    } finally {
      setLoading(false);
    }
  }, []);

  const eliminar = useCallback(async (viviendasId) => {
    try {
      setLoading(true);
      const result = await construccionService.eliminarVivienda(viviendasId);
      console.log("Eliminación exitosa:", result);
      // Recargar la lista completa de viviendas después de eliminar
      const viviendaActualizada = await construccionService.obtenerViviendas();
      setViviendas(viviendaActualizada);
      setViviendaActual(null);
      showAlert("success", "Éxito", "Vivienda eliminada exitosamente");
      return true;
    } catch (err) {
      console.error("Error en eliminar:", err);
      const mensaje = err?.error || err?.mensaje || "Error al eliminar vivienda";
      showAlert("error", "Error", mensaje);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const verificarRetrasos = useCallback(async () => {
    try {
      setLoading(true);
      await construccionService.verificarRetrasos();
      showAlert("success", "Éxito", "Verificación de retrasos completada");
      // Recargar viviendas para actualizar estados
      await cargarViviendas();
    } catch (err) {
      showAlert("error", "Error", err.mensaje || "Error al verificar retrasos");
    } finally {
      setLoading(false);
    }
  }, [cargarViviendas]);

  return {
    viviendas,
    viviendaActual,
    loading,
    error,
    cargarViviendas,
    cargarVivienda,
    crearVivienda,
    iniciar,
    completar,
    pausar,
    eliminar,
    verificarRetrasos,
  };
};
