'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, Reorder } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';
import { HomepageSection } from '@/types';
import { useToast } from '@/context/ToastContext';

export default function AdminHomepagePage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-homepage-sections'],
    queryFn: async () => (await api.get<ApiEnvelope<HomepageSection[]>>('/homepage-sections/admin/all')).data.data,
  });

  const [localOrder, setLocalOrder] = useState<HomepageSection[] | null>(null);
  const sections = localOrder || data || [];

  const toggleMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => api.patch(`/homepage-sections/admin/${id}`, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage-sections'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
      showToast('Section updated', 'success');
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const fieldMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: string }) => api.patch(`/homepage-sections/admin/${id}`, { [field]: value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const reorderMutation = useMutation({
    mutationFn: async (order: { id: string; displayOrder: number }[]) => api.post('/homepage-sections/admin/reorder', { order }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage-sections'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
      showToast('Order saved', 'success');
    },
  });

  const handleReorder = (newOrder: HomepageSection[]) => {
    setLocalOrder(newOrder);
    reorderMutation.mutate(newOrder.map((s, i) => ({ id: s._id, displayOrder: i + 1 })));
  };

  if (isLoading) return <p className="text-gray-400">Loading...</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Homepage Sections</h1>
        <p className="text-sm text-gray-500">Drag to reorder, toggle to enable/disable, edit titles inline</p>
      </div>

      <Reorder.Group axis="y" values={sections} onReorder={handleReorder} className="space-y-2">
        {sections.map((section) => (
          <Reorder.Item key={section._id} value={section}>
            <motion.div layout className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-card">
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-gray-300" />
              <div className="flex-1">
                <p className="text-xs font-mono uppercase text-gray-400">{section.key}</p>
                <input
                  defaultValue={section.title || ''}
                  onBlur={(e) => fieldMutation.mutate({ id: section._id, field: 'title', value: e.target.value })}
                  placeholder="Section title"
                  className="mt-0.5 w-full border-none bg-transparent p-0 text-sm font-medium text-gray-800 outline-none"
                />
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={section.enabled}
                  onChange={(e) => toggleMutation.mutate({ id: section._id, enabled: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-brand-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:after:translate-x-5" />
              </label>
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
