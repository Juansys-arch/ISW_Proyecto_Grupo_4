import { useAuth } from '@context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();

    const normalizedRole = String(user?.rol || '').trim().toLowerCase();
    const normalizedAllowedRoles = (allowedRoles || []).map((role) => String(role || '').trim().toLowerCase());

    const hasAccess = normalizedAllowedRoles.length === 0 || normalizedAllowedRoles.includes(normalizedRole) ||
        (normalizedRole === 'super_admin' && normalizedAllowedRoles.includes('administrador')) ||
        (normalizedRole === 'administrador' && normalizedAllowedRoles.includes('super_admin'));

    if (!isAuthenticated) {
        return <Navigate to="/auth" />;
    }

    if (!hasAccess) {
        return <Navigate to="/home" />;
    }

    return children;
};

export default ProtectedRoute;
