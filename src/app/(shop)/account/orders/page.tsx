'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, ChevronRight } from 'lucide-react';
import { api, ApiEnvelope } from '@/lib/api';
import { Order } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  confirmed: 'bg-brand-50 text-brand-700',
  processing: 'bg-brand-50 text-brand-700',
  packed: 'bg-brand-50 text-brand-700',
  shipped: 'bg-accent-50 text-accent-700',
  out_for_delivery: 'bg-accent-50 text-accent-700',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
  return_requested: 'bg-warning/10 text-warning',
  returned: 'bg-warning/10 text-warning',
  refunded: 'bg-gray-100 text-gray-600',
};

export default function OrdersListPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => (await api.get<ApiEnvelope<Order[]>>('/orders', { params: { limit: 50 } })).data.data,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Orders</h1>

      {isLoading ? (
        <p className="text-gray-400">Loading orders...</p>
      ) : !data || data.length === 0 ? (
        <EmptyState icon={Package} title="No orders found" description="You haven't placed any orders yet." actionLabel="Start Shopping" onAction={() => router.push('/products')} />
      ) : (
        <ul className="space-y-3">
          {data.map((order, i) => (
            <motion.li key={order._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.03 }}>
              <Link
                href={`/account/orders/${order._id}`}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-card hover:shadow-card-hover"
              >
                <div>
                  <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.placedAt)} &middot; {order.items.length} item{order.items.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn('rounded-full px-3 py-1 text-xs font-semibold capitalize', STATUS_COLORS[order.orderStatus] || 'bg-gray-100')}>
                    {order.orderStatus.replace(/_/g, ' ')}
                  </span>
                  <span className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
