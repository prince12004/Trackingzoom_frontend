import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, Clock, User } from 'lucide-react';
import { serverGet } from '@/lib/serverApi';
import { Blog } from '@/types';
import { formatDate } from '@/lib/utils';
import { ProductCard } from '@/components/product/ProductCard';

interface BlogDetailResponse {
  blog: Blog & { relatedProducts?: import('@/types').Product[] };
  related: Blog[];
}

async function getBlog(slug: string) {
  return serverGet<BlogDetailResponse>(`/blogs/${slug}`, 60);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBlog(slug);
  if (!data) return { title: 'Blog Not Found' };
  const { blog } = data;
  return {
    title: blog.title,
    description: blog.excerpt,
    openGraph: { title: blog.title, description: blog.excerpt, images: blog.featuredImage ? [blog.featuredImage] : undefined },
    alternates: { canonical: `/blog/${blog.slug}` },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getBlog(slug);
  if (!data) notFound();
  const { blog, related } = data;
  const category = typeof blog.category === 'object' ? blog.category : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    image: blog.featuredImage,
    datePublished: blog.publishedAt,
    author: { '@type': 'Person', name: blog.author },
  };

  return (
    <article className="container-page max-w-3xl py-8">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {category && (
        <Link href={`/blogs?category=${category._id}`} className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          {category.name}
        </Link>
      )}
      <h1 className="mt-2 text-3xl font-extrabold text-gray-900">{blog.title}</h1>
      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {blog.author}</span>
        {blog.publishedAt && (
          <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {formatDate(blog.publishedAt)}</span>
        )}
        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {blog.readingTimeMinutes} min read</span>
      </div>

      <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
        <Image src={blog.featuredImage} alt={blog.title} fill className="object-cover" priority />
      </div>

      <div
        className="prose prose-lg mt-8 max-w-none prose-headings:font-bold prose-a:text-brand-600"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: blog.content || '' }}
      />

      {blog.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {blog.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {blog.relatedProducts && blog.relatedProducts.length > 0 && (
        <div className="mt-10 border-t border-gray-100 pt-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Related Products</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {blog.relatedProducts.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-10 border-t border-gray-100 pt-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Related Articles</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {related.map((b) => (
              <Link key={b._id} href={`/blog/${b.slug}`} className="block overflow-hidden rounded-xl border border-gray-100">
                <div className="relative aspect-video w-full bg-gray-100">
                  <Image src={b.featuredImage} alt={b.title} fill className="object-cover" />
                </div>
                <p className="p-3 text-sm font-medium text-gray-800 line-clamp-2">{b.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
