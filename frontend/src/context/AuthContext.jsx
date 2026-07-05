import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        try {
            const savedUser = sessionStorage.getItem('usuario');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error('Error leyendo usuario de sesión:', error);
            return null;
        }
    });

    const isAuthenticated = !!user;

    const loginContext = (userData) => {
        setUser(userData);
        sessionStorage.setItem('usuario', JSON.stringify(userData));
    };

    const logoutContext = () => {
        setUser(null);
        sessionStorage.removeItem('usuario');
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth');
        }
    }, [isAuthenticated, navigate]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loginContext, logoutContext }}>
            {children}
        </AuthContext.Provider>
    );
}