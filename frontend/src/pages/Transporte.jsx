<<<<<<< HEAD
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
=======
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '../components/Form';
import Table from '../components/Table';
import { crearTransporte, obtenerTransportes, actualizarTransporte, registrarAbordaje, eliminarTransporte } from '../services/jornada.service';
>>>>>>> cf985d0a5c3a7df8bd0c18eceeb1d3f2fd80d4cb
import { showErrorAlert, showSuccessAlert } from '../helpers/sweetAlert';

export default function Transporte() {
  const navigate = useNavigate();
  const [transportes, setTransportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
<<<<<<< HEAD
  const [transporteSeleccionado, setTransporteSeleccionado] = useState(null);
  const [buscar, setBuscar] = useState('');
  const buttonCallbacksRef = useRef({});

  const columnasTabla = [
    { key: 'id', label: 'ID' },
    { key: 'numeroAutobus', label: 'Número' },
=======

  const columnasTabla = [
    { key: 'id', label: 'ID' },
    { key: 'numeroAutobus', label: 'Autobús' },
>>>>>>> cf985d0a5c3a7df8bd0c18eceeb1d3f2fd80d4cb
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
<<<<<<< HEAD
    const res = await obtenerTransportes({ buscar });
    setLoading(false);
    if (res.status === 'Success') {
      const datos = res.data || [];
=======
    const res = await obtenerTransportes();
    setLoading(false);
    console.log('Respuesta obtenerTransportes:', res);
    if (res.status === 'Success') {
      const datos = res.data || [];
      console.log('Datos transportes:', datos);
>>>>>>> cf985d0a5c3a7df8bd0c18eceeb1d3f2fd80d4cb
      setTransportes(Array.isArray(datos) ? datos : []);
    } else {
      showErrorAlert('Error', res.message || 'No se pudo cargar los transportes');
    }
  };

  useEffect(() => {
    cargarTransportes();
<<<<<<< HEAD
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

=======
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

>>>>>>> cf985d0a5c3a7df8bd0c18eceeb1d3f2fd80d4cb
  const handleAbordaje = async (transporte) => {
    const res = await registrarAbordaje(transporte.id);
    if (res.status === 'Success') {
      showSuccessAlert('Abordaje Registrado', `${res.data.abordajosRegistrados}/${res.data.capacidad} voluntarios abordados`);
      cargarTransportes();
    } else {
      showErrorAlert('Error', res.message || 'No se pudo registrar el abordaje');
    }
  };

<<<<<<< HEAD
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

=======
>>>>>>> cf985d0a5c3a7df8bd0c18eceeb1d3f2fd80d4cb
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

<<<<<<< HEAD
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Buscar por número, placa o conductor..."
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
=======
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
>>>>>>> cf985d0a5c3a7df8bd0c18eceeb1d3f2fd80d4cb
        >
          {mostrarFormulario ? 'Cancelar' : '+ Nuevo Transporte'}
        </button>
        <button
          onClick={() => navigate('/gestion-jornada')}
<<<<<<< HEAD
          style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
=======
          style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer' }}
>>>>>>> cf985d0a5c3a7df8bd0c18eceeb1d3f2fd80d4cb
        >
          ← Volver al Dashboard
        </button>
      </div>

      {mostrarFormulario && (
<<<<<<< HEAD
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #ddd' }}>
          <h3>{transporteSeleccionado ? 'Editar Transporte' : 'Registrar Nuevo Transporte'}</h3>
          <Form 
            fields={camposFormulario} 
            buttonText={transporteSeleccionado ? 'Actualizar' : 'Registrar'} 
            onSubmit={handleSubmit}
            initialValues={transporteSeleccionado}
          />
=======
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
          <h3>Registrar Nuevo Transporte</h3>
          <Form fields={camposFormulario} buttonText="Registrar" onSubmit={handleSubmit} />
>>>>>>> cf985d0a5c3a7df8bd0c18eceeb1d3f2fd80d4cb
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3>Transportes Disponibles</h3>
        <Table
<<<<<<< HEAD
          columns={[...columnasTabla, { key: 'acciones', label: 'Acciones' }]}
          data={transportes.map((transporte) => {
            const btnAbordajeId = `btn-abordaje-${transporte.id}`;
            const btnEditarId = `btn-editar-${transporte.id}`;
            const btnFinalizarId = `btn-finalizar-${transporte.id}`;
            const btnEliminarId = `btn-eliminar-${transporte.id}`;
            
            // Registrar callbacks en el ref
            buttonCallbacksRef.current[btnAbordajeId] = () => handleAbordaje(transporte);
            buttonCallbacksRef.current[btnEditarId] = () => handleEditar(transporte);
            buttonCallbacksRef.current[btnFinalizarId] = () => handleFinalizarJornada(transporte);
            buttonCallbacksRef.current[btnEliminarId] = () => handleEliminar(transporte);
            
            return {
              ...transporte,
              estado: `${transporte.estado === 'en_ruta' ? '🚀' : transporte.estado === 'finalizado' ? '✅' : '⏳'} ${transporte.estado}`,
              acciones: `
                <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                  <button id="${btnAbordajeId}" title="Registrar abordaje" style="padding: 5px 10px; background-color: #17a2b8; color: white; border: none; cursor: pointer; border-radius: 3px; font-size: 12px; font-weight: 500;">👤 Abordaje</button>
                  <button id="${btnEditarId}" title="Editar transporte" style="padding: 5px 10px; background-color: #ffc107; color: black; border: none; cursor: pointer; border-radius: 3px; font-size: 12px; font-weight: 500;">✏️ Editar</button>
                  <button id="${btnFinalizarId}" title="Finalizar jornada" style="padding: 5px 10px; background-color: #28a745; color: white; border: none; cursor: pointer; border-radius: 3px; font-size: 12px; font-weight: 500;">✔️ Finalizar</button>
                  <button id="${btnEliminarId}" title="Eliminar transporte" style="padding: 5px 10px; background-color: #dc3545; color: white; border: none; cursor: pointer; border-radius: 3px; font-size: 12px; font-weight: 500;">🗑️ Eliminar</button>
                </div>
              `,
            };
          })}
=======
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
>>>>>>> cf985d0a5c3a7df8bd0c18eceeb1d3f2fd80d4cb
          loading={loading}
        />
      </div>
    </div>
  );
}
