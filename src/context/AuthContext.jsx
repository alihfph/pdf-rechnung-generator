import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getApiUrl, getStoredToken, setStoredToken, apiFetch } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getStoredToken);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!getApiUrl());

  const setToken = useCallback((t) => {
    setStoredToken(t);
    setTokenState(t);
    if (!t) setUser(null);
  }, []);

  useEffect(() => {
    if (!getApiUrl() || !token) {
      setLoading(false);
      return;
    }
    apiFetch('/auth/me')
      .then((data) => setUser(data))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, [token, setToken]);

  const register = useCallback(async (email, password) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(data.access_token);
    setTokenState(data.access_token);
    setUser(data.user);
    return data;
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(data.access_token);
    setTokenState(data.access_token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, [setToken]);

  const value = {
    token,
    user,
    loading,
    register,
    login,
    logout,
    isBackendConfigured: !!getApiUrl(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
