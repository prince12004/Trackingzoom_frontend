'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, KeyRound } from 'lucide-react';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { DataTable, Column, StatusBadge } from '@/components/admin/DataTable';
import { Drawer, ConfirmDialog } from '@/components/admin/Drawer';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { formatDate } from '@/lib/utils';

interface AdminRole {
  _id: string;
  name: string;
  slug: string;
  isSystemRole: boolean;
}

interface AdminUserRow {
  _id: string;
  name: string;
  email: string;
  role: AdminRole | string;
  status: 'active' | 'suspended';
  lastLoginAt?: string;
  createdAt: string;
}

interface AdminForm {
  name: string;
  email: string;
  password: string;
  role: string;
  status: 'active' | 'suspended';
}

const EMPTY: AdminForm = { name: '', email: '', password: '', role: '', status: 'active' };

export default function AdminTeamPage() {
  const { admin: currentAdmin, isSuperAdmin } = useAdminAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUserRow | null>(null);
  const [form, setForm] = useState<AdminForm>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);
  const [resetTarget, setResetTarget] = useState<AdminUserRow | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-team'],
    queryFn: async () => (await api.get<ApiEnvelope<AdminUserRow[]>>('/admin/admins')).data.data,
  });

  const { data: roles } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => (await api.get<ApiEnvelope<AdminRole[]>>('/admin/roles')).data.data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) return api.patch(`/admin/admins/${editing._id}`, { name: form.name, role: form.role, status: form.status });
      return api.post('/admin/admins', { name: form.name, email: form.email, password: form.password, role: form.role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      showToast(editing ? 'Admin updated' : 'Admin created', 'success');
      setDrawerOpen(false);
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/admin/admins/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      showToast('Admin deleted', 'success');
      setDeleteTarget(null);
    },
    onError: (err) => {
      showToast(extractApiError(err), 'error');
      setDeleteTarget(null);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async () => api.post(`/admin/admins/${resetTarget!._id}/reset-password`, { password: newPassword }),
    onSuccess: () => {
      showToast('Password reset successfully', 'success');
      setResetTarget(null);
      setNewPassword('');
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, role: roles?.[0]?._id || '' });
    setDrawerOpen(true);
  };

  const openEdit = (row: AdminUserRow) => {
    setEditing(row);
    setForm({
      name: row.name,
      email: row.email,
      password: '',
      role: typeof row.role === 'object' ? row.role._id : row.role,
      status: row.status,
    });
    setDrawerOpen(true);
  };

  const roleName = (role: AdminRole | string) => (typeof role === 'object' ? role.name : role);

  const columns: Column<AdminUserRow>[] = [
    {
      header: 'Name',
      key: 'name',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-800">
            {row.name} {row._id === currentAdmin?.id && <span className="text-xs font-normal text-brand-600">(you)</span>}
          </p>
          <p className="text-xs text-gray-400">{row.email}</p>
        </div>
      ),
    },
    { header: 'Role', key: 'role', render: (row) => roleName(row.role) },
    { header: 'Status', key: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Last Login', key: 'lastLoginAt', render: (row) => (row.lastLoginAt ? formatDate(row.lastLoginAt) : 'Never') },
    {
      header: '',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => {
              setResetTarget(row);
              setNewPassword('');
            }}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
            aria-label="Reset password"
          >
            <KeyRound className="h-4 w-4" />
          </button>
          <button onClick={() => openEdit(row)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </button>
          {row._id !== currentAdmin?.id && (
            <button onClick={() => setDeleteTarget(row)} className="rounded-lg p-1.5 text-danger hover:bg-red-50" aria-label="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
      className: 'text-right',
    },
  ];

  if (!isSuperAdmin && !isLoading && !data) {
    return <p className="text-gray-400">You don&apos;t have permission to manage admin users.</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team &amp; Admin Access</h1>
          <p className="text-sm text-gray-500">{data?.length || 0} admin accounts</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Admin
        </Button>
      </div>

      <DataTable columns={columns} rows={data || []} loading={isLoading} emptyLabel="No admin accounts yet" />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Edit Admin' : 'Add Admin'} width="max-w-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          <Field label="Full Name">
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" />
          </Field>
          {!editing && (
            <>
              <Field label="Email">
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="input"
                />
              </Field>
              <Field label="Password">
                <input
                  required
                  type="password"
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="input"
                  placeholder="At least 8 characters"
                />
              </Field>
            </>
          )}
          <Field label="Role">
            <select required value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="input">
              <option value="">Select role</option>
              {(roles || []).map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
          {editing && (
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'active' | 'suspended' }))}
                className="input"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </Field>
          )}
          <Button type="submit" className="w-full" loading={saveMutation.isPending}>
            {editing ? 'Save Changes' : 'Create Admin'}
          </Button>
        </form>
      </Drawer>

      <Drawer open={!!resetTarget} onClose={() => setResetTarget(null)} title={`Reset Password — ${resetTarget?.name || ''}`} width="max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            resetPasswordMutation.mutate();
          }}
          className="space-y-4"
        >
          <Field label="New Password">
            <input
              required
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
              placeholder="At least 8 characters"
            />
          </Field>
          <Button type="submit" className="w-full" loading={resetPasswordMutation.isPending}>
            Reset Password
          </Button>
        </form>
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This admin will immediately lose access. This cannot be undone."
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
