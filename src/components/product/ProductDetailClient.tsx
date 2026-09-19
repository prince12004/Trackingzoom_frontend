'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, GitCompareArrows, Share2, Minus, Plus, ShieldCheck, Truck, PhoneCall, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { ProductGallery } from './ProductGallery';
import { PriceTag } from '../ui/PriceTag';
import { StarRating } from '../ui/StarRating';
import { PincodeCheck } from './PincodeCheck';
import { ProductTabs } from './ProductTabs';
import { ReviewsSection } from './ReviewsSection';
import { Button } from '../ui/Button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useCompare } from '@/context/CompareContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api, ApiEnvelope } from '@/lib/api';

interface PublicSettings {
  general: { contactNumber?: string };
}

export function ProductDetailClient({ product, related }: { product: Product; related: Product[] }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { user } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const { isComparing, add: addCompare, remove: removeCompare } = useCompare();
  const { showToast } = useToast();
  const router = useRouter();
  const { data: settings } = useQuery({
    queryKey: ['settings-public'],
    queryFn: async () => (await api.get<ApiEnvelope<PublicSettings>>('/settings/public')).data.data,
  });

  const category = typeof product.category === 'object' ? product.category : null;
  const brand = typeof product.brand === 'object' ? product.brand : null;
  const outOfStock = product.stockQuantity <= 0;

  const handleBuyNow = async () => {
    await addItem(product._id, quantity);
    router.push('/checkout');
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((i) => i.url),
    description: product.shortDescription,
    sku: product.sku,
    brand: brand ? { '@type': 'Brand', name: brand.name } : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.salePrice || product.regularPrice,
      availability: outOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    },
    aggregateRating:
      product.ratingCount > 0
        ? { '@type': 'AggregateRating', ratingValue: product.ratingAverage, reviewCount: product.ratingCount }
        : undefined,
  };

  return (
    <div className="container-page py-6">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-4 flex items-center gap-1 text-xs text-gray-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/products" className="hover:text-brand-600">Products</Link>
        {category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/products?category=${category.slug}`} className="hover:text-brand-600">{category.name}</Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {brand && <p className="text-sm font-medium text-brand-600">{brand.name}</p>}
          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            {product.ratingCount > 0 && <StarRating rating={product.ratingAverage} count={product.ratingCount} size="md" />}
            <span className="text-xs text-gray-400">SKU: {product.sku}</span>
          </div>

          <div className="mt-4">
            <PriceTag regularPrice={product.regularPrice} salePrice={product.salePrice} size="lg" />
            <p className="mt-1 text-xs text-gray-500">Inclusive of all taxes</p>
          </div>

          {product.shortDescription && <p className="mt-4 text-sm text-gray-600">{product.shortDescription}</p>}

          <div className="mt-4 flex items-center gap-2 text-sm">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                outOfStock ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
              )}
            >
              {outOfStock ? 'Out of Stock' : 'In Stock'}
            </span>
            {product.requiresInstallation && (
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                Installation Required
              </span>
            )}
            {product.requiresSubscription && (
              <span className="rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-700">
                Subscription Required
              </span>
            )}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-gray-200">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2.5 text-gray-500 hover:text-gray-800"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.maxOrderQuantity, q + 1))}
                className="p-2.5 text-gray-500 hover:text-gray-800"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="text-xs text-gray-400">Max {product.maxOrderQuantity} per order</span>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="flex-1" disabled={outOfStock} onClick={() => addItem(product._id, quantity)}>
              Add to Cart
            </Button>
            <Button size="lg" variant="secondary" className="flex-1" disabled={outOfStock} onClick={handleBuyNow}>
              Buy Now
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => (user ? toggle(product._id) : router.push('/login'))}
              className={cn('flex items-center gap-1.5 text-sm font-medium', isWishlisted(product._id) ? 'text-danger' : 'text-gray-600 hover:text-gray-900')}
            >
              <Heart className={cn('h-4 w-4', isWishlisted(product._id) && 'fill-current')} /> Wishlist
            </button>
            {product.comparable && (
              <button
                onClick={() => (isComparing(product._id) ? removeCompare(product._id) : addCompare(product._id))}
                className={cn('flex items-center gap-1.5 text-sm font-medium', isComparing(product._id) ? 'text-brand-600' : 'text-gray-600 hover:text-gray-900')}
              >
                <GitCompareArrows className="h-4 w-4" /> Compare
              </button>
            )}
            <button
              onClick={async () => {
                if (navigator.share) {
                  await navigator.share({ title: product.name, url: window.location.href });
                } else {
                  await navigator.clipboard.writeText(window.location.href);
                  showToast('Link copied to clipboard', 'success');
                }
              }}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>

          <div className="mt-6">
            <PincodeCheck />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> {product.codAvailable ? 'COD Available' : 'Prepaid Only'}</span>
            {product.warranty && <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> {product.warranty}</span>}
          </div>
        </motion.div>
      </div>

      <div className="mt-12">
        <ProductTabs product={product} />
      </div>

      <div className="mt-12 border-t border-gray-100 pt-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Customer Reviews</h2>
        <ReviewsSection productId={product._id} ratingAverage={product.ratingAverage} ratingCount={product.ratingCount} />
      </div>

      {related.length > 0 && (
        <div className="mt-12 border-t border-gray-100 pt-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Related Products</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-xl bg-brand-50 p-6 sm:flex-row">
        <div>
          <p className="font-semibold text-brand-900">Need help deciding?</p>
          <p className="text-sm text-brand-700">Talk to our product expert for personalized recommendations.</p>
        </div>
        {settings?.general?.contactNumber ? (
          <a
            href={`tel:${settings.general.contactNumber}`}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <PhoneCall className="h-4 w-4" /> Call {settings.general.contactNumber}
          </a>
        ) : (
          <Link href="/contact-us" className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            <PhoneCall className="h-4 w-4" /> Talk to Expert
          </Link>
        )}
      </div>
    </div>
  );
}

