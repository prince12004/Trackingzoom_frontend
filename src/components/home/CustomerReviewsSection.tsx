'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { UserRound, BadgeCheck } from 'lucide-react';
import { api, ApiEnvelope } from '@/lib/api';
import { Review } from '@/types';
import { StarRating } from '../ui/StarRating';
import { RevealSection, SectionHeading } from './RevealSection';

export function CustomerReviewsSection() {
  const { data } = useQuery({
    queryKey: ['recent-reviews'],
    queryFn: async () => (await api.get<ApiEnvelope<Review[]>>('/reviews/recent')).data.data,
  });

  if (!data || data.length === 0) return null;

  return (
    <RevealSection className="container-page py-12">
      <SectionHeading title="What Our Customers Say" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.slice(0, 6).map((review, i) => {
          const reviewer = typeof review.user === 'object' ? review.user : null;
          return (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-5 shadow-card"
            >
              <StarRating rating={review.rating} />
              {review.title && <p className="font-semibold text-gray-800">{review.title}</p>}
              <p className="line-clamp-4 text-sm text-gray-600">{review.comment}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <UserRound className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-gray-700">{reviewer?.name || 'Verified Customer'}</span>
                {review.verifiedPurchase && (
                  <span className="flex items-center gap-1 text-xs text-success">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </RevealSection>
  );
}
