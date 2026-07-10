import { NavLink, useNavigate } from "react-router-dom";
import { logout } from '@services/auth.service.js';
import '@styles/navbar.css';
import { useMemo, useState } from "react";
import { useAuth } from '@context/AuthContext';
import ProfileModal from '@components/ProfileModal.jsx';
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

const Navbar = ({ isOpen, onToggle }) => {
    const navigate = useNavigate();
    const { user, logoutContext } = useAuth();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const userRole = user?.rol;
    const userRoleLabel = useMemo(
        () => roleLabels[userRole] || userRole?.replaceAll('_', ' ') || 'Sin rol',
        [userRole],
    );
    const userInitials = useMemo(() => {
        const fullName = user?.nombreCompleto || 'Usuario';
        return fullName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('');
    }, [user?.nombreCompleto]);
    const formattedDate = useMemo(() => {
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(new Date());
    }, []);

    const logoutSubmit = () => {
        try {
            logout();
            logoutContext();
            navigate('/auth');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const getNavLinkClass = ({ isActive }) =>
        isActive ? 'active' : '';

    return (
        <aside className={`navbar ${isOpen ? 'open' : 'collapsed'}`}>
            <div className="sidebar-top">
                <button type="button" className="sidebar-toggle" onClick={onToggle} aria-label={isOpen ? 'Cerrar menú lateral' : 'Abrir menú lateral'}>
                    {isOpen ? '‹' : '›'}
                </button>

                <div className="profile-card" onClick={() => setIsProfileModalOpen(true)} title="Ver mi perfil">
                    <div className="profile-avatar">{userInitials || 'U'}</div>
                    {isOpen && (
                        <div className="profile-info">
                            <p className="profile-name">{user?.nombreCompleto || 'Usuario'}</p>
                        </div>
                    )}
                </div>
                {isOpen && <div className="profile-date-panel">{formattedDate}</div>}
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/home" className={getNavLinkClass} title="Inicio">
                    <span className="nav-icon">⌂</span>
                    {isOpen && <span>Inicio</span>}
                </NavLink>

                {(userRole === 'super_admin' || userRole === 'coordinador' || userRole === 'super_admin') && (
                    <NavLink to="/users" className={getNavLinkClass} title="Usuarios">
                        <span className="nav-icon">◫</span>
                        {isOpen && <span>Usuarios</span>}
                    </NavLink>
                )}

                {(userRole === 'super_admin' || userRole === 'encargado_inventario' || userRole === 'jefe_cuadrilla' || userRole === 'super_admin') && (
                    <NavLink to="/gestion-operativa" className={getNavLinkClass} title="Gestión operativa">
                        <span className="nav-icon">⚙</span>
                        {isOpen && <span>Gestión operativa</span>}
                    </NavLink>
                )}

                {(userRole === 'super_admin' || userRole === 'jefe_cuadrilla' || userRole === 'super_admin') && (
                    <NavLink to="/construccion" className={getNavLinkClass} title="Construcción">
                        <span className="nav-icon">⌘</span>
                        {isOpen && <span>Construcción</span>}
                    </NavLink>
                )}

                {(userRole === 'super_admin' || userRole === 'jefe_cuadrilla') && (
                    <>
                        <NavLink to="/gestion-jornada" className={getNavLinkClass} title="Gestión de jornada">
                            <span className="nav-icon">📅</span>
                            {isOpen && <span>Jornada</span>}
                        </NavLink>
                        <NavLink to="/asistencias" className={getNavLinkClass} title="Asistencias">
                            <span className="nav-icon">📝</span>
                            {isOpen && <span>Asistencias</span>}
                        </NavLink>
                        <NavLink to="/herramientas" className={getNavLinkClass} title="Herramientas">
                            <span className="nav-icon">🔧</span>
                            {isOpen && <span>Herramientas</span>}
                        </NavLink>
                        <NavLink to="/bitacora" className={getNavLinkClass} title="Bitácora">
                            <span className="nav-icon">📖</span>
                            {isOpen && <span>Bitácora</span>}
                        </NavLink>
                        <NavLink to="/kits" className={getNavLinkClass} title="Kits">
                            <span className="nav-icon">🧰</span>
                            {isOpen && <span>Kits</span>}
                        </NavLink>
                        <NavLink to="/transporte" className={getNavLinkClass} title="Transporte">
                            <span className="nav-icon">🚌</span>
                            {isOpen && <span>Transporte</span>}
                        </NavLink>
                        <NavLink to="/evaluacion-cuadrilla" className={getNavLinkClass} title="Evaluación de cuadrilla">
                            <span className="nav-icon">📊</span>
                            {isOpen && <span>Evaluación</span>}
                        </NavLink>
                    </>
                )}

                {(userRole === 'super_admin' || userRole === 'encargado_voluntarios') && (
                    <NavLink to="/voluntarios" className={getNavLinkClass} title="Voluntarios">
                        <span className="nav-icon">👥</span>
                        {isOpen && <span>Voluntarios</span>}
                    </NavLink>
                )}
            </nav>

            <div className="sidebar-footer">
                <NavLink
                    to="/auth"
                    className="logout-link"
                    onClick={() => {
                        logoutSubmit();
                    }}
                >
                    <span className="nav-icon">⇥</span>
                    {isOpen && <span>Cerrar sesión</span>}
                </NavLink>
            </div>
            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={user}
                userRoleLabel={userRoleLabel}
                userInitials={userInitials}
            />
        </aside>
    );
};

export default Navbar;