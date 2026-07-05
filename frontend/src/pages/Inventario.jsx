"use strict";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { getCuadrillas } from '@services/cuadrilla.service.js';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';
import '@styles/inventario.css'; // Asegúrate de crear este archivo de estilos o integrarlo a styles.css

export default function Inventario() {
    const navigate = useNavigate();
    // 1. Estados globales de la página
    const [materiales, setMateriales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');

    // 2. Estados para controlar ventanas emergentes (Modales)
    const [showModalMaterial, setShowModalMaterial] = useState(false);
    const [showModalMovimiento, setShowModalMovimiento] = useState(false);
    const [showModalSolicitud, setShowModalSolicitud] = useState(false);
    const [activeTab, setActiveTab] = useState('materiales');
    const [viewState, setViewState] = useState('hub');

    // 3. Estados para capturar los datos de los formularios
    const [nuevoMaterial, setNuevoMaterial] = useState({ nombre: '', descripcion: '', unidadMedida: '', stockMinimo: 0 });
    const [nuevoMovimiento, setNuevoMovimiento] = useState({ materialId: '', tipo: 'entrada', cantidad: 1, observacion: '', newMaterialNombre: '', newMaterialUnidad: '', newMaterialDescripcion: '' });
    const [nuevaSolicitud, setNuevaSolicitud] = useState({ materialId: '', cantidad: 1, observacion: '', ubicacion: '' });
    const [misSolicitudes, setMisSolicitudes] = useState([]);
    const [solicitudesEncargado, setSolicitudesEncargado] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [cuadrillaInfo, setCuadrillaInfo] = useState(null);
    const [filtroMaterial, setFiltroMaterial] = useState('');
    const [filtroFecha, setFiltroFecha] = useState('');
    const [filtroHistMaterial, setFiltroHistMaterial] = useState('');
    const [filtroHistFecha, setFiltroHistFecha] = useState('');
    const [filtroNombre, setFiltroNombre] = useState('');
    const [filtroStockMax, setFiltroStockMax] = useState('');


    useEffect(() => {
        const fetchInitialData = async () => {
            try {

                const usuarioSession = sessionStorage.getItem('usuario');
                let parsedUser = null;
                if (usuarioSession) {
                    parsedUser = JSON.parse(usuarioSession);
                    setUserRole(parsedUser.rol);
                    // Cargar info de cuadrilla del jefe si está disponible en sesión
                    if (parsedUser.cuadrilla) {
                        setCuadrillaInfo(parsedUser.cuadrilla);
                    }
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
                        // Cargar la cuadrilla del jefe
                        const cuadrillasData = await getCuadrillas();
                        if (Array.isArray(cuadrillasData) && cuadrillasData.length > 0) {
                            setCuadrillaInfo(cuadrillasData[0]);
                        }
                    }
                    if (parsedUser.rol === 'encargado_inventario' || parsedUser.rol === 'super_admin') {
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

    const handleScrollToSolicitudes = () => {
        const element = document.getElementById('solicitudes-pendientes-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
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

    const handleOpenMovimientosFromHub = async () => {
        setViewState('movimientos');
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
        if (!nuevoMovimiento.materialId) {
            showErrorAlert('Error', 'Seleccione un material.');
            return;
        }

        const payload = {
            materialId: parseInt(nuevoMovimiento.materialId),
            tipo: nuevoMovimiento.tipo,
            cantidad: parseInt(nuevoMovimiento.cantidad),
            observacion: nuevoMovimiento.observacion ?? null,
        };

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
            {viewState === 'hub' && (
                <>
                    <div className="header-section">
                        <div>
                            <h1 style={{ color: '#0b3b5a', margin: 0 }}>Panel de Control de Inventario</h1>
                            <p style={{ color: '#4b6077', marginTop: 4 }}>Bienvenido. Tu rol actual es: <strong style={{ textTransform: 'capitalize' }}>{userRole?.replace('_', ' ')}</strong></p>
                        </div>
                        <div className="action-buttons">
                            <button className="btn btn-back" onClick={() => navigate('/home')}>
                                ← Volver
                            </button>
                        </div>
                    </div>

                    <div className="hub-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '30px' }}>
                        {(userRole === 'super_admin' || userRole === 'encargado_inventario') && (
                            <>
                                <div className="hub-card" onClick={() => setViewState('materiales')}>
                                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📦</div>
                                    <h3 style={{ margin: '0 0 8px 0', color: '#0b3b5a' }}>Materiales</h3>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Ver catálogo de materiales existentes y niveles de stock.</p>
                                </div>

                                <div className="hub-card" onClick={handleOpenMovimientosFromHub}>
                                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
                                    <h3 style={{ margin: '0 0 8px 0', color: '#0b3b5a' }}>Historial de Materiales</h3>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Revisar el registro de entradas y salidas de bodega.</p>
                                </div>

                                <div className="hub-card" onClick={() => setViewState('solicitudes')}>
                                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔔</div>
                                    <h3 style={{ margin: '0 0 8px 0', color: '#0b3b5a' }}>Solicitudes Pendientes</h3>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                                        Gestionar solicitudes de cuadrilla ({solicitudesEncargado.filter(s => s.estado === 'pendiente').length} pendientes)
                                    </p>
                                </div>
                            </>
                        )}
                        {userRole === 'jefe_cuadrilla' && (
                            <>
                                <div className="hub-card" onClick={() => setViewState('solicitudes')}>
                                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
                                    <h3 style={{ margin: '0 0 8px 0', color: '#0b3b5a' }}>Mis Solicitudes</h3>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Ver el estado de tus solicitudes enviadas.</p>
                                </div>

                                <div className="hub-card" onClick={() => setShowModalSolicitud(true)} style={{ borderLeft: '4px solid #15803d' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>➕</div>
                                    <h3 style={{ margin: '0 0 8px 0', color: '#15803d' }}>Nueva Solicitud</h3>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Solicitar materiales adicionales para tu cuadrilla.</p>
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}

            {viewState === 'materiales' && (
                <>
                    <div className="header-section">
                        <div>
                            <h1 style={{ color: '#0b3b5a', margin: 0 }}>Catálogo de Materiales</h1>
                            <p style={{ color: '#4b6077', marginTop: 4 }}>Visualiza los niveles de stock existentes.</p>
                        </div>
                        <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-back" onClick={() => setViewState('hub')}>
                                ← Volver
                            </button>
                            {(userRole === 'super_admin' || userRole === 'encargado_inventario') && (
                                <>
                                    <button className="btn btn-secondary" onClick={() => setShowModalMaterial(true)}>
                                        Crear Material
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => setShowModalMovimiento(true)}>
                                        Abastecer Stock
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="table-container">

                        {/* Filtros del catálogo */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ flex: 2, minWidth: '200px' }}>
                                <input
                                    type="text"
                                    placeholder="🔍 Buscar por nombre..."
                                    value={filtroNombre}
                                    onChange={(e) => setFiltroNombre(e.target.value)}
                                    style={{
                                        width: '100%', padding: '9px 14px', borderRadius: '8px',
                                        border: '1px solid #e2e8f0', fontSize: '14px',
                                        outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ fontSize: '13px', color: '#4b6077', whiteSpace: 'nowrap', fontWeight: '600' }}>
                                    Stock ≤
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Ej: 5"
                                    value={filtroStockMax}
                                    onChange={(e) => setFiltroStockMax(e.target.value)}
                                    style={{
                                        width: '100%', padding: '9px 14px', borderRadius: '8px',
                                        border: '1px solid #e2e8f0', fontSize: '14px',
                                        outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => setFiltroStockMax(String(0))}
                                    title="Mostrar solo materiales con stock crítico"
                                    style={{
                                        padding: '9px 14px', borderRadius: '8px',
                                        border: '1px solid #fca5a5', background: '#fff5f5',
                                        color: '#dc2626', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                                    }}
                                >
                                    ⚠️ Stock crítico
                                </button>
                                {(filtroNombre || filtroStockMax !== '') && (
                                    <button
                                        onClick={() => { setFiltroNombre(''); setFiltroStockMax(''); }}
                                        style={{
                                            padding: '9px 14px', borderRadius: '8px',
                                            border: '1px solid #e2e8f0', background: '#f8fafc',
                                            color: '#64748b', cursor: 'pointer', fontSize: '13px'
                                        }}
                                    >
                                        ✕ Limpiar
                                    </button>
                                )}
                            </div>
                        </div>

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
                                {(() => {
                                    const materialesFiltrados = materiales.filter(m => {
                                        const coincideNombre = !filtroNombre || m.nombre.toLowerCase().includes(filtroNombre.toLowerCase());
                                        const coincideStock = filtroStockMax === '' || m.stockActual <= Number(filtroStockMax);
                                        return coincideNombre && coincideStock;
                                    });

                                    if (materialesFiltrados.length === 0) {
                                        return (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                                                    🔍 No se encontraron materiales con esos criterios.
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return materialesFiltrados.map((material) => {
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
                                    });
                                })()}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {viewState === 'movimientos' && (
                <>
                    <div className="header-section">
                        <div>
                            <h1 style={{ color: '#0b3b5a', margin: 0 }}>Historial de Materiales</h1>
                            <p style={{ color: '#4b6077', marginTop: 4 }}>Entradas, salidas y responsable de cada cambio.</p>
                        </div>
                        <div className="action-buttons">
                            <button className="btn btn-back" onClick={() => setViewState('hub')}>
                                ← Volver
                            </button>
                        </div>
                    </div>

                    <div className="table-container">

                        {/* Filtros del historial */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <input
                                    type="text"
                                    placeholder="🔍 Buscar por material..."
                                    value={filtroHistMaterial}
                                    onChange={(e) => setFiltroHistMaterial(e.target.value)}
                                    style={{
                                        width: '100%', padding: '9px 14px', borderRadius: '8px',
                                        border: '1px solid #e2e8f0', fontSize: '14px',
                                        outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: '180px' }}>
                                <input
                                    type="date"
                                    value={filtroHistFecha}
                                    onChange={(e) => setFiltroHistFecha(e.target.value)}
                                    style={{
                                        width: '100%', padding: '9px 14px', borderRadius: '8px',
                                        border: '1px solid #e2e8f0', fontSize: '14px',
                                        outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                                    }}
                                />
                            </div>
                            {(filtroHistMaterial || filtroHistFecha) && (
                                <button
                                    onClick={() => { setFiltroHistMaterial(''); setFiltroHistFecha(''); }}
                                    style={{
                                        padding: '9px 16px', borderRadius: '8px',
                                        border: '1px solid #fca5a5', background: '#fff5f5',
                                        color: '#dc2626', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                                    }}
                                >
                                    ✕ Limpiar filtros
                                </button>
                            )}
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
                                {(() => {
                                    const movimientosFiltrados = movimientos.filter(m => {
                                        const nombre = (m.material?.nombre || '').toLowerCase();
                                        const fechaMov = new Date(m.fecha || m.createdAt).toISOString().split('T')[0];
                                        const coincideMat = !filtroHistMaterial || nombre.includes(filtroHistMaterial.toLowerCase());
                                        const coincideFecha = !filtroHistFecha || fechaMov === filtroHistFecha;
                                        return coincideMat && coincideFecha;
                                    });

                                    if (movimientos.length === 0) {
                                        return (
                                            <tr><td colSpan="6" className="text-center">No hay movimientos registrados.</td></tr>
                                        );
                                    }
                                    if (movimientosFiltrados.length === 0) {
                                        return (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                                                    🔍 No se encontraron movimientos con esos filtros.
                                                </td>
                                            </tr>
                                        );
                                    }
                                    return movimientosFiltrados.map((movimiento) => (
                                        <tr key={movimiento.id}>
                                            <td>{new Date(movimiento.fecha || movimiento.createdAt).toLocaleString()}</td>
                                            <td>{movimiento.material?.nombre || '—'}</td>
                                            <td>{movimiento.tipo}</td>
                                            <td>{movimiento.cantidad}</td>
                                            <td>{movimiento.responsable?.nombreCompleto || movimiento.responsable?.email || `ID: ${movimiento.responsableId}`}</td>
                                            <td>{movimiento.observacion || '—'}</td>
                                        </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {viewState === 'solicitudes' && (
                <>
                    <div className="header-section">
                        <div>
                            <h1 style={{ color: '#0b3b5a', margin: 0 }}>
                                {userRole === 'jefe_cuadrilla' ? 'Mis Solicitudes' : 'Solicitudes Pendientes'}
                            </h1>
                            <p style={{ color: '#4b6077', marginTop: 4 }}>
                                {userRole === 'jefe_cuadrilla' ? 'Listado de tus requerimientos de obra' : 'Solicitudes de materiales de cuadrilla.'}
                            </p>
                        </div>
                        <div className="action-buttons">
                            <button className="btn btn-back" onClick={() => setViewState('hub')}>
                                ← Volver
                            </button>
                            {userRole === 'jefe_cuadrilla' && (
                                <button className="btn btn-success" onClick={() => setShowModalSolicitud(true)}>
                                    Solicitar Material para Cuadrilla
                                </button>
                            )}
                        </div>
                    </div>

                    {userRole !== 'jefe_cuadrilla' ? (
                        <div className="solicitudes-encargado">
                            {solicitudesEncargado.length === 0 ? (
                                <p>No hay solicitudes pendientes.</p>
                            ) : (
                                <table className="custom-table">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Cuadrilla</th>
                                            <th>Solicitante</th>
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
                                                <td>{new Date(s.createdAt || s.fecha).toLocaleString()}</td>
                                                <td style={{ fontWeight: '600', color: '#0b5ca8' }}>
                                                    {s.solicitante?.cuadrilla?.nombre || s.solicitante?.nombreCompleto || '—'}
                                                </td>
                                                <td>{s.solicitante?.nombreCompleto || '—'}</td>
                                                <td>{s.material?.nombre || '—'}</td>
                                                <td>{s.cantidad}</td>
                                                <td>{s.ubicacion || '—'}</td>
                                                <td>{s.observacion}</td>
                                                <td>{s.estado}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ marginRight: 8, padding: '6px 10px', fontSize: '12px' }}
                                                        onClick={async () => { await actualizarEstadoSolicitud(s.id, 'aceptada'); const all = await getSolicitudes(); setSolicitudesEncargado(all); }}
                                                    >
                                                        Aceptar
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary"
                                                        style={{ marginRight: 8, padding: '6px 10px', fontSize: '12px' }}
                                                        onClick={async () => { await actualizarEstadoSolicitud(s.id, 'en_camino'); const all = await getSolicitudes(); setSolicitudesEncargado(all); }}
                                                    >
                                                        En camino
                                                    </button>
                                                    <button
                                                        className="btn btn-success"
                                                        style={{ padding: '6px 10px', fontSize: '12px' }}
                                                        onClick={async () => { await actualizarEstadoSolicitud(s.id, 'entregada'); const all = await getSolicitudes(); setSolicitudesEncargado(all); }}
                                                    >
                                                        Entregado
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    ) : (
                        <div className="solicitudes-jefe">
                            {/* Barra de filtros */}
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <input
                                        type="text"
                                        placeholder="🔍 Buscar por material..."
                                        value={filtroMaterial}
                                        onChange={(e) => setFiltroMaterial(e.target.value)}
                                        style={{
                                            width: '100%', padding: '9px 14px', borderRadius: '8px',
                                            border: '1px solid #e2e8f0', fontSize: '14px',
                                            outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1, minWidth: '180px' }}>
                                    <input
                                        type="date"
                                        value={filtroFecha}
                                        onChange={(e) => setFiltroFecha(e.target.value)}
                                        style={{
                                            width: '100%', padding: '9px 14px', borderRadius: '8px',
                                            border: '1px solid #e2e8f0', fontSize: '14px',
                                            outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                                        }}
                                    />
                                </div>
                                {(filtroMaterial || filtroFecha) && (
                                    <button
                                        onClick={() => { setFiltroMaterial(''); setFiltroFecha(''); }}
                                        style={{
                                            padding: '9px 16px', borderRadius: '8px',
                                            border: '1px solid #fca5a5', background: '#fff5f5',
                                            color: '#dc2626', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                                        }}
                                    >
                                        ✕ Limpiar filtros
                                    </button>
                                )}
                            </div>

                            {misSolicitudes.length === 0 ? (
                                <p>No has realizado solicitudes aún.</p>
                            ) : (() => {
                                const solicitudesFiltradas = misSolicitudes.filter(s => {
                                    const nombreMaterial = (s.material?.nombre || s.materialNombre || '').toLowerCase();
                                    const fechaSolicitud = new Date(s.createdAt || s.fecha).toISOString().split('T')[0];
                                    const coincideMaterial = !filtroMaterial || nombreMaterial.includes(filtroMaterial.toLowerCase());
                                    const coincideFecha = !filtroFecha || fechaSolicitud === filtroFecha;
                                    return coincideMaterial && coincideFecha;
                                });

                                return solicitudesFiltradas.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                                        <p style={{ fontSize: '32px', margin: 0 }}>🔍</p>
                                        <p>No se encontraron solicitudes con esos filtros.</p>
                                    </div>
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
                                            {solicitudesFiltradas.map(s => (
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
                                );
                            })()}
                        </div>
                    )}
                </>
            )}

            {/* MODAL 1: NUEVO MATERIAL */}
            {showModalMaterial && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Crear Nuevo Material</h2>
                        <form onSubmit={handleSubmitMaterial}>
                            <label>Nombre del Material:</label>
                            <input type="text" required value={nuevoMaterial.nombre} onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, nombre: e.target.value })} />

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
                        <h2>Abastecer Stock de Material</h2>
                        <form onSubmit={handleSubmitMovimiento}>
                            <label>Seleccione el Material:</label>
                            <select required value={nuevoMovimiento.materialId} onChange={(e) => setNuevoMovimiento({
                                ...nuevoMovimiento,
                                materialId: e.target.value,
                                tipo: 'entrada' // Asegurar que sea entrada (abastecimiento)
                            })}>
                                <option value="">-- Seleccionar --</option>
                                {materiales.map(m => (
                                    <option key={m.id} value={m.id}>{m.nombre} (Disponibles: {m.stockActual})</option>
                                ))}
                            </select>

                            <label>Cantidad a Ingresar:</label>
                            <input type="number" min="1" required value={nuevoMovimiento.cantidad} onChange={(e) => setNuevoMovimiento({ ...nuevoMovimiento, cantidad: e.target.value })} />

                            {nuevoMovimiento.materialId && (
                                <>
                                    <label>Observaciones de abastecimiento (opcional):</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Compra de insumos o ingreso por proveedor"
                                        value={nuevoMovimiento.observacion}
                                        onChange={(e) => setNuevoMovimiento({ ...nuevoMovimiento, observacion: e.target.value })}
                                    />
                                </>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModalMovimiento(false)}>Cancelar</button>
                                <button type="submit" className="btn-submit">Confirmar Abastecimiento</button>
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

                            {/* Mostrar cuadrilla del jefe solicitante */}
                            {cuadrillaInfo && (
                                <div style={{
                                    background: '#f0f7ff',
                                    border: '1px solid #bfdbfe',
                                    borderRadius: '8px',
                                    padding: '12px 16px',
                                    marginBottom: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <span style={{ fontSize: '20px' }}>👥</span>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Cuadrilla Solicitante</p>
                                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0b5ca8' }}>{cuadrillaInfo.nombre}</p>
                                    </div>
                                </div>
                            )}

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