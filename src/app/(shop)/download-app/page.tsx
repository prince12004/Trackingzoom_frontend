'use client';

import { useQuery } from '@tanstack/react-query';
import { Apple, PlayCircle, Smartphone } from 'lucide-react';
import { api, ApiEnvelope } from '@/lib/api';

interface PublicSettings {
  apps: { androidUrl?: string; iosUrl?: string };
}

export default function DownloadAppPage() {
  const { data } = useQuery({
    queryKey: ['settings-public'],
    queryFn: async () => (await api.get<ApiEnvelope<PublicSettings>>('/settings/public')).data.data,
  });

  return (
    <div className="container-page flex flex-col items-center py-16 text-center">
      <Smartphone className="h-14 w-14 text-brand-500" />
      <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Get the TrackingZoom GPS App</h1>
      <p className="mt-2 max-w-md text-gray-500">
        Track your vehicle live, manage subscriptions and get instant alerts — right from your phone.
      </p>
      <div className="mt-8 flex gap-4">
        {data?.apps?.androidUrl ? (
          <a
            href={data.apps.androidUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            <PlayCircle className="h-5 w-5" /> Google Play
          </a>
        ) : (
          <span className="flex items-center gap-2 rounded-xl bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-400">
            <PlayCircle className="h-5 w-5" /> Coming Soon
          </span>
        )}
        {data?.apps?.iosUrl ? (
          <a
            href={data.apps.iosUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            <Apple className="h-5 w-5" /> App Store
          </a>
        ) : (
          <span className="flex items-center gap-2 rounded-xl bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-400">
            <Apple className="h-5 w-5" /> Coming Soon
          </span>
        )}
      </div>
    </div>
  );
}
