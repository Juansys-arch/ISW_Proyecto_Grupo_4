import { useState } from "react";
import { construccionService } from "@services/construccion.service.js";
import { showSuccessAlert, showErrorAlert } from "@helpers/sweetAlert.js";

export default function CrearViviendaForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    direccion: "",
    hitos: "2",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Enviamos los datos al backend
      await construccionService.crearVivienda({
        direccion: formData.direccion,
        hitos: parseInt(formData.hitos),
      });
      showSuccessAlert("Éxito", "Vivienda creada correctamente");
      setFormData({
        direccion: "",
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
