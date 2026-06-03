import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '../components/Form';
import Table from '../components/Table';
import { 
  crearKit, 
  obtenerKits, 
  actualizarKit, 
  eliminarKit,
  verificarKitsIncompletos,
  marcarKitIncompleto 
} from '../services/jornada.service';
import { showErrorAlert, showSuccessAlert, showWarningAlert } from '../helpers/sweetAlert';

export default function Kits() {
  const navigate = useNavigate();
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [kitSeleccionado, setKitSeleccionado] = useState(null);
<<<<<<< HEAD
  const [kitsIncompletos, setKitsIncompletos] = useState([]);
  const [buscar, setBuscar] = useState('');
  const buttonCallbacksRef = useRef({});
=======
>>>>>>> cf985d0a5c3a7df8bd0c18eceeb1d3f2fd80d4cb

  const columnasTabla = [
    { key: 'id', label: 'ID' },
    { key: 'codigoKit', label: 'Código' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'estado', label: 'Estado' },
    { key: 'cantidadItems', label: 'Cantidad' },
  ];

  const camposFormulario = [
    { label: 'Código del Kit', name: 'codigoKit', type: 'text', required: true },
    { label: 'Nombre del Kit', name: 'nombre', type: 'text', required: true },
    { label: 'Descripción', name: 'descripcion', type: 'textarea' },
    { label: 'Cantidad de Items', name: 'cantidadItems', type: 'number', required: true },
  ];

  const cargarKits = async () => {
    setLoading(true);
<<<<<<< HEAD
    const res = await obtenerKits({ buscar });
    setLoading(false);
    if (res.status === 'Success') {
      const datos = res.data || [];
=======
    const res = await obtenerKits();
    setLoading(false);
    console.log('Respuesta obtenerKits:', res);
    if (res.status === 'Success') {
      const datos = res.data || [];
      console.log('Datos kits:', datos);
>>>>>>> cf985d0a5c3a7df8bd0c18eceeb1d3f2fd80d4cb
      setKits(Array.isArray(datos) ? datos : []);
    } else {
      showErrorAlert('Error', res.message || 'No se pudo cargar los kits');
    }
  };

<<<<<<< HEAD
  const verificarIncompletos = async () => {
    const res = await verificarKitsIncompletos();
    if (res.status === 'Success') {
      const incompletos = res.data || [];
      setKitsIncompletos(incompletos);
      
      if (incompletos.length > 0) {
        showWarningAlert(
          '⚠️ ALERTA: Kits Incompletos',
          `Se encontraron ${incompletos.length} kit(s) incompleto(s) que requieren atención inmediata`
        );
      }
    }
  };

  useEffect(() => {
    cargarKits();
    verificarIncompletos();
  }, [buscar]);
=======
  useEffect(() => {
    cargarKits();
  }, []);
>>>>>>> cf985d0a5c3a7df8bd0c18eceeb1d3f2fd80d4cb

  const handleSubmit = async (data) => {
    if (kitSeleccionado) {
      const res = await actualizarKit(kitSeleccionado.id, data);
      if (res.status === 'Success') {
        showSuccessAlert('Éxito', 'Kit actualizado correctamente');
        setMostrarFormulario(false);
        setKitSeleccionado(null);
        cargarKits();
      } else {
        showErrorAlert('Error', res.message || 'No se pudo actualizar el kit');
      }
    } else {
      const res = await crearKit(data);
      if (res.status === 'Success') {
        showSuccessAlert('Éxito', 'Kit creado correctamente');
        setMostrarFormulario(false);
        cargarKits();
      } else {
        showErrorAlert('Error', res.message || 'No se pudo crear el kit');
      }
    }
  };

  const handleEditar = (kit) => {
    setKitSeleccionado(kit);
    setMostrarFormulario(true);
  };

<<<<<<< HEAD
  const handleMarcarIncompleto = async (kit) => {
    const razon = prompt('¿Cuál es la razón por la cual el kit está incompleto?');
    if (!razon) return;

    const res = await marcarKitIncompleto(kit.id, razon);
    if (res.status === 'Success') {
      showSuccessAlert('Kit Marcado', `Se ha marcado el kit como incompleto: ${razon}`);
      cargarKits();
      verificarIncompletos();
    } else {
      showErrorAlert('Error', res.message || 'No se pudo marcar el kit como incompleto');
    }
  };

=======
>>>>>>> cf985d0a5c3a7df8bd0c18eceeb1d3f2fd80d4cb
  const handleEliminar = async (kit) => {
    if (window.confirm(`¿Eliminar kit ${kit.nombre}?`)) {
      const res = await eliminarKit(kit.id);
      if (res.status === 'Success') {
        showSuccessAlert('Éxito', 'Kit eliminado correctamente');
        cargarKits();
<<<<<<< HEAD
        verificarIncompletos();
=======
>>>>>>> cf985d0a5c3a7df8bd0c18eceeb1d3f2fd80d4cb
      } else {
        showErrorAlert('Error', res.message || 'No se pudo eliminar el kit');
      }
    }
  };

  return (
    <div className="main-container">
      <h1>🛠️ Gestión de Kits de Herramientas</h1>

<<<<<<< HEAD
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Buscar por código o nombre..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          style={{
            padding: '10px 15px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            flex: '1',
            minWidth: '250px',
            fontSize: '14px'
          }}
        />
      </div>

      {/* Alerta visual de kits incompletos */}
      {kitsIncompletos.length > 0 && (
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#ffe6e6',
          border: '3px solid #dc3545',
          borderRadius: '5px',
          color: '#721c24'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>🚨 ALERTA: {kitsIncompletos.length} KIT(S) INCOMPLETO(S)</h3>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            {kitsIncompletos.map((kit) => (
              <li key={kit.id} style={{ marginBottom: '5px', fontWeight: 'bold' }}>
                {kit.nombre} (Código: {kit.codigoKit}) - Estado: {kit.estado}
              </li>
            ))}
          </ul>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
            ⚠️ Por favor, revise y complete estos kits de inmediato.
          </p>
        </div>
      )}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
=======
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
>>>>>>> cf985d0a5c3a7df8bd0c18eceeb1d3f2fd80d4cb
        <button
          onClick={() => {
            setMostrarFormulario(!mostrarFormulario);
            setKitSeleccionado(null);
          }}
<<<<<<< HEAD
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
=======
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
>>>>>>> cf985d0a5c3a7df8bd0c18eceeb1d3f2fd80d4cb
        >
          {mostrarFormulario ? 'Cancelar' : '+ Nuevo Kit'}
        </button>
        <button
<<<<<<< HEAD
          onClick={verificarIncompletos}
          style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        >
          🔍 Verificar Alertas
        </button>
        <button
          onClick={() => navigate('/gestion-jornada')}
          style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
=======
          onClick={() => navigate('/gestion-jornada')}
          style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer' }}
>>>>>>> cf985d0a5c3a7df8bd0c18eceeb1d3f2fd80d4cb
        >
          ← Volver al Dashboard
        </button>
      </div>

      {mostrarFormulario && (
<<<<<<< HEAD
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #ddd' }}>
          <h3>{kitSeleccionado ? 'Editar Kit' : 'Crear Nuevo Kit'}</h3>
          <Form 
            fields={camposFormulario} 
            buttonText={kitSeleccionado ? 'Actualizar' : 'Crear'} 
            onSubmit={handleSubmit}
            initialValues={kitSeleccionado}
          />
=======
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
          <h3>{kitSeleccionado ? 'Editar Kit' : 'Crear Nuevo Kit'}</h3>
          <Form fields={camposFormulario} buttonText={kitSeleccionado ? 'Actualizar' : 'Crear'} onSubmit={handleSubmit} />
>>>>>>> cf985d0a5c3a7df8bd0c18eceeb1d3f2fd80d4cb
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
<<<<<<< HEAD
        <h3>Kits Disponibles ({kits.length})</h3>
        <Table
          columns={[...columnasTabla, { key: 'acciones', label: 'Acciones' }]}
          data={kits.map((kit) => {
            const esIncompleto = kitsIncompletos.some(k => k.id === kit.id);
            const btnEditarId = `btn-editar-kit-${kit.id}`;
            const btnEliminarId = `btn-eliminar-kit-${kit.id}`;
            const btnMarcarId = `btn-marcar-kit-${kit.id}`;
            
            // Registrar callbacks en el ref
            buttonCallbacksRef.current[btnEditarId] = () => handleEditar(kit);
            buttonCallbacksRef.current[btnMarcarId] = () => handleMarcarIncompleto(kit);
            buttonCallbacksRef.current[btnEliminarId] = () => handleEliminar(kit);
            
            return {
              ...kit,
              estado: esIncompleto ? '🚨 faltante' : kit.estado,
              acciones: `
                <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                  <button id="${btnEditarId}" title="Editar kit" style="padding: 5px 10px; background-color: #007bff; color: white; border: none; cursor: pointer; border-radius: 3px; font-size: 12px; font-weight: 500;">✏️ Editar</button>
                  <button id="${btnMarcarId}" title="Marcar como incompleto" style="padding: 5px 10px; background-color: #dc3545; color: white; border: none; cursor: pointer; border-radius: 3px; font-size: 12px; font-weight: 500;">🚨 Incompleto</button>
                  <button id="${btnEliminarId}" title="Eliminar kit" style="padding: 5px 10px; background-color: #6c757d; color: white; border: none; cursor: pointer; border-radius: 3px; font-size: 12px; font-weight: 500;">🗑️ Eliminar</button>
                </div>
              `,
            };
          })}
=======
        <h3>Kits Disponibles</h3>
        <Table
          columns={columnasTabla}
          data={kits.map((kit) => ({
            ...kit,
            acciones: (
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={() => handleEditar(kit)} style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>✏️ Editar</button>
                <button onClick={() => handleEliminar(kit)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}>🗑️ Eliminar</button>
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
