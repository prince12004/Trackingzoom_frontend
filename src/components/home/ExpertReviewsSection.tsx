'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PlayCircle, UserRound } from 'lucide-react';
import { api, ApiEnvelope } from '@/lib/api';
import { ExpertReview } from '@/types';
import { RevealSection, SectionHeading } from './RevealSection';

export function ExpertReviewsSection() {
  const { data } = useQuery({
    queryKey: ['expert-reviews'],
    queryFn: async () => (await api.get<ApiEnvelope<ExpertReview[]>>('/expert-reviews')).data.data,
  });

  if (!data || data.length === 0) return null;

  return (
    <RevealSection className="bg-gray-50 py-12">
      <div className="container-page">
        <SectionHeading title="What Experts Say" />
        <div className="flex gap-4 overflow-x-auto pb-2">
          {data.map((review, i) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="w-72 shrink-0 rounded-xl bg-white p-4 shadow-card"
            >
              <div className="relative mb-3 aspect-video overflow-hidden rounded-lg bg-gray-100">
                {review.videoThumbnail ? (
                  <Image src={review.videoThumbnail} alt={review.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-300">
                    <PlayCircle className="h-10 w-10" />
                  </div>
                )}
                {review.videoUrl && (
                  <a
                    href={review.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30"
                  >
                    <PlayCircle className="h-10 w-10 text-white" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-brand-600">
                  {review.profileImage ? (
                    <Image src={review.profileImage} alt={review.name} width={32} height={32} className="object-cover" />
                  ) : (
                    <UserRound className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{review.name}</p>
                  {review.designation && <p className="text-xs text-gray-500">{review.designation}</p>}
                </div>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-gray-600">{review.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
