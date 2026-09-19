'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { extractApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

export default function AdminLoginPage() {
  const { admin, loading, login, verifyTwoFactor } = useAdminAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [adminId, setAdminId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (admin) router.replace('/admin');
  }, [admin, router]);

  const handleLogin = async () => {
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.requiresTwoFactor) {
        setAdminId(result.adminId!);
        setStep('otp');
      } else {
        router.push('/admin');
      }
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async () => {
    setSubmitting(true);
    try {
      await verifyTwoFactor(adminId, code);
      router.push('/admin');
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h1 className="mt-3 text-lg font-bold text-gray-900">TrackingZoom Admin</h1>
          <p className="text-sm text-gray-500">Sign in to manage your store</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'credentials' ? (
            <motion.form
              key="creds"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="h-11 w-full bg-transparent text-sm outline-none"
                />
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3">
                <Lock className="h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="h-11 w-full bg-transparent text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="rounded p-1 text-gray-400 hover:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button type="submit" className="w-full" size="lg" loading={submitting}>
                Sign In
              </Button>
            </motion.form>
          ) : (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify();
              }}
              className="space-y-3"
            >
              <p className="text-center text-sm text-gray-500">Enter the 6-digit code from your authenticator app</p>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="_ _ _ _ _ _"
                className="h-12 w-full rounded-lg border border-gray-200 text-center text-2xl tracking-[0.5em] outline-none focus:border-brand-400"
              />
              <Button type="submit" className="w-full" size="lg" loading={submitting}>
                Verify &amp; Sign In
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
