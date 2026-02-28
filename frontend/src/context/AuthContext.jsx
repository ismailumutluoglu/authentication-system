import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../api/axios.js';

// ─────────────────────────────────────
// 1. CONTEXT OLUŞTUR
// ─────────────────────────────────────
const AuthContext = createContext(null);

// ─────────────────────────────────────
// 2. PROVIDER
// ─────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─────────────────────────────────────
  // Sayfa yenilenince token'ı kurtar
  // ─────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Cookie'deki refresh token ile yeni access token al
        const res = await api.post('/auth/refresh');
        setAccessToken(res.data.accessToken);

        // Kullanıcı bilgisini al
        const profileRes = await api.get('/auth/profile');
        setUser(profileRes.data.user);

      } catch (_) {
        // Refresh token geçersiz veya yok — kullanıcı giriş yapmamış
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ─────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────
  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
  };

  // ─────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
  };

  // ─────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─────────────────────────────────────
// 3. CUSTOM HOOK
// ─────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};