import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '../components/Form';
import Table from '../components/Table';
import { crearKit, obtenerKits, actualizarKit, eliminarKit } from '../services/jornada.service';
import { showErrorAlert, showSuccessAlert } from '../helpers/sweetAlert';

export default function Kits() {
  const navigate = useNavigate();
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [kitSeleccionado, setKitSeleccionado] = useState(null);

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
    const res = await obtenerKits();
    setLoading(false);
    console.log('Respuesta obtenerKits:', res);
    if (res.status === 'Success') {
      const datos = res.data || [];
      console.log('Datos kits:', datos);
      setKits(Array.isArray(datos) ? datos : []);
    } else {
      showErrorAlert('Error', res.message || 'No se pudo cargar los kits');
    }
  };

  useEffect(() => {
    cargarKits();
  }, []);

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

  const handleEliminar = async (kit) => {
    if (window.confirm(`¿Eliminar kit ${kit.nombre}?`)) {
      const res = await eliminarKit(kit.id);
      if (res.status === 'Success') {
        showSuccessAlert('Éxito', 'Kit eliminado correctamente');
        cargarKits();
      } else {
        showErrorAlert('Error', res.message || 'No se pudo eliminar el kit');
      }
    }
  };

  return (
    <div className="main-container">
      <h1>🛠️ Gestión de Kits de Herramientas</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => {
            setMostrarFormulario(!mostrarFormulario);
            setKitSeleccionado(null);
          }}
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {mostrarFormulario ? 'Cancelar' : '+ Nuevo Kit'}
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
          <h3>{kitSeleccionado ? 'Editar Kit' : 'Crear Nuevo Kit'}</h3>
          <Form fields={camposFormulario} buttonText={kitSeleccionado ? 'Actualizar' : 'Crear'} onSubmit={handleSubmit} />
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
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
          loading={loading}
        />
      </div>
    </div>
  );
}
