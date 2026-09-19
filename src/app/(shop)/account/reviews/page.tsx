'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Star, ImageOff } from 'lucide-react';
import { api, ApiEnvelope } from '@/lib/api';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';

interface MyReview {
  _id: string;
  product: { name: string; slug: string; images: { url: string; isThumbnail: boolean }[] };
  rating: number;
  title?: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function MyReviewsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: async () => (await api.get<ApiEnvelope<MyReview[]>>('/reviews/mine')).data.data,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Reviews</h1>

      {isLoading ? (
        <p className="text-gray-400">Loading reviews...</p>
      ) : !data || data.length === 0 ? (
        <EmptyState icon={Star} title="No reviews yet" description="Reviews you submit on products will appear here." />
      ) : (
        <ul className="space-y-3">
          {data.map((review) => {
            const thumb = review.product.images?.find((i) => i.isThumbnail)?.url || review.product.images?.[0]?.url;
            return (
              <li key={review._id} className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-card">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {thumb ? <Image src={thumb} alt={review.product.name} fill className="object-cover" /> : <ImageOff className="m-auto h-5 w-5 text-gray-300" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/product/${review.product.slug}`} className="truncate font-medium text-gray-800 hover:text-brand-600">
                      {review.product.name}
                    </Link>
                    <StatusBadge status={review.status} />
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-accent-400 text-accent-400' : 'fill-gray-200 text-gray-200'}`} />
                    ))}
                    <span className="ml-1 text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                  </div>
                  {review.title && <p className="mt-1 text-sm font-medium text-gray-800">{review.title}</p>}
                  <p className="text-sm text-gray-600">{review.comment}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
