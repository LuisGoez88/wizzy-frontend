import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        
        if (savedUser && savedUser !== 'undefined' && savedToken) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
            } catch (e) {
                console.error("Error parsing user", e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    // ✅ CORREGIDO: Ahora guarda el TOKEN
    const login = (userData) => {
        if (!userData) return;
        
        setUser(userData);
        
        // 🔥 GUARDAR TOKEN (importante para las peticiones autenticadas)
        if (userData.token) {
            localStorage.setItem('token', userData.token);
        }
        
        // Guardar usuario
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userRole', userData.role || 'CLIENTE');
        localStorage.setItem('userName', userData.nombre || 'Usuario');
        localStorage.setItem('userId', userData.id || '');
        localStorage.setItem('tipoVendedor', userData.tipoVendedor || '');
    };

    const updateUser = (updatedUserData) => {
        if (!updatedUserData) return;
        
        const mergedUser = { ...user, ...updatedUserData };
        setUser(mergedUser);
        localStorage.setItem('user', JSON.stringify(mergedUser));
        
        if (updatedUserData.nombre) {
            localStorage.setItem('userName', updatedUserData.nombre);
        }
        if (updatedUserData.role) {
            localStorage.setItem('userRole', updatedUserData.role);
        }
        if (updatedUserData.id) {
            localStorage.setItem('userId', updatedUserData.id);
        }
        if (updatedUserData.tipoVendedor !== undefined) {
            localStorage.setItem('tipoVendedor', updatedUserData.tipoVendedor);
        }
        if (updatedUserData.telefono) {
            mergedUser.telefono = updatedUserData.telefono;
        }
        if (updatedUserData.whatsapp) {
            mergedUser.whatsapp = updatedUserData.whatsapp;
        }
        if (updatedUserData.direccionResidencia) {
            mergedUser.direccionResidencia = updatedUserData.direccionResidencia;
        }
        if (updatedUserData.nombreNegocio) {
            mergedUser.nombreNegocio = updatedUserData.nombreNegocio;
        }
        if (updatedUserData.descripcionTienda) {
            mergedUser.descripcionTienda = updatedUserData.descripcionTienda;
        }
        if (updatedUserData.whatsappContacto) {
            mergedUser.whatsappContacto = updatedUserData.whatsappContacto;
        }
        
        localStorage.setItem('user', JSON.stringify(mergedUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }
    return context;
};