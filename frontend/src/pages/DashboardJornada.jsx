import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '@components/Form';
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
import '@styles/jornada.css';
import '@styles/inventario.css';

const DashboardJornada = () => {
    const [viewState, setViewState] = useState('hub');
    const navigate = useNavigate();
    const { user } = useAuth();

    // Cuadrilla management states
    const [cuadrillas, setCuadrillas] = useState([]);
    const [cuadrilla, setCuadrilla] = useState(null);
    const [voluntarios, setVoluntarios] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [nombreCuadrilla, setNombreCuadrilla] = useState('');
    const [selectedVoluntarios, setSelectedVoluntarios] = useState([]);
    const [loadingCuadrilla, setLoadingCuadrilla] = useState(true);
    const [searchCuadrilla, setSearchCuadrilla] = useState('');
    const [cuadrillaView, setCuadrillaView] = useState('list'); // 'list', 'create', 'detail'

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
        if (viewState === 'cuadrillas') {
            fetchCuadrillaData();
        }
    }, [viewState]);

    const fetchCuadrillaData = async () => {
        setLoadingCuadrilla(true);
        try {
            const cuadrillasData = await getCuadrillas();
            if (Array.isArray(cuadrillasData)) {
                setCuadrillas(cuadrillasData);
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
        if (cuadrilla && cuadrillaView === 'detail') {
            res = await actualizarCuadrilla(cuadrilla.id, payload);
        } else {
            res = await crearCuadrilla(payload);
        }

        if (res && (res.status === 'Success' || res.data)) {
            showSuccessAlert('Guardado', 'La cuadrilla se guardó correctamente');
            setIsEditing(false);
            setCuadrillaView('list');
            fetchCuadrillaData();
        } else {
            showErrorAlert('Error', res.message || 'No se pudo guardar la cuadrilla');
        }
    };

    const openCreateCuadrilla = () => {
        setNombreCuadrilla('');
        setSelectedVoluntarios([]);
        setCuadrillaView('create');
    };

    const openDetailCuadrilla = (c) => {
        setCuadrilla(c);
        setNombreCuadrilla(c.nombre);
        setSelectedVoluntarios(c.miembros ? c.miembros.map(m => m.id) : []);
        setIsEditing(false);
        setCuadrillaView('detail');
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

        if (!volunteerFormEmail.endsWith('@gmail.cl') && !volunteerFormEmail.endsWith('@gmail.com')) {
            showErrorAlert('Error', 'El correo debe ser del dominio @gmail.cl o @gmail.com');
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

    const handleFormSubmit = async (data) => {
        let res;
        if (viewState === 'asistencia') res = await postAsistencia(data);
        if (viewState === 'herramientas') {
            res = await postHerramientas(data);
            if (data.estadoEntrega === 'incompleto') {
                await postBitacora({
                    tipo: 'recursos',
                    descripcion: `Kit ${data.kitId} incompleto. ${data.observaciones || 'Sin observaciones adicionales'}`
                });
            }
        }
        if (viewState === 'bitacora') res = await postBitacora(data);

        if (res.status === 'Success') {
            showSuccessAlert('Registrado', 'La información se guardó correctamente');
        } else {
            showErrorAlert('Error', res.message || 'No se pudo guardar');
        }
    };

    const filteredCuadrillas = cuadrillas.filter(c =>
        c.nombre?.toLowerCase().includes(searchCuadrilla.toLowerCase())
    );

    // ============================
    // RENDER: Cuadrilla Form (shared between create and edit)
    // ============================
    const renderCuadrillaForm = () => (
        <form onSubmit={handleSaveCuadrilla}>
            <div className="cuadrilla-form-group">
                <label>Nombre de la Cuadrilla</label>
                <input
                    type="text"
                    value={nombreCuadrilla}
                    onChange={(e) => setNombreCuadrilla(e.target.value)}
                    placeholder="Ej. Cuadrilla Santiago Centro"
                    required
                />
            </div>

            <div className="cuadrilla-form-group">
                <div className="volunteer-select-header">
                    <label style={{ margin: 0 }}>Seleccionar Miembros (Máximo 10)</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className={`volunteer-count ${selectedVoluntarios.length === 10 ? 'full' : ''}`}>
                            {selectedVoluntarios.length} / 10
                        </span>
                        <button
                            type="button"
                            onClick={openAddVolunteer}
                            className="btn-primary btn-sm"
                            style={{ fontSize: '13px' }}
                        >
                            ➕ Nuevo Voluntario
                        </button>
                    </div>
                </div>

                <div className="volunteer-select-list">
                    {voluntarios.length === 0 ? (
                        <div className="jornada-empty-state">
                            <div className="empty-icon">👥</div>
                            <p>No hay voluntarios aprobados disponibles.</p>
                        </div>
                    ) : (
                        voluntarios.map(v => {
                            const isChecked = selectedVoluntarios.includes(v.id);
                            const isDisabled = !isChecked && selectedVoluntarios.length >= 10;
                            return (
                                <div key={v.id} className={`volunteer-select-item ${isDisabled ? 'disabled' : ''}`}>
                                    <input
                                        type="checkbox"
                                        id={`vol-${v.id}`}
                                        checked={isChecked}
                                        disabled={isDisabled}
                                        onChange={() => handleCheckboxChange(v.id)}
                                    />
                                    <div className="vol-info">
                                        <label htmlFor={`vol-${v.id}`} style={{ cursor: isDisabled ? 'not-allowed' : 'pointer', display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, margin: 0 }}>
                                            <span className="vol-name">{v.nombreCompleto}</span>
                                            <span className="vol-rut">{v.rut}</span>
                                            <span className="vol-email">{v.email}</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => openEditVolunteer(v)}
                                            className="vol-edit-btn"
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

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                    type="button"
                    className="btn btn-back"
                    onClick={() => {
                        setCuadrillaView('list');
                        setIsEditing(false);
                    }}
                >
                    Cancelar
                </button>
                <button type="submit" className="btn-primary">
                    💾 {cuadrillaView === 'create' ? 'Crear Cuadrilla' : 'Guardar Cambios'}
                </button>
            </div>
        </form>
    );

    return (
        <div className="jornada-page">
            {/* ====== HUB VIEW ====== */}
            {viewState === 'hub' && (
                <>
                    <div className="header-section">
                        <div>
                            <h1 style={{ color: '#0b3b5a', margin: 0 }}>
                                Panel de Control - {user?.rol === 'super_admin' ? 'Administrador' : 'Jefe de Cuadrilla'}
                            </h1>
                            <p style={{ color: '#4b6077', marginTop: 4 }}>
                                Bienvenido. Tu rol actual es: <strong style={{ textTransform: 'capitalize' }}>{user?.rol?.replace('_', ' ')}</strong>
                            </p>
                        </div>
                        <div className="action-buttons">
                            <button className="btn btn-back" onClick={() => navigate('/home')}>
                                ← Volver
                            </button>
                        </div>
                    </div>

                    <p className="jornada-section-label">Gestión de Jornada</p>
                    <div className="jornada-hub-grid">
                        <div className="jornada-hub-card card-asistencia" onClick={() => setViewState('asistencia')}>
                            <div className="card-icon">📋</div>
                            <h3 className="card-title">Asistencia</h3>
                            <p className="card-desc">Validar abordaje de voluntarios al transporte.</p>
                        </div>

                        <div className="jornada-hub-card card-herramientas" onClick={() => setViewState('herramientas')}>
                            <div className="card-icon">🔧</div>
                            <h3 className="card-title">Herramientas</h3>
                            <p className="card-desc">Registrar estado de entrega de kits de herramientas.</p>
                        </div>

                        <div className="jornada-hub-card card-bitacora" onClick={() => setViewState('bitacora')}>
                            <div className="card-icon">📝</div>
                            <h3 className="card-title">Bitácora</h3>
                            <p className="card-desc">Reportar incidencias y eventos de terreno.</p>
                        </div>

                        <div className="jornada-hub-card card-cuadrilla" onClick={() => setViewState('cuadrillas')}>
                            <div className="card-icon">👥</div>
                            <h3 className="card-title">Cuadrillas</h3>
                            <p className="card-desc">Gestionar cuadrillas, crear nuevas y asignar miembros.</p>
                        </div>
                    </div>

                    <p className="jornada-section-label">Consultas Rápidas</p>
                    <div className="jornada-hub-grid">
                        <div className="jornada-hub-card card-nav" onClick={() => navigate('/asistencias')}>
                            <div className="card-icon">📊</div>
                            <h3 className="card-title">Ver Asistencias</h3>
                            <p className="card-desc">Consultar registros de asistencia.</p>
                        </div>

                        <div className="jornada-hub-card card-nav" onClick={() => navigate('/herramientas')}>
                            <div className="card-icon">📄</div>
                            <h3 className="card-title">Ver Actas</h3>
                            <p className="card-desc">Revisar actas digitales de herramientas.</p>
                        </div>

                        <div className="jornada-hub-card card-nav" onClick={() => navigate('/bitacora')}>
                            <div className="card-icon">📑</div>
                            <h3 className="card-title">Ver Bitácora</h3>
                            <p className="card-desc">Revisar historial de la bitácora de terreno.</p>
                        </div>

                        <div className="jornada-hub-card card-nav" onClick={() => navigate('/kits')} style={{ borderLeft: '4px solid #0b5ca8' }}>
                            <div className="card-icon">🧰</div>
                            <h3 className="card-title">Kits</h3>
                            <p className="card-desc">Gestionar kits de herramientas.</p>
                        </div>

                        <div className="jornada-hub-card card-nav" onClick={() => navigate('/transporte')} style={{ borderLeft: '4px solid #f59e0b' }}>
                            <div className="card-icon">🚐</div>
                            <h3 className="card-title">Transporte</h3>
                            <p className="card-desc">Administrar el transporte de cuadrillas.</p>
                        </div>
                    </div>
                </>
            )}

            {/* ====== ASISTENCIA VIEW ====== */}
            {viewState === 'asistencia' && (
                <>
                    <div className="header-section">
                        <div>
                            <h1 style={{ color: '#0b3b5a', margin: 0 }}>Validación de Abordaje</h1>
                            <p style={{ color: '#4b6077', marginTop: 4 }}>Registra la asistencia de los voluntarios al transporte.</p>
                        </div>
                        <div className="action-buttons">
                            <button className="btn btn-back" onClick={() => setViewState('hub')}>← Volver</button>
                        </div>
                    </div>
                    <div className="jornada-form-panel">
                        <Form
                            fields={asistenciaFields}
                            buttonText="Confirmar Asistencia"
                            onSubmit={handleFormSubmit}
                        />
                    </div>
                </>
            )}

            {/* ====== HERRAMIENTAS VIEW ====== */}
            {viewState === 'herramientas' && (
                <>
                    <div className="header-section">
                        <div>
                            <h1 style={{ color: '#0b3b5a', margin: 0 }}>Acta Digital de Herramientas</h1>
                            <p style={{ color: '#4b6077', marginTop: 4 }}>Registra el estado de los kits entregados.</p>
                        </div>
                        <div className="action-buttons">
                            <button className="btn btn-back" onClick={() => setViewState('hub')}>← Volver</button>
                        </div>
                    </div>
                    <div className="jornada-form-panel">
                        <Form
                            fields={herramientasFields}
                            buttonText="Registrar Estado"
                            onSubmit={handleFormSubmit}
                        />
                    </div>
                </>
            )}

            {/* ====== BITÁCORA VIEW ====== */}
            {viewState === 'bitacora' && (
                <>
                    <div className="header-section">
                        <div>
                            <h1 style={{ color: '#0b3b5a', margin: 0 }}>Bitácora de Terreno</h1>
                            <p style={{ color: '#4b6077', marginTop: 4 }}>Reporta eventos, accidentes o falta de recursos.</p>
                        </div>
                        <div className="action-buttons">
                            <button className="btn btn-back" onClick={() => setViewState('hub')}>← Volver</button>
                        </div>
                    </div>
                    <div className="jornada-form-panel">
                        <Form
                            fields={bitacoraFields}
                            buttonText="Reportar Incidencia"
                            onSubmit={handleFormSubmit}
                        />
                    </div>
                </>
            )}

            {/* ====== CUADRILLAS VIEW ====== */}
            {viewState === 'cuadrillas' && (
                <>
                    <div className="header-section">
                        <div>
                            <h1 style={{ color: '#0b3b5a', margin: 0 }}>
                                {cuadrillaView === 'list' && 'Gestión de Cuadrillas'}
                                {cuadrillaView === 'create' && 'Crear Nueva Cuadrilla'}
                                {cuadrillaView === 'detail' && (isEditing ? 'Editar Cuadrilla' : cuadrilla?.nombre || 'Detalle de Cuadrilla')}
                            </h1>
                            <p style={{ color: '#4b6077', marginTop: 4 }}>
                                {cuadrillaView === 'list' && 'Busca, crea y administra las cuadrillas del proyecto.'}
                                {cuadrillaView === 'create' && 'Asigna un nombre y selecciona los miembros.'}
                                {cuadrillaView === 'detail' && (isEditing ? 'Modifica los datos y miembros de la cuadrilla.' : 'Información detallada de la cuadrilla.')}
                            </p>
                        </div>
                        <div className="action-buttons" style={{ gap: '8px' }}>
                            <button
                                className="btn btn-back"
                                onClick={() => {
                                    if (cuadrillaView === 'list') {
                                        setViewState('hub');
                                    } else {
                                        setCuadrillaView('list');
                                        setIsEditing(false);
                                    }
                                }}
                            >
                                ← Volver
                            </button>
                            {cuadrillaView === 'list' && (
                                <button className="btn-primary" onClick={openCreateCuadrilla}>
                                    ➕ Nueva Cuadrilla
                                </button>
                            )}
                            {cuadrillaView === 'detail' && !isEditing && (
                                <button className="btn-primary" onClick={() => setIsEditing(true)}>
                                    ✏️ Editar Cuadrilla
                                </button>
                            )}
                        </div>
                    </div>

                    {loadingCuadrilla ? (
                        <div className="jornada-empty-state">
                            <div className="empty-icon">⏳</div>
                            <p>Cargando datos de cuadrillas...</p>
                        </div>
                    ) : (
                        <>
                            {/* LIST VIEW */}
                            {cuadrillaView === 'list' && (
                                <>
                                    <div className="cuadrilla-search-bar">
                                        <input
                                            type="text"
                                            placeholder="🔍 Buscar cuadrilla por nombre..."
                                            value={searchCuadrilla}
                                            onChange={(e) => setSearchCuadrilla(e.target.value)}
                                        />
                                    </div>

                                    {filteredCuadrillas.length === 0 ? (
                                        <div className="jornada-empty-state">
                                            <div className="empty-icon">👥</div>
                                            <p>{searchCuadrilla ? 'No se encontraron cuadrillas con ese nombre.' : 'No hay cuadrillas creadas aún. Crea la primera.'}</p>
                                        </div>
                                    ) : (
                                        <div className="cuadrilla-list">
                                            {filteredCuadrillas.map(c => (
                                                <div key={c.id} className="cuadrilla-item" onClick={() => openDetailCuadrilla(c)}>
                                                    <div className="cuadrilla-info">
                                                        <span className="cuadrilla-name">🏡 {c.nombre}</span>
                                                        <div className="cuadrilla-meta">
                                                            <span className="cuadrilla-badge members">
                                                                👥 {c.miembros?.length || 0} / 10 miembros
                                                            </span>
                                                            {c.jefeCuadrilla && (
                                                                <span className="cuadrilla-badge leader">
                                                                    👤 {c.jefeCuadrilla.nombreCompleto}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="cuadrilla-actions">
                                                        <button
                                                            className="btn-primary btn-sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openDetailCuadrilla(c);
                                                            }}
                                                        >
                                                            Ver Detalle
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* CREATE VIEW */}
                            {cuadrillaView === 'create' && (
                                <div className="cuadrilla-create-form">
                                    <h2>Nueva Cuadrilla</h2>
                                    <p className="form-subtitle">Completa los datos y selecciona los voluntarios para la nueva cuadrilla.</p>
                                    {renderCuadrillaForm()}
                                </div>
                            )}

                            {/* DETAIL VIEW */}
                            {cuadrillaView === 'detail' && cuadrilla && (
                                <>
                                    {isEditing ? (
                                        <div className="cuadrilla-create-form">
                                            <h2>Editando: {cuadrilla.nombre}</h2>
                                            <p className="form-subtitle">Modifica el nombre o los miembros de la cuadrilla.</p>
                                            {renderCuadrillaForm()}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="cuadrilla-detail-card">
                                                <div className="detail-info">
                                                    <h3>🏡 {cuadrilla.nombre}</h3>
                                                    <p>Jefe de Cuadrilla: <strong>{cuadrilla.jefeCuadrilla?.nombreCompleto || '—'}</strong></p>
                                                </div>
                                                <span className="cuadrilla-badge members" style={{ fontSize: '14px', padding: '6px 14px' }}>
                                                    {cuadrilla.miembros?.length || 0} / 10 miembros
                                                </span>
                                            </div>

                                            <div className="members-table-wrapper">
                                                <h3>Miembros de la Cuadrilla</h3>
                                                <table className="custom-table">
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
                                                                <td colSpan="3" style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>
                                                                    Esta cuadrilla no tiene miembros asignados. Haz clic en "Editar Cuadrilla" para agregar voluntarios.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            cuadrilla.miembros.map(m => (
                                                                <tr key={m.id}>
                                                                    <td style={{ fontWeight: '600' }}>{m.nombreCompleto}</td>
                                                                    <td>{m.rut}</td>
                                                                    <td>{m.email}</td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </>
            )}

            {/* ====== VOLUNTEER MODAL ====== */}
            {showVolunteerModal && (
                <div className="jornada-modal-overlay">
                    <div className="jornada-modal">
                        <button
                            className="modal-close"
                            onClick={() => setShowVolunteerModal(false)}
                        >
                            ✕
                        </button>
                        <h2>{editingVolunteer ? 'Editar Voluntario' : 'Crear Nuevo Voluntario'}</h2>
                        <form onSubmit={handleSaveVolunteer}>
                            <div className="form-group">
                                <label>Nombre Completo</label>
                                <input
                                    type="text"
                                    value={volunteerFormName}
                                    onChange={(e) => setVolunteerFormName(e.target.value)}
                                    placeholder="Diego Alexis Salazar Jara"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>RUT</label>
                                <input
                                    type="text"
                                    value={volunteerFormRut}
                                    onChange={(e) => setVolunteerFormRut(e.target.value)}
                                    placeholder="21.308.770-3"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Correo Electrónico</label>
                                <input
                                    type="email"
                                    value={volunteerFormEmail}
                                    onChange={(e) => setVolunteerFormEmail(e.target.value)}
                                    placeholder="ejemplo@gmail.cl"
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={() => setShowVolunteerModal(false)}
                                    className="btn btn-back"
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    💾 Guardar
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