'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { User, LayoutDashboard, Package, UserRound, Heart, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const MENU_ITEMS = [
  { label: 'Dashboard', href: '/account', icon: LayoutDashboard },
  { label: 'My Orders', href: '/account/orders', icon: Package },
  { label: 'My Profile', href: '/account/profile', icon: UserRound },
  { label: 'Wishlist', href: '/wishlist', icon: Heart },
];

export function AccountMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  if (!user) {
    return (
      <Link
        href="/login"
        className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-brand-50 hover:text-brand-700 sm:flex"
      >
        <User className="h-4 w-4" /> Login
      </Link>
    );
  }

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-brand-50 hover:text-brand-700"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <User className="h-4 w-4" />
        {user.name?.split(' ')[0] || 'Account'}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white p-1.5 shadow-card-hover"
          >
            <div className="mb-1 border-b border-gray-100 px-3 py-2">
              <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.mobile}</p>
            </div>
            {MENU_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700"
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            ))}
            <div className="mt-1 border-t border-gray-100 pt-1">
              <button
                onClick={async () => {
                  setOpen(false);
                  await logout();
                  router.push('/');
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-danger hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
