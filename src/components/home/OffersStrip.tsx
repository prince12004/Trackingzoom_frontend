'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';
import { api, ApiEnvelope } from '@/lib/api';
import { Offer } from '@/types';
import { RevealSection, SectionHeading } from './RevealSection';

export function OffersStrip() {
  const { data } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => (await api.get<ApiEnvelope<Offer[]>>('/offers')).data.data,
  });

  if (!data || data.length === 0) return null;

  return (
    <RevealSection className="container-page py-10">
      <SectionHeading title="Special Offers" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((offer, i) => (
          <motion.div
            key={offer._id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="relative flex items-center gap-4 overflow-hidden rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 p-5 text-white"
          >
            {offer.bannerImage ? (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/10">
                <Image src={offer.bannerImage} alt={offer.title} fill className="object-cover" />
              </div>
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <Tag className="h-7 w-7" />
              </span>
            )}
            <div>
              <p className="font-bold">{offer.title}</p>
              {offer.discountValue ? (
                <p className="text-sm text-accent-50">
                  {offer.type === 'percentage' ? `${offer.discountValue}% off` : `Flat ₹${offer.discountValue} off`}
                </p>
              ) : null}
            </div>
          </motion.div>
        ))}
      </div>
    </RevealSection>
  );
}
