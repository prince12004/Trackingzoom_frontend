'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowLeft, MapPin, Bell, Headset } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { extractApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/layout/Logo';

const BRAND_POINTS = [
  { icon: MapPin, text: 'Live location for every vehicle' },
  { icon: Bell, text: 'Instant geofence & speed alerts' },
  { icon: Headset, text: '24/7 dedicated support' },
];

type Step = 'mobile' | 'otp' | 'name';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';
  const { requestOtp, verifyLogin, verifyRegister, user } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState<Step>('mobile');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const autoVerifiedRef = useRef(false);
  // Synchronous lock, separate from `loading` state — a state-based guard can still race
  // if handleVerify gets invoked twice in quick succession before React commits the render
  // that would make `loading` true. A ref updates immediately with no such window.
  const submittingRef = useRef(false);

  useEffect(() => {
    if (user) router.replace(redirect);
  }, [user, redirect, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSendOtp = async (purpose: 'login' | 'register') => {
    if (!/^[6-9]\d{9}$/.test(mobile)) return showToast('Enter a valid 10-digit mobile number', 'error');
    setLoading(true);
    try {
      const otp = await requestOtp(mobile, purpose);
      setMode(purpose);
      setStep('otp');
      setCooldown(60);
      autoVerifiedRef.current = false;
      submittingRef.current = false;
      setDevOtp(otp || null);
      setCode(otp || '');
      showToast('OTP sent to your mobile number', 'success');
    } catch (err) {
      const message = extractApiError(err);
      if (message.includes('already exists')) {
        setMode('login');
        const otp = await requestOtp(mobile, 'login');
        setStep('otp');
        setCooldown(60);
        autoVerifiedRef.current = false;
        submittingRef.current = false;
        setDevOtp(otp || null);
        setCode(otp || '');
      } else if (message.includes('No account found')) {
        setStep('name');
      } else {
        showToast(message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (codeOverride?: string) => {
    const codeToSubmit = codeOverride ?? code;
    if (codeToSubmit.length !== 6 || submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    try {
      if (mode === 'register') {
        await verifyRegister(mobile, codeToSubmit, name);
      } else {
        await verifyLogin(mobile, codeToSubmit);
      }
      showToast('Welcome to TrackingZoom GPS!', 'success');
    } catch (err) {
      showToast(extractApiError(err), 'error');
      submittingRef.current = false;
      setLoading(false);
    }
  };

  // Auto-verify once the OTP is auto-filled (no real SMS provider configured yet) — fires
  // exactly once per OTP send; won't retry on its own if that attempt fails.
  useEffect(() => {
    if (step === 'otp' && code.length === 6 && !loading && !autoVerifiedRef.current) {
      autoVerifiedRef.current = true;
      handleVerify(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, code, loading]);

  return (
    <div className="flex min-h-[calc(100vh-220px)] items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-2xl border border-gray-100 shadow-card-hover lg:min-h-[620px] lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 p-12 text-white lg:flex">
          <Image
            src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=1200&q=80"
            alt=""
            fill
            className="object-cover opacity-[0.18] mix-blend-luminosity"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-950/95 via-brand-800/90 to-brand-600/85" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
              backgroundSize: '26px 26px',
            }}
          />
          <motion.div
            animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-accent-500/25 blur-3xl"
          />
          <div className="relative">
            <div className="inline-flex rounded-xl bg-white/95 px-3 py-2">
              <Logo />
            </div>
            <h2 className="mt-10 text-3xl font-bold leading-tight">
              Never Lose Sight of <span className="text-accent-300">What Matters</span>
            </h2>
            <p className="mt-4 max-w-sm text-base text-brand-100">
              Sign in to manage your trackers, orders and subscriptions from one dashboard.
            </p>
          </div>
          <ul className="relative space-y-4">
            {BRAND_POINTS.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-sm text-brand-50">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                  <p.icon className="h-5 w-5 text-accent-300" />
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col justify-center bg-white p-8 sm:p-12"
        >
          <div className="mb-6 flex justify-center lg:hidden">
            <Logo />
          </div>

          <AnimatePresence mode="wait">
          {step === 'mobile' && (
            <motion.div key="mobile" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
              <h1 className="mb-1 bg-gradient-to-r from-brand-700 to-accent-600 bg-clip-text text-center text-xl font-bold text-transparent">
                Login or Register
              </h1>
              <p className="mb-5 text-center text-sm text-gray-500">Enter your mobile number to continue</p>
              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                className="h-12 w-full rounded-lg border border-gray-200 px-4 text-center text-lg tracking-wide outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
              <Button className="mt-4 w-full" size="lg" loading={loading} onClick={() => handleSendOtp('login')}>
                Continue with OTP
              </Button>
              <p className="mt-5 border-t border-gray-100 pt-4 text-center text-xs text-gray-400">
                By continuing, you agree to our{' '}
                <Link href="/terms-and-conditions" className="font-medium text-brand-600 hover:underline">
                  Terms
                </Link>{' '}
                &amp;{' '}
                <Link href="/privacy-policy" className="font-medium text-brand-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </motion.div>
          )}

          {step === 'name' && (
            <motion.div key="name" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
              <button onClick={() => setStep('mobile')} className="mb-4 flex items-center gap-1 text-sm text-gray-500">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <h1 className="mb-1 bg-gradient-to-r from-brand-700 to-accent-600 bg-clip-text text-center text-xl font-bold text-transparent">
                Create Your Account
              </h1>
              <p className="mb-5 text-center text-sm text-gray-500">We didn&apos;t find an account for {mobile}</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="h-12 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
              <Button className="mt-4 w-full" size="lg" loading={loading} disabled={name.trim().length < 2} onClick={() => handleSendOtp('register')}>
                Send OTP
              </Button>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div key="otp" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
              <button onClick={() => setStep('mobile')} className="mb-4 flex items-center gap-1 text-sm text-gray-500">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="mb-4 flex justify-center">
                <ShieldCheck className="h-10 w-10 text-brand-500" />
              </div>
              <h1 className="mb-1 bg-gradient-to-r from-brand-700 to-accent-600 bg-clip-text text-center text-xl font-bold text-transparent">Verify OTP</h1>
              <p className="mb-3 text-center text-sm text-gray-500">Enter the 6-digit code sent to {mobile}</p>
              {devOtp && (
                <p className="mb-4 text-center text-sm font-semibold text-brand-700">
                  Your OTP: <span className="tracking-widest">{devOtp}</span> — verifying automatically&hellip;
                </p>
              )}
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="_ _ _ _ _ _"
                className="h-12 w-full rounded-lg border border-gray-200 px-4 text-center text-2xl tracking-[0.5em] outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
              <Button className="mt-4 w-full" size="lg" loading={loading} onClick={() => handleVerify()}>
                Verify &amp; Continue
              </Button>
              <button
                disabled={cooldown > 0}
                onClick={() => handleSendOtp(mode)}
                className="mt-3 w-full text-center text-xs font-medium text-brand-600 disabled:text-gray-400"
              >
                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
              </button>
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
