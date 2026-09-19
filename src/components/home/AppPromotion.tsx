'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Apple, PlayCircle, Smartphone } from 'lucide-react';
import { api, ApiEnvelope } from '@/lib/api';

interface PublicSettings {
  apps: { androidUrl?: string; iosUrl?: string };
}

export function AppPromotion() {
  const { data } = useQuery({
    queryKey: ['settings-public'],
    queryFn: async () => (await api.get<ApiEnvelope<PublicSettings>>('/settings/public')).data.data,
  });

  if (!data?.apps?.androidUrl && !data?.apps?.iosUrl) return null;

  return (
    <section className="bg-gradient-to-br from-accent-500 to-accent-600 py-12 text-white">
      <div className="container-page flex flex-col items-center justify-between gap-8 lg:flex-row">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
            <Smartphone className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold sm:text-3xl">Track On the Go</h2>
          <p className="mt-2 max-w-md text-accent-50">
            Download the TrackingZoom GPS app for live location, trip history and instant alerts, right from your
            phone.
          </p>
          <div className="mt-6 flex gap-3">
            {data.apps.androidUrl && (
              <a
                href={data.apps.androidUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold hover:bg-white/25"
              >
                <PlayCircle className="h-5 w-5" /> Google Play
              </a>
            )}
            {data.apps.iosUrl && (
              <a
                href={data.apps.iosUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold hover:bg-white/25"
              >
                <Apple className="h-5 w-5" /> App Store
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
