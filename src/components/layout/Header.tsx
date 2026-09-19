'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Menu, ShoppingCart, ChevronDown, Search, X, Navigation } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { TopStrip } from './TopStrip';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { MobileNav } from './MobileNav';
import { AccountMenu } from './AccountMenu';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { api, ApiEnvelope } from '@/lib/api';
import { Category } from '@/types';
import { cn } from '@/lib/utils';

const TRACKING_PLATFORM_URL = 'https://mvts1.millitrack.com/modern/';

const NAV_LINKS = [
  { label: 'All Products', href: '/products' },
  { label: 'Blog', href: '/blogs' },
  { label: 'Compare', href: '/compare' },
  { label: 'Contact', href: '/contact-us' },
];

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group relative rounded-lg px-2.5 py-1.5 text-sm font-semibold text-gray-700 hover:text-brand-700">
      {children}
      <span className="absolute inset-x-2.5 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-transform duration-200 group-hover:scale-x-100" />
    </Link>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cart, openDrawer } = useCart();
  const { user } = useAuth();

  const { data: categories } = useQuery({
    queryKey: ['nav-categories'],
    queryFn: async () => (await api.get<ApiEnvelope<Category[]>>('/categories', { params: { parent: 'root' } })).data.data,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const itemCount = cart?.itemCount || 0;

  return (
    <header
      className={cn(
        'sticky top-0 z-40 bg-white/90 backdrop-blur-md transition-shadow duration-300',
        scrolled ? 'shadow-[0_2px_16px_-4px_rgba(15,23,42,0.12)]' : 'shadow-none'
      )}
    >
      <TopStrip />

      <div className="container-page flex h-[70px] items-center gap-3 transition-all duration-300 sm:gap-6">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <Logo />

        <div className="hidden flex-1 lg:block lg:max-w-xl">
          <SearchBar />
        </div>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          <div className="group relative">
            <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:text-brand-700">
              Categories
              <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
            </button>
            <div className="invisible absolute left-0 top-full z-50 w-64 translate-y-1 rounded-xl border border-gray-100 bg-white p-2 opacity-0 shadow-card-hover transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              {(categories || []).map((cat) => (
                <Link
                  key={cat._id}
                  href={`/products?category=${cat.slug}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-brand-400 to-accent-500" />
                  {cat.name}
                </Link>
              ))}
              {(!categories || categories.length === 0) && (
                <p className="px-3 py-2 text-sm text-gray-400">No categories yet</p>
              )}
            </div>
          </div>
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <a
            href={TRACKING_PLATFORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mr-1 hidden items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110 sm:flex"
          >
            <Navigation className="h-4 w-4" /> Track Now
          </a>

          <AccountMenu />

          <button
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="rounded-lg p-2.5 text-gray-700 hover:bg-brand-50 hover:text-brand-700 lg:hidden"
            aria-label={mobileSearchOpen ? 'Close search' : 'Open search'}
          >
            {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>

          <button onClick={openDrawer} className="relative rounded-lg p-2.5 text-gray-700 hover:bg-brand-50 hover:text-brand-700" aria-label="Open cart">
            <ShoppingCart className="h-5 w-5" />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-600 px-1 text-[10px] font-bold text-white shadow-sm"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-100 lg:hidden"
          >
            <div className="px-4 py-2">
              <SearchBar autoFocus />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} categories={categories || []} />
    </header>
  );
}
