import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ViviendasList from "../components/ViviendasList";
import CrearViviendaForm from "../components/CrearViviendaForm";
import "../styles/construccion.css";

export default function Construccion() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  // Verificar que solo jefe_cuadrilla y administrador puedan ver esta página
  if (user?.rol !== "jefe_cuadrilla" && user?.rol !== "administrador") {
    return (
      <div style={{ backgroundColor: "#f5f7fa", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "40px",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
          textAlign: "center",
          maxWidth: "500px"
        }}>
          <h2 style={{ color: "#764ba2", marginBottom: "20px" }}>🔒 Acceso Denegado</h2>
          <p style={{ color: "#666", fontSize: "16px", marginBottom: "10px" }}>
            Solo administradores y jefes de cuadrilla pueden acceder a la gestión de construcciones.
          </p>
          <p style={{ color: "#999", fontSize: "14px" }}>
            Tu rol actual: <strong>{user?.rol || "No autenticado"}</strong>
          </p>
        </div>
      </div>
    );
  }

  const handleViviendaCreated = (vivienda) => {
    setShowForm(false);
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  return (
    <div style={{ backgroundColor: "#f5f7fa", minHeight: "100vh", paddingTop: "20px", paddingBottom: "40px" }}>
      <div className="container">
        {/* Botón Nueva Vivienda o Formulario - Solo para Admin */}
        {user?.rol === "administrador" && (
          <div style={{ marginBottom: "20px" }}>
            {showForm ? (
              <div style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "32px",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
                animation: "fadeIn 0.3s ease-in"
              }}>
                <CrearViviendaForm 
                  onSuccess={handleViviendaCreated}
                  onCancel={handleFormCancel}
                />
              </div>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  padding: "14px 32px",
                  fontSize: "16px",
                  fontWeight: "600",
                  borderRadius: "8px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                  transition: "all 0.3s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
              >
                ➕ Nueva Vivienda
              </button>
            )}
          </div>
        )}

        {/* Layout Principal - Tabla */}
        <div className="row g-4">
          <div className="col-12">
            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "0",
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
              animation: "fadeIn 0.3s ease-in"
            }}>
              <ViviendasList userRole={user?.rol} />
            </div>
          </div>
        </div>
      </div>

      {/* Animación CSS */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
