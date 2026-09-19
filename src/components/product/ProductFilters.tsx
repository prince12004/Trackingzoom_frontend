'use client';

import { useQuery } from '@tanstack/react-query';
import { Tag, Building2, IndianRupee, PackageCheck, RotateCcw } from 'lucide-react';
import { api, ApiEnvelope } from '@/lib/api';
import { Category, Brand } from '@/types';

export interface FilterState {
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
}

function FilterSection({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-brand-50 to-accent-50 text-brand-600">
          <Icon className="h-3.5 w-3.5" />
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

export function ProductFilters({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}) {
  const { data: categories } = useQuery({
    queryKey: ['nav-categories'],
    queryFn: async () => (await api.get<ApiEnvelope<Category[]>>('/categories', { params: { parent: 'root' } })).data.data,
  });
  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => (await api.get<ApiEnvelope<Brand[]>>('/brands')).data.data,
  });

  const activeCount =
    (filters.category ? 1 : 0) + (filters.brand ? filters.brand.split(',').length : 0) + (filters.minPrice || filters.maxPrice ? 1 : 0) + (filters.inStock ? 1 : 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
      <div className="flex items-center justify-between bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-4">
        <span className="text-sm font-bold text-white">Filters</span>
        {activeCount > 0 && (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white">{activeCount} active</span>
        )}
      </div>

      <div className="space-y-5 p-5">
        <FilterSection icon={Tag} title="Category">
          <div className="space-y-2.5">
            {(categories || []).map((cat) => (
              <label key={cat._id} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-600 hover:text-brand-700">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === cat.slug}
                  onChange={() => onChange({ ...filters, category: cat.slug })}
                  className="h-4 w-4 accent-brand-600"
                />
                {cat.name}
              </label>
            ))}
            {filters.category && (
              <button onClick={() => onChange({ ...filters, category: undefined })} className="text-xs font-semibold text-brand-600 hover:underline">
                Clear category
              </button>
            )}
          </div>
        </FilterSection>

        {brands && brands.length > 0 && (
          <FilterSection icon={Building2} title="Brand">
            <div className="space-y-2.5">
              {brands.map((brand) => (
                <label key={brand._id} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-600 hover:text-brand-700">
                  <input
                    type="checkbox"
                    checked={filters.brand?.split(',').includes(brand.slug) || false}
                    onChange={(e) => {
                      const current = filters.brand ? filters.brand.split(',') : [];
                      const next = e.target.checked ? [...current, brand.slug] : current.filter((b) => b !== brand.slug);
                      onChange({ ...filters, brand: next.length ? next.join(',') : undefined });
                    }}
                    className="h-4 w-4 rounded accent-brand-600"
                  />
                  {brand.name}
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        <FilterSection icon={IndianRupee} title="Price Range">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => onChange({ ...filters, minPrice: e.target.value || undefined })}
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <span className="shrink-0 text-gray-400">&ndash;</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => onChange({ ...filters, maxPrice: e.target.value || undefined })}
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </FilterSection>

        <FilterSection icon={PackageCheck} title="Availability">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-600 hover:text-brand-700">
            <input
              type="checkbox"
              checked={filters.inStock === 'true'}
              onChange={(e) => onChange({ ...filters, inStock: e.target.checked ? 'true' : undefined })}
              className="h-4 w-4 rounded accent-brand-600"
            />
            In Stock Only
          </label>
        </FilterSection>

        <button
          onClick={() => onChange({})}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-brand-100 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Clear All Filters
        </button>
      </div>
    </div>
  );
}
