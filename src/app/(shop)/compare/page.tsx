'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X, GitCompareArrows } from 'lucide-react';
import { useCompare } from '@/context/CompareContext';
import { PriceTag } from '@/components/ui/PriceTag';
import { StarRating } from '@/components/ui/StarRating';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';

export default function ComparePage() {
  const { products, remove, clear } = useCompare();
  const { addItem } = useCart();

  if (products.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={GitCompareArrows}
          title="No products to compare"
          description="Add products from the catalog to compare their specifications side-by-side."
          actionLabel="Browse Products"
          onAction={() => (window.location.href = '/products')}
        />
      </div>
    );
  }

  const allSpecKeys = Array.from(new Set(products.flatMap((p) => (p.specifications || []).map((s) => s.key))));

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Compare Products</h1>
        <button onClick={() => clear()} className="text-sm font-medium text-danger">
          Clear All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="w-40" />
              {products.map((p) => {
                const thumb = p.images?.find((i) => i.isThumbnail)?.url || p.images?.[0]?.url;
                return (
                  <th key={p._id} className="w-56 border-b border-gray-100 p-4 text-left align-top">
                    <button onClick={() => remove(p._id)} className="mb-2 text-gray-400 hover:text-danger" aria-label="Remove from compare">
                      <X className="h-4 w-4" />
                    </button>
                    <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
                      {thumb && <Image src={thumb} alt={p.name} fill className="object-cover" />}
                    </div>
                    <Link href={`/product/${p.slug}`} className="line-clamp-2 text-sm font-semibold text-gray-800 hover:text-brand-600">
                      {p.name}
                    </Link>
                    <div className="mt-2">
                      <PriceTag regularPrice={p.regularPrice} salePrice={p.salePrice} size="sm" />
                    </div>
                    <Button size="sm" className="mt-2 w-full" onClick={() => addItem(p._id, 1)}>
                      Add to Cart
                    </Button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-gray-100 p-3 text-sm font-medium text-gray-500">Rating</td>
              {products.map((p) => (
                <td key={p._id} className="border-b border-gray-100 p-3">
                  <StarRating rating={p.ratingAverage} count={p.ratingCount} />
                </td>
              ))}
            </tr>
            <tr>
              <td className="border-b border-gray-100 p-3 text-sm font-medium text-gray-500">Warranty</td>
              {products.map((p) => (
                <td key={p._id} className="border-b border-gray-100 p-3 text-sm text-gray-700">
                  {p.warranty || '—'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border-b border-gray-100 p-3 text-sm font-medium text-gray-500">Features</td>
              {products.map((p) => (
                <td key={p._id} className="border-b border-gray-100 p-3 text-sm text-gray-700">
                  <ul className="space-y-1">
                    {(p.features || []).slice(0, 5).map((f, i) => (
                      <li key={i}>• {f}</li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
            {allSpecKeys.map((key) => (
              <tr key={key}>
                <td className="border-b border-gray-100 p-3 text-sm font-medium text-gray-500">{key}</td>
                {products.map((p) => {
                  const spec = (p.specifications || []).find((s) => s.key === key);
                  return (
                    <td key={p._id} className="border-b border-gray-100 p-3 text-sm text-gray-700">
                      {spec?.value || '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
