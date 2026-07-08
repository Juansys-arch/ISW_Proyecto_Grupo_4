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
    { key: 'id', label: 'ID', minWidth: 60 },
    { key: 'numeroAutobus', label: 'Número', minWidth: 100 },
    { key: 'placa', label: 'Placa', minWidth: 120 },
    { key: 'capacidad', label: 'Capacidad', minWidth: 110 },
    { key: 'conductor', label: 'Conductor', minWidth: 180 },
    { key: 'estado', label: 'Estado', minWidth: 120 },
    { key: 'abordajosRegistrados', label: 'Abordajes', minWidth: 120 },
    { key: 'horaPartida', label: 'Hora Partida', minWidth: 130 },
    { key: 'acciones', label: 'Acciones', minWidth: 420, headerSort: false },
  ];

  const camposFormulario = [
    { label: 'Número de Autobús', name: 'numeroAutobus', type: 'text', required: true },
    { label: 'Placa', name: 'placa', type: 'text', required: true, placeholder: 'XX-XX-XXXX' },
    { label: 'Capacidad', name: 'capacidad', type: 'number', required: true },
    { label: 'Conductor', name: 'conductor', type: 'text', required: true },
    { label: 'Ruta Partida', name: 'rutaPartida', type: 'text', placeholder: 'Punto de encuentro' },
    { label: 'Ruta Destino', name: 'rutaDestino', type: 'text', placeholder: 'Sitio de obra' },
    { label: 'Correo Punto Encuentro', name: 'correoPuntoEncuentro', type: 'email', placeholder: 'punto.encuentro@techo.org' },
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
    <div className="jornada-page">
      <div className="header-section">
        <div>
          <h1 style={{ color: '#0b3b5a', margin: 0 }}>Gestión de Transporte</h1>
          <p style={{ color: '#4b6077', marginTop: 4 }}>Administra el transporte asignado a las cuadrillas y registra abordajes.</p>
        </div>
        <div className="action-buttons">
          <button className="btn btn-back" onClick={() => navigate('/gestion-jornada')}>
            ← Volver al Dashboard
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍 Buscar por número, placa o conductor..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          style={{
            padding: '10px 14px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            flex: '1',
            minWidth: '250px',
            fontSize: '14px',
            outline: 'none',
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}
        />
        <button
          onClick={() => {
            setMostrarFormulario(!mostrarFormulario);
            setTransporteSeleccionado(null);
          }}
          className={mostrarFormulario ? "btn-secondary" : "btn-primary"}
          style={{ height: '42px', padding: '0 16px', borderRadius: '8px', border: mostrarFormulario ? '1px solid #0b5ca8' : 'none' }}
        >
          {mostrarFormulario ? '✕ Cancelar' : '➕ Nuevo Transporte'}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="form-wrapper">
          <h3 style={{ color: '#0b3b5a', marginTop: 0, marginBottom: '20px' }}>{transporteSeleccionado ? 'Editar Transporte' : 'Registrar Nuevo Transporte'}</h3>
          <Form 
            fields={camposFormulario} 
            buttonText={transporteSeleccionado ? 'Actualizar' : 'Registrar'} 
            onSubmit={handleSubmit}
            initialValues={transporteSeleccionado}
          />
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3 style={{ color: '#0b3b5a' }}>Transportes Disponibles</h3>
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
          layout="fitDataFill"
        />
      </div>
    </div>
  );
}
