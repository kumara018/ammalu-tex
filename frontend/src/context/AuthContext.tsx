'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authAPI } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser  = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
      // Restore cookie so middleware can protect routes on hard refresh
      document.cookie = `auth_token=${storedToken}; path=/; max-age=86400; SameSite=Lax`;
    }
    setLoading(false);
  }, []);

  // ── Keep Render backend awake ─────────────────────────────────────────────
  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'https://ammalu-tex.onrender.com';
    const ping = () => fetch(`${API}/health`, { method: 'GET' }).catch(() => {});
    ping(); // Wake up immediately when app loads
    const iv = setInterval(ping, 14 * 60 * 1000); // Ping every 14 min
    return () => clearInterval(iv);
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    // Cookie for Next.js middleware route protection
    document.cookie = `auth_token=${newToken}; path=/; max-age=86400; SameSite=Lax`;
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'auth_token=; path=/; max-age=0';
    setToken(null);
    setUser(null);
  };

  const refresh = async () => {
    try {
      const res = await authAPI.getMe();
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
