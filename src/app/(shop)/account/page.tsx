'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle2, MapPin, Star, Bell, Satellite, CalendarClock, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api, ApiEnvelope } from '@/lib/api';

interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  deliveredOrders: number;
}

const CARDS = [
  { key: 'totalOrders', label: 'Total Orders', icon: Package, color: 'bg-sky-50 text-sky-600' },
  { key: 'activeOrders', label: 'Active Orders', icon: Truck, color: 'bg-amber-50 text-amber-600' },
  { key: 'deliveredOrders', label: 'Delivered', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
] as const;

const QUICK_LINKS = [
  { label: 'Addresses', href: '/account/addresses', icon: MapPin, desc: 'Manage delivery addresses' },
  { label: 'My Reviews', href: '/account/reviews', icon: Star, desc: 'Reviews you have submitted' },
  { label: 'Notifications', href: '/account/notifications', icon: Bell, desc: 'Order & account updates' },
];

export default function AccountPage() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['account-dashboard'],
    queryFn: async () => (await api.get<ApiEnvelope<DashboardStats>>('/users/me/dashboard')).data.data,
  });

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-6 text-white shadow-[0_18px_45px_-22px_rgba(2,32,56,0.8)] sm:p-8">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-amber-300/20" />
        <div className="absolute -right-6 -top-10 h-44 w-44 rounded-full border border-cyan-200/10" />
        <div className="relative max-w-2xl">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
            <Sparkles className="h-4 w-4" /> Member dashboard
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-300">Your TrackingZoom control room for orders, addresses and everything that keeps your drive moving.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Account secured</span>
            <span>{user?.email || user?.mobile}</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CARDS.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.7)]"
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-full ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.[card.key] ?? '—'}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Manage your account</h2>
          <span className="text-xs text-slate-400">Quick access</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="group rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.7)] transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <link.icon className="h-5 w-5 text-cyan-600" />
                <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-cyan-600" />
              </div>
              <p className="mt-5 font-semibold text-slate-800">{link.label}</p>
              <p className="mt-1 text-sm text-slate-500">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm text-slate-500">
        <div className="flex gap-2 text-cyan-600">
          <Satellite className="h-5 w-5 shrink-0" />
          <CalendarClock className="h-5 w-5 shrink-0" />
        </div>
        <p>Live device tracking, subscription renewals and installation bookings are launching soon — you&apos;ll see them here as devices are linked to your account.</p>
      </div>
    </div >
  );
}
