'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function CountUp({ value, prefix = '', decimals = 0 }: { value: number; prefix?: string; decimals?: number }) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 900, bounce: 0 });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsub = spring.on('change', (v) => {
      setDisplay(v.toLocaleString('en-IN', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }));
    });
    return unsub;
  }, [spring, decimals]);

  return (
    <span>
      {prefix}
      {display}
    </span>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  prefix,
  decimals,
  color = 'brand',
  index = 0,
  href,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  prefix?: string;
  decimals?: number;
  color?: 'brand' | 'accent' | 'success' | 'danger';
  index?: number;
  href?: string;
}) {
  const colorClasses: Record<string, string> = {
    brand: 'from-brand-500 to-brand-600',
    accent: 'from-accent-400 to-accent-600',
    success: 'from-emerald-400 to-emerald-600',
    danger: 'from-red-400 to-red-600',
  };

  const content = (
    <>
      <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md', colorClasses[color])}>
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-2xl font-extrabold text-gray-900">
          <CountUp value={value} prefix={prefix} decimals={decimals} />
        </p>
        <p className="text-xs font-medium text-gray-500">{label}</p>
      </div>
      {href && <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />}
    </>
  );

  const className = cn(
    'group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-card',
    href && 'cursor-pointer transition-shadow hover:shadow-card-hover hover:border-brand-200'
  );

  if (href) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.06 }}>
        <Link href={href} className={className}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.06 }} className={className}>
      {content}
    </motion.div>
  );
}
