'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface WishlistData {
  products: Product[];
}

const WISHLIST_KEY = ['wishlist'];

export function useWishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: async () => {
      const res = await api.get<ApiEnvelope<WishlistData>>('/wishlist');
      return res.data.data;
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await api.post<ApiEnvelope<WishlistData>>('/wishlist', { productId });
      return res.data.data;
    },
    onSuccess: (d) => {
      queryClient.setQueryData(WISHLIST_KEY, d);
      showToast('Added to wishlist', 'success');
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await api.delete<ApiEnvelope<WishlistData>>(`/wishlist/${productId}`);
      return res.data.data;
    },
    onSuccess: (d) => {
      queryClient.setQueryData(WISHLIST_KEY, d);
      showToast('Removed from wishlist', 'info');
    },
  });

  const productIds = new Set((data?.products || []).map((p) => p._id));

  return {
    products: data?.products || [],
    isLoading,
    isWishlisted: (productId: string) => productIds.has(productId),
    add: (productId: string) => addMutation.mutateAsync(productId),
    remove: (productId: string) => removeMutation.mutateAsync(productId),
    toggle: (productId: string) =>
      productIds.has(productId) ? removeMutation.mutateAsync(productId) : addMutation.mutateAsync(productId),
  };
}
