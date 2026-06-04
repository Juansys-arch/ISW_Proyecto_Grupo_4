import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { logout } from '@services/auth.service.js';
import '@styles/navbar.css';
import { useState } from "react";
import NotificationBell from '@components/NotificationBell.jsx';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
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
        if (!menuOpen) {
            removeActiveClass();
        } else {
            addActiveClass();
        }
        setMenuOpen(!menuOpen);
    };

    const removeActiveClass = () => {
        const activeLinks = document.querySelectorAll('.nav-menu ul li a.active');
        activeLinks.forEach(link => link.classList.remove('active'));
    };

    const addActiveClass = () => {
        const links = document.querySelectorAll('.nav-menu ul li a');
        links.forEach(link => {
            if (link.getAttribute('href') === location.pathname) {
                link.classList.add('active');
            }
        });
    };

    return (
        <nav className="navbar">
            <div className={`nav-menu ${menuOpen ? 'activado' : ''}`}>
                <ul>
                    <li>
                        <NavLink 
                            to="/home" 
                            onClick={() => { 
                                setMenuOpen(false); 
                                addActiveClass();
                            }} 
                            className={({ isActive }) => isActive ? "active" : ""}
                        >
                            Inicio
                        </NavLink>
                    </li>
                    {(userRole === 'administrador' || userRole === 'coordinador') && (
                    <li>
                        <NavLink 
                            to="/users" 
                            onClick={() => { 
                                setMenuOpen(false); 
                                addActiveClass();
                            }} 
                            className={({ isActive }) => isActive ? "active" : ""}
                        >
                            Usuarios
                        </NavLink>
                    </li>
                    )}
                    {(userRole === 'administrador' || userRole === 'coordinador') && (
                    <li>
                        <NavLink 
                            to="/admin/requests" 
                            onClick={() => { 
                                setMenuOpen(false); 
                                addActiveClass();
                            }} 
                            className={({ isActive }) => isActive ? "active" : ""}
                        >
                            Solicitudes
                        </NavLink>
                    </li>
                    )}
                    {userRole === 'encargado_inventario' && (
                    <li>
                        <NavLink 
                            to="/notificaciones" 
                            onClick={() => { 
                                setMenuOpen(false); 
                                addActiveClass();
                            }} 
                            className={({ isActive }) => isActive ? "active" : ""}
                        >
                            Notificaciones
                        </NavLink>
                    </li>
                    )}
                    {(userRole === 'administrador' || userRole === 'jefe_cuadrilla' || userRole === 'usuario') && (
                    <li>
                        <NavLink 
                            to="/construccion" 
                            onClick={() => { 
                                setMenuOpen(false); 
                                addActiveClass();
                            }} 
                            className={({ isActive }) => isActive ? "active" : ""}
                        >
                            Construcción
                        </NavLink>
                    </li>
                    )}
                    <li>
                        <NavLink 
                            to="/auth" 
                            onClick={() => { 
                                logoutSubmit(); 
                                setMenuOpen(false); 
                            }} 
                            className={({ isActive }) => isActive ? "active" : ""}
                        >
                            Cerrar sesión
                        </NavLink>
                    </li>
                </ul>
            </div>
            {(userRole === 'administrador' || userRole === 'jefe_cuadrilla') && (
                <NotificationBell />
            )}
            <div className="hamburger" onClick={toggleMenu}>
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </div>
        </nav>
    );
};

export default Navbar;