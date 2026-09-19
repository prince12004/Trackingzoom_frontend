'use client';

import { createContext, useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';
import { Product } from '@/types';
import { useToast } from './ToastContext';

interface CompareListData {
  products: Product[];
}

interface CompareContextValue {
  products: Product[];
  isLoading: boolean;
  isComparing: (productId: string) => boolean;
  add: (productId: string) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
}

const CompareContext = createContext<CompareContextValue | null>(null);
const COMPARE_KEY = ['compare'];

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: COMPARE_KEY,
    queryFn: async () => {
      const res = await api.get<ApiEnvelope<CompareListData>>('/compare');
      return res.data.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await api.post<ApiEnvelope<CompareListData>>('/compare', { productId });
      return res.data.data;
    },
    onSuccess: (d) => {
      queryClient.setQueryData(COMPARE_KEY, d);
      showToast('Added to compare', 'success');
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await api.delete<ApiEnvelope<CompareListData>>(`/compare/${productId}`);
      return res.data.data;
    },
    onSuccess: (d) => queryClient.setQueryData(COMPARE_KEY, d),
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete<ApiEnvelope<CompareListData>>('/compare');
      return res.data.data;
    },
    onSuccess: (d) => queryClient.setQueryData(COMPARE_KEY, d),
  });

  const productIds = new Set((data?.products || []).map((p) => p._id));

  return (
    <CompareContext.Provider
      value={{
        products: data?.products || [],
        isLoading,
        isComparing: (productId) => productIds.has(productId),
        add: async (productId) => {
          await addMutation.mutateAsync(productId);
        },
        remove: async (productId) => {
          await removeMutation.mutateAsync(productId);
        },
        clear: async () => {
          await clearMutation.mutateAsync();
        },
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
