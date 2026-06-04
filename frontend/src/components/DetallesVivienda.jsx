import { useEffect, useState } from "react";
import { useViviendas } from "../hooks/construccion/useViviendas";
import { useHitos } from "../hooks/construccion/useHitos";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

const DetallesVivienda = ({ viviendasId, onViviendasEliminada }) => {
  const { viviendaActual, cargarVivienda, loading, eliminar } = useViviendas();
  const { actualizarAvance } = useHitos();
  const { user } = useAuth();
  const [progresoEdicion, setProgresoEdicion] = useState({});

  useEffect(() => {
    if (viviendasId) {
      cargarVivienda(viviendasId);
    }
  }, [viviendasId, cargarVivienda]);

  const handleProgresoChange = (hitoId, valor) => {
    setProgresoEdicion((prev) => ({
      ...prev,
      [hitoId]: parseInt(valor),
    }));
  };

  const handleGuardarProgreso = async (hitoId) => {
    const progreso = progresoEdicion[hitoId];
    if (progreso !== undefined) {
      await actualizarAvance(viviendasId, hitoId, progreso);
      // Recargar la vivienda completa después de actualizar el hito
      await cargarVivienda(viviendasId);
      setProgresoEdicion((prev) => {
        const newState = { ...prev };
        delete newState[hitoId];
        return newState;
      });
    }
  };

  const handleEliminarVivienda = async () => {
    const result = await Swal.fire({
      title: "¿Eliminar vivienda?",
      text: `¿Está seguro de que desea eliminar la vivienda en ${viviendaActual.direccion}? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      await eliminar(viviendasId);
      if (onViviendasEliminada) {
        onViviendasEliminada();
      }
    }
  };

  if (loading) return <div className="alert alert-info">Cargando...</div>;

  if (!viviendaActual) {
    return <div className="alert alert-warning">Seleccione una vivienda</div>;
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: "badge-secondary",
      en_progreso: "badge-info",
      completado: "badge-success",
      atrasado: "badge-danger",
    };
    return badges[estado] || "badge-secondary";
  };

  return (
    <div className="card">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h4 style={{ margin: 0 }}>Detalles de Vivienda</h4>
        {user?.rol === "administrador" && viviendaActual && (
          <button
            className="btn btn-sm btn-danger"
            onClick={handleEliminarVivienda}
            style={{ marginLeft: "auto" }}
          >
            🗑️ Eliminar
          </button>
        )}
      </div>
      <div className="card-body">
        <div className="row mb-3">
          <div className="col-md-6">
            <p>
              <strong>Dirección:</strong> {viviendaActual.direccion}
            </p>
            <p>
              <strong>Propiedad:</strong> {viviendaActual.numeroPropiedad}
            </p>
            <p>
              <strong>Estado:</strong>{" "}
              <span className={`badge ${viviendaActual.estado === "completada" ? "badge-success" : "badge-info"}`}>
                {viviendaActual.estado}
              </span>
            </p>
          </div>
          <div className="col-md-6">
            <p>
              <strong>Avance General:</strong> {viviendaActual.avanceGeneral}%
            </p>
            <p>
              <strong>Inicio:</strong>{" "}
              {viviendaActual.fechaInicio
                ? new Date(viviendaActual.fechaInicio).toLocaleDateString()
                : "-"}
            </p>
            <p>
              <strong>Término:</strong>{" "}
              {viviendaActual.fechaTermino
                ? new Date(viviendaActual.fechaTermino).toLocaleDateString()
                : "-"}
            </p>
          </div>
        </div>

        <hr />

        <h5>Hitos</h5>
        {viviendaActual.hitos && viviendaActual.hitos.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Días</th>
                  <th>Estado</th>
                  <th>Progreso</th>
                  <th>Fecha Programada</th>
                  <th>Completado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {viviendaActual.hitos.map((hito) => (
                  <tr key={hito.id}>
                    <td>{hito.descripcion}</td>
                    <td>{hito.dias}</td>
                    <td>
                      <span className={`badge ${getEstadoBadge(hito.estado)}`}>
                        {hito.estado.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <div className="progress" style={{ height: "20px" }}>
                        <div
                          className="progress-bar"
                          style={{ width: `${hito.progreso}%` }}
                        >
                          {hito.progreso}%
                        </div>
                      </div>
                    </td>
                    <td>
                      {hito.fechaProgramada
                        ? new Date(hito.fechaProgramada).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      {hito.fechaCompletada
                        ? new Date(hito.fechaCompletada).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      {progresoEdicion[hito.id] !== undefined ? (
                        <>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="form-control form-control-sm"
                            value={progresoEdicion[hito.id]}
                            onChange={(e) =>
                              handleProgresoChange(hito.id, e.target.value)
                            }
                          />
                          <button
                            className="btn btn-sm btn-success mt-1"
                            onClick={() => handleGuardarProgreso(hito.id)}
                          >
                            Guardar
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() =>
                            handleProgresoChange(hito.id, hito.progreso)
                          }
                        >
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="alert alert-info">No hay hitos creados</div>
        )}
      </div>
    </div>
  );
};

export default DetallesVivienda;
