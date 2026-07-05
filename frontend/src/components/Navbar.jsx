import { NavLink, useNavigate } from "react-router-dom";
import { logout } from '@services/auth.service.js';
import '@styles/navbar.css';
import { useMemo, useState } from "react";
import NotificationBell from '@components/NotificationBell.jsx';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem('usuario')) || '';
    const userRole = user?.rol;
    const [menuOpen, setMenuOpen] = useState(false);

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
        <nav className="navbar">
            <ul className={menuOpen ? 'active' : ''}>
                <li>
                    <NavLink
                        to="/home"
                        className={getNavLinkClass}
                        onClick={() => setMenuOpen(false)}
                    >
                        Inicio
                    </NavLink>
                </li>

                {/* Gestión de Usuarios: Solo administrador */}
                {(userRole === 'administrador' || userRole === 'coordinador') && (
                    <li>
                        <NavLink
                            to="/users"
                            className={getNavLinkClass}
                            onClick={() => setMenuOpen(false)}
                        >
                            Usuarios
                        </NavLink>
                    </li>
                )}

                {(userRole === 'administrador' || userRole === 'encargado_inventario' || userRole === 'jefe_cuadrilla') && (
                    <li>
                        <NavLink
                            to="/gestion-operativa"
                            className={getNavLinkClass}
                            onClick={() => setMenuOpen(false)}
                        >
                            Gestión operativa
                        </NavLink>
                    </li>
                )}

                {(userRole === 'administrador' || userRole === 'jefe_cuadrilla') && (
                    <li>
                        <NavLink
                            to="/construccion"
                            className={getNavLinkClass}
                            onClick={() => setMenuOpen(false)}
                        >
                            Construcción
                        </NavLink>
                    </>
                )}

                {(userRole === 'administrador' || userRole === 'encargado_voluntarios') && (
                    <NavLink to="/voluntarios" className={getNavLinkClass} title="Voluntarios">
                        <span className="nav-icon">👥</span>
                        {isOpen && <span>Voluntarios</span>}
                    </NavLink>
                )}

                {(userRole === 'administrador' || userRole === 'encargado_inventario' || userRole === 'jefe_cuadrilla') && (
                    <li>
                        <NotificationBell />
                        {isOpen && <span>Notificaciones</span>}
                    </div>
                )}
            </nav>

                <li>
                    <NavLink
                        to="/auth"
                        className={getNavLinkClass}
                        onClick={() => {
                            logoutSubmit();
                            setMenuOpen(false);
                        }}
                    >
                        Cerrar sesión
                    </NavLink>
                </li>
            </ul>

            <div
                className={`hamburger ${menuOpen ? 'active' : ''}`}
                onClick={toggleMenu}
            >
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
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