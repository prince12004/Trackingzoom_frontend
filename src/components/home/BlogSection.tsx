'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, ArrowRight } from 'lucide-react';
import { api, ApiEnvelope } from '@/lib/api';
import { Blog } from '@/types';
import { formatDate } from '@/lib/utils';
import { RevealSection, SectionHeading } from './RevealSection';

export function BlogSection() {
  const { data } = useQuery({
    queryKey: ['home-blogs'],
    queryFn: async () => (await api.get<ApiEnvelope<Blog[]>>('/blogs', { params: { limit: 3 } })).data.data,
  });

  if (!data || data.length === 0) return null;

  return (
    <RevealSection className="bg-gray-50 py-12">
      <div className="container-page">
        <SectionHeading title="From Our Blog" subtitle="Tips, guides and news on vehicle safety & tracking" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {data.map((blog, i) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <Link
                href={`/blog/${blog.slug}`}
                className="group block overflow-hidden rounded-xl bg-white shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="relative aspect-video w-full bg-gray-100">
                  <Image src={blog.featuredImage} alt={blog.title} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 font-semibold text-gray-800">{blog.title}</h3>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
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
      </div>
    </RevealSection>
  );
}
