
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

    if (user?.rol === 'jefe_cuadrilla' || user?.rol === 'administrador') {
      navigate('/gestion-jornada');
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