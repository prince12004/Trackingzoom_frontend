import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

type Scope = 'customer' | 'admin';

// Separate in-memory + sessionStorage slots per scope so an admin session in
// one tab never clobbers a customer session's access token (and vice versa).
const tokens: Record<Scope, string | null> = { customer: null, admin: null };
const STORAGE_KEYS: Record<Scope, string> = {
  customer: 'tz_access_token',
  admin: 'tz_admin_access_token',
};
const refreshPromises: Record<Scope, Promise<string | null> | null> = { customer: null, admin: null };

function scopeForUrl(url?: string): Scope {
  return url?.includes('/admin/') ? 'admin' : 'customer';
}

export function setAccessToken(token: string | null, scope: Scope = 'customer') {
  tokens[scope] = token;
  if (typeof window !== 'undefined') {
    if (token) sessionStorage.setItem(STORAGE_KEYS[scope], token);
    else sessionStorage.removeItem(STORAGE_KEYS[scope]);
  }
}

export function getAccessToken(scope: Scope = 'customer'): string | null {
  if (tokens[scope]) return tokens[scope];
  if (typeof window !== 'undefined') {
    tokens[scope] = sessionStorage.getItem(STORAGE_KEYS[scope]);
  }
  return tokens[scope];
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const scope = scopeForUrl(config.url);
  const token = getAccessToken(scope);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function refreshAccessToken(scope: Scope): Promise<string | null> {
  try {
    const path = scope === 'admin' ? '/admin/auth/refresh' : '/auth/refresh';
    const res = await axios.post(`${API_URL}${path}`, {}, { withCredentials: true });
    const token = res.data?.data?.accessToken as string;
    setAccessToken(token, scope);
    return token;
  } catch {
    setAccessToken(null, scope);
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (error.response?.status === 401 && original && !original._retry && !original.url?.includes('/refresh')) {
      original._retry = true;
      const scope = scopeForUrl(original.url);
      if (!refreshPromises[scope]) {
        refreshPromises[scope] = refreshAccessToken(scope).finally(() => {
          refreshPromises[scope] = null;
        });
      }
      const newToken = await refreshPromises[scope];
      if (newToken) {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

export function extractApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || err.message || 'Something went wrong';
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}
