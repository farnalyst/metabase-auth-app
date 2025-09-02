import React, { createContext, useState, useEffect } from 'react';
import API from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            try {
                // Decode token to get user info without verifying on the client
                const decoded = JSON.parse(atob(token.split('.')[1]));
                // Set user if token is not expired
                if (decoded.exp * 1000 > Date.now()) {
                    setUser({
                        id: decoded.id,
                        username: decoded.username,
                        role: decoded.role,
                        level: decoded.level,
                    });
                } else {
                    logout();
                }
            } catch (e) {
                console.error("Invalid token", e);
                logout();
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (username, password) => {
        const { data } = await API.post('/auth/login', { username, password });
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;