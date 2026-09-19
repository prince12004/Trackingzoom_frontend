'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, ImageOff } from 'lucide-react';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';
import { Banner } from '@/types';
import { DataTable, Column, StatusBadge } from '@/components/admin/DataTable';
import { Drawer, ConfirmDialog } from '@/components/admin/Drawer';
import { ImageUploadList } from '@/components/admin/ImageUploadList';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

interface AdminBanner extends Banner {
  status: 'active' | 'inactive';
  startDate: string;
  endDate: string;
}

interface BannerForm {
  title: string;
  subtitle: string;
  desktopImage: string;
  mobileImage: string;
  ctaText: string;
  ctaUrl: string;
  displayOrder: number;
  status: 'active' | 'inactive';
  startDate: string;
  endDate: string;
}

const EMPTY: BannerForm = {
  title: '',
  subtitle: '',
  desktopImage: '',
  mobileImage: '',
  ctaText: '',
  ctaUrl: '',
  displayOrder: 0,
  status: 'active',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
};

export default function AdminBannersPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBanner | null>(null);
  const [form, setForm] = useState<BannerForm>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<AdminBanner | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => (await api.get<ApiEnvelope<AdminBanner[]>>('/banners/admin/all')).data.data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) return api.patch(`/banners/admin/${editing._id}`, form);
      return api.post('/banners/admin', form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      showToast(editing ? 'Banner updated' : 'Banner created', 'success');
      setDrawerOpen(false);
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/banners/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      showToast('Banner deleted', 'success');
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setDrawerOpen(true);
  };

  const openEdit = (b: AdminBanner) => {
    setEditing(b);
    setForm({
      title: b.title,
      subtitle: b.subtitle || '',
      desktopImage: b.desktopImage,
      mobileImage: b.mobileImage,
      ctaText: b.ctaText || '',
      ctaUrl: b.ctaUrl || '',
      displayOrder: b.displayOrder,
      status: b.status,
      startDate: b.startDate?.slice(0, 10) || EMPTY.startDate,
      endDate: b.endDate?.slice(0, 10) || EMPTY.endDate,
    });
    setDrawerOpen(true);
  };

  const columns: Column<AdminBanner>[] = [
    {
      header: 'Banner',
      key: 'title',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
            {row.desktopImage ? <Image src={row.desktopImage} alt={row.title} fill className="object-cover" /> : <ImageOff className="m-auto h-4 w-4 text-gray-300" />}
          </div>
          <p className="max-w-[240px] truncate font-medium text-gray-800">{row.title}</p>
        </div>
      ),
    },
    { header: 'Order', key: 'displayOrder' },
    { header: 'Status', key: 'status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: '',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => openEdit(row)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteTarget(row)} className="rounded-lg p-1.5 text-danger hover:bg-red-50" aria-label="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500">Manage homepage hero banners</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Banner
        </Button>
      </div>

      <DataTable columns={columns} rows={data || []} loading={isLoading} emptyLabel="No banners yet" />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Edit Banner' : 'Add Banner'}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          <Field label="Title">
            <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input" />
          </Field>
          <Field label="Subtitle">
            <input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} className="input" />
          </Field>
          <ImageUploadList
            label="Desktop Image"
            value={form.desktopImage ? [form.desktopImage] : []}
            onChange={(urls) => setForm((f) => ({ ...f, desktopImage: urls[0] || '' }))}
            folder="banners"
            multiple={false}
          />
          <ImageUploadList
            label="Mobile Image"
            value={form.mobileImage ? [form.mobileImage] : []}
            onChange={(urls) => setForm((f) => ({ ...f, mobileImage: urls[0] || '' }))}
            folder="banners"
            multiple={false}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field label="CTA Text">
              <input value={form.ctaText} onChange={(e) => setForm((f) => ({ ...f, ctaText: e.target.value }))} className="input" />
            </Field>
            <Field label="CTA URL">
              <input value={form.ctaUrl} onChange={(e) => setForm((f) => ({ ...f, ctaUrl: e.target.value }))} className="input" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date">
              <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className="input" />
            </Field>
            <Field label="End Date">
              <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className="input" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Display Order">
              <input type="number" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))} className="input" />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'active' | 'inactive' }))} className="input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>
          <Button type="submit" className="w-full" loading={saveMutation.isPending}>
            {editing ? 'Save Changes' : 'Create Banner'}
          </Button>
        </form>
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
        title={`Delete "${deleteTarget?.title}"?`}
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
