'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, UserRound, Trash2 } from 'lucide-react';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';
import { User, Order } from '@/types';
import { DataTable, Column, StatusBadge } from '@/components/admin/DataTable';
import { Drawer, ConfirmDialog } from '@/components/admin/Drawer';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatDate } from '@/lib/utils';

interface AdminCustomer extends User {
  _id: string;
  status: 'active' | 'blocked';
}

export default function AdminCustomersPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', search],
    queryFn: async () => (await api.get<ApiEnvelope<AdminCustomer[]>>('/users/admin/all', { params: { search: search || undefined, limit: 100 } })).data.data,
  });

  const { data: detail } = useQuery({
    queryKey: ['admin-customer-detail', selectedId],
    queryFn: async () =>
      (await api.get<ApiEnvelope<{ user: AdminCustomer; orders: Order[]; totalSpent: number }>>(`/users/admin/${selectedId}`)).data.data,
    enabled: !!selectedId,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'blocked' }) => api.patch(`/users/admin/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-customer-detail'] });
      showToast('Customer status updated', 'success');
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const [deleteTarget, setDeleteTarget] = useState<AdminCustomer | null>(null);
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/users/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      showToast('Customer deleted', 'success');
      setDeleteTarget(null);
      setSelectedId(null);
    },
    onError: (err) => {
      showToast(extractApiError(err), 'error');
      setDeleteTarget(null);
    },
  });

  const columns: Column<AdminCustomer>[] = [
    {
      header: 'Customer',
      key: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <UserRound className="h-4 w-4" />
          </span>
          <div>
            <p className="font-medium text-gray-800">{row.name}</p>
            <p className="text-xs text-gray-400">{row.mobile}</p>
          </div>
        </div>
      ),
    },
    { header: 'Email', key: 'email', render: (row) => row.email || '—' },
    { header: 'Joined', key: 'createdAt', render: (row) => formatDate(row.createdAt) },
    { header: 'Status', key: 'status', render: (row) => <StatusBadge status={row.status} colorMap={{ active: 'bg-success/10 text-success', blocked: 'bg-danger/10 text-danger' }} /> },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">{data?.length || 0} customers</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
          <Search className="h-4 w-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, mobile, email..." className="h-10 bg-transparent text-sm outline-none" />
        </div>
      </div>

      <DataTable columns={columns} rows={data || []} loading={isLoading} onRowClick={(row) => setSelectedId(row._id)} emptyLabel="No customers yet" />

      <Drawer open={!!selectedId} onClose={() => setSelectedId(null)} title={detail?.user.name || 'Customer'}>
        {detail && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Total Orders</p>
                <p className="text-lg font-bold text-gray-900">{detail.orders.length}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Total Spent</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(detail.totalSpent)}</p>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>{detail.user.mobile}</p>
              {detail.user.email && <p>{detail.user.email}</p>}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  statusMutation.mutate({ id: detail.user._id, status: detail.user.status === 'active' ? 'blocked' : 'active' })
                }
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${detail.user.status === 'active' ? 'bg-danger' : 'bg-success'}`}
              >
                {detail.user.status === 'active' ? 'Block Customer' : 'Unblock Customer'}
              </button>
              <Button type="button" variant="outline" onClick={() => setDeleteTarget(detail.user)}>
                <Trash2 className="h-4 w-4" /> Delete Customer
              </Button>
            </div>
            {detail.orders.length > 0 && (
              <p className="text-xs text-gray-400">
                This customer has {detail.orders.length} order(s), so deleting is blocked — use Block instead to keep order history intact.
              </p>
            )}

            <div>
              <p className="mb-2 text-sm font-semibold text-gray-700">Recent Orders</p>
              {detail.orders.length === 0 ? (
                <p className="text-sm text-gray-400">No orders yet.</p>
              ) : (
                <ul className="space-y-2">
                  {detail.orders.map((o) => (
                    <li key={o._id} className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5 text-sm">
                      <div>
                        <p className="font-medium text-gray-800">{o.orderNumber}</p>
                        <p className="text-xs text-gray-400">{formatDate(o.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">{formatCurrency(o.totalAmount)}</p>
                        <StatusBadge status={o.orderStatus} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This permanently removes the customer account, cart, addresses and wishlist. This cannot be undone."
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
