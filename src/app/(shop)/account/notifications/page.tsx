'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';
import { api, ApiEnvelope } from '@/lib/api';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { formatDate, cn } from '@/lib/utils';

interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-notifications'],
    queryFn: async () => (await api.get<ApiEnvelope<{ notifications: NotificationItem[]; unreadCount: number }>>('/notifications/customer')).data.data,
  });

  const markAllMutation = useMutation({
    mutationFn: async () => api.patch('/notifications/customer/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-notifications'] }),
  });

  const markOneMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/notifications/customer/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-notifications'] }),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {!!data?.unreadCount && (
          <Button size="sm" variant="outline" onClick={() => markAllMutation.mutate()}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-gray-400">Loading notifications...</p>
      ) : !data || data.notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="Order updates and account alerts will show up here." />
      ) : (
        <ul className="space-y-2">
          {data.notifications.map((n, i) => (
            <motion.li
              key={n._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.3) }}
              onClick={() => !n.read && markOneMutation.mutate(n._id)}
              className={cn(
                'cursor-pointer rounded-xl border p-4 transition-colors',
                n.read ? 'border-gray-100 bg-white' : 'border-brand-100 bg-brand-50/50'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-800">{n.title}</p>
                  <p className="text-sm text-gray-500">{n.message}</p>
                </div>
                {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
              </div>
              <p className="mt-1.5 text-xs text-gray-400">{formatDate(n.createdAt)}</p>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
