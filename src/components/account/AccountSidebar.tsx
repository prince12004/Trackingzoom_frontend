'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  MapPin,
  UserRound,
  Heart,
  GitCompareArrows,
  Star,
  Bell,
  Gift,
  Satellite,
  CalendarClock,
  Wrench,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const NAV_GROUPS = [
  {
    label: 'Account',
    items: [
      { label: 'Dashboard', href: '/account', icon: LayoutDashboard, live: true },
      { label: 'My Profile', href: '/account/profile', icon: UserRound, live: true },
      { label: 'My Addresses', href: '/account/addresses', icon: MapPin, live: true },
    ],
  },
  {
    label: 'Shopping',
    items: [
      { label: 'My Orders', href: '/account/orders', icon: Package, live: true },
      { label: 'Wishlist', href: '/wishlist', icon: Heart, live: true },
      { label: 'Compare List', href: '/compare', icon: GitCompareArrows, live: true },
      { label: 'My Reviews', href: '/account/reviews', icon: Star, live: true },
    ],
  },
  {
    label: 'Engage',
    items: [
      { label: 'Notifications', href: '/account/notifications', icon: Bell, live: true },
      { label: 'Refer & Earn', href: '/refer-earn', icon: Gift, live: true },
    ],
  },
  {
    label: 'Devices',
    items: [
      { label: 'My Devices', href: '/account/devices', icon: Satellite, live: false },
      { label: 'Subscriptions', href: '/account/subscriptions', icon: CalendarClock, live: false },
      { label: 'Installations', href: '/account/installations', icon: Wrench, live: false },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export function AccountSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem = ALL_ITEMS.find((item) => item.href === pathname);

  return (
    <div className="w-full shrink-0 lg:w-64">
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-card">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 via-brand-600 to-accent-500 text-base font-bold text-white shadow-sm">
          {user?.name?.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.mobile}</p>
        </div>
      </div>

      {/* Mobile: compact collapsible toggle showing current section */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className="mb-2 flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-card lg:hidden"
      >
        <span className="flex items-center gap-2.5 text-sm font-semibold text-gray-800">
          {activeItem ? <activeItem.icon className="h-4 w-4 text-brand-600" /> : <LayoutDashboard className="h-4 w-4 text-brand-600" />}
          {activeItem?.label || 'Account Menu'}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', mobileOpen && 'rotate-180')} />
      </button>

      <nav
        className={cn(
          'space-y-4 rounded-xl border border-gray-100 bg-white p-3 shadow-card lg:block',
          mobileOpen ? 'block' : 'hidden'
        )}
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-2 text-[11px] font-bold uppercase tracking-wide text-gray-400">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-gradient-to-r from-brand-50 to-accent-50 text-brand-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <item.icon className={cn('h-4 w-4 shrink-0', active && 'text-brand-600')} />
                    <span className="flex-1">{item.label}</span>
                    {!item.live && (
                      <span className="rounded-full bg-accent-50 px-1.5 py-0.5 text-[9px] font-bold text-accent-600">SOON</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div className="border-t border-gray-100 pt-2">
          <button
            onClick={async () => {
              await logout();
              router.push('/');
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-danger hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </nav>
    </div>
  );
}
