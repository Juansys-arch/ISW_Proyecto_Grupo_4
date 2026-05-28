"use strict";
import React, { useState } from 'react';
import Inventario from '@pages/Inventario';
import Incidencias from '@pages/Incidencias';
import '@styles/styles.css';
import '@styles/inventario.css';

export default function GestionOperativa(){
    const [activeTab, setActiveTab] = useState('inventario'); // 'inventario' | 'incidencias'

    return (
        <div className="gestion-operativa-page" style={{paddingTop: '64px'}}>
            <div className="gestion-header" style={{maxWidth:1200, margin:'0 auto', padding:'20px'}}>
                <h1 style={{color:'#0b3b5a', margin:0}}>Gestión operativa</h1>
                <p style={{color:'#4b6077'}}>Bienvenido. Tu rol actual es: <strong>{/* role shown inside child components */}</strong></p>
                <div style={{marginTop:12}}>
                    <button className={`tab-btn ${activeTab==='inventario'?'active':''}`} onClick={()=>setActiveTab('inventario')} style={{marginRight:10}}>Inventario</button>
                    <button className={`tab-btn ${activeTab==='incidencias'?'active':''}`} onClick={()=>setActiveTab('incidencias')}>Incidencias</button>
                </div>
            </div>

            <div style={{maxWidth:1200, margin:'0 auto', padding:20}}>
                {activeTab === 'inventario' ? <Inventario/> : <Incidencias/>}
            </div>
        </div>
    )
}
