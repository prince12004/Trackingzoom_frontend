'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { api, ApiEnvelope } from '@/lib/api';
import { Product } from '@/types';
import { ProductCard } from '../product/ProductCard';
import { ProductGridSkeleton } from '../ui/Skeleton';
import { RevealSection, SectionHeading } from './RevealSection';

type TabKey = 'new_arrival' | 'best_sellers' | 'featured' | 'special_offers';

const TABS: { key: TabKey; label: string; params: Record<string, string> }[] = [
  { key: 'new_arrival', label: 'New Arrival', params: { newArrival: 'true', sort: 'newest', limit: '8' } },
  { key: 'best_sellers', label: 'Best Sellers', params: { bestSeller: 'true', sort: 'best_selling', limit: '8' } },
  { key: 'featured', label: 'Featured', params: { featured: 'true', limit: '8' } },
  { key: 'special_offers', label: 'Special Offers', params: { limit: '30' } },
];

function discountPercent(p: Product) {
  if (!p.salePrice || p.salePrice >= p.regularPrice) return 0;
  return Math.round(((p.regularPrice - p.salePrice) / p.regularPrice) * 100);
}

export function TabbedProductShowcase() {
  const [active, setActive] = useState<TabKey>('new_arrival');
  const tab = TABS.find((t) => t.key === active)!;

  const { data, isLoading } = useQuery({
    queryKey: ['product-showcase', active],
    queryFn: async () => (await api.get<ApiEnvelope<Product[]>>('/products', { params: tab.params })).data.data,
  });

  const products =
    active === 'special_offers'
      ? [...(data || [])].sort((a, b) => discountPercent(b) - discountPercent(a)).slice(0, 8)
      : data;

  return (
    <RevealSection className="container-page py-12">
      <SectionHeading title="All Products" subtitle="Real-time location updates with advanced tracking features" />

      <div className="mb-8 flex flex-wrap items-center justify-center gap-2.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wide transition-all duration-300 sm:text-sm ${
              active === t.key
                ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/25'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {isLoading ? (
            <ProductGridSkeleton count={8} />
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {products.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-gray-400">No products in this category yet.</p>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex justify-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-brand-200 px-6 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:border-brand-400 hover:bg-brand-50"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </RevealSection>
  );
}
