import { useEffect, useState } from "react";
import { construccionService } from "@services/construccion.service.js";
import { showSuccessAlert, showErrorAlert, deleteDataAlert } from "@helpers/sweetAlert.js";
import "@styles/construccion.css";

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

  const handlePausar = async (id) => {
    try {
      await construccionService.pausarConstruccion(id);
      showSuccessAlert("Éxito", "Construcción pausada");
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      showErrorAlert("Error", "No se pudo pausar la construcción");
    }
  };

  const handleTerminar = async (id) => {
    try {
      await construccionService.completarConstruccion(id);
      showSuccessAlert("Éxito", "Construcción completada");
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      showErrorAlert("Error", "No se pudo completar la construcción");
    }
  };

  const handleReanudar = async (id) => {
    try {
      await construccionService.reanudarConstruccion(id);
      showSuccessAlert("Éxito", "Construcción reanudada");
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      showErrorAlert("Error", "No se pudo reanudar la construcción");
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "no_iniciada":
        return "#ffc107";
      case "en_progreso":
        return "#17a2b8";
      case "atrasada":
        return "#dc3545";
      case "pausada":
        return "#ff9800";
      case "completada":
        return "#28a745";
      default:
        return "#6c757d";
    }
  };

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case "no_iniciada":
        return "No iniciada";
      case "en_progreso":
        return "En progreso";
      case "atrasada":
        return "Atrasada";
      case "pausada":
        return "Pausada";
      case "completada":
        return "Completada";
      default:
        return "Sin estado";
    }
  };

  const getEstadoClass = (estado) => {
    switch (estado) {
      case "no_iniciada":
        return "badge-no-iniciada";
      case "en_progreso":
        return "badge-en-progreso";
      case "atrasada":
        return "badge-atrasada";
      case "pausada":
        return "badge-pausada";
      case "completada":
        return "badge-completada";
      default:
        return "badge-default";
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
          <option value="atrasada">Atrasada</option>
          <option value="pausada">Pausada</option>
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
        <div className="viviendas-grid">
          {viviendas.map((vivienda) => (
            <div
              key={vivienda.id}
              className={`vivienda-card ${vivienda.estado}`}
              style={{ borderColor: getEstadoColor(vivienda.estado) }}
            >
              <div className="vivienda-card-header">
                <div>
                  <p className="vivienda-card-title">{vivienda.direccion}</p>
                  <p className="vivienda-card-subtitle">
                    {vivienda.hitos?.length || 0} hitos
                  </p>
                  <p className="vivienda-card-subtitle">
                    Dueño: {vivienda.beneficiario || "—"} · {vivienda.region || "—"}, {vivienda.comuna || "—"}
                  </p>
                </div>
                <span className={`vivienda-state-badge ${getEstadoClass(vivienda.estado)}`}>
                  {getEstadoLabel(vivienda.estado)}
                </span>
              </div>

              <div className="vivienda-dates">
                <div className="vivienda-date-item">
                  <span>Inicio</span>
                  <strong>{formatFecha(vivienda.fechaInicio)}</strong>
                </div>
                <div className="vivienda-date-item">
                  <span>Término</span>
                  <strong>{formatFecha(vivienda.fechaCompletacion)}</strong>
                </div>
              </div>

              <div className="vivienda-card-actions">
                {vivienda.estado === "no_iniciada" && role === "jefe_cuadrilla" && (
                  <button className="vivienda-action-btn btn-start" onClick={() => handleIniciar(vivienda.id)}>
                    ✓ Iniciar
                  </button>
                )}
                {vivienda.estado === "en_progreso" && role === "jefe_cuadrilla" && (
                  <>
                    <button className="vivienda-action-btn btn-pause" onClick={() => handlePausar(vivienda.id)}>
                      ⏸️ Pausar
                    </button>
                    <button className="vivienda-action-btn btn-finish" onClick={() => handleTerminar(vivienda.id)}>
                      ✓ Terminado
                    </button>
                  </>
                )}
                {vivienda.estado === "pausada" && role === "jefe_cuadrilla" && (
                  <>
                    <button className="vivienda-action-btn btn-resume" onClick={() => handleReanudar(vivienda.id)}>
                      ▶️ Reanudar
                    </button>
                    <button className="vivienda-action-btn btn-finish" onClick={() => handleTerminar(vivienda.id)}>
                      ✓ Terminado
                    </button>
                  </>
                )}
                {vivienda.estado === "atrasada" && role === "jefe_cuadrilla" && (
                  <>
                    <button className="vivienda-action-btn btn-resume" onClick={() => handleReanudar(vivienda.id)}>
                      ▶️ Reanudar
                    </button>
                    <button className="vivienda-action-btn btn-finish" onClick={() => handleTerminar(vivienda.id)}>
                      ✓ Terminado
                    </button>
                  </>
                )}
                {role === "administrador" && (
                  <button className="vivienda-action-btn btn-delete" onClick={() => handleEliminar(vivienda.id)}>
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
