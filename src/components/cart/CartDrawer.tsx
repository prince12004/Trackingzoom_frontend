'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

export function CartDrawer() {
  const { cart, isDrawerOpen, closeDrawer, updateQuantity, removeItem } = useCart();
  const router = useRouter();
  const lines = (cart?.lines || []).filter((l) => !l.savedForLater);
  useBodyScrollLock(isDrawerOpen);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-black/40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
            className="fixed inset-y-0 right-0 z-50 flex w-[90%] max-w-md flex-col bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <ShoppingBag className="h-5 w-5" /> Your Cart
              </h2>
              <button onClick={closeDrawer} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="Close cart">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {lines.length === 0 ? (
                <EmptyState
                  icon={ShoppingBag}
                  title="Your cart is empty"
                  description="Browse our GPS trackers and accessories to get started."
                  actionLabel="Continue Shopping"
                  onAction={() => {
                    closeDrawer();
                    router.push('/products');
                  }}
                />
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.li
                        key={line.itemId}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {line.image && <Image src={line.image} alt={line.name} fill className="object-cover" />}
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <Link href={`/product/${line.slug}`} onClick={closeDrawer} className="text-sm font-medium text-gray-800 hover:text-brand-600">
                              {line.name}
                            </Link>
                            <button
                              onClick={() => removeItem(line.itemId)}
                              className="text-gray-400 hover:text-danger"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {!line.stockOk && <p className="text-xs text-danger">Only {line.availableStock} left in stock</p>}
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-2 rounded-lg border border-gray-200">
                              <button
                                onClick={() => updateQuantity(line.itemId, line.quantity - 1)}
                                className="p-1.5 text-gray-500 hover:text-gray-800"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-5 text-center text-sm">{line.quantity}</span>
                              <button
                                onClick={() => updateQuantity(line.itemId, line.quantity + 1)}
                                disabled={line.quantity >= line.maxOrderQuantity}
                                className="p-1.5 text-gray-500 hover:text-gray-800 disabled:opacity-40"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(line.lineTotal)}</span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {lines.length > 0 && cart && (
              <div className="border-t border-gray-100 p-4">
                <div className="mb-3 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (GST)</span>
                    <span>{formatCurrency(cart.taxAmount)}</span>
                  </div>
                  {cart.discountAmount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount</span>
                      <span>-{formatCurrency(cart.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{cart.shippingCharge === 0 ? 'Free' : formatCurrency(cart.shippingCharge)}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-gray-200 pt-1.5 text-base font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatCurrency(cart.totalAmount)}</span>
                  </div>
                </div>
                <Link href="/checkout" onClick={closeDrawer}>
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
