import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '@components/Form';
import Table from '@components/Table';
import { postAsistencia, postHerramientas, postBitacora } from '@services/jornada.service';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert';

const DashboardJornada = () => {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    const asistenciaFields = [
        { label: "RUT Voluntario", name: "rut", type: "text", placeholder: "12.345.678-9" },
        { label: "Estado Abordaje", name: "estado", type: "select", options: [
            { value: "presente", label: "Abordó Transporte" },
            { value: "ausente", label: "No llegó" }
        ]}
    ];

    const herramientasFields = [
        { label: "ID del Kit", name: "kitId", type: "text" },
        { label: "Estado Entrega", name: "estadoEntrega", type: "select", options: [
            { value: "completo", label: "Kit Completo" },
            { value: "incompleto", label: "Incompleto / Dañado" }
        ]},
        { label: "Observaciones", name: "observaciones", type: "textarea" }
    ];

    const bitacoraFields = [
        { label: "Tipo de Evento", name: "tipo", type: "select", options: [
            { value: "accidente", label: "Accidente" },
            { value: "conflicto", label: "Conflicto" },
            { value: "recursos", label: "Falta de Recursos" }
        ]},
        { label: "Descripción", name: "descripcion", type: "textarea" }
    ];

    const handleFormSubmit = async (data, action) => {
        let res;
        if (step === 1) res = await postAsistencia(data);
        if (step === 2) {
            res = await postHerramientas(data);
            if (data.estadoEntrega === 'incompleto') {
                await postBitacora({
                    tipo: 'recursos',
                    descripcion: `Kit ${data.kitId} incompleto. ${data.observaciones || 'Sin observaciones adicionales'}`
                });
            }
        }
        if (step === 3) res = await postBitacora(data);

        if (res.status === 'Success') {
            showSuccessAlert('Registrado', 'La información se guardó correctamente');
        } else {
            showErrorAlert('Error', res.message || 'No se pudo guardar');
        }
    };

    return (
        <div className="main-container">
            <h1>Panel de Control - Jefe de Cuadrilla</h1>
            
            <div className="tabs-container" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button onClick={() => setStep(1)} className={step === 1 ? 'active' : ''} style={{ padding: '8px 12px' }}>1. Asistencia</button>
                <button onClick={() => setStep(2)} className={step === 2 ? 'active' : ''} style={{ padding: '8px 12px' }}>2. Herramientas</button>
                <button onClick={() => setStep(3)} className={step === 3 ? 'active' : ''} style={{ padding: '8px 12px' }}>3. Bitácora</button>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate('/asistencias')} style={{ padding: '8px 12px', backgroundColor: '#6c757d' }}>📋 Ver Asistencias</button>
                    <button onClick={() => navigate('/herramientas')} style={{ padding: '8px 12px', backgroundColor: '#6c757d' }}>🔧 Ver Actas</button>
                    <button onClick={() => navigate('/bitacora')} style={{ padding: '8px 12px', backgroundColor: '#6c757d' }}>📝 Ver Bitácora</button>
                    <button onClick={() => navigate('/kits')} style={{ padding: '8px 12px', backgroundColor: '#007bff' }}>🛠️ Kits</button>
                    <button onClick={() => navigate('/transporte')} style={{ padding: '8px 12px', backgroundColor: '#fd7e14' }}>🚌 Transporte</button>
                </div>
            </div>

            {step === 1 && (
                <section>
                    <h2>Validación de Abordaje</h2>
                    <Form 
                        fields={asistenciaFields} 
                        buttonText="Confirmar Asistencia" 
                        onSubmit={handleFormSubmit} 
                    />
                </section>
            )}

            {step === 2 && (
                <section>
                    <h2>Acta Digital de Herramientas</h2>
                    <Form 
                        fields={herramientasFields} 
                        buttonText="Registrar Estado" 
                        onSubmit={handleFormSubmit} 
                    />
                </section>
            )}

            {step === 3 && (
                <section>
                    <h2>Bitácora de Terreno</h2>
                    <Form 
                        fields={bitacoraFields} 
                        buttonText="Reportar Incidencia" 
                        onSubmit={handleFormSubmit} 
                    />
                </section>
            )}
        </div>
    );
};

export default DashboardJornada;