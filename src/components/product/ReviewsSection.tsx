'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, UserRound, BadgeCheck } from 'lucide-react';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';
import { Review } from '@/types';
import { StarRating } from '../ui/StarRating';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatDate, cn } from '@/lib/utils';

export function ReviewsSection({ productId, ratingAverage, ratingCount }: { productId: string; ratingAverage: number; ratingCount: number }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [title, setTitle] = useState('');

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => (await api.get<ApiEnvelope<Review[]>>(`/reviews/product/${productId}`)).data.data,
  });

  const mutation = useMutation({
    mutationFn: async () => api.post('/reviews', { productId, rating, comment, title }),
    onSuccess: () => {
      showToast('Review submitted for approval. Thank you!', 'success');
      setShowForm(false);
      setComment('');
      setTitle('');
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  return (
    <div>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{ratingAverage.toFixed(1)}</span>
            <div>
              <StarRating rating={ratingAverage} size="md" />
              <p className="text-xs text-gray-500">{ratingCount} reviews</p>
            </div>
          </div>
        </div>
        {user ? (
          <Button variant="outline" size="sm" onClick={() => setShowForm((s) => !s)}>
            Write a Review
          </Button>
        ) : (
          <a href="/login" className="text-sm font-semibold text-brand-600">
            Login to write a review
          </a>
        )}
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="mb-6 space-y-3 rounded-xl border border-gray-200 p-4"
        >
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button key={i} type="button" onClick={() => setRating(i + 1)}>
                <Star className={cn('h-6 w-6', i < rating ? 'fill-accent-400 text-accent-400' : 'fill-gray-200 text-gray-200')} />
              </button>
            ))}
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Review title (optional)"
            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-400"
          />
          <textarea
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
          <Button type="submit" size="sm" loading={mutation.isPending}>
            Submit Review
          </Button>
        </motion.form>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading reviews...</p>
      ) : !reviews || reviews.length === 0 ? (
        <EmptyState title="No reviews yet" description="Be the first to review this product." />
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => {
            const reviewer = typeof review.user === 'object' ? review.user : null;
            return (
              <li key={review._id} className="border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <UserRound className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{reviewer?.name || 'Customer'}</p>
                    <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                  </div>
                  {review.verifiedPurchase && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-success">
                      <BadgeCheck className="h-3.5 w-3.5" /> Verified Purchase
                    </span>
                  )}
                </div>
                <StarRating rating={review.rating} />
                {review.title && <p className="mt-1 font-medium text-gray-800">{review.title}</p>}
                <p className="mt-1 text-sm text-gray-600">{review.comment}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
