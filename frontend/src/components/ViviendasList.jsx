import { useEffect } from "react";
import { useViviendas } from "../hooks/construccion/useViviendas";
import Swal from "sweetalert2";
import "../styles/construccion.css";

export const ViviendasList = ({ userRole }) => {
  const { viviendas, loading, cargarViviendas, iniciar, completar, pausar, eliminar, verificarRetrasos } =
    useViviendas();

  useEffect(() => {
    cargarViviendas();
  }, [cargarViviendas]);

  const getEstadoBadge = (estado) => {
    const badges = {
      planificada: "badge-primary",
      en_progreso: "badge-info",
      pausada: "badge-warning",
      completada: "badge-success",
    };
    return badges[estado] || "badge-secondary";
  };

  // Calcular tiempo restante y estado
  const getEstadoTiempo = (vivienda) => {
    if (vivienda.estado !== "en_progreso" || !vivienda.hitos || vivienda.hitos.length === 0) {
      return { estado: "normal", diasRestantes: null, mensaje: "" };
    }

    const hito = vivienda.hitos[0];
    if (!hito.fechaProgramada) return { estado: "normal", diasRestantes: null, mensaje: "" };

    const ahora = new Date();
    const fechaProgramada = new Date(hito.fechaProgramada);
    const diferencia = fechaProgramada - ahora;
    const diasRestantes = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    const horasRestantes = Math.ceil(diferencia / (1000 * 60 * 60));

    if (diferencia < 0) {
      // Vencido
      const horasVencidas = Math.floor(-diferencia / (1000 * 60 * 60));
      return { 
        estado: "vencido", 
        diasRestantes: diasRestantes,
        mensaje: `⚠️ Vencido hace ${horasVencidas}h`,
        color: "#dc3545"
      };
    } else if (diferencia < 24 * 60 * 60 * 1000) {
      // Menos de 1 día
      return { 
        estado: "critico", 
        diasRestantes: diasRestantes,
        mensaje: `🔴 Vence en ${horasRestantes}h`,
        color: "#ff6b6b"
      };
    } else if (diferencia < 2 * 24 * 60 * 60 * 1000) {
      // Menos de 2 días
      return { 
        estado: "advertencia", 
        diasRestantes: diasRestantes,
        mensaje: `🟡 Vence en ${diasRestantes} día`,
        color: "#ffc107"
      };
    }

    return { 
      estado: "ok", 
      diasRestantes: diasRestantes,
      mensaje: `✅ Vence en ${diasRestantes} días`,
      color: "#28a745"
    };
  };

  // Determinar si está retrasado (hito con estado "atrasado")
  const isRetrasado = (vivienda) => {
    if (vivienda.hitos && vivienda.hitos.length > 0) {
      return vivienda.hitos.some(h => h.estado === "atrasado");
    }
    return false;
  };

  // Determinar estado de etapa para mostrar
  const getEtapa = (vivienda) => {
    if (vivienda.estado === "completada") {
      return { icono: "✅ Terminado", color: "#d4edda", textColor: "#155724" };
    }
    
    if (vivienda.estado === "pausada") {
      return { icono: "⏸️ Pausada", color: "#fff3cd", textColor: "#856404" };
    }

    if (vivienda.estado === "en_progreso") {
      const estadoTiempo = getEstadoTiempo(vivienda);
      
      if (estadoTiempo.estado === "vencido") {
        return { 
          icono: estadoTiempo.mensaje, 
          color: "#f8d7da", 
          textColor: "#721c24" 
        };
      } else if (estadoTiempo.estado === "critico") {
        return { 
          icono: estadoTiempo.mensaje, 
          color: "#ffe0e0", 
          textColor: "#c3111b" 
        };
      } else if (estadoTiempo.estado === "advertencia") {
        return { 
          icono: estadoTiempo.mensaje, 
          color: "#fff8e1", 
          textColor: "#f57f17" 
        };
      }
      
      return { 
        icono: estadoTiempo.mensaje, 
        color: "#e7f3ff", 
        textColor: "#004085" 
      };
    }

    return { icono: "📋 Planificada", color: "#e7e7ff", textColor: "#383d92" };
  };

  const handleEliminarVivienda = async (vivienda) => {
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
      await eliminar(vivienda.id);
    }
  };

  if (loading) return <div className="text-center p-4">Cargando...</div>;

  return (
    <div className="construccion-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Viviendas en Construcción</h2>
        {userRole === "administrador" && (
          <button
            className="btn btn-sm btn-info"
            onClick={verificarRetrasos}
            title="Fuerza la verificación de retrasos en construcciones"
          >
            🔄 Verificar Retrasos
          </button>
        )}
      </div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-dark">
            <tr>
              <th>Dirección</th>
              <th>Inicio</th>
              <th>Término</th>
              <th>{userRole === "administrador" ? "Etapa" : "Acciones"}</th>
              {userRole === "administrador" && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {viviendas.map((vivienda) => (
              <tr key={vivienda.id}>
                <td>
                  {isRetrasado(vivienda) && (
                    <span style={{
                      display: "inline-block",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: "#dc3545",
                      marginRight: "8px"
                    }}></span>
                  )}
                  {vivienda.direccion}
                </td>
                <td>{vivienda.fechaInicio ? new Date(vivienda.fechaInicio).toLocaleDateString() : "-"}</td>
                <td>{vivienda.fechaTermino ? new Date(vivienda.fechaTermino).toLocaleDateString() : "-"}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  {userRole === "administrador" ? (
                    // Vista para administrador: mostrar etapa
                    <span style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      backgroundColor: getEtapa(vivienda).color,
                      color: getEtapa(vivienda).textColor,
                      fontWeight: "600",
                      fontSize: "14px"
                    }}>
                      {getEtapa(vivienda).icono}
                    </span>
                  ) : (
                    // Vista para jefe de cuadrilla: mostrar acciones
                    <>
                      {vivienda.estado === "planificada" && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => iniciar(vivienda.id)}
                        >
                          Iniciar
                        </button>
                      )}
                      {vivienda.estado === "en_progreso" && (
                        <>
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => pausar(vivienda.id)}
                          >
                            Pausar
                          </button>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => completar(vivienda.id)}
                          >
                            Completar
                          </button>
                        </>
                      )}
                      {vivienda.estado === "pausada" && (
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => iniciar(vivienda.id)}
                        >
                          Reanudar
                        </button>
                      )}
                    </>
                  )}
                </td>
                {userRole === "administrador" && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleEliminarVivienda(vivienda)}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {viviendas.length === 0 && (
          <div className="alert alert-info text-center">
            No hay viviendas registradas
          </div>
        )}
      </div>
    </div>
  );
};

export default ViviendasList;
