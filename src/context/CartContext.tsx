'use client';

import { createContext, useContext, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';
import { CartSummary } from '@/types';
import { useToast } from './ToastContext';

interface CartContextValue {
  cart: CartSummary | undefined;
  isLoading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  toggleSaveForLater: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  isMutating: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = ['cart'];

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: CART_KEY,
    queryFn: async () => {
      const res = await api.get<ApiEnvelope<CartSummary>>('/cart');
      return res.data.data;
    },
  });

  const invalidate = (summary: CartSummary) => {
    queryClient.setQueryData(CART_KEY, summary);
  };

  const addMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
      variantId,
    }: {
      productId: string;
      quantity?: number;
      variantId?: string;
    }) => {
      const res = await api.post<ApiEnvelope<CartSummary>>('/cart/items', { productId, quantity, variantId });
      return res.data.data;
    },
    onSuccess: (summary) => {
      invalidate(summary);
      setDrawerOpen(true);
      showToast('Added to cart', 'success');
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const res = await api.patch<ApiEnvelope<CartSummary>>(`/cart/items/${itemId}`, { quantity });
      return res.data.data;
    },
    onSuccess: invalidate,
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await api.delete<ApiEnvelope<CartSummary>>(`/cart/items/${itemId}`);
      return res.data.data;
    },
    onSuccess: (summary) => {
      invalidate(summary);
      showToast('Item removed', 'info');
    },
  });

  const saveForLaterMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await api.post<ApiEnvelope<CartSummary>>(`/cart/items/${itemId}/save-for-later`);
      return res.data.data;
    },
    onSuccess: invalidate,
  });

  const couponMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await api.post<ApiEnvelope<CartSummary>>('/cart/coupon', { code });
      return res.data.data;
    },
    onSuccess: (summary) => {
      invalidate(summary);
      showToast('Coupon applied', 'success');
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const removeCouponMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete<ApiEnvelope<CartSummary>>('/cart/coupon');
      return res.data.data;
    },
    onSuccess: invalidate,
  });

  const isMutating =
    addMutation.isPending ||
    updateMutation.isPending ||
    removeMutation.isPending ||
    saveForLaterMutation.isPending ||
    couponMutation.isPending;

  return (
    <CartContext.Provider
      value={{
        cart: data,
        isLoading,
        isDrawerOpen,
        openDrawer: () => setDrawerOpen(true),
        closeDrawer: () => setDrawerOpen(false),
        addItem: async (productId, quantity = 1, variantId) => {
          await addMutation.mutateAsync({ productId, quantity, variantId });
        },
        updateQuantity: async (itemId, quantity) => {
          await updateMutation.mutateAsync({ itemId, quantity });
        },
        removeItem: async (itemId) => {
          await removeMutation.mutateAsync(itemId);
        },
        toggleSaveForLater: async (itemId) => {
          await saveForLaterMutation.mutateAsync(itemId);
        },
        applyCoupon: async (code) => {
          await couponMutation.mutateAsync(code);
        },
        removeCoupon: async () => {
          await removeCouponMutation.mutateAsync();
        },
        isMutating,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
