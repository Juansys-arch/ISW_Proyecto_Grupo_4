import { useState, useCallback } from "react";
import construccionService from "../../services/construccion.service";
import { showAlert } from "../../helpers/sweetAlert";

export const useHitos = () => {
  const [hitos, setHitos] = useState([]);
  const [loading, setLoading] = useState(false);

  const actualizarAvance = useCallback(async (viviendasId, hitoId, progreso) => {
    try {
      setLoading(true);
      const hitoActualizado = await construccionService.actualizarAvanceHito(
        viviendasId,
        hitoId,
        progreso
      );
      setHitos(hitos.map((h) => (h.id === hitoId ? hitoActualizado : h)));
      showAlert("success", "Éxito", "Avance actualizado");
      return hitoActualizado;
    } catch (err) {
      showAlert("error", "Error", err.mensaje || "Error al actualizar avance");
    } finally {
      setLoading(false);
    }
  }, [hitos]);

  return {
    hitos,
    setHitos,
    loading,
    actualizarAvance,
  };
};
