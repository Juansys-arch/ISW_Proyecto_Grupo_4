import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '../components/Form';
import Table from '../components/Table';
import { 
  crearTransporte, 
  obtenerTransportes, 
  actualizarTransporte, 
  registrarAbordaje, 
  eliminarTransporte,
  finalizarJornada 
} from '../services/jornada.service';
import { showErrorAlert, showSuccessAlert } from '../helpers/sweetAlert';

export default function Transporte() {
  const navigate = useNavigate();
  const [transportes, setTransportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [transporteSeleccionado, setTransporteSeleccionado] = useState(null);
  const [buscar, setBuscar] = useState('');
  const buttonCallbacksRef = useRef({});

  const columnasTabla = [
    { key: 'id', label: 'ID' },
    { key: 'numeroAutobus', label: 'Número' },
    { key: 'placa', label: 'Placa' },
    { key: 'capacidad', label: 'Capacidad' },
    { key: 'conductor', label: 'Conductor' },
    { key: 'estado', label: 'Estado' },
    { key: 'abordajosRegistrados', label: 'Abordajes' },
    { key: 'horaPartida', label: 'Hora Partida' },
    { key: 'acciones', label: 'Acciones', minWidth: 420, headerSort: false },
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
    const res = await obtenerTransportes({ buscar });
    setLoading(false);
    if (res.status === 'Success') {
      const datos = res.data || [];
      setTransportes(Array.isArray(datos) ? datos : []);
    } else {
      showErrorAlert('Error', res.message || 'No se pudo cargar los transportes');
    }
  };

  useEffect(() => {
    cargarTransportes();
  }, [buscar]);

  const handleSubmit = async (data) => {
    if (transporteSeleccionado) {
      const res = await actualizarTransporte(transporteSeleccionado.id, data);
      if (res.status === 'Success') {
        showSuccessAlert('Éxito', 'Transporte actualizado correctamente');
        setMostrarFormulario(false);
        setTransporteSeleccionado(null);
        cargarTransportes();
      } else {
        showErrorAlert('Error', res.message || 'No se pudo actualizar el transporte');
      }
    } else {
      const res = await crearTransporte(data);
      if (res.status === 'Success') {
        showSuccessAlert('Éxito', 'Transporte registrado correctamente');
        setMostrarFormulario(false);
        cargarTransportes();
      } else {
        showErrorAlert('Error', res.message || 'No se pudo registrar el transporte');
      }
    }
  };

  const handleEditar = (transporte) => {
    setTransporteSeleccionado(transporte);
    setMostrarFormulario(true);
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

  const handleFinalizarJornada = async (transporte) => {
    const horaLlegada = prompt('Ingrese la hora de llegada (HH:MM):');
    if (!horaLlegada) return;

    const res = await finalizarJornada(transporte.id, horaLlegada);
    if (res.status === 'Success') {
      showSuccessAlert('Éxito', 'Jornada finalizada correctamente');
      cargarTransportes();
    } else {
      showErrorAlert('Error', res.message || 'No se pudo finalizar la jornada');
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
      <h1>Gestión de Transporte</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por número, placa o conductor..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            flex: '1',
            minWidth: '250px',
            fontSize: '14px',
            fontWeight: '500',
            backgroundColor: '#f9fafb',
            transition: 'all 0.3s ease',
            outline: 'none',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#2563eb';
            e.target.style.backgroundColor = 'white';
            e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.backgroundColor = '#f9fafb';
            e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          }}
        />
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => {
            setMostrarFormulario(!mostrarFormulario);
            setTransporteSeleccionado(null);
          }}
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        >
          {mostrarFormulario ? 'Cancelar' : '+ Nuevo Transporte'}
        </button>
        <button
          onClick={() => navigate('/gestion-jornada')}
          style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        >
          Volver al Dashboard
        </button>
      </div>

      {mostrarFormulario && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #ddd' }}>
          <h3>{transporteSeleccionado ? 'Editar Transporte' : 'Registrar Nuevo Transporte'}</h3>
          <Form 
            fields={camposFormulario} 
            buttonText={transporteSeleccionado ? 'Actualizar' : 'Registrar'} 
            onSubmit={handleSubmit}
            initialValues={transporteSeleccionado}
          />
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3>Transportes Disponibles</h3>
        <Table
          columns={columnasTabla}
          data={transportes.map((transporte) => {
            const btnAbordajeId = `btn-abordaje-${transporte.id}`;
            const btnEditarId = `btn-editar-${transporte.id}`;
            const btnFinalizarId = `btn-finalizar-${transporte.id}`;
            const btnEliminarId = `btn-eliminar-${transporte.id}`;
            
            // Registrar callbacks en el ref compartido con useTable
            buttonCallbacksRef.current[btnAbordajeId] = () => handleAbordaje(transporte);
            buttonCallbacksRef.current[btnEditarId] = () => handleEditar(transporte);
            buttonCallbacksRef.current[btnFinalizarId] = () => handleFinalizarJornada(transporte);
            buttonCallbacksRef.current[btnEliminarId] = () => handleEliminar(transporte);
            
            return {
              ...transporte,
              estado: transporte.estado,
              acciones: `<div style="display:flex;gap:5px;flex-wrap:wrap;"><button id="${btnAbordajeId}" style="padding:5px 10px;background-color:#17a2b8;color:white;border:none;cursor:pointer;border-radius:3px;font-size:12px;">Abordaje</button><button id="${btnEditarId}" style="padding:5px 10px;background-color:#ffc107;color:black;border:none;cursor:pointer;border-radius:3px;font-size:12px;">Actualizar</button><button id="${btnFinalizarId}" style="padding:5px 10px;background-color:#28a745;color:white;border:none;cursor:pointer;border-radius:3px;font-size:12px;">Finalizar</button><button id="${btnEliminarId}" style="padding:5px 10px;background-color:#dc3545;color:white;border:none;cursor:pointer;border-radius:3px;font-size:12px;">Eliminar</button></div>`,
            };
          })}
          loading={loading}
          buttonCallbacksRef={buttonCallbacksRef}
        />
      </div>
    </div>
  );
}
