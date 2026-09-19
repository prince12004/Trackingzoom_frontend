'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, ImageOff, Search } from 'lucide-react';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';
import { Product, Category, Brand } from '@/types';
import { DataTable, Column, StatusBadge } from '@/components/admin/DataTable';
import { Drawer, ConfirmDialog } from '@/components/admin/Drawer';
import { ImageUploadList } from '@/components/admin/ImageUploadList';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, cn } from '@/lib/utils';

interface ProductForm {
  name: string;
  sku: string;
  category: string;
  brand: string;
  shortDescription: string;
  description: string;
  regularPrice: number;
  salePrice: number;
  gstPercentage: number;
  stockQuantity: number;
  maxOrderQuantity: number;
  warranty: string;
  imageUrls: string[];
  features: string;
  specifications: string;
  whatsInTheBox: string;
  faqs: string;
  seoTitle: string;
  metaDescription: string;
  status: 'active' | 'inactive' | 'draft';
  codAvailable: boolean;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  requiresInstallation: boolean;
  requiresSubscription: boolean;
}

const EMPTY: ProductForm = {
  name: '',
  sku: '',
  category: '',
  brand: '',
  shortDescription: '',
  description: '',
  regularPrice: 0,
  salePrice: 0,
  gstPercentage: 18,
  stockQuantity: 0,
  maxOrderQuantity: 5,
  warranty: '',
  imageUrls: [],
  features: '',
  specifications: '',
  whatsInTheBox: '',
  faqs: '',
  seoTitle: '',
  metaDescription: '',
  status: 'active',
  codAvailable: true,
  featured: false,
  bestSeller: false,
  newArrival: false,
  requiresInstallation: false,
  requiresSubscription: false,
};

function linesToArray(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function parseSpecifications(text: string): { key: string; value: string }[] {
  return linesToArray(text).map((line) => {
    const [key, ...rest] = line.split(':');
    return { key: key.trim(), value: rest.join(':').trim() };
  });
}

function parseFaqs(text: string): { question: string; answer: string }[] {
  return linesToArray(text).map((line) => {
    const [question, ...rest] = line.split('|');
    return { question: question.trim(), answer: rest.join('|').trim() };
  });
}

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search],
    queryFn: async () => (await api.get<ApiEnvelope<Product[]>>('/products/admin/all', { params: { search: search || undefined, limit: 100 } })).data.data,
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => (await api.get<ApiEnvelope<Category[]>>('/categories/admin/all')).data.data,
  });
  const { data: brands } = useQuery({
    queryKey: ['brands-all'],
    queryFn: async () => (await api.get<ApiEnvelope<Brand[]>>('/brands', { params: { all: 'true' } })).data.data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        sku: form.sku,
        category: form.category,
        brand: form.brand || undefined,
        shortDescription: form.shortDescription,
        description: form.description,
        regularPrice: form.regularPrice,
        salePrice: form.salePrice || undefined,
        gstPercentage: form.gstPercentage,
        maxOrderQuantity: form.maxOrderQuantity,
        warranty: form.warranty,
        status: form.status,
        codAvailable: form.codAvailable,
        featured: form.featured,
        bestSeller: form.bestSeller,
        newArrival: form.newArrival,
        requiresInstallation: form.requiresInstallation,
        requiresSubscription: form.requiresSubscription,
        images: form.imageUrls.map((url, i) => ({ url, isThumbnail: i === 0, displayOrder: i })),
        features: linesToArray(form.features),
        specifications: parseSpecifications(form.specifications),
        whatsInTheBox: linesToArray(form.whatsInTheBox),
        faqs: parseFaqs(form.faqs),
        seoTitle: form.seoTitle || undefined,
        metaDescription: form.metaDescription || undefined,
        ...(editing ? {} : { stockQuantity: form.stockQuantity }),
      };
      if (editing) return api.patch(`/products/${editing._id}`, payload);
      return api.post('/products', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      showToast(editing ? 'Product updated' : 'Product created', 'success');
      setDrawerOpen(false);
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      showToast('Product deactivated', 'success');
      setDeleteTarget(null);
    },
    onError: (err) => {
      showToast(extractApiError(err), 'error');
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setDrawerOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      sku: p.sku,
      category: typeof p.category === 'object' ? p.category._id : p.category,
      brand: typeof p.brand === 'object' ? p.brand?._id || '' : p.brand || '',
      shortDescription: p.shortDescription || '',
      description: p.description || '',
      regularPrice: p.regularPrice,
      salePrice: p.salePrice || 0,
      gstPercentage: p.gstPercentage,
      stockQuantity: p.stockQuantity,
      maxOrderQuantity: p.maxOrderQuantity,
      warranty: p.warranty || '',
      imageUrls: [...p.images].sort((a, b) => a.displayOrder - b.displayOrder).map((i) => i.url),
      features: (p.features || []).join('\n'),
      specifications: (p.specifications || []).map((s) => `${s.key}: ${s.value}`).join('\n'),
      whatsInTheBox: (p.whatsInTheBox || []).join('\n'),
      faqs: (p.faqs || []).map((f) => `${f.question} | ${f.answer}`).join('\n'),
      seoTitle: p.seoTitle || '',
      metaDescription: p.metaDescription || '',
      status: p.status,
      codAvailable: p.codAvailable,
      featured: p.featured,
      bestSeller: p.bestSeller,
      newArrival: p.newArrival,
      requiresInstallation: p.requiresInstallation,
      requiresSubscription: p.requiresSubscription,
    });
    setDrawerOpen(true);
  };

  const columns: Column<Product>[] = [
    {
      header: 'Product',
      key: 'name',
      render: (row) => {
        const thumb = row.images.find((i) => i.isThumbnail)?.url || row.images[0]?.url;
        return (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {thumb ? <Image src={thumb} alt={row.name} fill className="object-cover" /> : <ImageOff className="m-auto h-4 w-4 text-gray-300" />}
            </div>
            <div className="min-w-0">
              <p className="max-w-[220px] truncate font-medium text-gray-800">{row.name}</p>
              <p className="text-xs text-gray-400">{row.sku}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Price',
      key: 'regularPrice',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-800">{formatCurrency(row.salePrice || row.regularPrice)}</p>
          {row.salePrice ? <p className="text-xs text-gray-400 line-through">{formatCurrency(row.regularPrice)}</p> : null}
        </div>
      ),
    },
    {
      header: 'Stock',
      key: 'stockQuantity',
      render: (row) => (
        <span className={cn('font-medium', row.stockQuantity === 0 ? 'text-danger' : row.stockQuantity < 10 ? 'text-warning' : 'text-gray-700')}>
          {row.stockQuantity}
        </span>
      ),
    },
    { header: 'Status', key: 'status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: '',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => openEdit(row)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteTarget(row)} className="rounded-lg p-1.5 text-danger hover:bg-red-50" aria-label="Deactivate">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">{data?.length || 0} products</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
            <Search className="h-4 w-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="h-10 bg-transparent text-sm outline-none" />
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <DataTable columns={columns} rows={data || []} loading={isLoading} emptyLabel="No products yet" />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} width="max-w-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Product Name">
              <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" />
            </Field>
            <Field label="SKU">
              <input required value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className="input" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select required value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input">
                <option value="">Select category</option>
                {(categories || []).map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Brand (optional)">
              <select value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} className="input">
                <option value="">— None —</option>
                {(brands || []).map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Short Description">
            <input value={form.shortDescription} onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))} className="input" />
          </Field>
          <Field label="Full Description (HTML supported)">
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} className="input" />
          </Field>
          <ImageUploadList
            label="Product Images (first is used as the thumbnail)"
            value={form.imageUrls}
            onChange={(urls) => setForm((f) => ({ ...f, imageUrls: urls }))}
            folder="products"
          />
          <div className="grid grid-cols-3 gap-4">
            <Field label="Regular Price (₹)">
              <input type="number" required value={form.regularPrice} onChange={(e) => setForm((f) => ({ ...f, regularPrice: Number(e.target.value) }))} className="input" />
            </Field>
            <Field label="Sale Price (₹)">
              <input type="number" value={form.salePrice} onChange={(e) => setForm((f) => ({ ...f, salePrice: Number(e.target.value) }))} className="input" />
            </Field>
            <Field label="GST %">
              <input type="number" value={form.gstPercentage} onChange={(e) => setForm((f) => ({ ...f, gstPercentage: Number(e.target.value) }))} className="input" />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label={editing ? 'Stock (use Inventory to adjust)' : 'Initial Stock'}>
              <input
                type="number"
                disabled={!!editing}
                value={form.stockQuantity}
                onChange={(e) => setForm((f) => ({ ...f, stockQuantity: Number(e.target.value) }))}
                className="input disabled:bg-gray-50 disabled:text-gray-400"
              />
            </Field>
            <Field label="Max Order Qty">
              <input type="number" value={form.maxOrderQuantity} onChange={(e) => setForm((f) => ({ ...f, maxOrderQuantity: Number(e.target.value) }))} className="input" />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProductForm['status'] }))} className="input">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>

          <Field label="Warranty">
            <input value={form.warranty} onChange={(e) => setForm((f) => ({ ...f, warranty: e.target.value }))} className="input" placeholder="e.g. 1 Year Manufacturer Warranty" />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Features (one per line)">
              <textarea
                value={form.features}
                onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                rows={4}
                className="input"
                placeholder={'Real-time GPS tracking\nGeofence alerts\nSOS button'}
              />
            </Field>
            <Field label="Specifications (Key: Value, one per line)">
              <textarea
                value={form.specifications}
                onChange={(e) => setForm((f) => ({ ...f, specifications: e.target.value }))}
                rows={4}
                className="input"
                placeholder={'Battery Life: 45 days\nNetwork: 4G LTE'}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="What's in the Box (one per line)">
              <textarea
                value={form.whatsInTheBox}
                onChange={(e) => setForm((f) => ({ ...f, whatsInTheBox: e.target.value }))}
                rows={3}
                className="input"
                placeholder={'1x GPS Tracker\nUSB-C Cable\nMagnetic Mount'}
              />
            </Field>
            <Field label="Product FAQs (Question | Answer, one per line)">
              <textarea
                value={form.faqs}
                onChange={(e) => setForm((f) => ({ ...f, faqs: e.target.value }))}
                rows={3}
                className="input"
                placeholder={'Does this need installation? | No, it is plug-and-play.'}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="SEO Title (optional)">
              <input value={form.seoTitle} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} className="input" />
            </Field>
            <Field label="Meta Description (optional)">
              <input value={form.metaDescription} onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))} className="input" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(
              [
                ['codAvailable', 'COD Available'],
                ['featured', 'Featured'],
                ['bestSeller', 'Best Seller'],
                ['newArrival', 'New Arrival'],
                ['requiresInstallation', 'Needs Installation'],
                ['requiresSubscription', 'Needs Subscription'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))} className="accent-brand-600" />
                {label}
              </label>
            ))}
          </div>

          <Button type="submit" className="w-full" loading={saveMutation.isPending}>
            {editing ? 'Save Changes' : 'Create Product'}
          </Button>
        </form>
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
        title={`Deactivate "${deleteTarget?.name}"?`}
        description="The product will be hidden from the storefront but its data is preserved."
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}
