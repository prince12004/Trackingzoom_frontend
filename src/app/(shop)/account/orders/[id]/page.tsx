'use client';

import { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Download, ChevronLeft, Package, QrCode, Clock, XCircle } from 'lucide-react';
import { api, ApiEnvelope, API_URL, extractApiError } from '@/lib/api';
import { Order } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

const TIMELINE_STEPS = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => (await api.get<ApiEnvelope<Order>>(`/orders/${id}`)).data.data,
  });

  const cancelMutation = useMutation({
    mutationFn: async () => api.post(`/orders/${id}/cancel`, { reason }),
    onSuccess: () => {
      showToast('Order cancelled', 'success');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      setShowCancelForm(false);
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const returnMutation = useMutation({
    mutationFn: async () => api.post(`/orders/${id}/return`, { reason }),
    onSuccess: () => {
      showToast('Return request submitted', 'success');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      setShowCancelForm(false);
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  if (isLoading) return <div className="py-16 text-center text-gray-400">Loading order...</div>;
  if (!order) return <div className="py-16 text-center text-gray-400">Order not found.</div>;

  const currentStepIndex = TIMELINE_STEPS.indexOf(order.orderStatus);
  const isCancellable = ['pending', 'confirmed', 'processing'].includes(order.orderStatus);
  const isReturnable = order.orderStatus === 'delivered';

  return (
    <div className="max-w-3xl">
      <Link href="/account/orders" className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ChevronLeft className="h-4 w-4" /> Back to Orders
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">Placed on {formatDate(order.placedAt)}</p>
        </div>
        {order.invoiceNumber && (
          <a href={`${API_URL}/orders/${order._id}/invoice`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Invoice
            </Button>
          </a>
        )}
      </div>

      {!['cancelled', 'returned', 'refunded'].includes(order.orderStatus) && (
        <div className="mb-8 overflow-x-auto rounded-xl border border-gray-100 p-5 shadow-card">
          <div className="flex min-w-[560px] items-center">
            {TIMELINE_STEPS.map((step, i) => (
              <div key={step} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full',
                      i <= currentStepIndex ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'
                    )}
                  >
                    {i <= currentStepIndex ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                  </motion.div>
                  <span className="whitespace-nowrap text-[10px] capitalize text-gray-500">{step.replace(/_/g, ' ')}</span>
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div className={cn('mx-1 h-0.5 flex-1', i < currentStepIndex ? 'bg-brand-600' : 'bg-gray-100')} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-100 p-5 shadow-card">
        <ul className="divide-y divide-gray-100">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-center gap-3 py-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50">
                {item.image ? (
                  <Image src={item.image} alt={item.name} width={48} height={48} className="rounded-lg object-cover" />
                ) : (
                  <Package className="h-5 w-5 text-gray-400" />
                )}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 border-t border-gray-100 pt-4 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Payment Method</span>
            <span className="font-medium uppercase text-gray-800">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Payment Status</span>
            <span className="font-medium capitalize text-gray-800">{order.paymentStatus}</span>
          </div>
          {order.trackingNumber && (
            <div className="flex justify-between text-gray-600">
              <span>Tracking Number</span>
              <span className="font-medium text-gray-800">{order.trackingNumber} {order.courier && `(${order.courier})`}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-dashed border-gray-200 pt-2 text-base font-bold text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {order.paymentMethod === 'qr_manual' && order.paymentScreenshotUrl && (
          <div className="mt-4 rounded-lg border border-gray-100 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-gray-800">
              <QrCode className="h-4 w-4" /> Payment Screenshot
            </p>
            <a href={order.paymentScreenshotUrl} target="_blank" rel="noreferrer" className="block">
              <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <Image src={order.paymentScreenshotUrl} alt="Payment screenshot" fill className="object-contain" />
              </div>
            </a>
            {order.paymentStatus === 'pending_verification' && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-accent-700">
                <Clock className="h-3.5 w-3.5" /> Verification pending
              </p>
            )}
            {order.paymentStatus === 'success' && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-success">
                <CheckCircle2 className="h-3.5 w-3.5" /> Payment verified
              </p>
            )}
            {order.paymentStatus === 'failed' && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-danger">
                <XCircle className="h-3.5 w-3.5" /> Payment rejected — contact support
              </p>
            )}
          </div>
        )}

        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
          <p className="font-medium text-gray-800">Delivery Address</p>
          <p>{order.shippingAddress.name}, {order.shippingAddress.mobile}</p>
          <p>
            {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
            {order.shippingAddress.pincode}
          </p>
        </div>

        {(isCancellable || isReturnable) && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            {!showCancelForm ? (
              <Button variant="outline" size="sm" onClick={() => setShowCancelForm(true)}>
                {isCancellable ? 'Cancel Order' : 'Request Return'}
              </Button>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={isCancellable ? 'Reason for cancellation' : 'Reason for return'}
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={!reason.trim()}
                    loading={cancelMutation.isPending || returnMutation.isPending}
                    onClick={() => (isCancellable ? cancelMutation.mutate() : returnMutation.mutate())}
                  >
                    Confirm
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowCancelForm(false)}>
                    Dismiss
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
