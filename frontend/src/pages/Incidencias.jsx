"use strict";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIncidencias, crearIncidencia, generarReporteEmergencia, actualizarIncidencia, eliminarIncidencia } from '@services/incidencia.service.js';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';
import Swal from 'sweetalert2';
import '@styles/incidencias.css'; // Asegúrate de vincular tus hojas de estilo CSS

export default function Incidencias() {
    const navigate = useNavigate();
    // 1. Estados de carga e información
    const [incidencias, setIncidencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');

    // 2. Estado para el Modal de reportes
    const [showModal, setShowModal] = useState(false);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [incidenciaEditId, setIncidenciaEditId] = useState(null);

    // 3. Estado del formulario para nueva incidencia (con estructuras por defecto según Joi)
    const [nuevaIncidencia, setNuevaIncidencia] = useState({
        descripcion: '',
        fecha: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })(),
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
        if (!data.fecha) {
            errors.fecha = 'La fecha es requerida.';
        } else if (data.tipo === 'accidente') {
            // Para accidente laboral, la fecha debe ser EXACTAMENTE hoy (hora local)
            const d = new Date();
            const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            if (data.fecha !== hoy) {
                errors.fecha = `Para un Accidente Laboral, la fecha debe ser la de hoy (${hoy}).`;
            }
        }
        // Para otros tipos (conflicto, otro, etc.) se permiten fechas pasadas — sin restricción.
        if (!data.descripcion || data.descripcion.trim().length < 5) {
            errors.descripcion = 'La descripción debe tener al menos 5 caracteres.';
        } else if (data.descripcion.length > 1000) {
            errors.descripcion = 'La descripción debe tener como máximo 1000 caracteres.';
        }

        if (data.rutPaciente && !/^\d{9}$/.test(data.rutPaciente)) {
            errors.rutPaciente = 'El RUT del paciente debe tener exactamente 9 números.';
        }
        if (data.nombrePaciente) {
            if (data.nombrePaciente.trim().length < 3) {
                errors.nombrePaciente = 'El nombre del paciente debe tener al menos 3 caracteres.';
            } else if (data.nombrePaciente.length > 255) {
                errors.nombrePaciente = 'El nombre del paciente debe tener como máximo 255 caracteres.';
            }
        }
        if (data.ubicacionPaciente) {
            if (data.ubicacionPaciente.trim().length < 3) {
                errors.ubicacionPaciente = 'La ubicación del paciente debe tener al menos 3 caracteres.';
            } else if (data.ubicacionPaciente.length > 255) {
                errors.ubicacionPaciente = 'La ubicación del paciente debe tener como máximo 255 caracteres.';
            }
        }

        return errors;
    };

    const validarReporteEmergencia = (data) => {
        const errors = {};

        if (!data.nombrePaciente || data.nombrePaciente.trim().length < 3) {
            errors.nombrePaciente = 'El nombre del paciente debe tener al menos 3 caracteres.';
        } else if (data.nombrePaciente.length > 255) {
            errors.nombrePaciente = 'El nombre del paciente debe tener como máximo 255 caracteres.';
        }
        if (!/^\d{9}$/.test(String(data.rutPaciente || ''))) {
            errors.rutPaciente = 'El RUT del paciente debe tener exactamente 9 números.';
        }
        if (!data.ubicacionPaciente || data.ubicacionPaciente.trim().length < 3) {
            errors.ubicacionPaciente = 'La ubicación del paciente debe tener al menos 3 caracteres.';
        } else if (data.ubicacionPaciente.length > 255) {
            errors.ubicacionPaciente = 'La ubicación del paciente debe tener como máximo 255 caracteres.';
        }
        if (!data.gravedad) errors.gravedad = 'La gravedad es requerida.';
        if (data.observacionMedica && data.observacionMedica.length > 1000) {
            errors.observacionMedica = 'La observación médica debe tener como máximo 1000 caracteres.';
        }

        return errors;
    };

    const handleCloseReportModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setIncidenciaEditId(null);
        setFormErrors({});
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
    };

    const handleEditIncidencia = (incidencia) => {
        setIsEditing(true);
        setIncidenciaEditId(incidencia.id);
        setNuevaIncidencia({
            descripcion: incidencia.descripcion,
            fecha: new Date(incidencia.fecha).toISOString().split('T')[0],
            prioridad: incidencia.prioridad,
            tipo: incidencia.tipo,
            estado: incidencia.estado || 'pendiente',
            nombrePaciente: incidencia.nombrePaciente || '',
            rutPaciente: incidencia.rutPaciente || '',
            ubicacionPaciente: incidencia.ubicacionPaciente || '',
            observacionMedica: incidencia.observacionMedica || '',
        });
        setShowModal(true);
    };

    const handleDeleteIncidencia = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede revertir.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            const response = await eliminarIncidencia(id);
            if (response.status === 'Success' || response.id) {
                showSuccessAlert('Eliminado', 'La incidencia ha sido eliminada.');
                refrescarTabla();
            } else {
                showErrorAlert('Error', response.message || 'No se pudo eliminar la incidencia.');
            }
        }
    };

    const handleSubmitIncidencia = async (e) => {
        e.preventDefault();

        const errors = validarIncidencia(nuevaIncidencia);
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        const payload = {
            ...nuevaIncidencia,
            fecha: new Date(`${nuevaIncidencia.fecha}T00:00:00Z`).toISOString()
        };

        let response;
        if (isEditing) {
            response = await actualizarIncidencia(incidenciaEditId, payload);
        } else {
            response = await crearIncidencia(payload);
        }

        if (response.status === "Success" || response.id) {
            showSuccessAlert(
                isEditing ? 'Reporte Actualizado' : 'Reporte Enviado',
                isEditing ? 'La incidencia fue actualizada exitosamente.' : 'La incidencia fue registrada exitosamente en el sistema.'
            );
            handleCloseReportModal();
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
        incidencia.estado === 'pendiente';

    const calcularEquipoMedico = (gravedad) => {
        switch (gravedad) {
            case 'baja': return 'Equipo Médico Básico';
            case 'media': return 'Equipo Médico Intermedio';
            case 'alta': return 'Equipo Médico Avanzado';
            case 'critica': return 'Equipo Médico Experto';
            default: return '';
        }
    };

    const handleReporteEmergencia = async (incidencia) => {
        setIncidenciaSeleccionada(incidencia);
        const initGravedad = incidencia.prioridad || 'baja';
        setReporteEmergencia({
            nombrePaciente: incidencia.nombrePaciente || '',
            rutPaciente: incidencia.rutPaciente || '',
            ubicacionPaciente: incidencia.ubicacionPaciente || '',
            gravedad: initGravedad,
            equipoMedico: calcularEquipoMedico(initGravedad),
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
            showSuccessAlert('Reporte Enviado', 'El reporte médico y el correo han sido enviados correctamente al Jefe de Cuadrilla.');
            setShowEmergencyModal(false);
            setIncidenciaSeleccionada(null);
            setFormErrors({});
            refrescarTabla();
        } else {
            showErrorAlert('Error', response.message || 'No se pudo generar el reporte médico.');
        }
    };

    const [expandedFichas, setExpandedFichas] = useState({});

    const toggleFicha = (id) => {
        setExpandedFichas(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const formatBriefName = (name) => {
        if (!name) return '';
        const parts = name.split(' ').filter(Boolean);
        if (parts.length >= 3) {
            return `${parts[0][0]}. ${parts.slice(2).join(' ')}`;
        } else if (parts.length === 2) {
            return `${parts[0][0]}. ${parts[1]}`;
        }
        return name;
    };

    if (loading) return <div className="loading-container">Cargando módulo de incidencias...</div>;

    return (
        <div className="incidencias-page">
            <div className="header-section">
                <div className="title-area">
                    <button className="btn btn-back" onClick={() => navigate('/gestion-operativa')}>
                        ← Volver
                    </button>
                    <div className="title-text-group">
                        <span className="user-role-label">{userRole.replace('_', ' ').toUpperCase()}</span>
                        <h1>{userRole === 'jefe_cuadrilla' ? 'REGISTRO DE INCIDENCIAS' : 'INCIDENCIAS EN CURSO'}</h1>
                        <p>{userRole === 'jefe_cuadrilla' ? 'Terreno' : 'Panel de supervisión'}</p>
                    </div>
                </div>

                <div className="action-buttons">
                    {userRole === 'jefe_cuadrilla' && (
                        <button className="btn btn-report" onClick={() => setShowModal(true)}>
                            REPORTEAR INCIDENCIA
                        </button>
                    )}
                </div>
            </div>

            <div className="incidencias-list">
                {incidencias.length === 0 ? (
                    <div className="no-incidencias">No hay incidencias registradas en el historial.</div>
                ) : (
                    incidencias.map((incidencia) => {
                        const hasPatientInfo = incidencia.nombrePaciente || incidencia.rutPaciente || incidencia.ubicacionPaciente;
                        const isExpanded = expandedFichas[incidencia.id];

                        const reporterName = incidencia.jefeCuadrilla?.nombreCompleto
                            ? (userRole === 'super_admin'
                                ? formatBriefName(incidencia.jefeCuadrilla.nombreCompleto)
                                : incidencia.jefeCuadrilla.nombreCompleto)
                            : `ID: ${incidencia.jefeCuadrillaId}`;

                        return (
                            <div key={incidencia.id} className={`incidencia-card priority-${incidencia.prioridad}`}>
                                <div className="incidencia-card-main">
                                    <div className="incidencia-card-content">
                                        <div className="incidencia-badges">
                                            <span className={`badge-tipo ${incidencia.tipo}`}>
                                                {incidencia.tipo.replace('_', ' ').toUpperCase()}
                                            </span>
                                            <span className={obtenerClasePrioridad(incidencia.prioridad)}>
                                                {incidencia.prioridad.toUpperCase()}
                                            </span>
                                            <span className={`badge-estado ${incidencia.estado}`}>
                                                {incidencia.estado.toUpperCase()}
                                            </span>
                                        </div>
                                        <h4 className="incidencia-descripcion">{incidencia.descripcion}</h4>
                                        <p className="incidencia-meta">
                                            {new Date(incidencia.fecha).toLocaleDateString('es-CL', { timeZone: 'UTC' })} · {userRole === 'super_admin' ? reporterName : `reportado por ${reporterName}`}
                                        </p>
                                    </div>

                                    <div className="incidencia-card-actions" style={{ display: 'flex', gap: '8px' }}>
                                        {(userRole === 'super_admin' || userRole === 'jefe_cuadrilla') && (
                                            <>
                                                <button
                                                    className="btn-toggle-ficha"
                                                    onClick={() => handleEditIncidencia(incidencia)}
                                                >
                                                    ✏️ Editar
                                                </button>
                                                <button
                                                    className="btn-toggle-ficha"
                                                    style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}
                                                    onClick={() => handleDeleteIncidencia(incidencia.id)}
                                                >
                                                    🗑️ Eliminar
                                                </button>
                                            </>
                                        )}
                                        {userRole === 'super_admin' && hasPatientInfo && (
                                            <button
                                                className="btn-toggle-ficha"
                                                onClick={() => toggleFicha(incidencia.id)}
                                            >
                                                {isExpanded ? 'Ocultar ficha médica ▲' : 'Ver ficha médica ▼'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {userRole === 'super_admin' && hasPatientInfo && isExpanded && (
                                    <div className="incidencia-medical-section">
                                        <div className="medical-grid">
                                            <div className="medical-field">
                                                <span className="medical-label">PACIENTE</span>
                                                <span className="medical-value">{incidencia.nombrePaciente || 'Sin dato'}</span>
                                            </div>
                                            <div className="medical-field">
                                                <span className="medical-label">RUT</span>
                                                <span className="medical-value">{incidencia.rutPaciente || 'Sin RUT'}</span>
                                            </div>
                                            <div className="medical-field">
                                                <span className="medical-label">UBICACIÓN</span>
                                                <span className="medical-value">{incidencia.ubicacionPaciente || 'Sin ubicación'}</span>
                                            </div>
                                            {incidencia.equipoMedico && (
                                                <div className="medical-field">
                                                    <span className="medical-label">EQUIPO ASIGNADO</span>
                                                    <span className="medical-value">{incidencia.equipoMedico}</span>
                                                </div>
                                            )}
                                        </div>

                                        {requiereAccionMedica(incidencia) && (
                                            <button
                                                className="btn-generar-reporte"
                                                onClick={() => handleReporteEmergencia(incidencia)}
                                            >
                                                GENERAR REPORTE MÉDICO
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* MODAL: REPORTAR INCIDENCIA */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{isEditing ? 'Formulario de Edición de Incidencia' : 'Formulario de Reporte de Incidencias'}</h2>
                        <form onSubmit={handleSubmitIncidencia}>

                            <label>Tipo de Evento:</label>
                            <select
                                required
                                value={nuevaIncidencia.tipo}
                                onChange={(e) => setNuevaIncidencia({ ...nuevaIncidencia, tipo: e.target.value })}
                            >
                                <option value="otro">Otro / General</option>
                                <option value="accidente">Accidente Laboral</option>
                                <option value="conflicto">Conflicto en Obra / Cuadrilla</option>
                            </select>
                            {formErrors.tipo && <small className="field-error">{formErrors.tipo}</small>}

                            <label>Nivel de Prioridad:</label>
                            <select
                                required
                                value={nuevaIncidencia.prioridad}
                                onChange={(e) => setNuevaIncidencia({ ...nuevaIncidencia, prioridad: e.target.value })}
                            >
                                <option value="baja">Baja (No interrumpe la faena)</option>
                                <option value="media">Media (Requiere atención pronta)</option>
                                <option value="alta">Alta (Riesgo de detención de obra)</option>
                                <option value="critica">Crítica (Detención inmediata / Alerta automática)</option>
                            </select>
                            {formErrors.prioridad && <small className="field-error">{formErrors.prioridad}</small>}

                            {isEditing && (
                                <>
                                    <label>Estado Actual:</label>
                                    <select
                                        required
                                        value={nuevaIncidencia.estado}
                                        onChange={(e) => setNuevaIncidencia({ ...nuevaIncidencia, estado: e.target.value })}
                                    >
                                        <option value="pendiente">Pendiente</option>
                                        <option value="en_proceso">En Proceso</option>
                                        <option value="listo">Listo</option>
                                        <option value="resuelto">Resuelto</option>
                                    </select>
                                    {formErrors.estado && <small className="field-error">{formErrors.estado}</small>}
                                </>
                            )}

                            <label>Fecha de Incidencia:</label>
                            <input
                                type="date"
                                required
                                min={nuevaIncidencia.tipo === 'accidente' ? (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })() : undefined}
                                max={nuevaIncidencia.tipo === 'accidente' ? (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })() : undefined}
                                value={nuevaIncidencia.fecha}
                                onChange={(e) => setNuevaIncidencia({ ...nuevaIncidencia, fecha: e.target.value })}
                            />
                            {formErrors.fecha && <small className="field-error">{formErrors.fecha}</small>}

                            <label>Descripción detallada de lo ocurrido:</label>
                            <textarea
                                required
                                minLength={5}
                                placeholder="Escribe aquí los detalles del suceso (mínimo 5 caracteres)..."
                                rows="4"
                                value={nuevaIncidencia.descripcion}
                                onChange={(e) => setNuevaIncidencia({ ...nuevaIncidencia, descripcion: e.target.value })}
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
                            {formErrors.nombrePaciente && <small className="field-error">{formErrors.nombrePaciente}</small>}

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
                            {formErrors.rutPaciente && <small className="field-error">{formErrors.rutPaciente}</small>}

                            <label>Ubicación del paciente (si aplica):</label>
                            <input
                                type="text"
                                minLength={3}
                                value={nuevaIncidencia.ubicacionPaciente}
                                onChange={(e) => setNuevaIncidencia({ ...nuevaIncidencia, ubicacionPaciente: e.target.value })}
                                placeholder="Ej: Obra central, sector norte"
                            />
                            {formErrors.ubicacionPaciente && <small className="field-error">{formErrors.ubicacionPaciente}</small>}

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseReportModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-submit btn-danger-submit">
                                    {isEditing ? 'Guardar Cambios' : 'Emitir Reporte de Alerta'}
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
                                onChange={(e) => setReporteEmergencia({ ...reporteEmergencia, gravedad: e.target.value, equipoMedico: calcularEquipoMedico(e.target.value) })}
                            >
                                <option value="baja">Baja</option>
                                <option value="media">Media</option>
                                <option value="alta">Alta</option>
                                <option value="critica">Crítica</option>
                            </select>

                            <label>Equipo médico asignado:</label>
                            <input
                                type="text"
                                readOnly
                                value={reporteEmergencia.equipoMedico || ''}
                                style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                            />

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