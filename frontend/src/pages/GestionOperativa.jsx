"use strict";
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Inventario from '@pages/Inventario';
import Incidencias from '@pages/Incidencias';
import '@styles/styles.css';
import '@styles/inventario.css';

export default function GestionOperativa() {
    const location = useLocation();
    const navigate = useNavigate();

    const userSession = sessionStorage.getItem('usuario');
    const userRole = userSession ? JSON.parse(userSession)?.rol : '';
    const showIncidenciasTab = userRole === 'administrador' || userRole === 'jefe_cuadrilla';

    const activeTab = (location.pathname === '/incidencias' && showIncidenciasTab) ? 'incidencias' : 'inventario';

    const handleTabChange = (tab) => {
        navigate(tab === 'incidencias' ? '/incidencias' : '/inventario');
    };

    return (
        <div className="gestion-operativa-page" style={{ paddingTop: '64px' }}>
            <div className="gestion-header" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
                <h1 style={{ color: '#0b3b5a', margin: 0 }}>Gestión operativa</h1>
                <p style={{ color: '#4b6077' }}>Bienvenido. Tu rol actual es: <strong style={{ textTransform: 'capitalize' }}>{userRole?.replace('_', ' ')}</strong></p>
                <div style={{ marginTop: 12 }}>
                    <button className={`tab-btn ${activeTab === 'inventario' ? 'active' : ''}`} onClick={() => handleTabChange('inventario')} style={{ marginRight: 10 }}>Inventario</button>
                    {showIncidenciasTab && (
                        <button className={`tab-btn ${activeTab === 'incidencias' ? 'active' : ''}`} onClick={() => handleTabChange('incidencias')}>Incidencias</button>
                    )}
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
                {activeTab === 'inventario' ? <Inventario /> : <Incidencias />}
            </div>
        </div>
    )
}
