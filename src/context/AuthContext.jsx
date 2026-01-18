import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (identifier, password) => {
        try {
            const response = await api.post("/api/auth/login", { identifier, password });

            const payload = response.data?.data || response.data;
            const { user, token } = payload;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            setUser(user);

            return { success: true };
        } catch (error) {
            console.log("LOGIN ERROR:", error?.response?.status, error?.response?.data);

            return {
                success: false,
                message: error?.response?.data?.message || "Login failed",
            };
        }
    };

    const register = async (data) => {
        try {
            const response = await api.post("/api/auth/register", data);

            const payload = response.data?.data || response.data;
            const { user, token } = payload;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            setUser(user);

            return { success: true };
        } catch (error) {
            console.log("REGISTER ERROR:", error?.response?.status, error?.response?.data);

            return {
                success: false,
                message: error?.response?.data?.message || "Registration failed",
            };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
