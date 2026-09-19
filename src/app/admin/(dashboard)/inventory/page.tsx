'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Boxes, AlertTriangle, PackageX, TrendingUp, Plus } from 'lucide-react';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';
import { Product } from '@/types';
import { StatCard } from '@/components/admin/StatCard';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Drawer } from '@/components/admin/Drawer';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { formatDate } from '@/lib/utils';

interface InventoryDashboard {
  totalProducts: number;
  totalStock: number;
  totalReserved: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockProducts: { _id: string; name: string; sku: string; stockQuantity: number; minStockLevel: number }[];
  recentMovements: {
    _id: string;
    product: { name: string; sku: string };
    movementType: string;
    quantityChanged: number;
    newStock: number;
    reason?: string;
    createdAt: string;
  }[];
}

export default function AdminInventoryPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [movementType, setMovementType] = useState<'manual_addition' | 'damage' | 'adjustment'>('manual_addition');
  const [reason, setReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-inventory-dashboard'],
    queryFn: async () => (await api.get<ApiEnvelope<InventoryDashboard>>('/inventory/dashboard')).data.data,
  });

  const { data: products } = useQuery({
    queryKey: ['admin-inventory-products'],
    queryFn: async () => (await api.get<ApiEnvelope<Product[]>>('/products', { params: { limit: 200, sort: 'newest' } })).data.data,
    enabled: drawerOpen,
  });

  const selectedProduct = products?.find((p) => p._id === productId);

  const adjustMutation = useMutation({
    mutationFn: async () => api.post('/inventory/adjust', { productId, quantity, movementType, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-dashboard'] });
      showToast('Stock adjusted', 'success');
      setDrawerOpen(false);
      setProductId('');
      setQuantity(0);
      setReason('');
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const movementColumns: Column<InventoryDashboard['recentMovements'][number]>[] = [
    { header: 'Product', key: 'product', render: (row) => <span>{row.product?.name} <span className="text-xs text-gray-400">({row.product?.sku})</span></span> },
    { header: 'Type', key: 'movementType', render: (row) => <span className="capitalize">{row.movementType.replace(/_/g, ' ')}</span> },
    {
      header: 'Change',
      key: 'quantityChanged',
      render: (row) => <span className={row.quantityChanged >= 0 ? 'font-semibold text-success' : 'font-semibold text-danger'}>{row.quantityChanged >= 0 ? '+' : ''}{row.quantityChanged}</span>,
    },
    { header: 'New Stock', key: 'newStock' },
    { header: 'Date', key: 'createdAt', render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500">Stock levels and movement history</p>
        </div>
        <Button onClick={() => setDrawerOpen(true)}>
          <Plus className="h-4 w-4" /> Adjust Stock
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Products" value={data?.totalProducts || 0} icon={Boxes} color="brand" index={0} />
        <StatCard label="Total Stock" value={data?.totalStock || 0} icon={TrendingUp} color="success" index={1} />
        <StatCard label="Low Stock" value={data?.lowStockCount || 0} icon={AlertTriangle} color="accent" index={2} />
        <StatCard label="Out of Stock" value={data?.outOfStockCount || 0} icon={PackageX} color="danger" index={3} />
      </div>

      {!isLoading && data && data.lowStockProducts.length > 0 && (
        <div className="mt-6 rounded-2xl border border-warning/30 bg-warning/5 p-4">
          <p className="mb-2 text-sm font-semibold text-warning">Low Stock Alert</p>
          <div className="flex flex-wrap gap-2">
            {data.lowStockProducts.map((p) => (
              <span key={p._id} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                {p.name} — {p.stockQuantity} left
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="mb-3 font-semibold text-gray-900">Recent Stock Movements</h2>
        <DataTable columns={movementColumns} rows={data?.recentMovements || []} loading={isLoading} emptyLabel="No stock movements yet" />
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Adjust Stock">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            adjustMutation.mutate();
          }}
          className="space-y-4"
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Product</span>
            <select required value={productId} onChange={(e) => setProductId(e.target.value)} className="input">
              <option value="">Select a product</option>
              {(products || []).map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.sku}) — {p.stockQuantity} in stock
                </option>
              ))}
            </select>
            {selectedProduct && (
              <p className="mt-1.5 text-xs text-gray-500">
                Current stock: <span className="font-semibold text-gray-800">{selectedProduct.stockQuantity}</span>
              </p>
            )}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Movement Type</span>
            <select value={movementType} onChange={(e) => setMovementType(e.target.value as typeof movementType)} className="input">
              <option value="manual_addition">Manual Addition (+)</option>
              <option value="damage">Damage (-)</option>
              <option value="adjustment">Adjustment (+/-)</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Quantity</span>
            <input
              type="number"
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="input"
              placeholder={movementType === 'damage' ? 'Negative number, e.g. -5' : 'Positive number, e.g. 10'}
            />
            {selectedProduct && quantity !== 0 && (
              <p className="mt-1.5 text-xs text-gray-500">
                New stock will be:{' '}
                <span className="font-semibold text-gray-800">{selectedProduct.stockQuantity + quantity}</span>
              </p>
            )}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Reason</span>
            <textarea required value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="input" />
          </label>
          <Button type="submit" className="w-full" loading={adjustMutation.isPending}>
            Apply Adjustment
          </Button>
        </form>
      </Drawer>
    </div>
  );
}
