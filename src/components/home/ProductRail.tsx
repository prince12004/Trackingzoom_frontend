'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { api, ApiEnvelope } from '@/lib/api';
import { Product } from '@/types';
import { ProductCard } from '../product/ProductCard';
import { ProductGridSkeleton } from '../ui/Skeleton';
import { RevealSection, SectionHeading } from './RevealSection';

export function ProductRail({
  title,
  subtitle,
  params,
  viewAllHref,
}: {
  title: string;
  subtitle?: string;
  params: Record<string, string>;
  viewAllHref: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['product-rail', params],
    queryFn: async () =>
      (await api.get<ApiEnvelope<Product[]>>('/products', { params: { limit: 8, ...params } })).data.data,
  });

  if (!isLoading && (!data || data.length === 0)) return null;

  return (
    <RevealSection className="container-page py-10">
      <div className="mb-6 flex items-end justify-between">
        <SectionHeading title={title} subtitle={subtitle} />
        <Link href={viewAllHref} className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 sm:flex">
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {isLoading ? (
        <ProductGridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {data!.map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </div>
      )}
      <Link href={viewAllHref} className="mt-4 flex items-center justify-center gap-1 text-sm font-semibold text-brand-600 sm:hidden">
        View All <ArrowRight className="h-4 w-4" />
      </Link>
    </RevealSection>
  );
}
