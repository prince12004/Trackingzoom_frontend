'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Headset, Truck, Wrench } from 'lucide-react';
import { RevealSection, SectionHeading } from './RevealSection';

const ITEMS = [
  { icon: ShieldCheck, title: 'Reliable Tracking', desc: 'Real-time GPS accuracy with instant alerts, wherever you are.', gradient: 'from-brand-400 to-brand-600' },
  { icon: Wrench, title: 'Professional Installation', desc: 'Certified technicians for hassle-free device fitting.', gradient: 'from-accent-400 to-accent-600' },
  { icon: Headset, title: '24/7 Support', desc: 'Round-the-clock customer support whenever you need us.', gradient: 'from-brand-400 to-brand-600' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Quick dispatch and doorstep delivery across India.', gradient: 'from-accent-400 to-accent-600' },
];

export function WhyChooseUs() {
  return (
    <RevealSection className="relative overflow-hidden bg-gray-50 py-14">
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-accent-100/60 blur-3xl" />
      <div className="container-page relative">
        <SectionHeading title="Why Choose TrackingZoom GPS" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-card transition-shadow duration-300 hover:shadow-card-hover"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
