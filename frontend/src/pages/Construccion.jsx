import { useState } from "react";
import { useAuth } from "@context/AuthContext";
import ViviendasList from "@components/ViviendasList";
import CrearViviendaForm from "@components/CrearViviendaForm";
import "@styles/construccion.css";

export default function Construccion() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleViviendaCreated = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  return (
    <div style={{ backgroundColor: "#f5f7fa", minHeight: "100vh", paddingTop: "20px", paddingBottom: "40px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <h1 style={{ color: "#333", marginBottom: "30px" }}>Gestión de Construcciones</h1>
        
        {showForm ? (
          <div style={{ marginBottom: "30px", backgroundColor: "white", borderRadius: "8px", padding: "20px" }}>
            <CrearViviendaForm onSuccess={handleViviendaCreated} onCancel={handleFormCancel} />
          </div>
        ) : user?.rol === 'super_admin' ? (
          <button
            onClick={() => setShowForm(true)}
            style={{
              backgroundColor: "#764ba2",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "6px",
              cursor: "pointer",
              marginBottom: "20px",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            + Agregar Vivienda
          </button>
        ) : null}
        
        <div>
          <ViviendasList
            key={refreshKey}
            userRole={user?.rol}
          />
        </div>
      </div>
    </div>
  );
}
