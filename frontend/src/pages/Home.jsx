import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import NotificationBell from '@components/NotificationBell.jsx';
import '@styles/home.css';

const roleLabels = {
    administrador: 'Administrador',
    super_admin: 'Super Admin',
    superadmin: 'Super Admin',
    voluntario: 'Voluntario',
    usuario: 'Usuario',
    jefe_cuadrilla: 'Jefe de Cuadrilla',
    encargado_inventario: 'Encargado de Inventario',
    encargado_voluntarios: 'Encargado de Voluntarios',
    coordinador: 'Coordinador',
};

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const userRole = user?.rol;
  const userRoleLabel = roleLabels[userRole] || userRole?.replaceAll('_', ' ') || 'Sin rol';

  if (!isAuthenticated) return null;

  return (
    <div className="home-dashboard">
      <header className="home-header">
        <div className="welcome-message">
          <h1>¡Hola, {user?.nombreCompleto || 'Usuario'}!</h1>
          <p className="welcome-subtitle">Te damos la bienvenida al portal de gestión de TECHO.</p>
        </div>
        <div className="home-notifications-wrapper">
          <NotificationBell />
        </div>
      </header>

      <section className="home-welcome-card">
        <div className="welcome-card-content">
          <div className="user-profile-badge">
            <span className="profile-role-badge">{userRoleLabel}</span>
          </div>
          <h2>Tu Espacio de Trabajo</h2>
          <p>Desde este portal podrás acceder a todas las secciones utilizando la barra de navegación lateral. Tu campana de notificaciones se encuentra arriba a la derecha.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;