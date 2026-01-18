import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (identifier, password) => {
        try {
            const response = await api.post('/auth/login', { identifier, password });
            const { user, token } = response.data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return { success: true };
        } catch (error) {
            console.log("LOGIN ERROR FULL:", error);
            console.log("LOGIN ERROR RESPONSE:", error?.response);
            console.log("LOGIN ERROR DATA:", error?.response?.data);
            console.log("LOGIN STATUS:", error?.response?.status);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (data) => {
        try {
            const response = await api.post('/auth/register', data);
            const { user, token } = response.data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return { success: true };
        } catch (error) {
            console.log("LOGIN ERROR FULL:", error);
            console.log("LOGIN ERROR RESPONSE:", error?.response);
            console.log("LOGIN ERROR DATA:", error?.response?.data);
            console.log("LOGIN STATUS:", error?.response?.status);
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
