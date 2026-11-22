import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      authService
        .getMe()
        .then((res) => {
          setUser(res.data.user || res.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await authService.login(email, password);
    const { token: jwt, user: userData } = res.data;
    localStorage.setItem('token', jwt);
    setToken(jwt);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await authService.register(name, email, password);
    const { token: jwt, user: userData } = res.data;
    localStorage.setItem('token', jwt);
    setToken(jwt);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  }, []);

  const value = { user, token, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
