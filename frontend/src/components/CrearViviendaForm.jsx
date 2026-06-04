import { useState } from "react";
import { useViviendas } from "../hooks/construccion/useViviendas";

export const CrearViviendaForm = ({ onSuccess, onCancel }) => {
  const { crearVivienda } = useViviendas();
  const [formData, setFormData] = useState({
    direccion: "",
    numeroPropiedad: "",
    diasHito: "2",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare data for submission
    const dataToSend = {
      direccion: formData.direccion,
      numeroPropiedad: formData.numeroPropiedad,
      diasHito: parseInt(formData.diasHito),
    };
    
    const vivienda = await crearVivienda(dataToSend);
    
    if (vivienda) {
      setFormData({
        direccion: "",
        numeroPropiedad: "",
        diasHito: "2",
      });
      onSuccess && onSuccess(vivienda);
    }
  };

  const handleCancel = () => {
    setFormData({
      direccion: "",
      numeroPropiedad: "",
      diasHito: "2",
    });
    onCancel && onCancel();
  };

  return (
    <div className="card shadow-lg border-0">
      <div className="card-header bg-gradient" style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "1.5rem",
        borderRadius: "0.5rem 0.5rem 0 0"
      }}>
        <h5 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "600" }}>
          ➕ Crear Nueva Vivienda
        </h5>
      </div>
      <div className="card-body" style={{ padding: "2rem" }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="direccion" className="form-label" style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
              📍 Dirección
            </label>
            <input
              type="text"
              className="form-control form-control-lg"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Ej: Calle Principal 123"
              required
              style={{ borderRadius: "0.5rem", borderColor: "#e0e0e0" }}
            />
            <small className="text-muted">Ingrese la dirección completa de la propiedad</small>
          </div>

          <div className="mb-4">
            <label htmlFor="numeroPropiedad" className="form-label" style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
              🏠 Número de Propiedad
            </label>
            <input
              type="text"
              className="form-control form-control-lg"
              id="numeroPropiedad"
              name="numeroPropiedad"
              value={formData.numeroPropiedad}
              onChange={handleChange}
              placeholder="Ej: PROP-001"
              required
              style={{ borderRadius: "0.5rem", borderColor: "#e0e0e0" }}
            />
            <small className="text-muted">Identificador único de la propiedad</small>
          </div>

          <div className="mb-4">
            <label className="form-label" style={{ fontWeight: "600", marginBottom: "1rem", display: "block" }}>
              🎯 Hito de Control (Seleccione solo uno)
            </label>
            <div style={{
              backgroundColor: "#f8f9fa",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #dee2e6"
            }}>
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="radio"
                  id="hito_dos_dias"
                  name="diasHito"
                  value="2"
                  checked={formData.diasHito === "2"}
                  onChange={handleChange}
                  style={{ cursor: "pointer", width: "1.2rem", height: "1.2rem" }}
                />
                <label className="form-check-label" htmlFor="hito_dos_dias" style={{ cursor: "pointer", marginLeft: "0.5rem" }}>
                  <strong>Hito de 2 días</strong> - Control temprano del progreso
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id="hito_cinco_dias"
                  name="diasHito"
                  value="5"
                  checked={formData.diasHito === "5"}
                  onChange={handleChange}
                  style={{ cursor: "pointer", width: "1.2rem", height: "1.2rem" }}
                />
                <label className="form-check-label" htmlFor="hito_cinco_dias" style={{ cursor: "pointer", marginLeft: "0.5rem" }}>
                  <strong>Hito de 5 días</strong> - Control final del progreso
                </label>
              </div>
            </div>
            <small className="text-muted d-block mt-2">Seleccione uno de los hitos disponibles para alertar si se excede el tiempo límite</small>
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "2rem" }}>
            <button 
              type="button" 
              className="btn btn-lg"
              onClick={handleCancel}
              style={{
                backgroundColor: "#e9ecef",
                color: "#495057",
                fontWeight: "600",
                borderRadius: "0.5rem",
                paddingLeft: "2rem",
                paddingRight: "2rem"
              }}
            >
              ✕ Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-lg"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                fontWeight: "600",
                borderRadius: "0.5rem",
                paddingLeft: "2rem",
                paddingRight: "2rem",
                border: "none"
              }}
            >
              ✓ Crear Vivienda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearViviendaForm;
