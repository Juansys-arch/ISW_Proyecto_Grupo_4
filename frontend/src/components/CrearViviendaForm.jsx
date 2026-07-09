import { useState, useMemo } from "react";
import { construccionService } from "@services/construccion.service.js";
import { showSuccessAlert, showErrorAlert } from "@helpers/sweetAlert.js";
import { getAllRegionNames, getCommunesByRegion } from "@helpers/chileanRegionsData.js";

export default function CrearViviendaForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    direccion: "",
    beneficiario: "",
    region: "",
    comuna: "",
    hitos: "2",
  });
  const [loading, setLoading] = useState(false);

  const allRegions = getAllRegionNames();
  const communesForSelectedRegion = useMemo(
    () => getCommunesByRegion(formData.region),
    [formData.region]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };
      // Si se cambia la región, limpiar la comuna
      if (name === "region") {
        updated.comuna = "";
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Enviamos los datos al backend
      await construccionService.crearVivienda({
        direccion: formData.direccion,
        beneficiario: formData.beneficiario,
        region: formData.region,
        comuna: formData.comuna,
        hitos: parseInt(formData.hitos),
      });
      showSuccessAlert("Éxito", "Vivienda creada correctamente");
      setFormData({
        direccion: "",
        beneficiario: "",
        region: "",
        comuna: "",
        hitos: "2",
      });
      onSuccess();
    } catch (error) {
      showErrorAlert("Error", error.message || "No se pudo crear la vivienda");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h3 style={{ color: "#333", marginBottom: "20px", fontSize: "18px", fontWeight: "600" }}>
        Nueva Vivienda
      </h3>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px", marginBottom: "20px" }}>
          {/* Dirección */}
          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "#333", fontWeight: "500", fontSize: "14px" }}>
              Dirección <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              required
              placeholder="Ej: Calle Principal 123"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                fontSize: "14px",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "#333", fontWeight: "500", fontSize: "14px" }}>
              Nombre del dueño <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="beneficiario"
              value={formData.beneficiario}
              onChange={handleChange}
              required
              placeholder="Ej: Juan Pérez"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                fontSize: "14px",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#333", fontWeight: "500", fontSize: "14px" }}>
                Región <span style={{ color: "red" }}>*</span>
              </label>
              <select
                name="region"
                value={formData.region}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  backgroundColor: "white",
                  cursor: "pointer",
                }}
              >
                <option value="">Selecciona una región</option>
                {allRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#333", fontWeight: "500", fontSize: "14px" }}>
                Comuna <span style={{ color: "red" }}>*</span>
              </label>
              <select
                name="comuna"
                value={formData.comuna}
                onChange={handleChange}
                required
                disabled={!formData.region}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  backgroundColor: "white",
                  cursor: formData.region ? "pointer" : "not-allowed",
                  opacity: formData.region ? 1 : 0.6,
                }}
              >
                <option value="">
                  {formData.region ? "Selecciona una comuna" : "Selecciona primero una región"}
                </option>
                {communesForSelectedRegion.map((commune) => (
                  <option key={commune} value={commune}>
                    {commune}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hitos */}
          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "#333", fontWeight: "500", fontSize: "14px" }}>
              Hitos <span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="hitos"
              value={formData.hitos}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                fontSize: "14px",
                boxSizing: "border-box",
                fontFamily: "inherit",
                backgroundColor: "white",
                cursor: "pointer",
              }}
            >
              <option value="2">2 Hitos</option>
              <option value="5">5 Hitos</option>
            </select>
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              backgroundColor: "#f5f5f5",
              color: "#333",
              border: "1px solid #ddd",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#e8e8e8";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#f5f5f5";
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "#764ba2",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "600",
              opacity: loading ? 0.6 : 1,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.backgroundColor = "#5a3a7a";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.backgroundColor = "#764ba2";
            }}
          >
            {loading ? "Creando..." : "Crear Vivienda"}
          </button>
        </div>
      </form>
    </div>
  );
}
