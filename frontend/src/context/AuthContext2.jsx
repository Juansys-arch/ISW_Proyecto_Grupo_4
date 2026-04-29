import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = sessionStorage.getItem('usuario');
        return savedUser ? JSON.parse(savedUser) : null;
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

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loginContext, logoutContext }}>
            {children}
        </AuthContext.Provider>
    );
}