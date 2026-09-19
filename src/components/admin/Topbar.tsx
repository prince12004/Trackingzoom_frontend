'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, User, Bell } from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { AnimatePresence, motion } from 'framer-motion';

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { admin, logout } = useAdminAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const roleName = typeof admin?.role === 'object' ? admin.role.name : '';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-gray-100 bg-white/90 px-4 backdrop-blur-md sm:px-6">
      <button onClick={onMenuClick} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1" />
      <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="Notifications">
        <Bell className="h-5 w-5" />
      </button>
      <div className="relative">
        <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-xs font-bold text-white">
            {admin?.name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium text-gray-800">{admin?.name}</span>
            <span className="block text-xs capitalize text-gray-400">{roleName?.replace(/_/g, ' ')}</span>
          </span>
        </button>
        <AnimatePresence>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 z-20 w-44 rounded-xl border border-gray-100 bg-white p-1.5 shadow-card-hover"
              >
                <button
                  onClick={async () => {
                    await logout();
                    router.push('/admin/login');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
