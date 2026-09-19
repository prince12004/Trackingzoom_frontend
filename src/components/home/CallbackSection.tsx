'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PhoneCall } from 'lucide-react';
import { api, extractApiError } from '@/lib/api';
import { Button } from '../ui/Button';
import { useToast } from '@/context/ToastContext';
import { RevealSection } from './RevealSection';

export function CallbackSection() {
  const [form, setForm] = useState({ name: '', mobile: '', message: '' });
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: async () =>
      api.post('/leads', { ...form, leadType: 'callback', sourcePage: '/' }),
    onSuccess: () => {
      showToast('Thanks! We will call you back shortly.', 'success');
      setForm({ name: '', mobile: '', message: '' });
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  return (
    <RevealSection className="container-page py-12">
      <div className="overflow-hidden rounded-2xl bg-brand-900 text-white">
        <div className="grid gap-8 p-8 lg:grid-cols-2 lg:p-12">
          <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <PhoneCall className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">Need Help Choosing a Tracker?</h2>
            <p className="mt-2 max-w-md text-brand-100">
              Request a callback and our team will help you find the right GPS tracker or accessory for your vehicle.
            </p>
          </motion.div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            className="grid gap-3 rounded-xl bg-white p-5 text-gray-800"
          >
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Your Name"
              className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <input
              required
              value={form.mobile}
              onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
              placeholder="Mobile Number"
              className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="What are you looking for? (optional)"
              rows={2}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <Button type="submit" loading={mutation.isPending} disabled={!/^[6-9]\d{9}$/.test(form.mobile) || !form.name}>
              Request Callback
            </Button>
          </form>
        </div>
      </div>
    </RevealSection>
  );
}
