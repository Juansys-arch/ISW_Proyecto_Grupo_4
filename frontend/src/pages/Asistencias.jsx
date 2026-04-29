import { useEffect, useState } from 'react';
import Table from '../components/Table';
import { getAsistencias } from '../services/jornada.service';
import { showErrorAlert } from '../helpers/sweetAlert';

export default function Asistencias() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const datosPrueba = [
    { id: 1, rut: "11.111.111-1", estado: "abordaje", createdAt: "2024-04-28" },
    { id: 2, rut: "22.222.222-2", estado: "inasistencia", createdAt: "2024-04-28" }
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'rut', label: 'RUT' },
    { key: 'estado', label: 'Estado' },
    { key: 'createdAt', label: 'Fecha' },
  ];

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAsistencias();
      if (res.status === 'Success' || Array.isArray(res)) {
        const data = res.data ? res.data : res;
        setRows(data.length > 0 ? data : datosPrueba);
      } else {
  setRows(datosPrueba);
      }
    } catch (error) {
      setRows(datosPrueba);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="main-container">
      <h1>Histórico de Asistencias</h1>
      <Table columns={columns} data={rows} loading={loading} />
    </div>
  );
}