"use strict";
import React, { useState, useEffect } from 'react';
import { getIncidencias, crearIncidencia, generarReporteEmergencia } from '@services/incidencia.service.js';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';
import '@styles/incidencias.css'; // Asegúrate de vincular tus hojas de estilo CSS

export default function Incidencias() {
    // 1. Estados de carga e información
    const [incidencias, setIncidencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');

    // 2. Estado para el Modal de reportes
    const [showModal, setShowModal] = useState(false);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState(null);

    // 3. Estado del formulario para nueva incidencia (con estructuras por defecto según Joi)
    const [nuevaIncidencia, setNuevaIncidencia] = useState({
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
        prioridad: 'baja',
        tipo: 'otro',
        estado: 'pendiente',
        nombrePaciente: '',
        rutPaciente: '',
        ubicacionPaciente: '',
        observacionMedica: ''
    });

    const [reporteEmergencia, setReporteEmergencia] = useState({
        nombrePaciente: '',
        rutPaciente: '',
        ubicacionPaciente: '',
        gravedad: 'alta',
        observacionMedica: ''
    });

    const [formErrors, setFormErrors] = useState({});

    // Cargar historial de incidencias y validar rol de la sesión
    useEffect(() => {
        const fetchIncidenciasData = async () => {
            try {
                const usuarioSession = sessionStorage.getItem('usuario');
                if (usuarioSession) {
                    const parsedUser = JSON.parse(usuarioSession);
                    setUserRole(parsedUser.rol);
                }

                const data = await getIncidencias();
                if (Array.isArray(data)) {
                    setIncidencias(data);
                } else {
                    showErrorAlert('Error', 'No se pudo cargar el historial de incidencias.');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchIncidenciasData();
    }, []);

    const refrescarTabla = async () => {
        const data = await getIncidencias();
        if (Array.isArray(data)) setIncidencias(data);
    };

    const validarIncidencia = (data) => {
        const errors = {};

        if (!data.tipo) errors.tipo = 'El tipo de evento es requerido.';
        if (!data.prioridad) errors.prioridad = 'La prioridad es requerida.';
        if (!data.fecha) errors.fecha = 'La fecha es requerida.';
        if (!data.descripcion || data.descripcion.trim().length < 5) {
            errors.descripcion = 'La descripción debe tener al menos 5 caracteres.';
        }

        return errors;
    };

    const validarReporteEmergencia = (data) => {
        const errors = {};

        if (!data.nombrePaciente || data.nombrePaciente.trim().length < 3) {
            errors.nombrePaciente = 'El nombre del paciente debe tener al menos 3 caracteres.';
        }
        if (!/^\d{9}$/.test(String(data.rutPaciente || ''))) {
            errors.rutPaciente = 'El RUT del paciente debe tener exactamente 9 números.';
        }
        if (!data.ubicacionPaciente || data.ubicacionPaciente.trim().length < 3) {
            errors.ubicacionPaciente = 'La ubicación del paciente debe tener al menos 3 caracteres.';
        }
        if (!data.gravedad) errors.gravedad = 'La gravedad es requerida.';

        return errors;
    };

    // Controlador del envío de reportes de incidentes
    const handleSubmitIncidencia = async (e) => {
        e.preventDefault();

        const errors = validarIncidencia(nuevaIncidencia);
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        // Convertir la fecha al formato ISO requerido por la validación Joi del backend
        const payload = {
            ...nuevaIncidencia,
            fecha: new Date(nuevaIncidencia.fecha).toISOString()
        };

        const response = await crearIncidencia(payload);

        if (response.status === "Success" || response.id) {
            showSuccessAlert('Reporte Enviado', 'La incidencia fue registrada exitosamente en el sistema.');
            setShowModal(false);
            setFormErrors({});
            // Resetear el formulario con valores base
            setNuevaIncidencia({
                descripcion: '',
                fecha: new Date().toISOString().split('T')[0],
                prioridad: 'baja',
                tipo: 'otro',
                estado: 'pendiente',
                nombrePaciente: '',
                rutPaciente: '',
                ubicacionPaciente: '',
                observacionMedica: '',
            });
            refrescarTabla();
        } else {
            showErrorAlert('Error de Validación', response.message || 'Verifique los campos ingresados.');
        }
    };

    // Helper visual para asignar clases CSS dinámicas según la gravedad
    const obtenerClasePrioridad = (prioridad) => {
        switch (prioridad) {
            case 'critica': return 'badge-priority critica';
            case 'alta': return 'badge-priority alta';
            case 'media': return 'badge-priority media';
            default: return 'badge-priority baja';
        }
    };

    const requiereAccionMedica = (incidencia) =>
        incidencia.tipo === 'accidente' &&
        ['alta', 'critica'].includes(incidencia.prioridad) &&
        incidencia.estado !== 'resuelto';

    const handleReporteEmergencia = async (incidencia) => {
        setIncidenciaSeleccionada(incidencia);
        setReporteEmergencia({
            nombrePaciente: incidencia.nombrePaciente || '',
            rutPaciente: incidencia.rutPaciente || '',
            ubicacionPaciente: incidencia.ubicacionPaciente || '',
            gravedad: incidencia.prioridad === 'critica' ? 'critica' : 'alta',
            observacionMedica: incidencia.observacionMedica || ''
        });
        setShowEmergencyModal(true);
    };

    const handleSubmitReporteEmergencia = async (e) => {
        e.preventDefault();

        const errors = validarReporteEmergencia(reporteEmergencia);
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        if (!incidenciaSeleccionada) return;

        const response = await generarReporteEmergencia(incidenciaSeleccionada.id, reporteEmergencia);

        if (response.status === 'Success') {
            setShowEmergencyModal(false);
            setIncidenciaSeleccionada(null);
            setFormErrors({});
            refrescarTabla();
        } else {
            showErrorAlert('Error', response.message || 'No se pudo generar el reporte médico.');
        }
    };

    if (loading) return <div className="loading-container">Cargando módulo de incidencias...</div>;

    return (
        <div className="incidencias-page">
            <div className="header-section">
                <h1>Registro e Historial de Incidencias</h1>
                <p>Módulo de supervisión operativa en terreno para: <strong>{userRole}</strong></p>

                <div className="action-buttons">
                    {/* Restricción de Vista: Solo el jefe de cuadrilla inicia reportes según tus rutas */}
                    {userRole === 'jefe_cuadrilla' && (
                        <button className="btn btn-danger" onClick={() => setShowModal(true)}>
                            ⚠️ Reportar Nueva Incidencia
                        </button>
                    )}
                </div>
            </div>

            {/* Tabla General de Incidencias */}
            <div className="table-container">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Tipo de Suceso</th>
                            <th>Descripción</th>
                            <th>Fecha del Reporte</th>
                            <th>Prioridad</th>
                            <th>Estado Actual</th>
                            <th>Reportado Por</th>
                            {(userRole === 'administrador' || userRole === 'encargado_inventario') && <th>Nombre del paciente</th>}
                            {(userRole === 'administrador' || userRole === 'encargado_inventario') && <th>RUT del paciente</th>}
                            {(userRole === 'administrador' || userRole === 'encargado_inventario') && <th>Ubicación del paciente</th>}
                            {userRole === 'administrador' && <th>Acción</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {incidencias.length === 0 ? (
                            <tr>
                                <td colSpan={userRole === 'administrador' ? 10 : 9} className="text-center">No hay incidencias registradas en el historial.</td>
                            </tr>
                        ) : (
                            incidencias.map((incidencia) => (
                                <tr key={incidencia.id}>
                                    <td>
                                        <span className={`badge-tipo ${incidencia.tipo}`}>
                                            {incidencia.tipo.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="table-descripcion">{incidencia.descripcion}</td>
                                    <td>{new Date(incidencia.fecha).toLocaleString()}</td>
                                    <td>
                                        <span className={obtenerClasePrioridad(incidencia.prioridad)}>
                                            {incidencia.prioridad.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge-estado ${incidencia.estado}`}>
                                            {incidencia.estado}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="user-info">
                                            {incidencia.jefeCuadrilla?.nombreCompleto || `ID: ${incidencia.jefeCuadrillaId}`}
                                        </span>
                                    </td>
                                    {(userRole === 'administrador' || userRole === 'encargado_inventario') && (
                                        <td>
                                            {requiereAccionMedica(incidencia) ? (incidencia.nombrePaciente || 'Sin dato') : <span className="badge-estado pendiente">No aplica</span>}
                                        </td>
                                    )}
                                    {(userRole === 'administrador' || userRole === 'encargado_inventario') && (
                                        <td>
                                            {requiereAccionMedica(incidencia) ? (incidencia.rutPaciente || 'Sin RUT') : <span className="badge-estado pendiente">No aplica</span>}
                                        </td>
                                    )}
                                    {(userRole === 'administrador' || userRole === 'encargado_inventario') && (
                                        <td>
                                            {requiereAccionMedica(incidencia) ? (incidencia.ubicacionPaciente || 'Sin ubicación') : <span className="badge-estado pendiente">No aplica</span>}
                                        </td>
                                    )}
                                    {userRole === 'administrador' && (
                                        <td>
                                            {requiereAccionMedica(incidencia) ? (
                                                <button className="btn btn-danger" onClick={() => handleReporteEmergencia(incidencia)}>
                                                    Generar reporte médico
                                                </button>
                                            ) : (
                                                <span className="badge-estado pendiente">Sin acción</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL: REPORTAR INCIDENCIA */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Formulario de Reporte de Incidencias</h2>
                        <form onSubmit={handleSubmitIncidencia}>
                            
                            <label>Tipo de Evento:</label>
                            <select 
                                required
                                value={nuevaIncidencia.tipo} 
                                onChange={(e) => setNuevaIncidencia({...nuevaIncidencia, tipo: e.target.value})}
                            >
                                <option value="otro">Otro / General</option>
                                <option value="accidente">Accidente Laboral</option>
                                <option value="falta_material">Falta Crítica de Material</option>
                                <option value="conflicto">Conflicto en Obra / Cuadrilla</option>
                            </select>
                            {formErrors.tipo && <small className="field-error">{formErrors.tipo}</small>}

                            <label>Nivel de Prioridad:</label>
                            <select 
                                required
                                value={nuevaIncidencia.prioridad} 
                                onChange={(e) => setNuevaIncidencia({...nuevaIncidencia, prioridad: e.target.value})}
                            >
                                <option value="baja">Baja (No interrumpe la faena)</option>
                                <option value="media">Media (Requiere atención pronta)</option>
                                <option value="alta">Alta (Riesgo de detención de obra)</option>
                                <option value="critica">Crítica (Detención inmediata / Alerta automática)</option>
                            </select>
                            {formErrors.prioridad && <small className="field-error">{formErrors.prioridad}</small>}

                            <label>Fecha y Hora del Suceso:</label>
                            <input 
                                type="date" 
                                required 
                                value={nuevaIncidencia.fecha} 
                                onChange={(e) => setNuevaIncidencia({...nuevaIncidencia, fecha: e.target.value})} 
                            />
                            {formErrors.fecha && <small className="field-error">{formErrors.fecha}</small>}

                            <label>Descripción detallada de lo ocurrido:</label>
                            <textarea 
                                required
                                minLength={5}
                                placeholder="Escribe aquí los detalles del suceso (mínimo 5 caracteres)..."
                                rows="4"
                                value={nuevaIncidencia.descripcion} 
                                onChange={(e) => setNuevaIncidencia({...nuevaIncidencia, descripcion: e.target.value})}
                            />
                            {formErrors.descripcion && <small className="field-error">{formErrors.descripcion}</small>}

                            <label>Nombre del paciente (si aplica):</label>
                            <input
                                type="text"
                                minLength={3}
                                value={nuevaIncidencia.nombrePaciente}
                                onChange={(e) => setNuevaIncidencia({ ...nuevaIncidencia, nombrePaciente: e.target.value })}
                                placeholder="Ej: Juan Pérez"
                            />

                            <label>RUT del paciente (si aplica):</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]{9}"
                                maxLength={9}
                                value={nuevaIncidencia.rutPaciente}
                                onChange={(e) => setNuevaIncidencia({ ...nuevaIncidencia, rutPaciente: e.target.value })}
                                placeholder="Ej: 123456789"
                            />

                            <label>Ubicación del paciente (si aplica):</label>
                            <input
                                type="text"
                                minLength={3}
                                value={nuevaIncidencia.ubicacionPaciente}
                                onChange={(e) => setNuevaIncidencia({ ...nuevaIncidencia, ubicacionPaciente: e.target.value })}
                                placeholder="Ej: Obra central, sector norte"
                            />

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-submit btn-danger-submit">
                                    Emitir Reporte de Alerta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEmergencyModal && incidenciaSeleccionada && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Formulario de Reporte de Incidencias</h2>
                        <p style={{ marginTop: 0, color: '#4b6077' }}>
                            Reporte médico - Incidencia #{incidenciaSeleccionada.id} - {incidenciaSeleccionada.prioridad.toUpperCase()}
                        </p>
                        <form onSubmit={handleSubmitReporteEmergencia}>
                            <label>Nombre del paciente:</label>
                            <input
                                type="text"
                                required
                                minLength={3}
                                value={reporteEmergencia.nombrePaciente}
                                onChange={(e) => setReporteEmergencia({ ...reporteEmergencia, nombrePaciente: e.target.value })}
                                placeholder="Ej: Juan Pérez"
                            />
                            {formErrors.nombrePaciente && <small className="field-error">{formErrors.nombrePaciente}</small>}

                            <label>RUT del paciente:</label>
                            <input
                                type="text"
                                required
                                inputMode="numeric"
                                pattern="[0-9]{9}"
                                maxLength={9}
                                value={reporteEmergencia.rutPaciente}
                                onChange={(e) => setReporteEmergencia({ ...reporteEmergencia, rutPaciente: e.target.value })}
                                placeholder="Ej: 123456789"
                            />
                            {formErrors.rutPaciente && <small className="field-error">{formErrors.rutPaciente}</small>}

                            <label>Ubicación del paciente:</label>
                            <input
                                type="text"
                                required
                                minLength={3}
                                value={reporteEmergencia.ubicacionPaciente}
                                onChange={(e) => setReporteEmergencia({ ...reporteEmergencia, ubicacionPaciente: e.target.value })}
                                placeholder="Ej: Obra central, sector norte"
                            />
                            {formErrors.ubicacionPaciente && <small className="field-error">{formErrors.ubicacionPaciente}</small>}

                            <label>Gravedad estimada:</label>
                            <select
                                required
                                value={reporteEmergencia.gravedad}
                                onChange={(e) => setReporteEmergencia({ ...reporteEmergencia, gravedad: e.target.value })}
                            >
                                <option value="alta">Alta</option>
                                <option value="critica">Crítica</option>
                            </select>

                            <label>Observación médica / síntomas:</label>
                            <textarea
                                rows="4"
                                value={reporteEmergencia.observacionMedica}
                                onChange={(e) => setReporteEmergencia({ ...reporteEmergencia, observacionMedica: e.target.value })}
                                placeholder="Ej: dolor intenso, pérdida de conciencia, sangrado, inmovilidad..."
                            />

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => { setShowEmergencyModal(false); setIncidenciaSeleccionada(null); }}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-submit btn-danger-submit">
                                    Enviar reporte médico
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}