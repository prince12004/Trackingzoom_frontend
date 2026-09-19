'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, FolderTree } from 'lucide-react';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';
import { Category } from '@/types';
import { DataTable, Column, StatusBadge } from '@/components/admin/DataTable';
import { Drawer, ConfirmDialog } from '@/components/admin/Drawer';
import { ImageUploadList } from '@/components/admin/ImageUploadList';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

interface CategoryForm {
  name: string;
  description: string;
  image: string;
  parent: string;
  displayOrder: number;
  status: 'active' | 'inactive';
}

const EMPTY: CategoryForm = { name: '', description: '', image: '', parent: '', displayOrder: 0, status: 'active' };

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => (await api.get<ApiEnvelope<Category[]>>('/categories/admin/all')).data.data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, parent: form.parent || null };
      if (editing) return api.patch(`/categories/${editing._id}`, payload);
      return api.post('/categories', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      showToast(editing ? 'Category updated' : 'Category created', 'success');
      setDrawerOpen(false);
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      showToast('Category deleted', 'success');
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

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      parent: typeof cat.parent === 'string' ? cat.parent : '',
      displayOrder: cat.displayOrder,
      status: cat.status,
    });
    setDrawerOpen(true);
  };

  const columns: Column<Category>[] = [
    {
      header: 'Category',
      key: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-100">
            {row.image ? <Image src={row.image} alt={row.name} fill className="object-cover" /> : <FolderTree className="m-auto h-4 w-4 text-gray-300" />}
          </div>
          <div>
            <p className="font-medium text-gray-800">{row.name}</p>
            <p className="text-xs text-gray-400">{row.slug}</p>
          </div>
        </div>
      ),
    },
    { header: 'Type', key: 'parent', render: (row) => (row.parent ? 'Subcategory' : 'Top-level') },
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

  const topLevel = (categories || []).filter((c) => !c.parent);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500">{categories?.length || 0} total categories</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <DataTable columns={columns} rows={categories || []} loading={isLoading} emptyLabel="No categories yet" />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          <Field label="Name">
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="input" />
          </Field>
          <ImageUploadList
            label="Category Image"
            value={form.image ? [form.image] : []}
            onChange={(urls) => setForm((f) => ({ ...f, image: urls[0] || '' }))}
            folder="categories"
            multiple={false}
          />
          <Field label="Parent Category">
            <select value={form.parent} onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))} className="input">
              <option value="">— Top Level —</option>
              {topLevel
                .filter((c) => c._id !== editing?._id)
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Display Order">
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))}
                className="input"
              />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'active' | 'inactive' }))} className="input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>
          <Button type="submit" className="w-full" loading={saveMutation.isPending}>
            {editing ? 'Save Changes' : 'Create Category'}
          </Button>
        </form>
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This cannot be undone. Categories with subcategories or products cannot be deleted."
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
