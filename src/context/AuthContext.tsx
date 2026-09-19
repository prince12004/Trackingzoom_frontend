'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setAccessToken, ApiEnvelope } from '@/lib/api';
import { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  requestOtp: (mobile: string, purpose: 'register' | 'login') => Promise<string | undefined>;
  verifyRegister: (mobile: string, code: string, name: string) => Promise<void>;
  verifyLogin: (mobile: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.post<ApiEnvelope<{ accessToken: string }>>('/auth/refresh');
      setAccessToken(res.data.data.accessToken);
      const me = await api.get<ApiEnvelope<User>>('/auth/me');
      setUser(me.data.data);
    } catch {
      setUser(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestOtp = async (mobile: string, purpose: 'register' | 'login') => {
    const res = await api.post<ApiEnvelope<{ mobile: string; devOtp?: string }>>('/auth/otp/request', { mobile, purpose });
    return res.data.data.devOtp;
  };

  const verifyRegister = async (mobile: string, code: string, name: string) => {
    const res = await api.post<ApiEnvelope<{ user: User; accessToken: string }>>('/auth/register/verify', {
      mobile,
      code,
      name,
    });
    setAccessToken(res.data.data.accessToken);
    setUser(res.data.data.user);
  };

  const verifyLogin = async (mobile: string, code: string) => {
    const res = await api.post<ApiEnvelope<{ user: User; accessToken: string }>>('/auth/login/verify', {
      mobile,
      code,
    });
    setAccessToken(res.data.data.accessToken);
    setUser(res.data.data.user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, requestOtp, verifyRegister, verifyLogin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
