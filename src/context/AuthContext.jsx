import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi } from '../api/api';

const AuthContext = createContext(null);

function parseToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub,
      email: payload.email || '',
      role: payload.role || '',
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token: newToken, email: userEmail } = res.data;
    const parsed = parseToken(newToken);
    if (!parsed) throw new Error('Token inválido');
    const userData = { ...parsed, email: userEmail };
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }, []);

  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) return;
    const parsed = parseToken(token);
    if (!parsed || !parsed.id) {
      logout();
    }
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
