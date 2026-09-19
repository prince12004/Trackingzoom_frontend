'use client';

import { Suspense, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Download, QrCode, CheckCircle2, XCircle } from 'lucide-react';
import { api, ApiEnvelope, API_URL, extractApiError } from '@/lib/api';
import { Order } from '@/types';
import { DataTable, Column, StatusBadge } from '@/components/admin/DataTable';
import { Drawer } from '@/components/admin/Drawer';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatDate } from '@/lib/utils';

interface AdminOrder extends Order {
  user: { name: string; mobile: string; email?: string };
}

const STATUS_FLOW: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: ['return_requested'],
  return_requested: ['returned'],
  returned: ['refunded'],
};

const STATUS_FILTERS = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned', 'refunded'];

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [courier, setCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', search, statusFilter],
    queryFn: async () =>
      (await api.get<ApiEnvelope<AdminOrder[]>>('/orders/admin/all', { params: { search: search || undefined, status: statusFilter || undefined, limit: 100 } }))
        .data.data,
  });

  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await api.patch<ApiEnvelope<AdminOrder>>(`/orders/admin/${selected!._id}/status`, {
        status,
        courier: courier || undefined,
        trackingNumber: trackingNumber || undefined,
      });
      return res.data.data;
    },
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      showToast('Order status updated', 'success');
      setSelected(updatedOrder);
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (approved: boolean) => {
      const res = await api.patch<ApiEnvelope<AdminOrder>>(`/orders/admin/${selected!._id}/verify-payment`, { approved });
      return res.data.data;
    },
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      showToast('Payment status updated', 'success');
      setSelected(updatedOrder);
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const columns: Column<AdminOrder>[] = [
    {
      header: 'Order',
      key: 'orderNumber',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-800">{row.orderNumber}</p>
          <p className="text-xs text-gray-400">{formatDate(row.createdAt)}</p>
        </div>
      ),
    },
    {
      header: 'Customer',
      key: 'user',
      render: (row) => (
        <div>
          <p className="text-gray-800">{row.user?.name}</p>
          <p className="text-xs text-gray-400">{row.user?.mobile}</p>
        </div>
      ),
    },
    { header: 'Amount', key: 'totalAmount', render: (row) => formatCurrency(row.totalAmount) },
    { header: 'Payment', key: 'paymentMethod', render: (row) => <StatusBadge status={row.paymentStatus} /> },
    { header: 'Status', key: 'orderStatus', render: (row) => <StatusBadge status={row.orderStatus} /> },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">{data?.length || 0} orders</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
            <Search className="h-4 w-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order, customer..." className="h-10 bg-transparent text-sm outline-none" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm">
            <option value="">All Statuses</option>
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable columns={columns} rows={data || []} loading={isLoading} onRowClick={(row) => setSelected(row)} emptyLabel="No orders yet" />

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.orderNumber || ''} width="max-w-xl">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <StatusBadge status={selected.orderStatus} />
              <a href={`${API_URL}/orders/admin/${selected._id}/invoice`} target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" /> Invoice
                </Button>
              </a>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700">Customer</p>
              <p className="text-sm text-gray-600">{selected.user?.name} &middot; {selected.user?.mobile}</p>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-gray-700">Items</p>
              <ul className="space-y-1.5">
                {selected.items.map((item, i) => (
                  <li key={i} className="flex justify-between text-sm text-gray-600">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="font-medium text-gray-800">{formatCurrency(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-between border-t border-dashed border-gray-200 pt-2 text-sm font-bold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(selected.totalAmount)}</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700">Shipping Address</p>
              <p className="text-sm text-gray-600">
                {selected.shippingAddress.name}, {selected.shippingAddress.addressLine1}, {selected.shippingAddress.city}, {selected.shippingAddress.state} -{' '}
                {selected.shippingAddress.pincode}
              </p>
            </div>

            {selected.paymentMethod === 'qr_manual' && (
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                  <QrCode className="h-4 w-4" /> UPI QR Payment
                </p>
                {selected.paymentScreenshotUrl ? (
                  <a href={selected.paymentScreenshotUrl} target="_blank" rel="noreferrer" className="block">
                    <div className="relative h-48 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      <Image src={selected.paymentScreenshotUrl} alt="Payment screenshot" fill className="object-contain" />
                    </div>
                  </a>
                ) : (
                  <p className="text-sm text-gray-400">Customer hasn&apos;t uploaded a payment screenshot yet.</p>
                )}
                {selected.paymentStatus === 'pending_verification' && (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" loading={verifyPaymentMutation.isPending} onClick={() => verifyPaymentMutation.mutate(true)}>
                      <CheckCircle2 className="h-4 w-4" /> Mark as Paid
                    </Button>
                    <Button size="sm" variant="danger" loading={verifyPaymentMutation.isPending} onClick={() => verifyPaymentMutation.mutate(false)}>
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                )}
                {selected.paymentStatus === 'success' && <p className="mt-2 text-xs font-semibold text-success">Payment verified</p>}
                {selected.paymentStatus === 'failed' && <p className="mt-2 text-xs font-semibold text-danger">Payment rejected</p>}
              </div>
            )}

            {STATUS_FLOW[selected.orderStatus] && (
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="mb-2 text-sm font-semibold text-gray-700">Update Status</p>
                {STATUS_FLOW[selected.orderStatus].includes('shipped') && (
                  <div className="mb-2 grid grid-cols-2 gap-2">
                    <input value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="Courier name" className="input" />
                    <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Tracking number" className="input" />
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {STATUS_FLOW[selected.orderStatus].map((next) => (
                    <Button
                      key={next}
                      size="sm"
                      variant={next === 'cancelled' ? 'danger' : 'primary'}
                      loading={statusMutation.isPending}
                      onClick={() => statusMutation.mutate(next)}
                    >
                      Mark as {next.replace(/_/g, ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
