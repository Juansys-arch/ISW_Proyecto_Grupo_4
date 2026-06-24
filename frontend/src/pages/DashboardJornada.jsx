import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '@components/Form';
import Table from '@components/Table';
import { postAsistencia, postHerramientas, postBitacora } from '@services/jornada.service';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert';
import { useAuth } from '@context/AuthContext';
import { 
    getCuadrillas, 
    getVoluntariosDisponibles, 
    crearCuadrilla, 
    actualizarCuadrilla,
    crearVoluntario,
    actualizarVoluntario
} from '@services/cuadrilla.service';

const DashboardJornada = () => {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Cuadrilla management states
    const [cuadrilla, setCuadrilla] = useState(null);
    const [voluntarios, setVoluntarios] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [nombreCuadrilla, setNombreCuadrilla] = useState('');
    const [selectedVoluntarios, setSelectedVoluntarios] = useState([]);
    const [loadingCuadrilla, setLoadingCuadrilla] = useState(true);

    // Volunteer modal states
    const [showVolunteerModal, setShowVolunteerModal] = useState(false);
    const [editingVolunteer, setEditingVolunteer] = useState(null);
    const [volunteerFormName, setVolunteerFormName] = useState('');
    const [volunteerFormRut, setVolunteerFormRut] = useState('');
    const [volunteerFormEmail, setVolunteerFormEmail] = useState('');

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

    useEffect(() => {
        if (step === 4) {
            fetchCuadrillaData();
        }
    }, [step]);

    const fetchCuadrillaData = async () => {
        setLoadingCuadrilla(true);
        try {
            const cuadrillasData = await getCuadrillas();
            // Find crew managed by this user
            const userCrew = cuadrillasData.find(c => c.jefeCuadrillaId === user?.id) || cuadrillasData[0];
            
            if (userCrew) {
                setCuadrilla(userCrew);
                setNombreCuadrilla(userCrew.nombre);
                setSelectedVoluntarios(userCrew.miembros ? userCrew.miembros.map(m => m.id) : []);
            } else {
                setCuadrilla(null);
                setNombreCuadrilla('');
                setSelectedVoluntarios([]);
            }

            const vols = await getVoluntariosDisponibles();
            if (Array.isArray(vols)) {
                setVoluntarios(vols);
            }
        } catch (error) {
            console.error("Error al cargar datos de cuadrilla:", error);
        } finally {
            setLoadingCuadrilla(false);
        }
    };

    const handleCheckboxChange = (volId) => {
        if (selectedVoluntarios.includes(volId)) {
            setSelectedVoluntarios(selectedVoluntarios.filter(id => id !== volId));
        } else {
            if (selectedVoluntarios.length >= 10) {
                showErrorAlert('Límite alcanzado', 'No puedes seleccionar más de 10 personas en la cuadrilla.');
                return;
            }
            setSelectedVoluntarios([...selectedVoluntarios, volId]);
        }
    };

    const handleSaveCuadrilla = async (e) => {
        e.preventDefault();

        if (selectedVoluntarios.length > 10) {
            showErrorAlert('Error', 'Una cuadrilla no puede tener más de 10 personas.');
            return;
        }

        if (!nombreCuadrilla.trim()) {
            showErrorAlert('Error', 'El nombre de la cuadrilla es obligatorio.');
            return;
        }

        const payload = {
            nombre: nombreCuadrilla,
            miembrosIds: selectedVoluntarios
        };

        let res;
        if (cuadrilla) {
            res = await actualizarCuadrilla(cuadrilla.id, payload);
        } else {
            res = await crearCuadrilla(payload);
        }

        if (res && (res.status === 'Success' || res.data)) {
            showSuccessAlert('Guardado', 'La cuadrilla se guardó correctamente');
            setIsEditing(false);
            fetchCuadrillaData();
        } else {
            showErrorAlert('Error', res.message || 'No se pudo guardar la cuadrilla');
        }
    };

    const openAddVolunteer = () => {
        setEditingVolunteer(null);
        setVolunteerFormName('');
        setVolunteerFormRut('');
        setVolunteerFormEmail('');
        setShowVolunteerModal(true);
    };

    const openEditVolunteer = (vol) => {
        setEditingVolunteer(vol);
        setVolunteerFormName(vol.nombreCompleto);
        setVolunteerFormRut(vol.rut);
        setVolunteerFormEmail(vol.email);
        setShowVolunteerModal(true);
    };

    const handleSaveVolunteer = async (e) => {
        e.preventDefault();

        if (!volunteerFormName.trim() || !volunteerFormRut.trim() || !volunteerFormEmail.trim()) {
            showErrorAlert('Error', 'Todos los campos son obligatorios.');
            return;
        }

        if (!volunteerFormEmail.endsWith('@gmail.cl')) {
            showErrorAlert('Error', 'El correo debe ser del dominio @gmail.cl');
            return;
        }

        const payload = {
            nombreCompleto: volunteerFormName,
            rut: volunteerFormRut,
            email: volunteerFormEmail
        };

        let res;
        if (editingVolunteer) {
            res = await actualizarVoluntario(editingVolunteer.id, payload);
        } else {
            res = await crearVoluntario(payload);
        }

        if (res && (res.status === 'Success' || res.data)) {
            showSuccessAlert('Éxito', editingVolunteer ? 'Voluntario actualizado correctamente' : 'Voluntario creado correctamente');
            setShowVolunteerModal(false);
            fetchCuadrillaData();
        } else {
            showErrorAlert('Error', res.message || 'Error al guardar el voluntario');
        }
    };

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
            <h1>Panel de Control - {user?.rol === 'administrador' ? 'Administrador' : 'Jefe de Cuadrilla'}</h1>
            
            <div className="tabs-container" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button onClick={() => setStep(1)} className={step === 1 ? 'active' : ''} style={{ padding: '8px 12px' }}>1. Asistencia</button>
                <button onClick={() => setStep(2)} className={step === 2 ? 'active' : ''} style={{ padding: '8px 12px' }}>2. Herramientas</button>
                <button onClick={() => setStep(3)} className={step === 3 ? 'active' : ''} style={{ padding: '8px 12px' }}>3. Bitácora</button>
                <button onClick={() => setStep(4)} className={step === 4 ? 'active' : ''} style={{ padding: '8px 12px' }}>4. Cuadrilla</button>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate('/asistencias')} style={{ padding: '8px 12px', backgroundColor: '#6c757d' }}>Ver Asistencias</button>
                    <button onClick={() => navigate('/herramientas')} style={{ padding: '8px 12px', backgroundColor: '#6c757d' }}>Ver Actas</button>
                    <button onClick={() => navigate('/bitacora')} style={{ padding: '8px 12px', backgroundColor: '#6c757d' }}>Ver Bitácora</button>
                    <button onClick={() => navigate('/kits')} style={{ padding: '8px 12px', backgroundColor: '#007bff' }}>Kits</button>
                    <button onClick={() => navigate('/transporte')} style={{ padding: '8px 12px', backgroundColor: '#fd7e14' }}>Transporte</button>
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

            {step === 4 && (
                <section style={{ animation: 'fadeIn 0.4s ease-out' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
                        <h2>Gestión de Cuadrilla</h2>
                        {cuadrilla && !isEditing && (
                            <button onClick={() => setIsEditing(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                ✏️ Gestionar Miembros
                            </button>
                        )}
                        {isEditing && (
                            <button onClick={() => setIsEditing(false)} className="btn-secondary" style={{ backgroundColor: '#6c757d', color: '#fff' }}>
                                Cancelar
                            </button>
                        )}
                    </div>

                    {loadingCuadrilla ? (
                        <p>Cargando datos de la cuadrilla...</p>
                    ) : !cuadrilla || isEditing ? (
                        <div className="form-wrapper">
                            <form onSubmit={handleSaveCuadrilla}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--gray-800)' }}>
                                        Nombre de la Cuadrilla
                                    </label>
                                    <input 
                                        type="text" 
                                        value={nombreCuadrilla}
                                        onChange={(e) => setNombreCuadrilla(e.target.value)}
                                        placeholder="Ej. Cuadrilla Santiago Centro"
                                        required
                                        style={{ maxWidth: '400px' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                                        <label style={{ display: 'block', fontWeight: '600', color: 'var(--gray-800)', margin: 0 }}>
                                            Seleccionar Miembros (Máximo 10)
                                        </label>
                                        <button 
                                            type="button" 
                                            onClick={openAddVolunteer} 
                                            className="btn-primary btn-sm" 
                                            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                                        >
                                            ➕ Nuevo Voluntario
                                        </button>
                                    </div>
                                    <p style={{ color: selectedVoluntarios.length === 10 ? 'var(--danger)' : 'var(--gray-500)', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: '500' }}>
                                        Seleccionados: {selectedVoluntarios.length} / 10
                                    </p>

                                    <div style={{ 
                                        maxHeight: '300px', 
                                        overflowY: 'auto', 
                                        border: '1px solid var(--gray-200)', 
                                        borderRadius: 'var(--radius-md)',
                                        padding: '1rem',
                                        backgroundColor: '#fff'
                                    }}>
                                        {voluntarios.length === 0 ? (
                                            <p style={{ color: 'var(--gray-400)', textAlign: 'center' }}>No hay voluntarios aprobados disponibles.</p>
                                        ) : (
                                            voluntarios.map(v => {
                                                const isChecked = selectedVoluntarios.includes(v.id);
                                                const isDisabled = !isChecked && selectedVoluntarios.length >= 10;
                                                return (
                                                    <div key={v.id} style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        padding: '8px 12px', 
                                                        borderBottom: '1px solid var(--gray-100)',
                                                        opacity: isDisabled ? 0.6 : 1,
                                                        transition: 'opacity 0.2s'
                                                    }}>
                                                        <input 
                                                            type="checkbox" 
                                                            id={`vol-${v.id}`}
                                                            checked={isChecked}
                                                            disabled={isDisabled}
                                                            onChange={() => handleCheckboxChange(v.id)}
                                                            style={{ width: '18px', height: '18px', marginRight: '12px', cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                                                        />
                                                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                                            <label htmlFor={`vol-${v.id}`} style={{ cursor: isDisabled ? 'not-allowed' : 'pointer', flex: 1, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginRight: '10px' }}>
                                                                <span style={{ fontWeight: '500', color: 'var(--gray-800)' }}>{v.nombreCompleto}</span>
                                                                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>{v.rut}</span>
                                                                <span style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>{v.email}</span>
                                                            </label>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => openEditVolunteer(v)} 
                                                                className="btn-warning btn-sm" 
                                                                style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '4px' }}
                                                            >
                                                                ✏️ Editar
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <button type="submit" className="btn-primary">
                                        💾 {cuadrilla ? 'Guardar Cambios' : 'Crear Cuadrilla'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="alert-banner alert-success" style={{ display: 'block' }}>
                                <h3 style={{ margin: 0, color: '#166534', fontSize: '1.25rem' }}>🏡 {cuadrilla.nombre}</h3>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.95rem' }}>
                                    Jefe de Cuadrilla: <strong>{cuadrilla.jefeCuadrilla?.nombreCompleto}</strong>
                                </p>
                            </div>

                            <div className="table-container">
                                <h3>Miembros de la Cuadrilla ({cuadrilla.miembros?.length || 0} / 10)</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Nombre Completo</th>
                                            <th>RUT</th>
                                            <th>Correo Electrónico</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!cuadrilla.miembros || cuadrilla.miembros.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" style={{ textAlign: 'center', color: 'var(--gray-400)' }}>
                                                    Esta cuadrilla no tiene miembros asignados aún. Haz clic en "Gestionar Miembros" para agregar voluntarios.
                                                </td>
                                            </tr>
                                        ) : (
                                            cuadrilla.miembros.map(m => (
                                                <tr key={m.id}>
                                                    <td style={{ fontWeight: '500' }}>{m.nombreCompleto}</td>
                                                    <td>{m.rut}</td>
                                                    <td>{m.email}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* Volunteer Creation/Edition Modal */}
            {showVolunteerModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div className="main-container" style={{
                        maxWidth: '500px',
                        margin: '20px',
                        padding: '2rem',
                        position: 'relative',
                        backgroundColor: '#fff'
                    }}>
                        <button 
                            onClick={() => setShowVolunteerModal(false)}
                            style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                boxShadow: 'none',
                                padding: 0
                            }}
                        >
                            ✕
                        </button>
                        <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
                            {editingVolunteer ? 'Editar Voluntario' : 'Crear Nuevo Voluntario'}
                        </h2>
                        <form onSubmit={handleSaveVolunteer}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--gray-800)' }}>
                                    Nombre Completo
                                </label>
                                <input 
                                    type="text"
                                    value={volunteerFormName}
                                    onChange={(e) => setVolunteerFormName(e.target.value)}
                                    placeholder="Diego Alexis Salazar Jara"
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--gray-800)' }}>
                                    RUT
                                </label>
                                <input 
                                    type="text"
                                    value={volunteerFormRut}
                                    onChange={(e) => setVolunteerFormRut(e.target.value)}
                                    placeholder="21.308.770-3"
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--gray-800)' }}>
                                    Correo Electrónico
                                </label>
                                <input 
                                    type="email"
                                    value={volunteerFormEmail}
                                    onChange={(e) => setVolunteerFormEmail(e.target.value)}
                                    placeholder="ejemplo@gmail.cl"
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn-primary">
                                    💾 Guardar
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setShowVolunteerModal(false)} 
                                    className="btn-secondary"
                                    style={{ backgroundColor: '#6c757d', color: '#fff' }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardJornada;