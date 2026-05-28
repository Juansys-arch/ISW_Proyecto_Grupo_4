"use strict";
import React, { useState, useEffect } from 'react';
import { getIncidencias, crearIncidencia } from '@services/incidencia.service.js';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';
import '@styles/incidencias.css'; // Asegúrate de vincular tus hojas de estilo CSS

export default function Incidencias() {
    // 1. Estados de carga e información
    const [incidencias, setIncidencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');

    // 2. Estado para el Modal de reportes
    const [showModal, setShowModal] = useState(false);

    // 3. Estado del formulario para nueva incidencia (con estructuras por defecto según Joi)
    const [nuevaIncidencia, setNuevaIncidencia] = useState({
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
        prioridad: 'baja',
        tipo: 'otro',
        estado: 'pendiente'
    });

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

    // Controlador del envío de reportes de incidentes
    const handleSubmitIncidencia = async (e) => {
        e.preventDefault();

        // Convertir la fecha al formato ISO requerido por la validación Joi del backend
        const payload = {
            ...nuevaIncidencia,
            fecha: new Date(nuevaIncidencia.fecha).toISOString()
        };

        const response = await crearIncidencia(payload);

        if (response.status === "Success" || response.id) {
            showSuccessAlert('Reporte Enviado', 'La incidencia fue registrada exitosamente en el sistema.');
            setShowModal(false);
            // Resetear el formulario con valores base
            setNuevaIncidencia({
                descripcion: '',
                fecha: new Date().toISOString().split('T')[0],
                prioridad: 'baja',
                tipo: 'otro',
                estado: 'pendiente'
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
                        </tr>
                    </thead>
                    <tbody>
                        {incidencias.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center">No hay incidencias registradas en el historial.</td>
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
                                value={nuevaIncidencia.tipo} 
                                onChange={(e) => setNuevaIncidencia({...nuevaIncidencia, tipo: e.target.value})}
                            >
                                <option value="otro">Otro / General</option>
                                <option value="accidente">Accidente Laboral</option>
                                <option value="falta_material">Falta Crítica de Material</option>
                                <option value="conflicto">Conflicto en Obra / Cuadrilla</option>
                            </select>

                            <label>Nivel de Prioridad:</label>
                            <select 
                                value={nuevaIncidencia.prioridad} 
                                onChange={(e) => setNuevaIncidencia({...nuevaIncidencia, prioridad: e.target.value})}
                            >
                                <option value="baja">Baja (No interrumpe la faena)</option>
                                <option value="media">Media (Requiere atención pronta)</option>
                                <option value="alta">Alta (Riesgo de detención de obra)</option>
                                <option value="critica">Crítica (Detención inmediata / Alerta automática)</option>
                            </select>

                            <label>Fecha y Hora del Suceso:</label>
                            <input 
                                type="date" 
                                required 
                                value={nuevaIncidencia.fecha} 
                                onChange={(e) => setNuevaIncidencia({...nuevaIncidencia, fecha: e.target.value})} 
                            />

                            <label>Descripción detallada de lo ocurrido:</label>
                            <textarea 
                                required
                                placeholder="Escribe aquí los detalles del suceso (mínimo 5 caracteres)..."
                                rows="4"
                                value={nuevaIncidencia.descripcion} 
                                onChange={(e) => setNuevaIncidencia({...nuevaIncidencia, descripcion: e.target.value})}
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
        </div>
    );
}