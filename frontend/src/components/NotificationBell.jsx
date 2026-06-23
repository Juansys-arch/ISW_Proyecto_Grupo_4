import { useState } from 'react';
import { useNotificacionesNav } from '@hooks/notificaciones/useNotificacionesNav';
import { marcarNotificacionLeida } from '@services/notificacion.service';
import '../styles/navbar-notifications.css';

const NotificationBell = () => {
    const { unreadCount, refrescar, notificaciones } = useNotificacionesNav();
    const [isOpen, setIsOpen] = useState(false);

    const handleBellClick = () => {
        setIsOpen(!isOpen);
        refrescar();
    };

    const handleMarkAsRead = async (id) => {
        await marcarNotificacionLeida(id);
        refrescar();
    };

    return (
        <div className="notification-bell-container">
            <button 
                className="notification-bell"
                onClick={handleBellClick}
                title={unreadCount > 0 ? `${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''}` : 'Sin notificaciones'}
            >
                <span className="bell-icon">🔔</span>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-dropdown-header">
                        <h3>Notificaciones</h3>
                        <button 
                            className="close-btn"
                            onClick={() => setIsOpen(false)}
                        >
                            ✕
                        </button>
                    </div>
                    
                    <div className="notification-dropdown-content">
                        {notificaciones.length === 0 ? (
                            <p className="no-notifications">No hay notificaciones</p>
                        ) : (
                            <ul className="notification-list">
                                {notificaciones.map((notif) => (
                                    <li 
                                        key={notif.id} 
                                        className={`notification-item ${notif.leida ? 'leida' : 'no-leida'}`}
                                    >
                                        <div className="notification-item-content">
                                            <div className="notification-item-header">
                                                <span className="notification-tipo">{notif.tipo}</span>
                                                {!notif.leida && <span className="dot-badge"></span>}
                                            </div>
                                            <p className="notification-message">{notif.mensaje}</p>
                                            <small className="notification-time">
                                                {new Date(notif.createdAt).toLocaleString('es-ES')}
                                            </small>
                                        </div>
                                        {!notif.leida && (
                                            <button
                                                className="mark-read-btn"
                                                onClick={() => handleMarkAsRead(notif.id)}
                                                title="Marcar como leída"
                                            >
                                                ✓
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
