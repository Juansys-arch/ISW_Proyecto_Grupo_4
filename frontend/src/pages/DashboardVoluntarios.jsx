import { useState, useEffect } from 'react';
import { createVolunteer, deleteVolunteer, getVolunteers, getRegionsList, updateVolunteer } from '../services/volunteer.service';
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert';

const initialVolunteerForm = {
  nombreCompleto: '',
  rut: '',
  email: '',
  fechaNacimiento: '',
  genero: 'masculino',
  numeroContacto: '',
  direccion: '',
  region: '',
  comuna: '',
  disponibilidad: '',
};

export default function DashboardVoluntarios() {
  const [volunteers, setVolunteers] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedComunas, setSelectedComunas] = useState([]);
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [volunteerForm, setVolunteerForm] = useState(initialVolunteerForm);
  const [savingVolunteer, setSavingVolunteer] = useState(false);

  const fetchVolunteers = async () => {
    setLoading(true);
    const data = await getVolunteers();
    setLoading(false);
    if (Array.isArray(data)) {
      setVolunteers(data);
    } else {
      setVolunteers([]);
    }
  };

  const fetchRegions = async () => {
    const data = await getRegionsList();
    if (Array.isArray(data)) {
      setRegions(data);
    } else {
      setRegions([]);
    }
  };

  useEffect(() => {
    fetchVolunteers();
    fetchRegions();
  }, []);

  const handleRoleChange = async (e, id) => {
    const newRole = e.target.value;
    const res = await updateVolunteer({ role: newRole }, id);
    if (res && !res.status?.includes('error')) {
      showSuccessAlert('Rol Actualizado', 'El rol del voluntario ha sido actualizado.');
      fetchVolunteers();
    } else {
      showErrorAlert('Error', 'No se pudo actualizar el rol.');
    }
  };

  const selectedRegionObj = regions.find((region) => region.region === selectedRegion);
  const comunas = selectedRegionObj ? selectedRegionObj.comunas : [];

  const handleRegionChange = (e) => {
    const regionValue = e.target.value;
    setSelectedRegion(regionValue);
    const regionObj = regions.find((region) => region.region === regionValue);
    setSelectedComunas(Array.isArray(regionObj?.comunas) ? regionObj.comunas : []);
  };

  const handleComunaChange = (e) => {
    const values = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedComunas(values);
  };

  const resetVolunteerForm = () => {
    setVolunteerForm(initialVolunteerForm);
    setEditingVolunteer(null);
  };

  const openCreateVolunteerForm = () => {
    resetVolunteerForm();
    setShowVolunteerForm(true);
  };

  const openEditVolunteerForm = (vol) => {
    setEditingVolunteer(vol);
    setVolunteerForm({
      nombreCompleto: vol.nombreCompleto || '',
      rut: vol.rut || '',
      email: vol.email || '',
      fechaNacimiento: vol.fechaNacimiento ? new Date(vol.fechaNacimiento).toISOString().split('T')[0] : '',
      genero: vol.genero || 'masculino',
      numeroContacto: vol.numeroContacto || '',
      direccion: vol.direccion || '',
      region: vol.region || '',
      comuna: vol.comuna || '',
      disponibilidad: vol.disponibilidad || '',
    });
    setShowVolunteerForm(true);
  };

  const handleVolunteerFormChange = (e) => {
    const { name, value } = e.target;
    setVolunteerForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();

    if (!volunteerForm.nombreCompleto || !volunteerForm.rut || !volunteerForm.email || !volunteerForm.fechaNacimiento || !volunteerForm.numeroContacto) {
      showErrorAlert('Datos incompletos', 'Completa los campos obligatorios para guardar el voluntario.');
      return;
    }

    const birthDate = new Date(volunteerForm.fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1;
    }

    if (age < 18 || age > 50) {
      showErrorAlert('Edad inválida', 'El voluntario debe tener entre 18 y 50 años.');
      return;
    }

    setSavingVolunteer(true);
    const payload = { ...volunteerForm };
    const res = editingVolunteer ? await updateVolunteer(payload, editingVolunteer.id) : await createVolunteer(payload);
    setSavingVolunteer(false);

    if (res && !res.status?.includes('error')) {
      showSuccessAlert(editingVolunteer ? 'Voluntario actualizado' : 'Voluntario creado', editingVolunteer ? 'Se actualizó el voluntario correctamente.' : 'Se creó el voluntario correctamente.');
      setShowVolunteerForm(false);
      resetVolunteerForm();
      fetchVolunteers();
    } else {
      showErrorAlert('Error', res?.message || 'No se pudo guardar el voluntario.');
    }
  };

  const handleDeleteVolunteer = async (vol) => {
    if (!window.confirm(`¿Deseas eliminar a ${vol.nombreCompleto || 'este voluntario'}?`)) return;

    const res = await deleteVolunteer(vol.id);
    if (res && !res.status?.includes('error')) {
      showSuccessAlert('Voluntario eliminado', 'El voluntario fue eliminado correctamente.');
      fetchVolunteers();
    } else {
      showErrorAlert('Error', res?.message || 'No se pudo eliminar el voluntario.');
    }
  };

  return (
    <div className="main-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '12px', flexWrap: 'wrap' }}>
        <h1 style={{ color: '#2b3452', fontSize: '28px', margin: 0 }}>Gestión de Voluntarios</h1>
        <button
          type="button"
          onClick={openCreateVolunteerForm}
          style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', fontWeight: 700 }}
        >
          + Crear voluntario
        </button>
      </div>

      {showVolunteerForm && (
        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)', position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '760px', borderRadius: '16px', padding: '20px', boxShadow: '0 16px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>{editingVolunteer ? 'Editar voluntario' : 'Crear voluntario'}</h3>
              <button type="button" onClick={() => { setShowVolunteerForm(false); resetVolunteerForm(); }} style={{ border: 'none', background: 'transparent', fontSize: '22px', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>

            <form onSubmit={handleVolunteerSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Nombre completo</label>
                  <input name="nombreCompleto" value={volunteerForm.nombreCompleto} onChange={handleVolunteerFormChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>RUT</label>
                  <input name="rut" value={volunteerForm.rut} onChange={handleVolunteerFormChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Email</label>
                  <input name="email" type="email" value={volunteerForm.email} onChange={handleVolunteerFormChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Fecha de nacimiento</label>
                  <input name="fechaNacimiento" type="date" value={volunteerForm.fechaNacimiento} onChange={handleVolunteerFormChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Género</label>
                  <select name="genero" value={volunteerForm.genero} onChange={handleVolunteerFormChange} style={inputStyle}>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Teléfono</label>
                  <input name="numeroContacto" value={volunteerForm.numeroContacto} onChange={handleVolunteerFormChange} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Dirección</label>
                  <input name="direccion" value={volunteerForm.direccion} onChange={handleVolunteerFormChange} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Región</label>
                  <input name="region" value={volunteerForm.region} onChange={handleVolunteerFormChange} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Comuna</label>
                  <input name="comuna" value={volunteerForm.comuna} onChange={handleVolunteerFormChange} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Disponibilidad</label>
                  <input name="disponibilidad" value={volunteerForm.disponibilidad} onChange={handleVolunteerFormChange} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => { setShowVolunteerForm(false); resetVolunteerForm(); }} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={savingVolunteer} style={{ padding: '10px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
                  {savingVolunteer ? 'Guardando...' : editingVolunteer ? 'Guardar cambios' : 'Crear voluntario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px', backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', boxSizing: 'border-box' }}>
        <div style={{ flex: '1 1 260px', minWidth: '0', maxWidth: '100%' }}>
          <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px' }}>Región</label>
          <select
            value={selectedRegion || ''}
            onChange={handleRegionChange}
            style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
          >
            <option value="">Selecciona una región</option>
            {regions.map((region) => (
              <option key={region.region} value={region.region}>{region.region}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 260px', minWidth: '0', maxWidth: '100%' }}>
          <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px' }}>Comunas</label>
          <select
            multiple
            value={selectedComunas}
            onChange={handleComunaChange}
            disabled={!selectedRegion}
            size={Math.max(4, Math.min(comunas.length, 8))}
            style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', minHeight: '120px', maxHeight: '260px', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: selectedRegion ? 'white' : '#f8fafc', overflowY: 'auto' }}
          >
            {comunas.map((comuna) => (
              <option key={comuna} value={comuna}>{comuna}</option>
            ))}
          </select>
          <div style={{ marginTop: '6px', fontSize: '12px', color: '#64748b' }}>Mantén Ctrl/Cmd para seleccionar varias.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {loading ? (
          <p>Cargando voluntarios...</p>
        ) : volunteers.length === 0 ? (
          <p>No hay voluntarios registrados.</p>
        ) : (
          volunteers
            .filter((vol) => {
              if (!selectedRegion) return true;
              if (selectedComunas.length === 0) return vol.region === selectedRegion;
              return vol.region === selectedRegion && selectedComunas.includes(vol.comuna);
            })
            .map((vol) => (
              <div key={vol.id} style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)', borderRadius: '16px', padding: '20px', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)', border: '1px solid #e5edf8', borderTop: '5px solid #3b82f6', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b', lineHeight: 1.3 }}>{vol.nombreCompleto}</h3>
                  <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                    {vol.role || 'Sin rol'}
                  </span>
                </div>

                <div style={{ display: 'grid', gap: '6px', fontSize: '14px', color: '#475569' }}>
                  <p style={{ margin: 0 }}><strong style={{ color: '#334155' }}>RUT:</strong> {vol.rut}</p>
                  <p style={{ margin: 0 }}><strong style={{ color: '#334155' }}>Email:</strong> {vol.email}</p>
                  <p style={{ margin: 0 }}><strong style={{ color: '#334155' }}>Región:</strong> {vol.region || 'No asignada'}</p>
                  <p style={{ margin: '0' }}><strong style={{ color: '#334155' }}>Comuna:</strong> {vol.comuna || 'No asignada'}</p>
                </div>

                <div style={{ marginTop: '5px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>Asignar Rol / Perfil Técnico</label>
                  <select
                    defaultValue={vol.role || ''}
                    onChange={(e) => handleRoleChange(e, vol.id)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a' }}
                  >
                    <option value="">Sin Rol Asignado</option>
                    <option value="constructor">Constructor Básica</option>
                    <option value="carpintero">Carpintero Avanzado</option>
                    <option value="logistica">Logística y Reparto</option>
                    <option value="jefe_cuadrilla">Jefe de Cuadrilla (Potencial)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button type="button" onClick={() => openEditVolunteerForm(vol)} style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #93c5fd', backgroundColor: '#eff6ff', color: '#1d4ed8', cursor: 'pointer', fontWeight: 700 }}>Editar</button>
                  <button type="button" onClick={() => handleDeleteVolunteer(vol)} style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #fda4af', backgroundColor: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontWeight: 700 }}>Eliminar</button>
                </div>

                <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#94a3b8' }}>
                  Inscrito: {new Date(vol.createdAt || Date.now()).toLocaleDateString()}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  boxSizing: 'border-box',
};
