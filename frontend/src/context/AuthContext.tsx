'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authAPI } from '@/lib/api';

export interface SavedSession {
  token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  sessions: SavedSession[];
  login: (token: string, user: User) => void;
  logout: () => void;
  switchAccount: (session: SavedSession) => void;
  removeSession: (userId: number) => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  sessions: [],
  login: () => {},
  logout: () => {},
  switchAccount: () => {},
  removeSession: () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,     setUser]     = useState<User | null>(null);
  const [token,    setToken]    = useState<string | null>(null);
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [loading,  setLoading]  = useState(true);

  // ── Restore state on mount ────────────────────────────────────────────────
  useEffect(() => {
    const storedToken    = localStorage.getItem('token');
    const storedUser     = localStorage.getItem('user');
    const storedSessions = localStorage.getItem('sessions');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try { setUser(JSON.parse(storedUser)); } catch {}
      document.cookie = `auth_token=${storedToken}; path=/; max-age=2592000; SameSite=Lax`;
    }
    if (storedSessions) {
      try { setSessions(JSON.parse(storedSessions)); } catch {}
    }
    setLoading(false);
  }, []);

  // ── Keep Render backend awake ─────────────────────────────────────────────
  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'https://ammalu-tex.onrender.com';
    const ping = () => fetch(`${API}/health`, { method: 'GET' }).catch(() => {});
    ping();
    const iv = setInterval(ping, 14 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const _setCookie = (t: string) => {
    document.cookie = `auth_token=${t}; path=/; max-age=2592000; SameSite=Lax`;
  };
  const _clearCookie = () => {
    document.cookie = 'auth_token=; path=/; max-age=0';
  };
  const _persistSessions = (list: SavedSession[]) => {
    setSessions(list);
    localStorage.setItem('sessions', JSON.stringify(list));
  };

  // ── Login (also called after OTP verify) ──────────────────────────────────
  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    _setCookie(newToken);
    setToken(newToken);
    setUser(newUser);

    // Upsert this session — replace existing entry for same user, prepend otherwise
    setSessions(prev => {
      const without = prev.filter(s => s.user.id !== newUser.id);
      const updated = [{ token: newToken, user: newUser }, ...without];
      localStorage.setItem('sessions', JSON.stringify(updated));
      return updated;
    });
  };

  // ── Instant account switch — no OTP, no page reload ──────────────────────
  const switchAccount = (session: SavedSession) => {
    localStorage.setItem('token', session.token);
    localStorage.setItem('user', JSON.stringify(session.user));
    _setCookie(session.token);
    setToken(session.token);
    setUser(session.user);

    // Bring switched account to front of list
    setSessions(prev => {
      const others  = prev.filter(s => s.user.id !== session.user.id);
      const updated = [session, ...others];
      localStorage.setItem('sessions', JSON.stringify(updated));
      return updated;
    });
  };

  // ── Remove one saved session (without affecting the active one) ───────────
  const removeSession = (userId: number) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.user.id !== userId);
      localStorage.setItem('sessions', JSON.stringify(updated));
      return updated;
    });
  };

  // ── Sign out current account only ────────────────────────────────────────
  // If other saved sessions exist → auto-switch to the next one (like Amazon/Google).
  // If no other sessions → fully log out.
  const logout = () => {
    const currentId = user?.id;
    const remaining = sessions.filter(s => s.user.id !== currentId);

    // Always update sessions list (remove signed-out account)
    setSessions(remaining);
    localStorage.setItem('sessions', JSON.stringify(remaining));

    if (remaining.length > 0) {
      // Switch to the next saved account seamlessly
      const next = remaining[0];
      localStorage.setItem('token', next.token);
      localStorage.setItem('user', JSON.stringify(next.user));
      _setCookie(next.token);
      setToken(next.token);
      setUser(next.user);
    } else {
      // No other saved accounts — full sign-out
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      _clearCookie();
      setToken(null);
      setUser(null);
    }
  };

  // ── Refresh current user from API ─────────────────────────────────────────
  const refresh = async () => {
    try {
      const res = await authAPI.getMe();
      const fresh = res.data as User;
      setUser(fresh);
      localStorage.setItem('user', JSON.stringify(fresh));
      setSessions(prev => {
        const updated = prev.map(s =>
          s.user.id === fresh.id ? { ...s, user: fresh } : s
        );
        localStorage.setItem('sessions', JSON.stringify(updated));
        return updated;
      });
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, sessions, login, logout, switchAccount, removeSession, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
