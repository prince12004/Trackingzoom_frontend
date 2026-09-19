'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import { ProductCard } from '@/components/product/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const { products, isLoading } = useWishlist();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login?redirect=/wishlist');
  }, [authLoading, user, router]);

  if (authLoading || !user) return <div className="container-page py-16 text-center text-gray-400">Loading...</div>;

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Wishlist</h1>
      {isLoading ? (
        <ProductGridSkeleton />
      ) : products.length === 0 ? (
        <EmptyState icon={Heart} title="Your wishlist is empty" description="Save products you love to buy them later." actionLabel="Browse Products" onAction={() => router.push('/products')} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
