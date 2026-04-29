import { useEffect, useState } from 'react';
import Table from '../components/Table';
import { getHerramientas } from '../services/jornada.service';

export default function Herramientas() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const herramientasPrueba = [
    { id: 1, kitId: "KIT-01", estadoEntrega: "completo", observaciones: "Sin novedades", createdAt: "2024-04-28" },
    { id: 2, kitId: "KIT-05", estadoEntrega: "incompleto", observaciones: "Falta martillo (Alerta enviada)", createdAt: "2024-04-28" }
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'kitId', label: 'Kit ID' },
    { key: 'estadoEntrega', label: 'Estado' },
    { key: 'observaciones', label: 'Observaciones' },
    { key: 'createdAt', label: 'Fecha' },
  ];

  const load = async () => {
    setLoading(true);
    try {
      const res = await getHerramientas();
      const data = res.data ? res.data : res;
      setRows(Array.isArray(data) && data.length > 0 ? data : herramientasPrueba);
    } catch (e) {
      setRows(herramientasPrueba);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="main-container">
      <h1>Actas Digitales de Herramientas</h1>
      <Table columns={columns} data={rows} loading={loading} />
    </div>
  );
}