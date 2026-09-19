'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { X, GitCompareArrows } from 'lucide-react';
import { useCompare } from '@/context/CompareContext';
import { Button } from '../ui/Button';

export function CompareBar() {
  const { products, remove, clear } = useCompare();

  return (
    <AnimatePresence>
      {products.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white shadow-card-hover"
        >
          <div className="container-page flex items-center gap-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <GitCompareArrows className="h-5 w-5 text-brand-600" />
              Compare ({products.length}/4)
            </div>
            <div className="flex flex-1 gap-2 overflow-x-auto">
              {products.map((p) => {
                const thumb = p.images?.find((i) => i.isThumbnail)?.url || p.images?.[0]?.url;
                return (
                  <div key={p._id} className="relative flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 p-1.5">
                    <div className="relative h-9 w-9 overflow-hidden rounded bg-gray-100">
                      {thumb && <Image src={thumb} alt={p.name} fill className="object-cover" />}
                    </div>
                    <span className="max-w-[120px] truncate text-xs text-gray-700">{p.name}</span>
                    <button onClick={() => remove(p._id)} className="text-gray-400 hover:text-danger" aria-label="Remove from compare">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
            <button onClick={() => clear()} className="hidden text-xs text-gray-400 hover:text-danger sm:block">
              Clear all
            </button>
            <Link href="/compare">
              <Button size="sm" disabled={products.length < 2}>
                Compare Now
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
