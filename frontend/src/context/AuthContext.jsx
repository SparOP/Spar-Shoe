import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Check local storage for initial token/user data
    const [auth, setAuth] = useState(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        const role = localStorage.getItem('role');
        return { token, user, role };
    });

    // --- Login Function ---
    const login = (token, name, role) => {
        setAuth({ token, user: name, role });
        localStorage.setItem('token', token);
        localStorage.setItem('user', name);
        localStorage.setItem('role', role);
    };

    // --- Logout Function ---
    const logout = () => {
        setAuth({ token: null, user: null, role: null });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};