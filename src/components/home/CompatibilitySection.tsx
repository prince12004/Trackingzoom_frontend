'use client';

import { motion } from 'framer-motion';
import { Car, Bike, Truck, Bus, Ship, Container } from 'lucide-react';
import { RevealSection, SectionHeading } from './RevealSection';

const ITEMS = [
  { icon: Car, label: 'Cars' },
  { icon: Bike, label: 'Bikes & Scooters' },
  { icon: Truck, label: 'Trucks' },
  { icon: Bus, label: 'Buses' },
  { icon: Ship, label: 'Boats' },
  { icon: Container, label: 'Cargo & Assets' },
];

export function CompatibilitySection() {
  return (
    <RevealSection className="container-page py-12">
      <SectionHeading title="Compatible with Everything" subtitle="One tracking platform for every kind of vehicle and asset" />
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {ITEMS.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            whileHover={{ y: -3 }}
            className="group flex flex-col items-center gap-3 rounded-xl border border-gray-100 p-4 text-center transition-colors duration-300 hover:border-brand-200 hover:bg-brand-50/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-50 to-accent-50 text-brand-600 transition-transform duration-300 group-hover:scale-110">
              <item.icon className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium text-gray-600">{item.label}</span>
          </motion.div>
        ))}
      </div>
    </RevealSection>
  );
}
