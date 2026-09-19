'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { PhoneCall, ShieldCheck, MapPin, Navigation, Wifi } from 'lucide-react';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';
import { Banner } from '@/types';
import { Button } from '../ui/Button';
import { useToast } from '@/context/ToastContext';

const TRUST_POINTS = ['Real-time live location', '24/7 customer support', 'Free professional installation*'];

export function Hero() {
  const { data: banners } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => (await api.get<ApiEnvelope<Banner[]>>('/banners')).data.data,
  });

  const [index, setIndex] = useState(0);
  const [mobile, setMobile] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (!banners || banners.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(id);
  }, [banners]);

  const leadMutation = useMutation({
    mutationFn: async () =>
      api.post('/leads', { name: 'Website Visitor', mobile, leadType: 'expert', sourcePage: '/', message: 'Hero callback request' }),
    onSuccess: () => {
      showToast('Thanks! Our expert will call you shortly.', 'success');
      setMobile('');
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const banner = banners && banners.length > 0 ? banners[index] : null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 mains_brand text-white">
      {/* Decorative background layer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=1600&q=80"
          alt=""
          fill
          priority
          className="object-cover opacity-[0.10] mix-blend-luminosity"
        />
        <Image
          src="/assets/logo/pinlocation.png"
          alt=""
          fill
          className="object-cover opacity-[0.8] mix-blend-screen"
        />
        <Image
          src="/assets/logo/logo.png"
          alt=""
          width={360}
          height={68}
          className="absolute right-6 top-6 h-auto w-56 opacity-[0.14] sm:right-10 sm:top-10 sm:w-72"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/85 via-brand-800/75 to-brand-600/60" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-accent-500/30 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 25, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-brand-400/25 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-accent-400/20 blur-3xl"
        />
      </div>

      <div className="container-page relative grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:py-24">
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-accent-200 backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5" /> Trusted by vehicle owners across India
          </span>
          <h1 className="mt-5 mainh text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
            {banner?.title || (
              <>
                Real-Time GPS Tracking
                <span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent"> for Every Vehicle</span>
              </>
            )}
          </h1>
          <p className="mt-5 max-w-lg text-base text-white sm:text-lg">
            {banner?.subtitle ||
              'Track your car, bike, truck or fleet live — with instant alerts, geofencing and round-the-clock support.'}
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-1.5 text-sm text-white">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-500/90 text-[10px] font-bold text-white">
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex w-full max-w-sm items-center gap-2 rounded-xl bg-white p-1.5 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.35)] sm:w-auto">
              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter mobile number"
                className="h-10 flex-1 rounded-lg px-3 text-sm text-gray-800 outline-none"
              />
              <Button
                size="sm"
                variant="secondary"
                disabled={!/^[6-9]\d{9}$/.test(mobile)}
                loading={leadMutation.isPending}
                onClick={() => leadMutation.mutate()}
                className="shrink-0"
              >
                <PhoneCall className="h-4 w-4" /> Talk to Expert
              </Button>
            </div>
            {banner?.ctaUrl ? (
              <Link href={banner.ctaUrl}>
                <Button variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white">
                  {banner.ctaText || 'Shop Now'}
                </Button>
              </Link>
            ) : (
              <Link href="/products">
                <Button variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white">
                  Browse Trackers
                </Button>
              </Link>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative aspect-[4/3] w-full"
        >
          <div className="absolute inset-0 overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-sm">
            <AnimatePresence mode="wait">
              {banner?.desktopImage ? (
                <motion.div
                  key={banner._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Image src={banner.desktopImage} alt={banner.title} fill className="object-cover" priority />
                </motion.div>
              ) : (
                <HeroTrackingIllustration />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {banners && banners.length > 1 && (
        <div className="relative z-10 mb-6 flex justify-center gap-1.5 lg:absolute lg:bottom-8 lg:left-1/2 lg:mb-0 lg:-translate-x-1/2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function HeroTrackingIllustration() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* real live-tracking map visual, full-bleed */}
      <Image
        src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=1200&q=80"
        alt="Live GPS tracking map"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-brand-900/10 to-transparent" />

      <motion.div
        animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
        className="absolute h-16 w-16 rounded-full bg-accent-400"
      />
      <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-600 shadow-lg shadow-accent-900/40">
        <MapPin className="h-7 w-7 text-white" fill="white" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="absolute left-[15%] top-[18%] flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-gray-800 shadow-lg"
      >
        <span className="h-2 w-2 rounded-full bg-success" />
        Vehicle Online
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.4 }}
        className="absolute bottom-[16%] right-[12%] flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-gray-800 shadow-lg"
      >
        <Navigation className="h-3.5 w-3.5 text-brand-600" />
        42 km/h &middot; NH-48
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.4 }}
        className="absolute right-[18%] top-[28%] flex items-center gap-1.5 rounded-full bg-brand-950/80 px-2.5 py-1 text-[10px] font-semibold text-accent-200"
      >
        <Wifi className="h-3 w-3" /> Live
      </motion.div>
    </div>
  );
}
