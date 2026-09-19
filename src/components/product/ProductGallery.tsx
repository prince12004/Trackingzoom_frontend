'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ImageOff } from 'lucide-react';
import { ProductImage } from '@/types';
import { cn } from '@/lib/utils';

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder);
  const [active, setActive] = useState(0);
  const current = sorted[active];

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-gray-50 text-gray-300">
        <ImageOff className="h-16 w-16" />
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Image src={current.url} alt={current.altText || name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
      </div>
      {sorted.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {sorted.map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => setActive(i)}
              className={cn(
                'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2',
                active === i ? 'border-brand-500' : 'border-transparent'
              )}
            >
              <Image src={img.url} alt={img.altText || name} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
