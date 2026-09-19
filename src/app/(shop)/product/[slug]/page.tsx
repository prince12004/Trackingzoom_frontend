import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverGet } from '@/lib/serverApi';
import { Product, ProductVariant } from '@/types';
import { ProductDetailClient } from '@/components/product/ProductDetailClient';

interface ProductDetailResponse {
  product: Product;
  variants: ProductVariant[];
  relatedProducts: Product[];
}

async function getProduct(slug: string) {
  return serverGet<ProductDetailResponse>(`/products/${slug}`, 60);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) return { title: 'Product Not Found' };

  const { product } = data;
  const image = product.images[0]?.url;

  return {
    title: product.seoTitle || product.name,
    description: product.metaDescription || product.shortDescription,
    openGraph: {
      title: product.seoTitle || product.name,
      description: product.metaDescription || product.shortDescription,
      images: image ? [image] : undefined,
    },
    alternates: { canonical: `/product/${product.slug}` },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) notFound();

  return <ProductDetailClient product={data.product} related={data.relatedProducts} />;
}
