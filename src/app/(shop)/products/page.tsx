'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { api, ApiEnvelope } from '@/lib/api';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters, FilterState } from '@/components/product/ProductFilters';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PackageSearch } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Popularity' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'best_selling', label: 'Best Selling' },
];

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters: FilterState = {
    category: searchParams.get('category') || undefined,
    brand: searchParams.get('brand') || undefined,
    minPrice: searchParams.get('minPrice') || undefined,
    maxPrice: searchParams.get('maxPrice') || undefined,
    inStock: searchParams.get('inStock') || undefined,
  };
  const search = searchParams.get('search') || undefined;
  const featured = searchParams.get('featured') || undefined;
  const bestSeller = searchParams.get('bestSeller') || undefined;
  const newArrival = searchParams.get('newArrival') || undefined;
  const sort = searchParams.get('sort') || 'popular';

  const setFilters = (next: FilterState) => {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => v && params.set(k, v));
    if (sort !== 'popular') params.set('sort', sort);
    router.push(`/products?${params.toString()}`);
    setPage(1);
  };

  const setSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`/products?${params.toString()}`);
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', filters, search, featured, bestSeller, newArrival, sort, page],
    queryFn: async () => {
      const res = await api.get<ApiEnvelope<Product[]>>('/products', {
        params: { ...filters, search, featured, bestSeller, newArrival, sort, page, limit: 20 },
      });
      return res;
    },
  });

  const products = data?.data.data || [];
  const pagination = data?.data.pagination;

  return (
    <div className="container-page py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
            {search ? `Search results for "${search}"` : filters.category ? 'Products' : 'All Products'}
          </h1>
          {pagination && <p className="text-sm text-gray-500">{pagination.total} products found</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <ProductFilters filters={filters} onChange={setFilters} />
        </aside>

        <div>
          {isLoading ? (
            <ProductGridSkeleton count={12} />
          ) : isError ? (
            <EmptyState title="Failed to load products" description="Please try again." actionLabel="Retry" onAction={() => refetch()} />
          ) : products.length === 0 ? (
            <EmptyState icon={PackageSearch} title="No products found" description="Try adjusting your filters or search terms." />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                {products.map((p, i) => (
                  <ProductCard key={p._id} product={p} index={i} />
                ))}
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {Array.from({ length: pagination.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`h-9 w-9 rounded-lg text-sm font-medium ${
                        page === i + 1 ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85%] overflow-y-auto bg-white p-4 shadow-xl lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ProductFilters
                filters={filters}
                onChange={(f) => {
                  setFilters(f);
                  setMobileFiltersOpen(false);
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container-page py-6"><ProductGridSkeleton count={12} /></div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
