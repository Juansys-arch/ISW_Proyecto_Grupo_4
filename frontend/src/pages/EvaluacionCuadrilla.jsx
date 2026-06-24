import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearEvaluacion, obtenerEvaluaciones } from '../services/evaluacion.service';
import { showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert';

export default function EvaluacionCuadrilla() {
  const navigate = useNavigate();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    cuadrillaId: '',
    calificacion: '',
    comentarios: ''
  });

  const fetchEvaluaciones = async () => {
    setLoading(true);
    const res = await obtenerEvaluaciones();
    setLoading(false);
    if (res.status === 'Success') {
      setEvaluaciones(res.data);
    }
  };

  useEffect(() => {
    fetchEvaluaciones();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      calificacion: parseInt(formData.calificacion, 10),
      cuadrillaId: parseInt(formData.cuadrillaId, 10)
    };

    const res = await crearEvaluacion(dataToSend);
    if (res.status === 'Success') {
      showSuccessAlert('Evaluación Registrada', 'Se ha guardado la evaluación de la cuadrilla exitosamente.');
      setFormData({ cuadrillaId: '', calificacion: '', comentarios: '' });
      fetchEvaluaciones();
    } else {
      showErrorAlert('Error', res.message || 'No se pudo registrar la evaluación.');
    }
  };

  return (
    <div className="main-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2b3452', fontSize: '28px', margin: 0 }}>Evaluación de Cuadrillas</h1>
        <button 
          onClick={() => navigate('/gestion-jornada')}
          style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Volver a Dashboard
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#1a1a1a' }}>Nueva Evaluación</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4a5568' }}>ID Cuadrilla</label>
              <input 
                type="number" 
                name="cuadrillaId" 
                value={formData.cuadrillaId} 
                onChange={handleChange} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4a5568' }}>Calificación (1-5)</label>
              <select 
                name="calificacion" 
                value={formData.calificacion} 
                onChange={handleChange} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
              >
                <option value="">Seleccione una calificación...</option>
                <option value="1">1 - Deficiente</option>
                <option value="2">2 - Regular</option>
                <option value="3">3 - Bueno</option>
                <option value="4">4 - Muy Bueno</option>
                <option value="5">5 - Excelente</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4a5568' }}>Comentarios</label>
              <textarea 
                name="comentarios" 
                value={formData.comentarios} 
                onChange={handleChange} 
                rows="4" 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box', resize: 'vertical' }}
                placeholder="Observaciones sobre el desempeño..."
              ></textarea>
            </div>
            <button 
              type="submit" 
              style={{ padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
            >
              Registrar Evaluación
            </button>
          </form>
        </div>

        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#1a1a1a' }}>Historial de Evaluaciones</h2>
          {loading ? (
            <p>Cargando evaluaciones...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {evaluaciones.length === 0 ? (
                <p style={{ color: '#718096', fontStyle: 'italic' }}>No hay evaluaciones registradas.</p>
              ) : (
                evaluaciones.map((ev) => (
                  <div key={ev.id} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <strong>Cuadrilla #{ev.cuadrillaId}</strong>
                      <span style={{ backgroundColor: ev.calificacion >= 4 ? '#d1fae5' : ev.calificacion === 3 ? '#fef3c7' : '#fee2e2', color: ev.calificacion >= 4 ? '#065f46' : ev.calificacion === 3 ? '#92400e' : '#991b1b', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                        ⭐ {ev.calificacion} / 5
                      </span>
                    </div>
                    <p style={{ margin: '0 0 10px 0', color: '#4a5568', fontSize: '14px' }}>{ev.comentarios || 'Sin comentarios adicionales.'}</p>
                    <div style={{ fontSize: '12px', color: '#a0aec0', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Evaluado por: Jefe #{ev.jefeCuadrillaId}</span>
                      <span>{new Date(ev.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
