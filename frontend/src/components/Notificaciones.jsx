"use strict";
import React, { useState, useEffect } from 'react';
import { getNotificaciones, marcarNotificacionLeida } from '@services/notificacion.service.js';

const NotificacionesDropdown = ({ userRole }) => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Si no se pasa el rol como prop (cuando se usa como página), leer desde sessionStorage
    const sessionUser = JSON.parse(sessionStorage.getItem('usuario')) || {};
    const effectiveRole = userRole || sessionUser.rol;

    // Solo cargar notificaciones si el rol tiene acceso según tus rutas del backend
    const tieneAcceso = ['administrador', 'encargado_inventario'].includes(effectiveRole);

    const cargarNotificaciones = async () => {
        if (!tieneAcceso) return;
        const data = await getNotificaciones();
        if (Array.isArray(data)) {
            // Filtrar solo las no leídas para la insignia de la campana
            setNotificaciones(data.filter(n => !n.leida));
        }
    };

    useEffect(() => {
        cargarNotificaciones();
        // Opcional: Un intervalo para revisar alertas cada 30 segundos
        const interval = setInterval(cargarNotificaciones, 30000);
        return () => clearInterval(interval);
    }, [effectiveRole]);

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
            <div style={{ padding: '20px', color: '#0b3b5a', background: 'linear-gradient(180deg, #f7fbff 0%, #eef4fa 100%)', minHeight: '100vh' }}>
                <h2 style={{ marginTop: 0 }}>Notificaciones</h2>
                {notificaciones.length === 0 ? (
                    <p style={{ color: '#5b6b7c' }}>No tienes alertas pendientes.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {notificaciones.map(n => (
                            <li key={n.id} style={{ marginBottom: '12px', padding: '12px', background: '#ffffff', border: '1px solid #d7e3ef', borderRadius: '10px', boxShadow: '0 6px 18px rgba(11,59,90,0.06)' }}>
                                <div style={{ color: '#17324d' }}>{n.mensaje}</div>
                                <div style={{ marginTop: '8px' }}>
                                    <button onClick={() => handleMarcarLeida(n.id)} style={{ background: '#0b5ca8', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>Marcar como leída</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
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