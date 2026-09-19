'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  PhoneCall,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { api, ApiEnvelope } from '@/lib/api';
import { StatCard } from '@/components/admin/StatCard';
import { formatCurrency } from '@/lib/utils';

interface DashboardSummary {
  revenue: number;
  orderCount: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  newCustomers: number;
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  callbackLeads: number;
  abandonedCarts: number;
  conversionRate: number;
  topProducts: { name: string; slug: string; unitsSold: number; revenue: number }[];
  revenueByDate: { _id: string; revenue: number; orders: number }[];
}

const RANGE_OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: 'This Month', value: 'this_month' },
];

export default function AdminDashboardPage() {
  const [range, setRange] = useState('30d');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard', range],
    queryFn: async () => (await api.get<ApiEnvelope<DashboardSummary>>('/admin/dashboard/summary', { params: { range } })).data.data,
  });

  const maxRevenue = Math.max(1, ...(data?.revenueByDate || []).map((d) => d.revenue));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of your store performance</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                range === opt.value ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Revenue" value={data?.revenue || 0} icon={IndianRupee} prefix="₹" color="brand" index={0} href="/admin/orders" />
        <StatCard label="Orders" value={data?.totalOrders || 0} icon={ShoppingBag} color="accent" index={1} href="/admin/orders" />
        <StatCard label="New Customers" value={data?.newCustomers || 0} icon={Users} color="success" index={2} href="/admin/customers" />
        <StatCard label="Pending Orders" value={data?.pendingOrders || 0} icon={Package} color="brand" index={3} href="/admin/orders?status=pending" />
        <StatCard label="Delivered" value={data?.deliveredOrders || 0} icon={TrendingUp} color="success" index={4} href="/admin/orders?status=delivered" />
        <StatCard label="Cancelled" value={data?.cancelledOrders || 0} icon={AlertTriangle} color="danger" index={5} href="/admin/orders?status=cancelled" />
        <StatCard
          label="Low / Out of Stock"
          value={(data?.lowStock || 0) + (data?.outOfStock || 0)}
          icon={AlertTriangle}
          color="accent"
          index={6}
          href="/admin/inventory"
        />
        <StatCard label="Callback Leads" value={data?.callbackLeads || 0} icon={PhoneCall} color="brand" index={7} href="/admin/leads" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card lg:col-span-2"
        >
          <h2 className="mb-4 font-semibold text-gray-900">Revenue Trend</h2>
          {!isLoading && (!data?.revenueByDate || data.revenueByDate.length === 0) ? (
            <p className="py-12 text-center text-sm text-gray-400">No orders in this period yet.</p>
          ) : (
            <div className="flex h-48 items-end gap-1.5">
              {(data?.revenueByDate || []).map((d, i) => (
                <div key={d._id} className="group relative flex flex-1 flex-col items-center justify-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(4, (d.revenue / maxRevenue) * 100)}%` }}
                    transition={{ duration: 0.5, delay: i * 0.02 }}
                    className="w-full rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400"
                  />
                  <div className="pointer-events-none absolute bottom-full mb-1 hidden rounded-md bg-gray-900 px-2 py-1 text-[10px] text-white group-hover:block">
                    {formatCurrency(d.revenue)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card"
        >
          <h2 className="mb-4 font-semibold text-gray-900">Top Products</h2>
          {!isLoading && (!data?.topProducts || data.topProducts.length === 0) ? (
            <p className="py-8 text-center text-sm text-gray-400">No sales yet.</p>
          ) : (
            <ul className="space-y-3">
              {(data?.topProducts || []).map((p, i) => (
                <li key={p.slug} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 truncate">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-700">
                      {i + 1}
                    </span>
                    <span className="truncate text-gray-700">{p.name}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-gray-900">{p.unitsSold} sold</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/orders" className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-700">
          View All Orders <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link href="/admin/products" className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-700">
          Manage Products <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link href="/admin/leads" className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-700">
          View Leads <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
