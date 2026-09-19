'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Radar } from 'lucide-react';
import { api, ApiEnvelope } from '@/lib/api';
import { Category } from '@/types';
import { RevealSection, SectionHeading } from './RevealSection';
import { motion } from 'framer-motion';

export function CategoryGrid() {
  const { data } = useQuery({
    queryKey: ['nav-categories'],
    queryFn: async () => (await api.get<ApiEnvelope<Category[]>>('/categories', { params: { parent: 'root' } })).data.data,
  });

  if (!data || data.length === 0) return null;

  return (
    <RevealSection className="container-page py-10">
      <SectionHeading title="Shop by Category" subtitle="Find the right tracker or accessory for your vehicle" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {data.map((cat, i) => (
          <motion.div
            key={cat._id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            whileHover={{ y: -4 }}
            className="group"
          >
            <Link
              href={`/products?category=${cat.slug}`}
              className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-card transition-all duration-300 group-hover:border-brand-200 group-hover:shadow-card-hover"
            >
              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-50 to-accent-50 ring-1 ring-brand-100 transition-transform duration-300 group-hover:scale-110">
                {cat.icon || cat.image ? (
                  <Image src={cat.icon || cat.image || ''} alt={cat.name} fill className="object-cover" />
                ) : (
                  <Radar className="h-7 w-7 text-brand-500" />
                )}
              </div>
              <span className="line-clamp-2 text-xs font-semibold text-gray-700 group-hover:text-brand-700">{cat.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </RevealSection>
  );
}
