import { useEffect, useState } from 'react';
import Table from '../components/Table';
import { getBitacora } from '../services/jornada.service';
import { showErrorAlert } from '../helpers/sweetAlert';

export default function Bitacora() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'tipo', label: 'Tipo de Evento' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'createdAt', label: 'Fecha' },
  ];

  const load = async () => {
    setLoading(true);
    const res = await getBitacora();
    setLoading(false);
    if (res.status === 'Success' || Array.isArray(res)) {
      const data = res.data ? res.data : res;
      setRows(Array.isArray(data) ? data : []);
    } else {
      showErrorAlert('Error', res.message || 'No se pudo obtener la bitácora');
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="main-container">
      <h1>Bitácora de Terreno</h1>
      <Table columns={columns} data={rows} loading={loading} />
    </div>
  );
}
