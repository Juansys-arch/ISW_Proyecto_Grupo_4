
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (user?.rol === 'super_admin' || user?.rol === 'coordinador') {
      navigate('/users');
    } else if (user?.rol === 'jefe_cuadrilla') {
      navigate('/gestion-jornada');
    } else if (user?.rol === 'encargado_inventario') {
      navigate('/gestion-operativa');
    } else {
      navigate('/asistencias');
    }
  }, [user, isAuthenticated, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <p>Redirigiendo a tu panel de TECHO...</p>
    </div>
  );
};

export default Home;