import { useEffect, useState } from "react";
import { construccionService } from "@services/construccion.service.js";
import { showSuccessAlert, showErrorAlert, deleteDataAlert } from "@helpers/sweetAlert.js";

export default function ViviendasList({ userRole }) {
  const [viviendas, setViviendas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const role = userRole || JSON.parse(sessionStorage.getItem('usuario'))?.rol;

  const cargarViviendas = async (estado = null) => {
    setLoading(true);
    try {
      const data = await construccionService.obtenerViviendas(estado);
      setViviendas(Array.isArray(data) ? data : []);
    } catch (error) {
      showErrorAlert("Error", "No se pudieron cargar las viviendas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarViviendas(filtroEstado);
  }, [filtroEstado, refreshKey]);

  const handleEliminar = async (id) => {
    const result = await deleteDataAlert();
    if (result.isConfirmed) {
      try {
        await construccionService.eliminarVivienda(id);
        showSuccessAlert("Éxito", "Vivienda eliminada");
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        showErrorAlert("Error", "No se pudo eliminar la vivienda");
      }
    }
  };

  const handleIniciar = async (id) => {
    try {
      await construccionService.iniciarConstruccion(id);
      showSuccessAlert("Éxito", "Construcción iniciada");
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      showErrorAlert("Error", "No se pudo iniciar la construcción");
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "no_iniciada":
        return "#ffc107";
      case "en_progreso":
        return "#17a2b8";
      case "completada":
        return "#28a745";
      default:
        return "#6c757d";
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center", padding: "20px" }}>
        <label style={{ fontWeight: "600", color: "#333" }}>Filtrar por estado:</label>
        <select
          value={filtroEstado || ""}
          onChange={(e) => setFiltroEstado(e.target.value || null)}
          style={{
            padding: "10px 12px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            cursor: "pointer",
            backgroundColor: "white",
            fontSize: "14px",
            fontFamily: "inherit"
          }}
        >
          <option value="">Todos los estados</option>
          <option value="no_iniciada">No iniciada</option>
          <option value="en_progreso">En progreso</option>
          <option value="completada">Completada</option>
        </select>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: "40px", color: "#999" }}>Cargando viviendas...</p>
      ) : viviendas.length === 0 ? (
        <p style={{ color: "#999", textAlign: "center", padding: "40px" }}>
          No hay viviendas registradas
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
            padding: "20px",
          }}
        >
          {viviendas.map((vivienda) => (
            <div
              key={vivienda.id}
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "16px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                border: `3px solid ${getEstadoColor(vivienda.estado)}`,
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                <p style={{ color: "#333", margin: "0 0 12px 0", fontSize: "14px" }}>
                  <strong>Dirección:</strong> {vivienda.direccion}
                </p>
                <p style={{ color: "#333", margin: "0 0 12px 0", fontSize: "14px" }}>
                  <strong>Hitos:</strong> {vivienda.hitos?.length || 0}
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {vivienda.estado === "no_iniciada" && role === "jefe_cuadrilla" && (
                  <button
                    onClick={() => handleIniciar(vivienda.id)}
                    style={{
                      flex: 1,
                      minWidth: "70px",
                      padding: "8px 12px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    ✓ Iniciar
                  </button>
                )}
                {role === "administrador" && (
                  <button
                    onClick={() => handleEliminar(vivienda.id)}
                    style={{
                      flex: 1,
                      minWidth: "70px",
                      padding: "8px 12px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
