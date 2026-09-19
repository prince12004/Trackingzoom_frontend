'use client';

import { Phone, Gift, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api, ApiEnvelope } from '@/lib/api';

interface PublicSettings {
  general: { contactNumber?: string };
}

export function TopStrip() {
  const { data } = useQuery({
    queryKey: ['settings-public'],
    queryFn: async () => (await api.get<ApiEnvelope<PublicSettings>>('/settings/public')).data.data,
    staleTime: 5 * 60 * 1000,
  });

  const phone = data?.general?.contactNumber;

  return (
    <div className="hidden bg-brand-950 text-white sm:block">
      <div className="container-page flex h-9 items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-1.5 hover:text-brand-200">
              <Phone className="h-3.5 w-3.5" /> {phone}
            </a>
          )}
          <span className="flex items-center gap-1.5 text-brand-100">Free shipping over ₹999</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/refer-earn" className="flex items-center gap-1.5 hover:text-brand-200">
            <Gift className="h-3.5 w-3.5" /> Refer &amp; Earn
          </Link>
          <Link href="/download-app" className="flex items-center gap-1.5 hover:text-brand-200">
            <Smartphone className="h-3.5 w-3.5" /> Get the App
          </Link>
        </div>
      </div>
    </div>
  );
}
