'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Facebook, Instagram, Youtube, Linkedin, Phone, Mail, MapPin } from 'lucide-react';
import { Logo } from './Logo';
import { api, ApiEnvelope } from '@/lib/api';

interface PublicSettings {
  general: { contactNumber?: string; email?: string; address?: string };
  social: { facebook?: string; instagram?: string; youtube?: string; linkedin?: string };
  apps: { androidUrl?: string; iosUrl?: string };
}

const FOOTER_LINKS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about-us' },
      { label: 'Contact Us', href: '/contact-us' },
      { label: 'Blog', href: '/blogs' },
      { label: 'Become a Dealer', href: '/dealer' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', href: '/contact-us' },
      { label: 'FAQs', href: '/faqs' },
      { label: 'Warranty Policy', href: '/warranty-policy' },
      { label: 'Shipping Policy', href: '/shipping-policy' },
      { label: 'Cancellation Policy', href: '/cancellation-policy' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms & Conditions', href: '/terms-and-conditions' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Refund Policy', href: '/refund-policy' },
      { label: 'Data Protection Policy', href: '/data-protection-policy' },
    ],
  },
];

export function Footer() {
  const { data } = useQuery({
    queryKey: ['settings-public'],
    queryFn: async () => (await api.get<ApiEnvelope<PublicSettings>>('/settings/public')).data.data,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <footer className="relative mt-16 overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-950 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl" />

      <div className="container-page relative grid grid-cols-2 gap-8 py-14 sm:grid-cols-3 lg:grid-cols-5">
        <div className="col-span-2 space-y-4 lg:col-span-2">
          <div className="inline-flex rounded-xl bg-white/95 px-3 py-2">
            <Logo />
          </div>
          <p className="max-w-xs text-sm text-brand-100">
            Trusted GPS tracking and vehicle security solutions with real-time monitoring, professional installation
            and dedicated customer support.
          </p>
          <div className="space-y-1.5 text-sm text-brand-100">
            {data?.general?.contactNumber && (
              <a href={`tel:${data.general.contactNumber}`} className="flex items-center gap-2 hover:text-accent-300">
                <Phone className="h-4 w-4" /> {data.general.contactNumber}
              </a>
            )}
            {data?.general?.email && (
              <a href={`mailto:${data.general.email}`} className="flex items-center gap-2 hover:text-accent-300">
                <Mail className="h-4 w-4" /> {data.general.email}
              </a>
            )}
            {data?.general?.address && (
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {data.general.address}
              </p>
            )}
          </div>
          <div className="flex gap-3 pt-1">
            {data?.social?.facebook && (
              <a
                href={data.social.facebook}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-brand-100 transition-colors hover:bg-accent-500 hover:text-white"
              >
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {data?.social?.instagram && (
              <a
                href={data.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-brand-100 transition-colors hover:bg-accent-500 hover:text-white"
              >
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {data?.social?.youtube && (
              <a
                href={data.social.youtube}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-brand-100 transition-colors hover:bg-accent-500 hover:text-white"
              >
                <Youtube className="h-4 w-4" />
              </a>
            )}
            {data?.social?.linkedin && (
              <a
                href={data.social.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-brand-100 transition-colors hover:bg-accent-500 hover:text-white"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {FOOTER_LINKS.map((group) => (
          <div key={group.title}>
            <h4 className="mb-3 bg-gradient-to-r from-white to-brand-200 bg-clip-text text-sm font-bold text-transparent">{group.title}</h4>
            <ul className="space-y-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-brand-100/80 transition-colors hover:text-accent-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="relative border-t border-white/10 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        <div className="container-page flex flex-col items-center justify-between gap-2 text-center text-xs text-brand-200 sm:flex-row sm:text-left">
          <p>&copy; {new Date().getFullYear()} TrackingZoom GPS. All rights reserved.</p>
          <p>Secure payments powered by Razorpay &middot; UPI, Cards, Netbanking &amp; COD accepted</p>
        </div>
      </div>
    </footer>
  );
}
