import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '../components/Form';
import Table from '../components/Table';
import { crearTransporte, obtenerTransportes, actualizarTransporte, registrarAbordaje, eliminarTransporte } from '../services/jornada.service';
import { showErrorAlert, showSuccessAlert } from '../helpers/sweetAlert';

export default function Transporte() {
  const navigate = useNavigate();
  const [transportes, setTransportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const columnasTabla = [
    { key: 'id', label: 'ID' },
    { key: 'numeroAutobus', label: 'Autobús' },
    { key: 'placa', label: 'Placa' },
    { key: 'capacidad', label: 'Capacidad' },
    { key: 'conductor', label: 'Conductor' },
    { key: 'estado', label: 'Estado' },
    { key: 'abordajosRegistrados', label: 'Abordajes' },
    { key: 'horaPartida', label: 'Hora Partida' },
  ];

  const camposFormulario = [
    { label: 'Número de Autobús', name: 'numeroAutobus', type: 'text', required: true },
    { label: 'Placa', name: 'placa', type: 'text', required: true, placeholder: 'XX-XX-XXXX' },
    { label: 'Capacidad', name: 'capacidad', type: 'number', required: true },
    { label: 'Conductor', name: 'conductor', type: 'text', required: true },
    { label: 'Ruta Partida', name: 'rutaPartida', type: 'text', placeholder: 'Punto de encuentro' },
    { label: 'Ruta Destino', name: 'rutaDestino', type: 'text', placeholder: 'Sitio de obra' },
    { label: 'Hora Partida', name: 'horaPartida', type: 'time' },
    { label: 'Fecha Jornada', name: 'fechaJornada', type: 'date' },
  ];

  const cargarTransportes = async () => {
    setLoading(true);
    const res = await obtenerTransportes();
    setLoading(false);
    console.log('Respuesta obtenerTransportes:', res);
    if (res.status === 'Success') {
      const datos = res.data || [];
      console.log('Datos transportes:', datos);
      setTransportes(Array.isArray(datos) ? datos : []);
    } else {
      showErrorAlert('Error', res.message || 'No se pudo cargar los transportes');
    }
  };

  useEffect(() => {
    cargarTransportes();
  }, []);

  const handleSubmit = async (data) => {
    const res = await crearTransporte(data);
    if (res.status === 'Success') {
      showSuccessAlert('Éxito', 'Transporte registrado correctamente');
      setMostrarFormulario(false);
      cargarTransportes();
    } else {
      showErrorAlert('Error', res.message || 'No se pudo registrar el transporte');
    }
  };

  const handleAbordaje = async (transporte) => {
    const res = await registrarAbordaje(transporte.id);
    if (res.status === 'Success') {
      showSuccessAlert('Abordaje Registrado', `${res.data.abordajosRegistrados}/${res.data.capacidad} voluntarios abordados`);
      cargarTransportes();
    } else {
      showErrorAlert('Error', res.message || 'No se pudo registrar el abordaje');
    }
  };

  const handleEliminar = async (transporte) => {
    if (window.confirm(`¿Eliminar transporte ${transporte.numeroAutobus}?`)) {
      const res = await eliminarTransporte(transporte.id);
      if (res.status === 'Success') {
        showSuccessAlert('Éxito', 'Transporte eliminado correctamente');
        cargarTransportes();
      } else {
        showErrorAlert('Error', res.message || 'No se pudo eliminar el transporte');
      }
    }
  };

  return (
    <div className="main-container">
      <h1>🚌 Gestión de Transporte</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {mostrarFormulario ? 'Cancelar' : '+ Nuevo Transporte'}
        </button>
        <button
          onClick={() => navigate('/gestion-jornada')}
          style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          ← Volver al Dashboard
        </button>
      </div>

      {mostrarFormulario && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
          <h3>Registrar Nuevo Transporte</h3>
          <Form fields={camposFormulario} buttonText="Registrar" onSubmit={handleSubmit} />
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3>Transportes Disponibles</h3>
        <Table
          columns={columnasTabla}
          data={transportes.map((transporte) => ({
            ...transporte,
            estado: `${transporte.estado === 'en_ruta' ? '🚀' : '⏳'} ${transporte.estado}`,
            acciones: (
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => handleAbordaje(transporte)} style={{ padding: '5px 10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', cursor: 'pointer' }}>👤 Abordaje</button>
                <button onClick={() => handleEliminar(transporte)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}>🗑️ Eliminar</button>
              </div>
            ),
          }))}
          loading={loading}
        />
      </div>
    </div>
  );
}
