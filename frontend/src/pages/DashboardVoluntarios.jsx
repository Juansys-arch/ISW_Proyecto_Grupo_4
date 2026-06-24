import { useState, useEffect } from 'react';
import { getVolunteers, updateVolunteer } from '../services/volunteer.service';
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert';

export default function DashboardVoluntarios() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

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

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const handleRoleChange = async (e, id) => {
    const newRole = e.target.value;
    // Asumimos que podemos enviar solo el rol a updateVolunteer, ajustarlo según el backend
    const res = await updateVolunteer({ role: newRole }, id);
    if (res && !res.status?.includes('error')) {
      showSuccessAlert('Rol Actualizado', 'El rol del voluntario ha sido actualizado.');
      fetchVolunteers();
    } else {
      showErrorAlert('Error', 'No se pudo actualizar el rol.');
    }
  };

  return (
    <div className="main-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2b3452', fontSize: '28px', margin: 0 }}>Gestión de Voluntarios</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {loading ? (
          <p>Cargando voluntarios...</p>
        ) : volunteers.length === 0 ? (
          <p>No hay voluntarios registrados.</p>
        ) : (
          volunteers.map((vol) => (
            <div key={vol.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: '4px solid #3b82f6' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#1a202c' }}>{vol.nombreCompleto}</h3>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#4a5568' }}><strong>RUT:</strong> {vol.rut}</p>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#4a5568' }}><strong>Email:</strong> {vol.email}</p>
              
              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#718096', marginBottom: '5px' }}>Asignar Rol / Perfil Técnico</label>
                <select 
                  defaultValue={vol.role || ''}
                  onChange={(e) => handleRoleChange(e, vol.id)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                >
                  <option value="">Sin Rol Asignado</option>
                  <option value="constructor">Constructor Básica</option>
                  <option value="carpintero">Carpintero Avanzado</option>
                  <option value="logistica">Logística y Reparto</option>
                  <option value="jefe_cuadrilla">Jefe de Cuadrilla (Potencial)</option>
                </select>
              </div>
              
              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #edf2f7' }}>
                <span style={{ fontSize: '12px', color: '#a0aec0' }}>Inscrito: {new Date(vol.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
