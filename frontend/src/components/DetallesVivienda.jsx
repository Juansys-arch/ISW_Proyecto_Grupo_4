import { useEffect, useState } from "react";
import { construccionService } from "../services/construccion.service";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

const DetallesVivienda = ({ viviendasId, onViviendasEliminada }) => {
  const { user } = useAuth();
  const [vivienda, setVivienda] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (viviendasId) {
      cargarVivienda(viviendasId);
    }
  }, [viviendasId]);

  const cargarVivienda = async (id) => {
    try {
      setLoading(true);
      const data = await construccionService.obtenerVivienda(id);
      setVivienda(data);
    } catch (error) {
      console.error("Error al cargar vivienda:", error);
      Swal.fire("Error", "No se pudo cargar la vivienda", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleIniciarConstruccion = async () => {
    try {
      setLoading(true);
      await construccionService.iniciarConstruccion(viviendasId);
      Swal.fire("Éxito", "Construcción iniciada", "success");
      await cargarVivienda(viviendasId);
    } catch (error) {
      console.error("Error al iniciar construcción:", error);
      Swal.fire("Error", "No se pudo iniciar la construcción", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarVivienda = async () => {
    const result = await Swal.fire({
      title: "¿Eliminar vivienda?",
      text: `¿Está seguro de que desea eliminar la vivienda en ${vivienda.direccion}? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await construccionService.eliminarVivienda(viviendasId);
        Swal.fire("Éxito", "Vivienda eliminada", "success");
        if (onViviendasEliminada) {
          onViviendasEliminada();
        }
      } catch (error) {
        console.error("Error al eliminar vivienda:", error);
        Swal.fire("Error", "No se pudo eliminar la vivienda", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const formatFecha = (valor) => {
    if (!valor) return "—";
    const fecha = new Date(valor);
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div
      style={{
        minHeight: "180px",
        padding: "0",
      }}
    >
      <div style={{ paddingTop: 0 }}>
        {loading ? (
          <div className="alert alert-info" style={{ margin: 0 }}>
            Cargando...
          </div>
        ) : vivienda ? (
          <>
            <div className="mb-3">
              <p style={{ fontSize: "16px", marginBottom: "6px" }}>
                <strong>Dirección:</strong> {vivienda.direccion}
              </p>
              <p style={{ fontSize: "16px", marginBottom: "10px" }}>
                <strong>Inicio:</strong> {formatFecha(vivienda.fechaInicio || vivienda.createdAt)}
              </p>
              <p style={{ fontSize: "16px", marginBottom: "20px" }}>
                <strong>Hitos:</strong> {vivienda.hitos?.length || 0}
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              {vivienda.estado === "no_iniciada" && (
                <button
                  className="btn btn-success"
                  onClick={handleIniciarConstruccion}
                  disabled={loading}
                >
                  ✓ Iniciar Construcción
                </button>
              )}

              {user?.rol === "super_admin" && (
                <button
                  className="btn btn-danger"
                  onClick={handleEliminarVivienda}
                  disabled={loading}
                >
                  🗑️ Eliminar
                </button>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default DetallesVivienda;
