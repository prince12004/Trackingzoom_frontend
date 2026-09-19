'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';
import { DataTable, Column, StatusBadge } from '@/components/admin/DataTable';
import { useToast } from '@/context/ToastContext';
import { formatDate } from '@/lib/utils';

interface Lead {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  leadType: 'callback' | 'expert';
  message?: string;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = ['new', 'contacted', 'follow_up', 'converted', 'not_interested', 'closed'];

export default function AdminLeadsPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-leads', statusFilter],
    queryFn: async () => (await api.get<ApiEnvelope<Lead[]>>('/leads/admin/all', { params: { status: statusFilter || undefined, limit: 100 } })).data.data,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => api.patch(`/leads/admin/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
      showToast('Lead updated', 'success');
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const columns: Column<Lead>[] = [
    {
      header: 'Lead',
      key: 'name',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-800">{row.name}</p>
          <p className="text-xs text-gray-400">{row.mobile}</p>
        </div>
      ),
    },
    { header: 'Type', key: 'leadType', render: (row) => <span className="capitalize">{row.leadType}</span> },
    { header: 'Message', key: 'message', render: (row) => <span className="max-w-xs truncate block">{row.message || '—'}</span> },
    { header: 'Received', key: 'createdAt', render: (row) => formatDate(row.createdAt) },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => updateMutation.mutate({ id: row._id, status: e.target.value })}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads &amp; Callbacks</h1>
          <p className="text-sm text-gray-500">{data?.length || 0} leads</p>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} rows={data || []} loading={isLoading} emptyLabel="No leads yet" />
    </div>
  );
}
