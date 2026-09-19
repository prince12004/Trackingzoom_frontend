'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Wrench, Headset, Truck, Lock } from 'lucide-react';

const BADGES = [
  { icon: Lock, label: 'Secure Payments', desc: 'Powered by Razorpay' },
  { icon: Wrench, label: 'Free Installation*', desc: 'By certified technicians' },
  { icon: Headset, label: '24/7 Support', desc: 'Real people, real help' },
  { icon: Truck, label: 'Pan-India Delivery', desc: 'Doorstep dispatch' },
  { icon: ShieldCheck, label: 'Warranty Backed', desc: 'On every device' },
];

export function TrustBadges() {
  return (
    <section className="border-y border-gray-100 bg-white py-8">
      <div className="container-page">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {BADGES.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-xl p-2"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-50 to-accent-50 ring-1 ring-brand-100">
                <badge.icon className="h-5 w-5 text-brand-600" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-gray-800">{badge.label}</p>
                <p className="truncate text-[11px] text-gray-400">{badge.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
