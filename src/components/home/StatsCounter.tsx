'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, animate } from 'framer-motion';
import { Car, Users, Route, ShieldCheck } from 'lucide-react';

// Placeholder figures — replace with real numbers from Admin > Settings before launch.
const STATS = [
  { icon: Car, value: 12000, suffix: '+', label: 'Vehicles Tracked' },
  { icon: Users, value: 4500, suffix: '+', label: 'Happy Customers' },
  { icon: Route, value: 25, suffix: 'M+', label: 'KM Tracked Daily' },
  { icon: ShieldCheck, value: 99.5, suffix: '%', label: 'Uptime Reliability', decimals: 1 },
];

function Counter({ value, suffix, decimals = 0 }: { value: number; suffix: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v.toLocaleString('en-IN', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })),
    });
    return () => controls.stop();
  }, [inView, value, decimals]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export function StatsCounter() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 py-12 text-white">
      <div className="container-page">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                <stat.icon className="h-6 w-6 text-accent-300" />
              </div>
              <p className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                <Counter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
              </p>
              <p className="mt-1 text-xs font-medium text-brand-100 sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
