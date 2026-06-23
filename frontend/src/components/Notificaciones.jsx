"use strict";
import { useState, useEffect, useCallback } from 'react';
import { obtenerNotificaciones, marcarNotificacionLeida } from '@services/notificacion.service.js';

const NotificacionesDropdown = ({ userRole }) => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Si no se pasa el rol como prop (cuando se usa como página), leer desde sessionStorage
    const sessionUser = JSON.parse(sessionStorage.getItem('usuario')) || {};
    const effectiveRole = userRole || sessionUser.rol;

    // Solo cargar notificaciones si el rol tiene acceso según tus rutas del backend
    const tieneAcceso = ['administrador', 'encargado_inventario', 'jefe_cuadrilla'].includes(effectiveRole);

    const cargarNotificaciones = useCallback(async () => {
        if (!tieneAcceso) return;
        const data = await obtenerNotificaciones();
        if (Array.isArray(data)) {
            // Filtrar solo las no leídas para la insignia de la campana aaaaa
            setNotificaciones(data.filter(n => !n.leida));
        }
    }, [tieneAcceso]);

    useEffect(() => {
        cargarNotificaciones();
        // Opcional: Un intervalo para revisar alertas cada 30 segundos
        const interval = setInterval(cargarNotificaciones, 30000);
        return () => clearInterval(interval);
    }, [cargarNotificaciones]);

    const handleMarcarLeida = async (id) => {
        const response = await marcarNotificacionLeida(id);
        if (response && (response.status === "Success" || response.message)) {
            setNotificaciones((prev) => prev.filter(n => n.id !== id));
        }
    };

    if (!tieneAcceso) return null;

    // Si la vista actual es la página /notificaciones, mostrar lista en página completa
    const isPageView = typeof window !== 'undefined' && window.location.pathname === '/notificaciones';

    if (isPageView) {
        return (
            <div style={{ backgroundColor: "#f5f7fa", minHeight: "100vh", paddingTop: "20px", paddingBottom: "40px" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
                    <h1 style={{ color: "#333", marginBottom: "30px" }}>Centro de Notificaciones</h1>
                    
                    {notificaciones.length === 0 ? (
                        <div style={{
                            backgroundColor: "white",
                            borderRadius: "12px",
                            padding: "60px 40px",
                            textAlign: "center",
                            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)"
                        }}>
                            <div style={{ fontSize: "48px", marginBottom: "20px" }}>📬</div>
                            <p style={{ color: "#666", fontSize: "18px", marginBottom: "10px" }}>
                                No tienes notificaciones pendientes
                            </p>
                            <p style={{ color: "#999", fontSize: "14px" }}>
                                Aquí aparecerán tus notificaciones del sistema
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                            gap: "20px"
                        }}>
                            {notificaciones.map(n => (
                                <div key={n.id} style={{
                                    backgroundColor: "white",
                                    borderRadius: "12px",
                                    padding: "24px",
                                    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
                                    borderLeft: "4px solid #764ba2",
                                    transition: "all 0.3s ease",
                                    cursor: "pointer",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "12px"
                                }}>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "start"
                                    }}>
                                        <div style={{
                                            fontSize: "20px",
                                            display: "inline-block"
                                        }}>
                                            ℹ️
                                        </div>
                                        <span style={{
                                            backgroundColor: "#764ba2",
                                            color: "white",
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            fontSize: "11px",
                                            fontWeight: "600"
                                        }}>
                                            {n.tipo || "Sistema"}
                                        </span>
                                    </div>
                                    
                                    <p style={{
                                        color: "#333",
                                        fontSize: "16px",
                                        fontWeight: "500",
                                        margin: "0"
                                    }}>
                                        {n.mensaje}
                                    </p>
                                    
                                    {n.descripcion && (
                                        <p style={{
                                            color: "#666",
                                            fontSize: "14px",
                                            margin: "0"
                                        }}>
                                            {n.descripcion}
                                        </p>
                                    )}
                                    
                                    <div style={{
                                        display: "flex",
                                        gap: "10px",
                                        marginTop: "12px"
                                    }}>
                                        <button
                                            onClick={() => handleMarcarLeida(n.id)}
                                            style={{
                                                backgroundColor: "#764ba2",
                                                color: "white",
                                                border: "none",
                                                padding: "8px 16px",
                                                borderRadius: "6px",
                                                cursor: "pointer",
                                                fontSize: "14px",
                                                fontWeight: "600",
                                                flex: "1"
                                            }}
                                        >
                                            Marcar como leída
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="notificaciones-container" style={{ position: 'relative', inlineSize: 'fit-content' }}>
            <button className="campana-btn" onClick={() => setIsOpen(!isOpen)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>
                🔔 {notificaciones.length > 0 && <span className="badge-campana" style={{ position: 'absolute', insetBlockStart: '-5px', insetInlineEnd: '-5px', background: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem' }}>{notificaciones.length}</span>}
            </button>

            {isOpen && (
                <div className="dropdown-notificaciones" style={{ position: 'absolute', insetInlineEnd: 0, insetBlockStart: '30px', background: '#ffffff', border: '1px solid #d7e3ef', borderRadius: '10px', minWidth: '280px', zIndex: 100, padding: '10px', boxShadow: '0px 12px 28px rgba(11,59,90,0.12)' }}>
                    <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #e5eef6', paddingBottom: '5px', color: '#0b3b5a' }}>Alertas del Sistema</h4>
                    {notificaciones.length === 0 ? (
                        <p style={{ fontSize: '0.9rem', color: '#5b6b7c', margin: '5px 0' }}>No tienes alertas pendientes.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto' }}>
                            {notificaciones.map(n => (
                                <li key={n.id} style={{ fontSize: '0.85rem', color: '#17324d', padding: '8px 0', borderBottom: '1px solid #edf2f7', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <span>{n.mensaje}</span>
                                    <button
                                        onClick={() => handleMarcarLeida(n.id)}
                                        style={{ alignSelf: 'flex-end', background: '#0b5ca8', color: '#fff', border: 'none', borderRadius: '6px', padding: '2px 6px', fontSize: '0.75rem', cursor: 'pointer' }}
                                    >
                                        Marcar como leída
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificacionesDropdown;