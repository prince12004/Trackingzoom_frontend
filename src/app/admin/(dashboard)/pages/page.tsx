'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';
import { CmsPage } from '@/types';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Drawer } from '@/components/admin/Drawer';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { formatDate } from '@/lib/utils';

interface PageForm {
  title: string;
  content: string;
  seoTitle: string;
  metaDescription: string;
}

const EMPTY: PageForm = { title: '', content: '', seoTitle: '', metaDescription: '' };

export default function AdminPagesPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<CmsPage | null>(null);
  const [form, setForm] = useState<PageForm>(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pages'],
    queryFn: async () => (await api.get<ApiEnvelope<CmsPage[]>>('/pages')).data.data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editing) throw new Error('No page selected');
      return api.put(`/pages/${editing.slug}`, form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      showToast('Page saved', 'success');
      setDrawerOpen(false);
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const openEdit = (p: CmsPage) => {
    setEditing(p);
    setForm({ title: p.title, content: p.content, seoTitle: p.seoTitle || '', metaDescription: p.metaDescription || '' });
    setDrawerOpen(true);
  };

  const columns: Column<CmsPage>[] = [
    { header: 'Page', key: 'title', render: (row) => <span className="font-medium text-gray-800">{row.title}</span> },
    { header: 'Slug', key: 'slug', render: (row) => <code className="text-xs text-gray-400">/{row.slug}</code> },
    { header: 'Last Updated', key: 'updatedAt', render: (row) => (row.updatedAt ? formatDate(row.updatedAt) : '—') },
    {
      header: '',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center justify-end">
          <button onClick={() => openEdit(row)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Legal & Content Pages</h1>
        <p className="text-sm text-gray-500">About Us, Terms, Privacy Policy and other static pages shown on the storefront</p>
      </div>

      <DataTable columns={columns} rows={data || []} loading={isLoading} emptyLabel="No pages found — run the backend seed script" />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? `Edit: ${editing.title}` : 'Edit Page'} width="max-w-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          <Field label="Page Title">
            <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input" />
          </Field>
          <Field label="Content (HTML supported)">
            <textarea
              required
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={14}
              className="input font-mono text-xs"
            />
          </Field>
          <Field label="SEO Title (optional)">
            <input value={form.seoTitle} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} className="input" />
          </Field>
          <Field label="Meta Description (optional)">
            <textarea value={form.metaDescription} onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))} rows={2} className="input" />
          </Field>
          <Button type="submit" className="w-full" loading={saveMutation.isPending}>
            Save Changes
          </Button>
        </form>
      </Drawer>
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
