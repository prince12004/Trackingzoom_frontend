'use client';

import { useQuery } from '@tanstack/react-query';
import { api, ApiEnvelope } from '@/lib/api';
import { FAQ } from '@/types';
import { Accordion } from '@/components/ui/Accordion';
import { EmptyState } from '@/components/ui/EmptyState';

export default function FaqsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => (await api.get<ApiEnvelope<FAQ[]>>('/faqs')).data.data,
  });

  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="mb-6 text-center text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h1>
      {isLoading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : !data || data.length === 0 ? (
        <EmptyState title="No FAQs available yet" />
      ) : (
        <Accordion items={data} />
      )}
    </div>
  );
}
