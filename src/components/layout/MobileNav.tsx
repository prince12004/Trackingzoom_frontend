'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { X, User, LogOut, Gift, Smartphone, Navigation } from 'lucide-react';
import { Logo } from './Logo';
import { Category } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

const TRACKING_PLATFORM_URL = 'https://mvts1.millitrack.com/modern/';

export function MobileNav({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
}) {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  useBodyScrollLock(open);

  useEffect(() => setMounted(true), []);

  const content = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85%] flex-col overflow-y-auto bg-white shadow-xl lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <Logo />
              <button onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-gray-100 p-4">
              {user ? (
                <div className="flex items-center justify-between">
                  <Link href="/account" onClick={onClose} className="flex items-center gap-2 font-medium text-gray-800">
                    <User className="h-5 w-5" /> {user.name}
                  </Link>
                  <button onClick={() => logout()} className="text-gray-400 hover:text-danger" aria-label="Logout">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white"
                >
                  <User className="h-4 w-4" /> Login / Register
                </Link>
              )}
              <a
                href={TRACKING_PLATFORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 py-2.5 text-sm font-semibold text-white"
              >
                <Navigation className="h-4 w-4" /> Track Now
              </a>
            </div>

            <nav className="flex flex-1 flex-col gap-1 p-4">
              <p className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Shop by Category</p>
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/products?category=${cat.slug}`}
                  onClick={onClose}
                  className="rounded-lg px-2 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {cat.name}
                </Link>
              ))}

              <div className="my-2 h-px bg-gray-100" />

              {[
                ['All Products', '/products'],
                ['Compare', '/compare'],
                ['Blog', '/blogs'],
                ['About Us', '/about-us'],
                ['Contact Us', '/contact-us'],
              ].map(([label, href]) => (
                <Link key={href} href={href} onClick={onClose} className="rounded-lg px-2 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  {label}
                </Link>
              ))}

              <div className="my-2 h-px bg-gray-100" />

              <Link href="/refer-earn" onClick={onClose} className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Gift className="h-4 w-4" /> Refer &amp; Earn
              </Link>
              <Link href="/download-app" onClick={onClose} className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Smartphone className="h-4 w-4" /> Get the App
              </Link>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}
