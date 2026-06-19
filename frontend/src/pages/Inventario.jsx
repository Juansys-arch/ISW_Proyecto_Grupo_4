"use strict";
import React, { useState, useEffect } from 'react';
import {
    getMateriales,
    crearMaterial,
    registrarMovimiento,
    getMovimientos,
    solicitarMaterial,
    getSolicitudes,
    getMisSolicitudes,
    actualizarEstadoSolicitud
} from '@services/inventario.service.js';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';
import '@styles/inventario.css'; // Asegúrate de crear este archivo de estilos o integrarlo a styles.css

export default function Inventario() {
    // 1. Estados globales de la página
    const [materiales, setMateriales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');

    // 2. Estados para controlar ventanas emergentes (Modales)
    const [showModalMaterial, setShowModalMaterial] = useState(false);
    const [showModalMovimiento, setShowModalMovimiento] = useState(false);
    const [showModalSolicitud, setShowModalSolicitud] = useState(false);
    const [activeTab, setActiveTab] = useState('materiales');

    // 3. Estados para capturar los datos de los formularios
    const [nuevoMaterial, setNuevoMaterial] = useState({ nombre: '', descripcion: '', unidadMedida: '', stockMinimo: 0 });
    const [nuevoMovimiento, setNuevoMovimiento] = useState({ materialId: '', tipo: 'entrada', cantidad: 1, observacion: '', newMaterialNombre: '', newMaterialUnidad: '', newMaterialDescripcion: '' });
    const [nuevaSolicitud, setNuevaSolicitud] = useState({ materialId: '', cantidad: 1, observacion: '', ubicacion: '' });
    const [misSolicitudes, setMisSolicitudes] = useState([]);
    const [solicitudesEncargado, setSolicitudesEncargado] = useState([]);
    const [movimientos, setMovimientos] = useState([]);


    useEffect(() => {
        const fetchInitialData = async () => {
            try {

                const usuarioSession = sessionStorage.getItem('usuario');
                let parsedUser = null;
                if (usuarioSession) {
                    parsedUser = JSON.parse(usuarioSession);
                    setUserRole(parsedUser.rol);
                }

                const data = await getMateriales();
                if (Array.isArray(data)) {
                    setMateriales(data);
                } else {
                    showErrorAlert('Error', 'No se pudieron cargar los materiales.');
                }

                try {
                    if (parsedUser.rol === 'jefe_cuadrilla') {
                        const mis = await getMisSolicitudes();
                        if (Array.isArray(mis)) setMisSolicitudes(mis);
                    }
                    if (parsedUser.rol === 'encargado_inventario' || parsedUser.rol === 'administrador') {
                        const all = await getSolicitudes();
                        if (Array.isArray(all)) setSolicitudesEncargado(all);
                    }
                } catch (err) { console.error('Error cargando solicitudes', err); }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const refrescarTabla = async () => {
        const data = await getMateriales();
        if (Array.isArray(data)) setMateriales(data);
    };

    const cargarMovimientos = async () => {
        const data = await getMovimientos();
        if (Array.isArray(data)) setMovimientos(data);
    };

    const handleOpenMovimientos = async () => {
        setActiveTab('movimientos');
        if (movimientos.length === 0) {
            await cargarMovimientos();
        }
    };



    const handleSubmitMaterial = async (e) => {
        e.preventDefault();
        const response = await crearMaterial(nuevoMaterial);

        if (response.status === "Success" || response.id) {
            showSuccessAlert('¡Creado!', 'El material ha sido registrado correctamente.');
            setShowModalMaterial(false);
            setNuevoMaterial({ nombre: '', descripcion: '', unidadMedida: '', stockMinimo: 0 });
            refrescarTabla();
        } else {
            showErrorAlert('Error', response.message || 'No se pudo crear el material.');
        }
    };

    const handleSubmitMovimiento = async (e) => {
        e.preventDefault();
        // Construir payload según si se usa material existente o se crea uno nuevo
        let payload;
        if (nuevoMovimiento.materialId && nuevoMovimiento.materialId !== 'new') {
            payload = {
                materialId: parseInt(nuevoMovimiento.materialId),
                tipo: nuevoMovimiento.tipo,
                cantidad: parseInt(nuevoMovimiento.cantidad),
                observacion: nuevoMovimiento.observacion ?? null,
            };
        } else if (nuevoMovimiento.materialId === 'new') {
            payload = {
                materialNombre: nuevoMovimiento.newMaterialNombre,
                unidadMedida: nuevoMovimiento.newMaterialUnidad || 'unid.',
                descripcion: nuevoMovimiento.newMaterialDescripcion || null,
                tipo: nuevoMovimiento.tipo,
                cantidad: parseInt(nuevoMovimiento.cantidad),
                observacion: nuevoMovimiento.observacion ?? null,
            };
        } else {
            showErrorAlert('Error', 'Seleccione o ingrese un material');
            return;
        }

        const response = await registrarMovimiento(payload);
        if (response.status === "Success" || response.id) {
            showSuccessAlert('Éxito', 'El movimiento de stock fue registrado.');
            setShowModalMovimiento(false);
            setNuevoMovimiento({ materialId: '', tipo: 'entrada', cantidad: 1, observacion: '', newMaterialNombre: '', newMaterialUnidad: '', newMaterialDescripcion: '' });
            refrescarTabla();
        } else {
            showErrorAlert('Error de Inventario', response.message || 'Verifique el stock disponible.');
        }
    };

    const handleSubmitSolicitud = async (e) => {
        e.preventDefault();
        const payload = {
            ...nuevaSolicitud,
            materialId: parseInt(nuevaSolicitud.materialId),
            cantidad: parseInt(nuevaSolicitud.cantidad)
        };

        const response = await solicitarMaterial({ ...payload, ubicacion: nuevaSolicitud.ubicacion });
        if (response && (response.status === "Success" || response.id)) {
            showSuccessAlert('Enviado', 'La solicitud fue enviada al Encargado de Inventario.');
            setShowModalSolicitud(false);
            setNuevaSolicitud({ materialId: '', cantidad: 1, observacion: '', ubicacion: '' });
            // refrescar listas desde API
            try {
                const mis = await getMisSolicitudes();
                if (Array.isArray(mis)) setMisSolicitudes(mis);
                const all = await getSolicitudes();
                if (Array.isArray(all)) setSolicitudesEncargado(all);
            } catch (err) { console.error(err) }
        } else {
            showErrorAlert('Error', response.message || 'No se pudo procesar la solicitud.');
        }
    };

    if (loading) return <div className="loading-container">Cargando inventario...</div>;

    return (
        <div className="inventario-page">
            <div className="header-section">
                <h1>Panel de Control de Inventario</h1>
                <p>Bienvenido. Tu rol actual es: <strong>{userRole}</strong></p>

                {/* Botonera dinámica según roles */}
                <div className="action-buttons">
                    {(userRole === 'administrador' || userRole === 'encargado_inventario') && (
                        <>
                            <button className={`btn btn-primary tab-link ${activeTab === 'materiales' ? 'active' : ''}`} onClick={() => setActiveTab('materiales')}>
                                Materiales
                            </button>
                            <button className={`btn btn-primary tab-link ${activeTab === 'movimientos' ? 'active' : ''}`} onClick={handleOpenMovimientos}>
                                Historial de movimientos
                            </button>
                            <button className="btn btn-secondary" onClick={() => setShowModalMovimiento(true)}>
                                Registrar Entrada/Salida
                            </button>
                        </>
                    )}
                    {userRole === 'jefe_cuadrilla' && (
                        <button className="btn btn-success" onClick={() => setShowModalSolicitud(true)}>
                            Solicitar Material para Cuadrilla
                        </button>
                    )}
                </div>
            </div>

            {/* Tabla de Existencias (oculta para jefe de cuadrilla) */}
            {userRole !== 'jefe_cuadrilla' ? (
                <>
                    {activeTab === 'materiales' && (
                        <div className="table-container">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Descripción</th>
                                        <th>Stock Actual</th>
                                        <th>Mínimo Requerido</th>
                                        <th>U. Medida</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materiales.map((material) => {
                                        const esStockBajo = material.stockActual <= material.stockMinimo;
                                        return (
                                            <tr key={material.id} className={esStockBajo ? 'row-alert-stock' : ''}>
                                                <td><strong>{material.nombre}</strong></td>
                                                <td>{material.descripcion || 'Sin descripción'}</td>
                                                <td className="stock-number">{material.stockActual}</td>
                                                <td>{material.stockMinimo}</td>
                                                <td><span className="badge-unit">{material.unidadMedida}</span></td>
                                                <td>
                                                    {esStockBajo ? (
                                                        <span className="status-badge critico">Crítico</span>
                                                    ) : (
                                                        <span className="status-badge ok">Óptimo</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'movimientos' && (
                        <div className="table-container" style={{ marginTop: '20px' }}>
                            <div className="header-section movimientos-header" style={{ marginBottom: '10px' }}>
                                <div>
                                    <h1>Historial de movimientos</h1>
                                    <p>Entradas, salidas y responsable de cada cambio.</p>
                                </div>
                            </div>
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Material</th>
                                        <th>Tipo</th>
                                        <th>Cantidad</th>
                                        <th>Realizado por</th>
                                        <th>Observación</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movimientos.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center">No hay movimientos registrados.</td>
                                        </tr>
                                    ) : (
                                        movimientos.map((movimiento) => (
                                            <tr key={movimiento.id}>
                                                <td>{new Date(movimiento.fecha || movimiento.createdAt).toLocaleString()}</td>
                                                <td>{movimiento.material?.nombre || '—'}</td>
                                                <td>{movimiento.tipo}</td>
                                                <td>{movimiento.cantidad}</td>
                                                <td>{movimiento.responsable?.nombreCompleto || movimiento.responsable?.email || `ID: ${movimiento.responsableId}`}</td>
                                                <td>{movimiento.observacion || '—'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            ) : (
                <div>
                    {userRole === 'jefe_cuadrilla' && (
                        <div className="solicitudes-jefe">
                            <h3>Mis Solicitudes</h3>
                            {misSolicitudes.length === 0 ? (
                                <p>No has realizado solicitudes aún.</p>
                            ) : (
                                <table className="custom-table">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Material</th>
                                            <th>Cantidad</th>
                                            <th>Ubicación</th>
                                            <th>Observación</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {misSolicitudes.map(s => (
                                            <tr key={s.id}>
                                                <td>{new Date(s.createdAt || s.fecha).toLocaleString()}</td>
                                                <td>{s.material?.nombre || s.materialNombre || '—'}</td>
                                                <td>{s.cantidad}</td>
                                                <td>{s.ubicacion || '—'}</td>
                                                <td>{s.observacion}</td>
                                                <td>{s.estado}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {userRole === 'encargado_inventario' && (
                        <div className="solicitudes-encargado">
                            <h3>Solicitudes pendientes</h3>
                            {solicitudesEncargado.length === 0 ? (
                                <p>No hay solicitudes pendientes.</p>
                            ) : (
                                <table className="custom-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Fecha</th>
                                            <th>Material</th>
                                            <th>Cantidad</th>
                                            <th>Ubicación</th>
                                            <th>Observación</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {solicitudesEncargado.map(s => (
                                            <tr key={s.id}>
                                                <td>{s.id}</td>
                                                <td>{new Date(s.createdAt || s.fecha).toLocaleString()}</td>
                                                <td>{s.material?.nombre || '—'}</td>
                                                <td>{s.cantidad}</td>
                                                <td>{s.ubicacion || '—'}</td>
                                                <td>{s.observacion}</td>
                                                <td>{s.estado}</td>
                                                <td>
                                                    <button onClick={async () => { await actualizarEstadoSolicitud(s.id, 'aceptada'); const all = await getSolicitudes(); setSolicitudesEncargado(all); }}>Aceptar</button>
                                                    <button onClick={async () => { await actualizarEstadoSolicitud(s.id, 'en_camino'); const all = await getSolicitudes(); setSolicitudesEncargado(all); }}>En camino</button>
                                                    <button onClick={async () => { await actualizarEstadoSolicitud(s.id, 'entregada'); const all = await getSolicitudes(); setSolicitudesEncargado(all); }}>Entregado</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* MODAL 1: NUEVO MATERIAL */}
            {showModalMaterial && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Registrar Nuevo Material en Catálogo</h2>
                        <form onSubmit={handleSubmitMaterial}>
                            <label>Nombre del Material:</label>
                            <input type="text" required value={nuevoMaterial.nombre} onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, nombre: e.target.value })} />

                            <label>Descripción:</label>
                            <textarea value={nuevoMaterial.descripcion} onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, descripcion: e.target.value })} />

                            <label>Unidad de Medida (Ej: Kg, Unidades, Litros):</label>
                            <input type="text" required value={nuevoMaterial.unidadMedida} onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, unidadMedida: e.target.value })} />

                            <label>Stock Mínimo de Seguridad:</label>
                            <input type="number" min="0" required value={nuevoMaterial.stockMinimo} onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, stockMinimo: parseInt(e.target.value) })} />

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModalMaterial(false)}>Cancelar</button>
                                <button type="submit" className="btn-submit">Guardar Material</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: REGISTRAR MOVIMIENTO (ENTRADA/SALIDA) */}
            {showModalMovimiento && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Registrar Movimiento de Bodega</h2>
                        <form onSubmit={handleSubmitMovimiento}>
                            <label>Seleccione el Material:</label>
                            <select required value={nuevoMovimiento.materialId} onChange={(e) => setNuevoMovimiento({
                                ...nuevoMovimiento,
                                materialId: e.target.value,
                                observacion: e.target.value === 'new' ? '' : nuevoMovimiento.observacion,
                            })}>
                                <option value="">-- Seleccionar --</option>
                                <option value="new">-- Crear nuevo material --</option>
                                {materiales.map(m => (
                                    <option key={m.id} value={m.id}>{m.nombre} (Disponibles: {m.stockActual})</option>
                                ))}
                            </select>

                            {nuevoMovimiento.materialId === 'new' && (
                                <>
                                    <label>Nombre del nuevo material:</label>
                                    <input required type="text" value={nuevoMovimiento.newMaterialNombre} onChange={(e) => setNuevoMovimiento({ ...nuevoMovimiento, newMaterialNombre: e.target.value })} />

                                    <label>Descripción del nuevo material:</label>
                                    <textarea
                                        value={nuevoMovimiento.newMaterialDescripcion}
                                        onChange={(e) => setNuevoMovimiento({ ...nuevoMovimiento, newMaterialDescripcion: e.target.value })}
                                        placeholder="Ej: Material para uso general en cuadrilla"
                                    />

                                    <label>Unidad de medida:</label>
                                    <input required type="text" value={nuevoMovimiento.newMaterialUnidad} onChange={(e) => setNuevoMovimiento({ ...nuevoMovimiento, newMaterialUnidad: e.target.value })} placeholder="Ej: unid., Kg" />
                                </>
                            )}

                            <label>Tipo de Flujo:</label>
                            <select value={nuevoMovimiento.tipo} onChange={(e) => setNuevoMovimiento({ ...nuevoMovimiento, tipo: e.target.value })}>
                                <option value="entrada">Entrada (+) (Abastecimiento)</option>
                                <option value="salida">Salida (-) (Despacho a terreno)</option>
                            </select>

                            <label>Cantidad:</label>
                            <input type="number" min="1" required value={nuevoMovimiento.cantidad} onChange={(e) => setNuevoMovimiento({ ...nuevoMovimiento, cantidad: e.target.value })} />

                            {nuevoMovimiento.materialId && nuevoMovimiento.materialId !== 'new' && (
                                <>
                                    <label>Descripción del movimiento:</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Salida para obra sector norte"
                                        value={nuevoMovimiento.observacion}
                                        onChange={(e) => setNuevoMovimiento({ ...nuevoMovimiento, observacion: e.target.value })}
                                    />
                                </>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModalMovimiento(false)}>Cancelar</button>
                                <button type="submit" className="btn-submit">Procesar Stock</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: SOLICITAR MATERIAL (JEFE DE CUADRILLA) */}
            {showModalSolicitud && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Formulario de Requerimiento de Materiales</h2>
                        <form onSubmit={handleSubmitSolicitud}>
                            <label>Material Necesario:</label>
                            <select required value={nuevaSolicitud.materialId} onChange={(e) => setNuevaSolicitud({ ...nuevaSolicitud, materialId: e.target.value })}>
                                <option value="">-- Seleccionar --</option>
                                {materiales.map(m => (
                                    <option key={m.id} value={m.id}>{m.nombre} ({m.unidadMedida})</option>
                                ))}
                            </select>

                            <label>Cantidad Solicitada:</label>
                            <input type="number" min="1" required value={nuevaSolicitud.cantidad} onChange={(e) => setNuevaSolicitud({ ...nuevaSolicitud, cantidad: e.target.value })} />

                            <label>Detalle de la Faena u Observaciones:</label>
                            <textarea placeholder="Ej: Para reparaciones en sector Norte..." value={nuevaSolicitud.observacion} onChange={(e) => setNuevaSolicitud({ ...nuevaSolicitud, observacion: e.target.value })} />

                            <label>Ubicación / Dirección de despacho:</label>
                            <input type="text" placeholder="Ej: Sector Norte - Avenida 123" value={nuevaSolicitud.ubicacion} onChange={(e) => setNuevaSolicitud({ ...nuevaSolicitud, ubicacion: e.target.value })} />

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModalSolicitud(false)}>Cancelar</button>
                                <button type="submit" className="btn-success">Enviar Requerimiento</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}