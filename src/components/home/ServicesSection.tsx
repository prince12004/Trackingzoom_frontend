'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Radar } from 'lucide-react';
import { api, ApiEnvelope } from '@/lib/api';
import { Category } from '@/types';
import { RevealSection, SectionHeading } from './RevealSection';

export function ServicesSection() {
  const { data } = useQuery({
    queryKey: ['nav-categories'],
    queryFn: async () => (await api.get<ApiEnvelope<Category[]>>('/categories', { params: { parent: 'root' } })).data.data,
  });

  const services = (data || []).slice(0, 5);
  if (services.length === 0) return null;

  return (
    <RevealSection className="container-page py-12">
      <SectionHeading title="Our Services" subtitle="Reliable GPS tracking for vehicles, assets, and people" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {services.map((service, i) => (
          <motion.div
            key={service._id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            whileHover={{ y: -6 }}
            className="group"
          >
            <Link
              href={`/products?category=${service.slug}`}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card transition-shadow duration-300 group-hover:shadow-card-hover"
            >
              <div className="relative h-36 w-full overflow-hidden bg-gray-100">
                {service.image ? (
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-accent-50">
                    <Radar className="h-8 w-8 text-brand-400" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-sm font-bold text-gray-900">{service.name}</h3>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-gray-500">{service.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
                  Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </RevealSection>
  );
}
