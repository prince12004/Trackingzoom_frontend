'use client';

import { motion } from 'framer-motion';
import { MousePointerClick, Wrench, Smartphone, ShieldCheck } from 'lucide-react';
import { RevealSection, SectionHeading } from './RevealSection';

const STEPS = [
  { icon: MousePointerClick, title: 'Choose Your Tracker', desc: 'Pick the right GPS tracker for your car, bike, fleet or asset.' },
  { icon: Wrench, title: 'Get It Installed', desc: 'Self-install in minutes, or book a professional installation.' },
  { icon: Smartphone, title: 'Track in Real-Time', desc: 'Open the app or dashboard and see live location instantly.' },
  { icon: ShieldCheck, title: 'Stay Protected', desc: 'Get instant alerts, geofencing and 24/7 peace of mind.' },
];

export function HowItWorks() {
  return (
    <RevealSection className="container-page py-12">
      <SectionHeading title="How It Works" subtitle="From unboxing to live tracking in four simple steps" />
      <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-brand-200 via-accent-200 to-brand-200 lg:block" />
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.1 }}
            className="relative flex flex-col items-center text-center"
          >
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-card-hover ring-4 ring-white">
              <span className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                <step.icon className="h-7 w-7" />
              </span>
            </div>
            <span className="absolute -top-1 right-[calc(50%-40px)] flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-[11px] font-bold text-white ring-2 ring-white lg:right-auto lg:left-1/2 lg:translate-x-5">
              {i + 1}
            </span>
            <h3 className="mt-4 font-semibold text-gray-900">{step.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </RevealSection>
  );
}
