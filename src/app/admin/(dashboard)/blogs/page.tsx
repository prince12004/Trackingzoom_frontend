'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';
import { Blog, BlogCategory } from '@/types';
import { DataTable, Column, StatusBadge } from '@/components/admin/DataTable';
import { Drawer, ConfirmDialog } from '@/components/admin/Drawer';
import { ImageUploadList } from '@/components/admin/ImageUploadList';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { formatDate } from '@/lib/utils';

interface BlogForm {
  title: string;
  category: string;
  author: string;
  featuredImage: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published';
  featured: boolean;
}

const EMPTY: BlogForm = { title: '', category: '', author: 'TrackingZoom Team', featuredImage: '', excerpt: '', content: '', status: 'draft', featured: false };

export default function AdminBlogsPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [form, setForm] = useState<BlogForm>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: async () => (await api.get<ApiEnvelope<Blog[]>>('/blogs/admin/all', { params: { limit: 100 } })).data.data,
  });
  const { data: categories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => (await api.get<ApiEnvelope<BlogCategory[]>>('/blog-categories')).data.data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) return api.patch(`/blogs/admin/${editing._id}`, form);
      return api.post('/blogs/admin', form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      showToast(editing ? 'Blog updated' : 'Blog created', 'success');
      setDrawerOpen(false);
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/blogs/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      showToast('Blog deleted', 'success');
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setDrawerOpen(true);
  };

  const openEdit = (b: Blog) => {
    setEditing(b);
    setForm({
      title: b.title,
      category: typeof b.category === 'object' ? b.category._id : b.category,
      author: b.author,
      featuredImage: b.featuredImage,
      excerpt: b.excerpt || '',
      content: b.content || '',
      status: b.status as 'draft' | 'published',
      featured: b.featured,
    });
    setDrawerOpen(true);
  };

  const columns: Column<Blog>[] = [
    { header: 'Title', key: 'title', render: (row) => <span className="max-w-xs truncate font-medium text-gray-800">{row.title}</span> },
    { header: 'Author', key: 'author' },
    { header: 'Status', key: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Published', key: 'publishedAt', render: (row) => (row.publishedAt ? formatDate(row.publishedAt) : '—') },
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
          <h1 className="text-2xl font-bold text-gray-900">Blogs</h1>
          <p className="text-sm text-gray-500">{data?.length || 0} posts</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Blog Post
        </Button>
      </div>

      <DataTable columns={columns} rows={data || []} loading={isLoading} emptyLabel="No blog posts yet" />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Edit Blog Post' : 'Add Blog Post'} width="max-w-2xl">
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
            <Field label="Author">
              <input value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} className="input" />
            </Field>
          </div>
          <ImageUploadList
            label="Featured Image"
            value={form.featuredImage ? [form.featuredImage] : []}
            onChange={(urls) => setForm((f) => ({ ...f, featuredImage: urls[0] || '' }))}
            folder="blogs"
            multiple={false}
          />
          <Field label="Excerpt">
            <textarea value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} rows={2} className="input" />
          </Field>
          <Field label="Content (HTML supported)">
            <textarea required value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={8} className="input font-mono text-xs" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Status">
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'draft' | 'published' }))} className="input">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-gray-600">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="accent-brand-600" />
              Featured post
            </label>
          </div>
          <Button type="submit" className="w-full" loading={saveMutation.isPending}>
            {editing ? 'Save Changes' : 'Create Blog Post'}
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
