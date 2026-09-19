'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, Tag, ArrowRight, ShoppingBag, BookmarkPlus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const { cart, isLoading, updateQuantity, removeItem, toggleSaveForLater, applyCoupon, removeCoupon } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [couponCode, setCouponCode] = useState('');

  const activeLines = (cart?.lines || []).filter((l) => !l.savedForLater);
  const savedLines = (cart?.lines || []).filter((l) => l.savedForLater);

  if (isLoading) {
    return <div className="container-page py-16 text-center text-gray-400">Loading cart...</div>;
  }

  if (activeLines.length === 0 && savedLines.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet."
          actionLabel="Start Shopping"
          onAction={() => router.push('/products')}
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Shopping Cart</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <ul className="space-y-4">
            <AnimatePresence initial={false}>
              {activeLines.map((line) => (
                <motion.li
                  key={line.itemId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-4 rounded-xl border border-gray-100 p-4 shadow-card"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {line.image && <Image src={line.image} alt={line.name} fill className="object-cover" />}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/product/${line.slug}`} className="font-medium text-gray-800 hover:text-brand-600">
                        {line.name}
                      </Link>
                      <span className="font-semibold text-gray-900">{formatCurrency(line.lineTotal)}</span>
                    </div>
                    <p className="text-xs text-gray-400">SKU: {line.sku}</p>
                    {!line.stockOk && <p className="mt-1 text-xs text-danger">Only {line.availableStock} left in stock</p>}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200">
                        <button onClick={() => updateQuantity(line.itemId, line.quantity - 1)} className="p-2 text-gray-500 hover:text-gray-800" aria-label="Decrease quantity">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm">{line.quantity}</span>
                        <button
                          onClick={() => updateQuantity(line.itemId, line.quantity + 1)}
                          disabled={line.quantity >= line.maxOrderQuantity}
                          className="p-2 text-gray-500 hover:text-gray-800 disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleSaveForLater(line.itemId)} className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-brand-600">
                          <BookmarkPlus className="h-3.5 w-3.5" /> Save for later
                        </button>
                        <button onClick={() => removeItem(line.itemId)} className="text-gray-400 hover:text-danger" aria-label="Remove item">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {savedLines.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-gray-700">Saved for Later ({savedLines.length})</h2>
              <ul className="space-y-3">
                {savedLines.map((line) => (
                  <li key={line.itemId} className="flex items-center gap-4 rounded-xl border border-gray-100 p-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {line.image && <Image src={line.image} alt={line.name} fill className="object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{line.name}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(line.unitPrice)}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => toggleSaveForLater(line.itemId)}>
                      Move to Cart
                    </Button>
                    <button onClick={() => removeItem(line.itemId)} className="text-gray-400 hover:text-danger" aria-label="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {cart && activeLines.length > 0 && (
          <div className="h-fit rounded-xl border border-gray-100 p-5 shadow-card">
            <h2 className="mb-4 font-semibold text-gray-900">Order Summary</h2>

            {user && (
              <div className="mb-4">
                {cart.couponCode ? (
                  <div className="flex items-center justify-between rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                    <span className="flex items-center gap-1.5">
                      <Tag className="h-4 w-4" /> {cart.couponCode} applied
                    </span>
                    <button onClick={() => removeCoupon()} className="font-medium underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      className="h-10 flex-1 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-400"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!couponCode}
                      onClick={async () => {
                        await applyCoupon(couponCode);
                        setCouponCode('');
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                )}
                {cart.couponError && <p className="mt-1 text-xs text-danger">{cart.couponError}</p>}
              </div>
            )}

            <div className="space-y-2 text-sm">
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
              <div className="flex justify-between border-t border-dashed border-gray-200 pt-2 text-base font-bold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(cart.totalAmount)}</span>
              </div>
            </div>

            <Button
              className="mt-5 w-full"
              size="lg"
              onClick={() => router.push(user ? '/checkout' : '/login?redirect=/checkout')}
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
