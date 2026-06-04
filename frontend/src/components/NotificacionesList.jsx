import { useNotificaciones } from '@hooks/notificaciones/useNotificaciones.jsx';
import '../styles/notificaciones.css';

export function NotificacionesList() {
    const { notificaciones, loading, error, marcarLeida } = useNotificaciones();

    if (loading) {
        return <div className="notificaciones-container"><p className="loading">Cargando notificaciones...</p></div>;
    }

    if (error) {
        return <div className="notificaciones-container"><p className="error">{error}</p></div>;
    }

    const noLeidasCount = notificaciones.filter(n => !n.leida).length;

    return (
        <div className="notificaciones-container">
            <div className="notificaciones-header">
                <h2>Notificaciones</h2>
                <span className="badge-count">{noLeidasCount} nuevas</span>
            </div>

            {notificaciones.length === 0 ? (
                <p className="no-notifications">No hay notificaciones</p>
            ) : (
                <div className="notificaciones-list">
                    {notificaciones.map((notificacion) => (
                        <div
                            key={notificacion.id}
                            className={`notificacion-item ${notificacion.leida ? 'leida' : 'no-leida'}`}
                        >
                            <div className="notificacion-content">
                                <div className="notificacion-header-item">
                                    <span className="notificacion-tipo">{notificacion.tipo}</span>
                                    {!notificacion.leida && <div className="dot-nuevo"></div>}
                                </div>
                                <p className="notificacion-mensaje">{notificacion.mensaje}</p>
                                <small className="notificacion-fecha">
                                    {new Date(notificacion.createdAt).toLocaleString('es-ES')}
                                </small>
                            </div>
                            {!notificacion.leida && (
                                <button
                                    className="btn-marcar-leida"
                                    onClick={() => marcarLeida(notificacion.id)}
                                    title="Marcar como leída"
                                >
                                    ✓
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
