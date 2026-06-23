import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { logout } from '@services/auth.service.js';
import '@styles/navbar.css';
import { useState } from "react";
import NotificationBell from '@components/NotificationBell.jsx';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem('usuario')) || '';
    const userRole = user?.rol;
    const [menuOpen, setMenuOpen] = useState(false);

    const logoutSubmit = () => {
        try {
            logout();
            navigate('/auth');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
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
                    </li>
                )}

                {(userRole === 'administrador' || userRole === 'encargado_inventario' || userRole === 'jefe_cuadrilla') && (
                    <li>
                        <NotificationBell />
                    </li>
                )}

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
        </nav>
    );
};

export default Navbar;