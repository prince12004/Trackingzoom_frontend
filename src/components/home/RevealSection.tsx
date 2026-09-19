'use client';

import { motion } from 'framer-motion';

export function RevealSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4, delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8 text-center">
      <h2 className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl md:text-4xl">
        {title}
      </h2>
      <div className="mx-auto mt-3 flex h-1.5 w-16 overflow-hidden rounded-full">
        <span className="w-1/2 bg-brand-500" />
        <span className="w-1/2 bg-accent-500" />
      </div>
      {subtitle && <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500 sm:text-base">{subtitle}</p>}
    </div>
  );
}
