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

  if (loading) return <div className="alert alert-info">Cargando...</div>;

  if (!vivienda) {
    return <div className="alert alert-warning">Seleccione una vivienda</div>;
  }

  return (
    <div className="card">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h4 style={{ margin: 0 }}>Detalles de Vivienda</h4>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <p style={{ fontSize: "16px", marginBottom: "10px" }}>
            <strong>Dirección:</strong> {vivienda.direccion}
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
      </div>
    </div>
  );
};

export default DetallesVivienda;
