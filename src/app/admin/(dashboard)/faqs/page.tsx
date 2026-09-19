'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';
import { FAQ } from '@/types';
import { DataTable, Column, StatusBadge } from '@/components/admin/DataTable';
import { Drawer, ConfirmDialog } from '@/components/admin/Drawer';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

interface FaqForm {
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  status: 'active' | 'inactive';
}

const EMPTY: FaqForm = { question: '', answer: '', category: '', displayOrder: 0, status: 'active' };

export default function AdminFaqsPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState<FaqForm>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: async () => (await api.get<ApiEnvelope<FAQ[]>>('/faqs/admin/all', { params: { limit: 100 } })).data.data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) return api.patch(`/faqs/admin/${editing._id}`, form);
      return api.post('/faqs/admin', form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      showToast(editing ? 'FAQ updated' : 'FAQ created', 'success');
      setDrawerOpen(false);
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/faqs/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      showToast('FAQ deleted', 'success');
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, displayOrder: (data?.length || 0) + 1 });
    setDrawerOpen(true);
  };

  const openEdit = (f: FAQ) => {
    setEditing(f);
    setForm({
      question: f.question,
      answer: f.answer,
      category: f.category || '',
      displayOrder: f.displayOrder ?? 0,
      status: f.status || 'active',
    });
    setDrawerOpen(true);
  };

  const columns: Column<FAQ>[] = [
    { header: 'Question', key: 'question', render: (row) => <span className="max-w-md truncate font-medium text-gray-800">{row.question}</span> },
    { header: 'Order', key: 'displayOrder' },
    { header: 'Status', key: 'status', render: (row) => <StatusBadge status={row.status || 'active'} /> },
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
          <h1 className="text-2xl font-bold text-gray-900">FAQs</h1>
          <p className="text-sm text-gray-500">{data?.length || 0} questions shown on the FAQs page</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add FAQ
        </Button>
      </div>

      <DataTable columns={columns} rows={data || []} loading={isLoading} emptyLabel="No FAQs yet" />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Edit FAQ' : 'Add FAQ'} width="max-w-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          <Field label="Question">
            <input required value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} className="input" />
          </Field>
          <Field label="Answer">
            <textarea required value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} rows={4} className="input" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category (optional)">
              <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input" />
            </Field>
            <Field label="Display Order">
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))}
                className="input"
              />
            </Field>
          </div>
          <Field label="Status">
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'active' | 'inactive' }))} className="input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
          <Button type="submit" className="w-full" loading={saveMutation.isPending}>
            {editing ? 'Save Changes' : 'Create FAQ'}
          </Button>
        </form>
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
        title={`Delete this FAQ?`}
        description={deleteTarget?.question}
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
