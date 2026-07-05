import { useMemo, useState, useEffect } from 'react';
import {
  createVolunteer,
  deleteVolunteer,
  getRegionsList,
  getVolunteers,
  getVolunteersByRegion,
  updateVolunteer,
} from '../services/volunteer.service';
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert';

const initialVolunteerForm = {
  nombreCompleto: '',
  rut: '',
  email: '',
  fechaNacimiento: '',
  genero: '',
  numeroContacto: '',
  direccion: '',
  region: '',
  comuna: '',
  disponibilidad: '',
};

export default function Volunteer() {
  const [regions, setRegions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [regionError, setRegionError] = useState('');
  const [expandedRegions, setExpandedRegions] = useState({});
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [volunteerForm, setVolunteerForm] = useState(initialVolunteerForm);
  const [savingVolunteer, setSavingVolunteer] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('usuario')) || {};
    } catch (error) {
      return {};
    }
  }, []);

  const toggleRegion = (regionName) => {
    setExpandedRegions((prev) => ({
      ...prev,
      [regionName]: !prev[regionName],
    }));
  };

  const normalizeRegions = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.regions)) return data.regions;
    return [];
  };

  const mergeVolunteersIntoRegions = (regionsData, volunteers = []) => {
    const regionsCopy = regionsData.map((region) => ({
      ...region,
      comunas: Array.isArray(region.comunas)
        ? region.comunas.map((comuna) => ({
            ...comuna,
            volunteers: Array.isArray(comuna.volunteers) ? [...comuna.volunteers] : [],
          }))
        : [],
    }));

    const normalizeText = (value) =>
      typeof value === 'string'
        ? value.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
        : '';

    const ensureRegion = (regionName) => {
      const normalizedRegion = normalizeText(regionName) || 'sin region asignada';
      let region = regionsCopy.find((item) => normalizeText(item.region) === normalizedRegion);
      if (!region) {
        region = { region: regionName || 'Sin región asignada', comunas: [] };
        regionsCopy.push(region);
      }
      return region;
    };

    const ensureComuna = (region, comunaName) => {
      const normalizedComuna = normalizeText(comunaName) || 'sin comuna asignada';
      let comuna = region.comunas.find((item) => normalizeText(typeof item === 'string' ? item : item.comuna) === normalizedComuna);
      if (!comuna) {
        comuna = { comuna: comunaName || 'Sin comuna asignada', volunteers: [] };
        region.comunas.push(comuna);
      }
      if (!Array.isArray(comuna.volunteers)) {
        comuna.volunteers = [];
      }
      return comuna;
    };

    volunteers.forEach((volunteer) => {
      const normalizedStatus = String(volunteer?.status || '').trim().toLowerCase();
      if (['rejected', 'rechazado'].includes(normalizedStatus)) return;
      const region = ensureRegion(volunteer.region);
      const comuna = ensureComuna(region, volunteer.comuna);
      const exists = comuna.volunteers.some((item) => item.id === volunteer.id || item.email === volunteer.email || item.rut === volunteer.rut);
      if (!exists) {
        comuna.volunteers.push(volunteer);
      }
    });

    return regionsCopy;
  };

  const loadRegions = async () => {
    setLoadingRegions(true);
    setRegionError('');

    try {
      const groupedData = await getVolunteersByRegion();
      const groupedRegions = normalizeRegions(groupedData);

      if (groupedRegions.length > 0) {
        setRegions(groupedRegions);
        setLoadingRegions(false);
        return;
      }
    } catch (error) {
      console.error('No se pudo cargar la vista agrupada de regiones:', error);
    }

    try {
      const fallbackData = await getRegionsList();
      const fallbackRegions = normalizeRegions(fallbackData);

      if (fallbackRegions.length > 0) {
        const formattedFallbackRegions = fallbackRegions.map((region) => ({
          region: region.region || region.name || 'Región sin nombre',
          comunas: Array.isArray(region.comunas)
            ? region.comunas.map((comuna) =>
                typeof comuna === 'string'
                  ? { comuna, volunteers: [] }
                  : { ...comuna, volunteers: Array.isArray(comuna?.volunteers) ? comuna.volunteers : [] },
              )
            : [],
        }));

        const volunteers = await getVolunteers();
        const completeRegions = Array.isArray(volunteers)
          ? mergeVolunteersIntoRegions(formattedFallbackRegions, volunteers)
          : formattedFallbackRegions;

        setRegions(completeRegions);
      } else {
        setRegionError('No se pudieron cargar las regiones de Chile.');
      }
    } catch (error) {
      console.error('No se pudo cargar la lista pública de regiones:', error);
      setRegionError('No se pudieron cargar las regiones de Chile.');
    } finally {
      setLoadingRegions(false);
    }
  };

  useEffect(() => {
    loadRegions();
  }, []);

  const resetVolunteerForm = () => {
    setVolunteerForm(initialVolunteerForm);
    setEditingVolunteer(null);
  };

  const openCreateVolunteerForm = () => {
    resetVolunteerForm();
    setShowVolunteerForm(true);
  };

  const openEditVolunteerForm = (volunteer) => {
    setEditingVolunteer(volunteer);
    setVolunteerForm({
      nombreCompleto: volunteer.nombreCompleto || '',
      rut: volunteer.rut || '',
      email: volunteer.email || '',
      fechaNacimiento: volunteer.fechaNacimiento ? new Date(volunteer.fechaNacimiento).toISOString().split('T')[0] : '',
      genero: volunteer.genero || 'masculino',
      numeroContacto: volunteer.numeroContacto || '',
      direccion: volunteer.direccion || '',
      region: volunteer.region || '',
      comuna: volunteer.comuna || '',
      disponibilidad: volunteer.disponibilidad || '',
    });
    setShowVolunteerForm(true);
  };

  const upsertVolunteerInRegions = (volunteer) => {
    if (!volunteer) return;

    setRegions((prevRegions) => {
      const regionName = (volunteer.region || 'Sin región asignada').trim();
      const comunaName = (volunteer.comuna || 'Sin comuna asignada').trim();
      const volunteerToAdd = { ...volunteer };

      const regionsCopy = prevRegions.map((region) => ({
        ...region,
        comunas: Array.isArray(region.comunas)
          ? region.comunas.map((comuna) => ({
              ...comuna,
              volunteers: Array.isArray(comuna.volunteers) ? [...comuna.volunteers] : [],
            }))
          : [],
      }));

      const filteredRegions = regionsCopy.map((region) => ({
        ...region,
        comunas: Array.isArray(region.comunas)
          ? region.comunas.map((comuna) => ({
              ...comuna,
              volunteers: Array.isArray(comuna.volunteers)
                ? comuna.volunteers.filter((item) => item.id !== volunteerToAdd.id)
                : [],
            }))
          : [],
      }));

      let targetRegion = filteredRegions.find((region) => String(region.region).trim() === regionName);
      if (!targetRegion) {
        targetRegion = {
          region: regionName,
          comunas: [],
        };
        filteredRegions.push(targetRegion);
      }

      let targetComuna = Array.isArray(targetRegion.comunas)
        ? targetRegion.comunas.find((comuna) => String(typeof comuna === 'string' ? comuna : comuna.comuna).trim() === comunaName)
        : undefined;

      if (!targetComuna) {
        targetComuna = {
          comuna: comunaName,
          volunteers: [],
        };
        targetRegion.comunas = [...(targetRegion.comunas || []), targetComuna];
      }

      targetComuna.volunteers = [...(targetComuna.volunteers || []), volunteerToAdd];

      return filteredRegions;
    });
  };

  const handleVolunteerFormChange = (event) => {
    const { name, value } = event.target;
    if (name === 'region') {
      setVolunteerForm((prev) => ({ ...prev, region: value, comuna: '' }));
      return;
    }

    setVolunteerForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVolunteerSubmit = async (event) => {
    event.preventDefault();

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
    const response = editingVolunteer
      ? await updateVolunteer(payload, editingVolunteer.id)
      : await createVolunteer(payload);
    setSavingVolunteer(false);

    if (response && !response.status?.includes('error')) {
      showSuccessAlert(
        editingVolunteer ? 'Voluntario actualizado' : 'Voluntario creado',
        editingVolunteer ? 'Se actualizó correctamente.' : 'Se creó correctamente.',
      );
      const updatedVolunteer = response;
      await loadRegions();
      setShowVolunteerForm(false);
      resetVolunteerForm();
      if (!editingVolunteer) {
        upsertVolunteerInRegions(updatedVolunteer);
      }
    } else {
      showErrorAlert('Error', response?.message || 'No se pudo guardar el voluntario.');
    }
  };

  const handleDeleteVolunteer = async (volunteer) => {
    if (!window.confirm(`¿Deseas eliminar a ${volunteer.nombreCompleto || 'este voluntario'}?`)) {
      return;
    }

    const response = await deleteVolunteer(volunteer.id);
    if (response && !response.status?.includes('error')) {
      showSuccessAlert('Voluntario eliminado', 'Se eliminó correctamente.');
      await loadRegions();
    } else {
      showErrorAlert('Error', response?.message || 'No se pudo eliminar el voluntario.');
    }
  };

  const availableComunas = useMemo(() => {
    const selectedRegion = regions.find((region) => region.region === volunteerForm.region);
    return Array.isArray(selectedRegion?.comunas)
      ? selectedRegion.comunas.map((comuna) => (typeof comuna === 'string' ? comuna : comuna?.comuna || comuna?.name || ''))
      : [];
  }, [regions, volunteerForm.region]);

  const getActiveVolunteers = (items = []) => {
    if (!Array.isArray(items)) return [];
    return items.filter((volunteer) => {
      const normalizedStatus = String(volunteer?.status || '').trim().toLowerCase();
      return !['rejected', 'rechazado'].includes(normalizedStatus);
    });
  };

  const totalVolunteersCount = useMemo(() => {
    return regions.reduce((total, region) => {
      if (!Array.isArray(region.comunas)) return total;
      const regionCount = region.comunas.reduce((regionTotal, comuna) => {
        const validVolunteers = getActiveVolunteers(Array.isArray(comuna?.volunteers) ? comuna.volunteers : []);
        return regionTotal + validVolunteers.length;
      }, 0);
      return total + regionCount;
    }, 0);
  }, [regions]);

  return (
    <div
      className="main-container"
      style={{
        position: 'relative',
        zIndex: 0,
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 16px 16px',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        display: 'block',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        height: 'auto',
        minHeight: 'auto',
      }}
    >
      <div style={{ marginBottom: '14px', paddingTop: '4px' }}>
        <h1 style={{ fontSize: '1.6rem', margin: 0, color: '#1f2937' }}>Voluntario</h1>
        <p style={{ color: '#4b5563', margin: '4px 0 0', fontSize: '0.95rem' }}>
          Bienvenido{user.nombreCompleto ? `, ${user.nombreCompleto}` : ''}. Aquí puedes ver las regiones de Chile.
        </p>
      </div>

      {showVolunteerForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(15, 23, 42, 0.32)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '24px', boxSizing: 'border-box', overflowY: 'auto' }}>
          <section style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #d1d5db', padding: '24px', boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)', width: '100%', maxWidth: '780px', margin: 'auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#1f2937' }}>{editingVolunteer ? 'Editar voluntario' : 'Registrar nuevo voluntario'}</h2>
              <p style={{ margin: '8px 0 0 0', color: '#556574', fontSize: '0.95rem' }}>Completa el formulario para registrar o actualizar un voluntario.</p>
            </div>
            <button type="button" onClick={() => { setShowVolunteerForm(false); resetVolunteerForm(); }} style={{ backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '999px', padding: '10px 14px', cursor: 'pointer' }}>
              Cerrar encuesta
            </button>
          </div>

          <form onSubmit={handleVolunteerSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>Nombre completo</label>
                <input name="nombreCompleto" value={volunteerForm.nombreCompleto} onChange={handleVolunteerFormChange} style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>RUT</label>
                <input name="rut" value={volunteerForm.rut} onChange={handleVolunteerFormChange} style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>Email</label>
                <input name="email" type="email" value={volunteerForm.email} onChange={handleVolunteerFormChange} style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>Fecha de nacimiento</label>
                <input name="fechaNacimiento" type="date" value={volunteerForm.fechaNacimiento} onChange={handleVolunteerFormChange} style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>Género</label>
                <select name="genero" value={volunteerForm.genero} onChange={handleVolunteerFormChange} style={inputStyle}>
                  <option value="">Selecciona un género</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>Teléfono</label>
                <input name="numeroContacto" value={volunteerForm.numeroContacto} onChange={handleVolunteerFormChange} style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>Dirección</label>
                <input name="direccion" value={volunteerForm.direccion} onChange={handleVolunteerFormChange} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>Región</label>
                <select name="region" value={volunteerForm.region} onChange={handleVolunteerFormChange} style={inputStyle}>
                  <option value="">Selecciona una región</option>
                  {regions.map((region) => (
                    <option key={region.region} value={region.region}>{region.region || region.name || 'Región sin nombre'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>Comuna</label>
                <select name="comuna" value={volunteerForm.comuna} onChange={handleVolunteerFormChange} style={inputStyle} disabled={!volunteerForm.region}>
                  <option value="">Selecciona una comuna</option>
                  {availableComunas.map((comuna) => (
                    <option key={comuna} value={comuna}>{comuna}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>Disponibilidad</label>
                <input name="disponibilidad" value={volunteerForm.disponibilidad} onChange={handleVolunteerFormChange} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '18px' }}>
              <button type="button" onClick={() => { setShowVolunteerForm(false); resetVolunteerForm(); }} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#334155', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button type="submit" disabled={savingVolunteer} style={{ padding: '10px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', cursor: 'pointer', fontWeight: 700 }}>
                {savingVolunteer ? 'Guardando...' : editingVolunteer ? 'Guardar cambios' : 'Guardar encuesta'}
              </button>
            </div>
          </form>
        </section>
      </div>
      )}

      <section style={{ marginBottom: '12px' }}>
        <div style={{ background: 'linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)', width: '100%', boxSizing: 'border-box', margin: '0 auto', marginTop: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
            <div style={{ flex: '1 1 260px', minWidth: '0', maxWidth: '100%' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '999px', backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '0.8rem', fontWeight: 700, marginBottom: '10px' }}>
                <span style={{ fontSize: '0.9rem' }}>🗺️</span>
                Vista regional
              </div>
              <h2 style={{ fontSize: '1.32rem', margin: '0 0 6px 0', color: '#0f172a', overflowWrap: 'anywhere', wordBreak: 'break-word', fontWeight: 800 }}>Regiones de Chile</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.94rem', overflowWrap: 'anywhere', wordBreak: 'break-word', lineHeight: 1.5 }}>Consulta de forma organizada las regiones, sus comunas y la participación de voluntarios.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '8px 12px', borderRadius: '999px', fontSize: '0.84rem', fontWeight: 700, flexShrink: 0 }}>
                {regions.length} regiones
              </div>
              <div style={{ backgroundColor: '#ecfdf5', color: '#047857', padding: '8px 12px', borderRadius: '999px', fontSize: '0.84rem', fontWeight: 700, flexShrink: 0 }}>
                {totalVolunteersCount} voluntarios
              </div>
              <button type="button" onClick={openCreateVolunteerForm} style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', border: 'none', borderRadius: '999px', padding: '9px 14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)' }}>
                + Añadir voluntario
              </button>
            </div>
          </div>

          <div style={{ width: '100%' }}>
            {loadingRegions ? (
              <p style={{ color: '#4b5563' }}>Cargando regiones...</p>
            ) : regionError ? (
              <p style={{ color: '#dc2626' }}>{regionError}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                {regions.map((region) => {
                  const regionName = region.region || region.name || 'Región sin nombre';
                  const regionComunas = Array.isArray(region.comunas) ? region.comunas : [];
                  const activeVolunteers = regionComunas.flatMap((comuna) => getActiveVolunteers(Array.isArray(comuna?.volunteers) ? comuna.volunteers : []));
                  const isExpanded = Boolean(expandedRegions[regionName]);
                  const initials = regionName
                    .split(' ')
                    .slice(0, 2)
                    .map((word) => word.charAt(0))
                    .join('')
                    .toUpperCase();

                  return (
                    <article
                      key={regionName}
                      style={{
                        background: isExpanded ? 'linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        borderRadius: '20px',
                        border: isExpanded ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                        boxShadow: isExpanded ? '0 12px 26px rgba(37, 99, 235, 0.12)' : '0 8px 20px rgba(15, 23, 42, 0.04)',
                        overflow: 'hidden',
                        width: '100%',
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignSelf: 'stretch',
                        position: 'relative',
                        zIndex: 0,
                      }}
                    >
                      <div style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', flexWrap: 'wrap', background: isExpanded ? 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)' : '#ffffff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)', color: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 800, flexShrink: 0 }}>
                            {initials || 'R'}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <h3 style={{ margin: 0, fontSize: '1.08rem', color: '#0f172a', lineHeight: 1.2, fontWeight: 800, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{regionName}</h3>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                              <span style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700 }}>
                                {regionComunas.length} comuna{regionComunas.length === 1 ? '' : 's'}
                              </span>
                              <span style={{ backgroundColor: '#ccfbf1', color: '#0f766e', padding: '4px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700 }}>
                                {activeVolunteers.length} voluntario{activeVolunteers.length === 1 ? '' : 's'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleRegion(regionName)}
                          style={{
                            border: '1px solid #bfdbfe',
                            backgroundColor: isExpanded ? '#2563eb' : '#f8fbff',
                            color: isExpanded ? '#ffffff' : '#1d4ed8',
                            borderRadius: '999px',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)',
                          }}
                        >
                          {isExpanded ? 'Ocultar' : 'Ver más'}
                        </button>
                      </div>

                      {isExpanded && (
                        <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)', padding: '0 20px 20px 20px', borderTop: '1px solid #e5e7eb', position: 'relative', zIndex: 0, overflow: 'hidden' }}>
                          <div style={{ display: 'grid', gap: '14px', marginTop: '14px' }}>
                            <div>
                              <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '0.94rem', fontWeight: 700 }}>Comunas</h4>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', width: '100%' }}>
                                {regionComunas.length > 0 ? (
                                  regionComunas.map((comuna, index) => {
                                    const comunaName = typeof comuna === 'string' ? comuna : comuna?.comuna || comuna?.name || `Comuna ${index + 1}`;
                                    const comunaVolunteers = getActiveVolunteers(Array.isArray(comuna?.volunteers) ? comuna.volunteers : []);

                                    return (
                                      <div
                                        key={`${regionName}-${comunaName}-${index}`}
                                        style={{
                                          background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
                                          border: '1px solid #dbeafe',
                                          borderRadius: '12px',
                                          padding: '12px 14px',
                                          fontSize: '0.84rem',
                                          color: '#0f172a',
                                          minWidth: 0,
                                          width: '100%',
                                          minHeight: '58px',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                          textAlign: 'center',
                                          gap: '6px',
                                          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                                        }}
                                      >
                                        <span style={{ fontWeight: 600, overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: 1.35, letterSpacing: '0.01em', fontSize: '0.78rem', color: '#1e3a8a', display: 'block', width: '100%' }}>{comunaName}</span>
                                        <span style={{ backgroundColor: '#ecfdf5', color: '#047857', borderRadius: '999px', padding: '3px 8px', fontSize: '0.72rem', fontWeight: 700 }}>
                                          {comunaVolunteers.length} voluntario{comunaVolunteers.length === 1 ? '' : 's'}
                                        </span>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>No hay comunas registradas</span>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '0.96rem' }}>Voluntarios</h4>
                              {activeVolunteers.length > 0 ? (
                                <div style={{ display: 'grid', gap: '12px' }}>
                                  {activeVolunteers.map((volunteer, volunteerIndex) => (
                                    <div
                                      key={`${regionName}-vol-${volunteer.id || volunteer.email || volunteerIndex}`}
                                      style={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '16px',
                                        padding: '14px 16px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '12px',
                                        flexWrap: 'wrap',
                                      }}
                                    >
                                      <div style={{ minWidth: 0, flex: 1, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                                        <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: '#0f172a' }}>
                                          {volunteer.nombreCompleto || volunteer.email || `Voluntario ${volunteerIndex + 1}`}
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', color: '#475569', fontSize: '0.88rem' }}>
                                          {volunteer.rut && <span style={{ backgroundColor: '#f1f5f9', borderRadius: '999px', padding: '4px 10px' }}>RUT: {volunteer.rut}</span>}
                                          {volunteer.email && <span style={{ backgroundColor: '#f1f5f9', borderRadius: '999px', padding: '4px 10px' }}>{volunteer.email}</span>}
                                        </div>
                                      </div>
                                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                                        <button
                                          type="button"
                                          onClick={() => openEditVolunteerForm(volunteer)}
                                          style={{
                                            border: '1px solid #93c5fd',
                                            backgroundColor: '#eff6ff',
                                            color: '#1d4ed8',
                                            borderRadius: '999px',
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            fontWeight: 700,
                                          }}
                                        >
                                          Editar
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteVolunteer(volunteer)}
                                          style={{
                                            border: '1px solid #fda4af',
                                            backgroundColor: '#fef2f2',
                                            color: '#dc2626',
                                            borderRadius: '999px',
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            fontWeight: 700,
                                          }}
                                        >
                                          Eliminar
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>No hay voluntarios activos en esta región.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  boxSizing: 'border-box',
  backgroundImage: 'none',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'initial',
};
