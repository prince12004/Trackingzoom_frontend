'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { api, ApiEnvelope } from '@/lib/api';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';

export function SearchBar({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await api.get<ApiEnvelope<Product[]>>('/products/search/autocomplete', {
          params: { q: query },
        });
        setResults(res.data.data);
        setOpen(true);
      } catch {
        setResults([]);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const submit = () => {
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div ref={containerRef} className={`relative w-full searchhs ${className || ''}`}>
      <div className="flex h-11 items-center rounded-lg border border-gray-200 bg-gray-50 pl-3 pr-1 focus-within:border-brand-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100">
        <Search className="h-4 w-4 shrink-0 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Search GPS trackers, accessories..."
          className="h-full w-full bg-transparent px-2 text-sm outline-none placeholder:text-gray-400"
          autoFocus={autoFocus}
        />
        {query && (
          <button onClick={() => setQuery('')} className="p-1.5 text-gray-400 hover:text-gray-600" aria-label="Clear search">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-12 z-50 max-h-96 overflow-auto rounded-xl border border-gray-100 bg-white p-2 shadow-card-hover"
          >
            {results.map((p) => {
              const thumb = p.images.find((i) => i.isThumbnail)?.url || p.images[0]?.url;
              return (
                <Link
                  key={p._id}
                  href={`/product/${p.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {thumb && <Image src={thumb} alt={p.name} fill className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{p.name}</p>
                    <p className="text-xs font-semibold text-brand-600">
                      {formatCurrency(p.salePrice && p.salePrice < p.regularPrice ? p.salePrice : p.regularPrice)}
                    </p>
                  </div>
                </Link>
              );
            })}
            <button
              onClick={submit}
              className="mt-1 w-full rounded-lg py-2 text-center text-xs font-semibold text-brand-600 hover:bg-brand-50"
            >
              View all results for &ldquo;{query}&rdquo;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
