'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, Package } from 'lucide-react';
import { api, ApiEnvelope, API_URL } from '@/lib/api';
import { Order } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PaymentProofUpload } from '@/components/checkout/PaymentProofUpload';

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => (await api.get<ApiEnvelope<Order>>(`/orders/${id}`)).data.data,
  });

  if (isLoading) return <div className="container-page py-16 text-center text-gray-400">Loading order...</div>;
  if (!order) return <div className="container-page py-16 text-center text-gray-400">Order not found.</div>;

  // Screenshot is now uploaded during checkout itself before the order is placed — this
  // widget only matters as a fallback for the rare pre-existing order that predates that.
  const needsPaymentProof =
    order.paymentMethod === 'qr_manual' &&
    !order.paymentScreenshotUrl &&
    order.paymentStatus !== 'success' &&
    order.paymentStatus !== 'failed';

  return (
    <div className="container-page max-w-2xl py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 14 }}
        className="flex flex-col items-center text-center"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Order Placed Successfully!</h1>
        <p className="mt-1 text-gray-500">
          Thank you, your order <strong>{order.orderNumber}</strong> has been confirmed.
        </p>
      </motion.div>

      <div className="mt-8 rounded-xl border border-gray-100 p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="font-semibold text-gray-900">{order.orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Order Date</p>
            <p className="font-semibold text-gray-900">{formatDate(order.placedAt)}</p>
          </div>
        </div>

        <ul className="divide-y divide-gray-100">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                  <Package className="h-4 w-4 text-gray-400" />
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-4 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Payment Method</span>
            <span className="font-medium uppercase text-gray-800">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery Address</span>
            <span className="max-w-[60%] text-right font-medium text-gray-800">
              {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.pincode}
            </span>
          </div>
          <div className="flex justify-between border-t border-dashed border-gray-200 pt-2 text-base font-bold text-gray-900">
            <span>{order.paymentMethod === 'cod' ? 'Amount Due' : 'Total Paid'}</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {needsPaymentProof && (
        <PaymentProofUpload
          orderId={order._id}
          hasScreenshot={!!order.paymentScreenshotUrl}
          onSubmitted={() => queryClient.invalidateQueries({ queryKey: ['order', id] })}
        />
      )}

      {order.paymentMethod === 'qr_manual' && order.paymentScreenshotUrl && order.paymentStatus === 'pending_verification' && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-accent-200 bg-accent-50 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-accent-600" />
          <div>
            <p className="text-sm font-semibold text-accent-800">Payment verification pending</p>
            <p className="text-xs text-accent-700">We&apos;ve received your payment screenshot and will confirm it shortly.</p>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {order.invoiceNumber && (
          <a href={`${API_URL}/orders/${order._id}/invoice`} target="_blank" rel="noreferrer" className="flex-1">
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4" /> Download Invoice
            </Button>
          </a>
        )}
        <Link href="/account/orders" className="flex-1">
          <Button className="w-full">View My Orders</Button>
        </Link>
      </div>
    </div>
  );
}
