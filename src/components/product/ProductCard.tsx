'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, GitCompareArrows, ShoppingCart, ImageOff } from 'lucide-react';
import { Product } from '@/types';
import { PriceTag } from '../ui/PriceTag';
import { StarRating } from '../ui/StarRating';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useCompare } from '@/context/CompareContext';
import { useAuth } from '@/context/AuthContext';
import { cn, discountPercent } from '@/lib/utils';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const { isComparing, add: addCompare, remove: removeCompare } = useCompare();

  const thumbnail = product.images.find((i) => i.isThumbnail)?.url || product.images[0]?.url;
  const outOfStock = product.stockQuantity <= 0;
  const discount = discountPercent(product.regularPrice, product.salePrice);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
      whileHover={{ y: -5 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card transition-shadow duration-300 hover:shadow-card-hover"
    >
      <div className="absolute right-2 top-2 z-10 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            if (!user) return (window.location.href = '/login');
            toggle(product._id);
          }}
          aria-label="Toggle wishlist"
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-card',
            isWishlisted(product._id) ? 'text-danger' : 'text-gray-500'
          )}
        >
          <Heart className={cn('h-4 w-4', isWishlisted(product._id) && 'fill-current')} />
        </motion.button>
        {product.comparable && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault();
              isComparing(product._id) ? removeCompare(product._id) : addCompare(product._id);
            }}
            aria-label="Toggle compare"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-card',
              isComparing(product._id) ? 'text-brand-600' : 'text-gray-500'
            )}
          >
            <GitCompareArrows className="h-4 w-4" />
          </motion.button>
        )}
      </div>

      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/3] w-full overflow-hidden bg-gray-50">
        {discount > 0 && !outOfStock && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-gradient-to-r from-accent-500 to-accent-600 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
            {discount}% OFF
          </span>
        )}
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={product.images.find((i) => i.isThumbnail)?.altText || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-medium text-gray-800 hover:text-brand-600">{product.name}</h3>
        </Link>
        {product.ratingCount > 0 && <StarRating rating={product.ratingAverage} count={product.ratingCount} />}
        <PriceTag regularPrice={product.regularPrice} salePrice={product.salePrice} />

        <motion.button
          whileTap={{ scale: 0.96 }}
          disabled={outOfStock}
          onClick={async (e) => {
            e.preventDefault();
            await addItem(product._id, 1);
          }}
          className="mt-1 flex h-9 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:shadow-none"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </motion.button>
      </div>
    </motion.div>
  );
}
