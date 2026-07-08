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
  const [kitsIncompletos, setKitsIncompletos] = useState([]);
  const [buscar, setBuscar] = useState('');
  const buttonCallbacksRef = useRef({});

  const columnasTabla = [
    { key: 'codigoKit', label: 'Código', minWidth: 120 },
    { key: 'nombre', label: 'Nombre', minWidth: 200 },
    { key: 'estado', label: 'Estado', minWidth: 120 },
    { key: 'cantidadItems', label: 'Cantidad', minWidth: 120 },
    { key: 'acciones', label: 'Acciones', minWidth: 220, headerSort: false },
  ];

  const camposFormulario = [
    { label: 'Código del Kit', name: 'codigoKit', type: 'text', required: true },
    { label: 'Nombre del Kit', name: 'nombre', type: 'text', required: true },
    { label: 'Descripción', name: 'descripcion', type: 'textarea' },
    { label: 'Cantidad de Items', name: 'cantidadItems', type: 'number', required: true },
  ];

  const cargarKits = async () => {
    setLoading(true);
    const res = await obtenerKits({ buscar });
    setLoading(false);
    if (res.status === 'Success') {
      const datos = res.data || [];
      setKits(Array.isArray(datos) ? datos : []);
    } else {
      showErrorAlert('Error', res.message || 'No se pudo cargar los kits');
    }
  };

  const verificarIncompletos = async () => {
    const res = await verificarKitsIncompletos();
    if (res.status === 'Success') {
      const incompletos = res.data || [];
      setKitsIncompletos(incompletos);
      
      if (incompletos.length > 0) {
        showWarningAlert(
          'ALERTA: Kits Incompletos',
          `Se encontraron ${incompletos.length} kit(s) incompleto(s) que requieren atención inmediata`
        );
      }
    }
  };

  useEffect(() => {
    cargarKits();
    verificarIncompletos();
  }, [buscar]);

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

  const handleEliminar = async (kit) => {
    if (window.confirm(`¿Eliminar kit ${kit.nombre}?`)) {
      const res = await eliminarKit(kit.id);
      if (res.status === 'Success') {
        showSuccessAlert('Éxito', 'Kit eliminado correctamente');
        cargarKits();
        verificarIncompletos();
      } else {
        showErrorAlert('Error', res.message || 'No se pudo eliminar el kit');
      }
    }
  };

  return (
    <div className="jornada-page">
      <div className="header-section">
        <div>
          <h1 style={{ color: '#0b3b5a', margin: 0 }}>Gestión de Kits de Herramientas</h1>
          <p style={{ color: '#4b6077', marginTop: 4 }}>Administra los kits de herramientas disponibles y verifica alertas.</p>
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
          placeholder="🔍 Buscar por código o nombre..."
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
            setKitSeleccionado(null);
          }}
          className={mostrarFormulario ? "btn-secondary" : "btn-primary"}
          style={{ height: '42px', padding: '0 16px', borderRadius: '8px', border: mostrarFormulario ? '1px solid #0b5ca8' : 'none' }}
        >
          {mostrarFormulario ? '✕ Cancelar' : '➕ Nuevo Kit'}
        </button>
        <button
          onClick={verificarIncompletos}
          className="btn-primary"
          style={{ backgroundColor: '#dc3545', border: 'none', height: '42px', padding: '0 16px', borderRadius: '8px' }}
        >
          🚨 Verificar Alertas
        </button>
      </div>

      {/* Alerta visual de kits incompletos */}
      {kitsIncompletos.length > 0 && (
        <div className="alert-banner alert-danger" style={{ display: 'block', margin: '20px 0' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#b91c1c' }}>🚨 ALERTA: {kitsIncompletos.length} KIT(S) INCOMPLETO(S)</h3>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            {kitsIncompletos.map((kit) => (
              <li key={kit.id} style={{ marginBottom: '5px', fontWeight: '600' }}>
                {kit.nombre} (Código: {kit.codigoKit}) - Estado: {kit.estado}
              </li>
            ))}
          </ul>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
            Por favor, revise y complete estos kits de inmediato.
          </p>
        </div>
      )}

      {mostrarFormulario && (
        <div className="form-wrapper">
          <h3 style={{ color: '#0b3b5a', marginTop: 0, marginBottom: '20px' }}>{kitSeleccionado ? 'Editar Kit' : 'Crear Nuevo Kit'}</h3>
          <Form 
            fields={camposFormulario} 
            buttonText={kitSeleccionado ? 'Actualizar' : 'Crear'} 
            onSubmit={handleSubmit}
            initialValues={kitSeleccionado}
          />
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3 style={{ color: '#0b3b5a' }}>Kits Disponibles ({kits.length})</h3>
        <Table
          columns={columnasTabla}
          data={kits.map((kit) => {
            const esIncompleto = kitsIncompletos.some(k => k.id === kit.id);
            const btnEditarId = `btn-editar-kit-${kit.id}`;
            const btnEliminarId = `btn-eliminar-kit-${kit.id}`;
            
            // Registrar callbacks en el ref compartido con useTable
            buttonCallbacksRef.current[btnEditarId] = () => handleEditar(kit);
            buttonCallbacksRef.current[btnEliminarId] = () => handleEliminar(kit);
            
            return {
              ...kit,
              estado: esIncompleto ? 'faltante' : kit.estado,
              acciones: `<div style="display:flex;gap:5px;"><button id="${btnEditarId}" style="padding:5px 10px;background-color:#007bff;color:white;border:none;cursor:pointer;border-radius:3px;font-size:12px;">Actualizar</button><button id="${btnEliminarId}" style="padding:5px 10px;background-color:#dc3545;color:white;border:none;cursor:pointer;border-radius:3px;font-size:12px;">Eliminar</button></div>`,
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
