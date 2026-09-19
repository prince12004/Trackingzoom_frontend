'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, Search, ArrowRight } from 'lucide-react';
import { api, ApiEnvelope } from '@/lib/api';
import { Blog, BlogCategory } from '@/types';
import { formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

function BlogsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const category = searchParams.get('category') || undefined;

  const { data: categories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => (await api.get<ApiEnvelope<BlogCategory[]>>('/blog-categories')).data.data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['blogs', search, category],
    queryFn: async () => (await api.get<ApiEnvelope<Blog[]>>('/blogs', { params: { search: search || undefined, category, limit: 12 } })).data.data,
  });

  return (
    <div className="container-page py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Blog</h1>
        <p className="mt-2 text-gray-500">Tips, guides and news on vehicle safety &amp; GPS tracking</p>
      </div>

      <div className="mx-auto mb-6 flex max-w-lg items-center gap-2 rounded-lg border border-gray-200 px-3">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles..."
          className="h-11 w-full bg-transparent text-sm outline-none"
        />
      </div>

      {categories && categories.length > 0 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => router.push('/blogs')}
            className={cn('rounded-full px-3 py-1.5 text-xs font-medium', !category ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => router.push(`/blogs?category=${cat._id}`)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium',
                category === cat._id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState title="No blogs available" description="Check back soon for new articles." />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((blog, i) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Link href={`/blog/${blog.slug}`} className="group block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card">
                <div className="relative aspect-video w-full bg-gray-100">
                  <Image src={blog.featuredImage} alt={blog.title} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <h2 className="line-clamp-2 font-semibold text-gray-800">{blog.title}</h2>
                  {blog.excerpt && <p className="mt-1 line-clamp-2 text-sm text-gray-500">{blog.excerpt}</p>}
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                    {blog.publishedAt && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" /> {formatDate(blog.publishedAt)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {blog.readingTimeMinutes} min read
                    </span>
                  </div>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
                    Read More <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BlogsPage() {
  return (
    <Suspense fallback={null}>
      <BlogsPageContent />
    </Suspense>
  );
}
