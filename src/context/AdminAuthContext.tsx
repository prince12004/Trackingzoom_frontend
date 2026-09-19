'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setAccessToken, ApiEnvelope } from '@/lib/api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: { name: string; slug: string; permissions: string[] } | string;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
}

interface AdminAuthContextValue {
  admin: AdminUser | null;
  loading: boolean;
  permissions: string[];
  isSuperAdmin: boolean;
  hasPermission: (code: string) => boolean;
  login: (email: string, password: string) => Promise<{ requiresTwoFactor: boolean; adminId?: string }>;
  verifyTwoFactor: (adminId: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAdmin = useCallback(async () => {
    try {
      const res = await api.post<ApiEnvelope<{ accessToken: string }>>('/admin/auth/refresh');
      setAccessToken(res.data.data.accessToken, 'admin');
      const me = await api.get<ApiEnvelope<AdminUser>>('/admin/auth/me');
      setAdmin(me.data.data);
    } catch {
      setAdmin(null);
      setAccessToken(null, 'admin');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<ApiEnvelope<{ requiresTwoFactor?: boolean; adminId?: string; admin?: AdminUser; accessToken?: string }>>(
      '/admin/auth/login',
      { email, password }
    );
    if (res.data.data.requiresTwoFactor) {
      return { requiresTwoFactor: true, adminId: res.data.data.adminId };
    }
    setAccessToken(res.data.data.accessToken!, 'admin');
    setAdmin(res.data.data.admin!);
    return { requiresTwoFactor: false };
  };

  const verifyTwoFactor = async (adminId: string, code: string) => {
    const res = await api.post<ApiEnvelope<{ admin: AdminUser; accessToken: string }>>('/admin/auth/2fa/verify-login', {
      adminId,
      code,
    });
    setAccessToken(res.data.data.accessToken, 'admin');
    setAdmin(res.data.data.admin);
  };

  const logout = async () => {
    try {
      await api.post('/admin/auth/logout');
    } finally {
      setAccessToken(null, 'admin');
      setAdmin(null);
    }
  };

  const roleObj = typeof admin?.role === 'object' ? admin.role : null;
  const permissions = roleObj?.permissions || [];
  const isSuperAdmin = roleObj?.slug === 'super_admin';

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        permissions,
        isSuperAdmin,
        hasPermission: (code) => isSuperAdmin || permissions.includes(code),
        login,
        verifyTwoFactor,
        logout,
        refreshAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
