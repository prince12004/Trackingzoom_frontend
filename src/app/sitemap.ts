import { MetadataRoute } from 'next';
import { serverGet } from '@/lib/serverApi';
import { Product, Blog, Category } from '@/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const STATIC_ROUTES = [
  '',
  '/products',
  '/blogs',
  '/compare',
  '/about-us',
  '/contact-us',
  '/terms-and-conditions',
  '/privacy-policy',
  '/cancellation-policy',
  '/refund-policy',
  '/shipping-policy',
  '/warranty-policy',
  '/data-protection-policy',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, blogs, categories] = await Promise.all([
    serverGet<Product[]>('/products?limit=200', 3600),
    serverGet<Blog[]>('/blogs?limit=200', 3600),
    serverGet<Category[]>('/categories', 3600),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
  }));

  const productEntries: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: 'weekly',
  }));

  const blogEntries: MetadataRoute.Sitemap = (blogs || []).map((b) => ({
    url: `${SITE_URL}/blog/${b.slug}`,
    changeFrequency: 'monthly',
  }));

  const categoryEntries: MetadataRoute.Sitemap = (categories || []).map((c) => ({
    url: `${SITE_URL}/products?category=${c.slug}`,
    changeFrequency: 'weekly',
  }));

  return [...staticEntries, ...productEntries, ...blogEntries, ...categoryEntries];
}
