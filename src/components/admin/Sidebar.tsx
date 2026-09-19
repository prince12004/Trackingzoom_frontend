'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Megaphone,
  FileText,
  PhoneCall,
  Settings,
  Boxes,
  ChevronRight,
  HelpCircle,
  BookOpenText,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/context/AdminAuthContext';

const NAV_GROUPS: { label: string; items: { label: string; href: string; icon: React.ElementType; permission?: string }[] }[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }],
  },
  {
    label: 'Catalog',
    items: [
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Categories', href: '/admin/categories', icon: FolderTree },
      { label: 'Inventory', href: '/admin/inventory', icon: Boxes },
    ],
  },
  {
    label: 'Sales',
    items: [
      { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
      { label: 'Customers', href: '/admin/customers', icon: Users },
    ],
  },
  {
    label: 'Marketing & Content',
    items: [
      { label: 'Banners', href: '/admin/banners', icon: Megaphone },
      { label: 'Homepage', href: '/admin/homepage', icon: FileText },
      { label: 'Blogs', href: '/admin/blogs', icon: FileText },
      { label: 'Pages', href: '/admin/pages', icon: BookOpenText },
      { label: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
    ],
  },
  {
    label: 'Leads',
    items: [{ label: 'Leads & Callbacks', href: '/admin/leads', icon: PhoneCall }],
  },
  {
    label: 'System',
    items: [
      { label: 'Team & Access', href: '/admin/team', icon: ShieldCheck, permission: 'roles.manage' },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export function Sidebar({ mobile, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { hasPermission } = useAdminAuth();

  return (
    <div className={cn('flex h-full flex-col bg-brand-950 text-white', mobile ? 'w-72' : 'w-64')}>
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-white">
          <Image src="/assets/logo/icon-square.png" alt="TrackingZoom" fill className="object-contain p-0.5" />
        </div>
        <span className="text-sm font-bold">TrackingZoom Admin</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-white/40">{group.label}</p>
            {group.items
              .filter((item) => !item.permission || hasPermission(item.permission))
              .map((item) => {
              const active = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md' : 'text-white/70 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight className="h-3.5 w-3.5" />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
