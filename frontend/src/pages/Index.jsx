import { Navigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

const Index = () => {
    const { isAuthenticated } = useAuth();
    
    return isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/auth" />;
};

export default Index;
