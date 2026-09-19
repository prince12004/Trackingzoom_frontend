'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Store, CheckCircle2 } from 'lucide-react';
import { api, extractApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

export default function DealerPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', mobile: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: async () =>
      api.post('/leads', { ...form, leadType: 'expert', sourcePage: '/dealer', message: `Dealer application: ${form.message}` }),
    onSuccess: () => setSubmitted(true),
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  return (
    <div className="container-page flex flex-col items-center py-16 text-center">
      <Store className="h-14 w-14 text-brand-500" />
      <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Become a Dealer</h1>
      <p className="mt-2 max-w-md text-gray-500">
        Our dealer/reseller portal is launching soon. Register your interest below and our partnerships team will
        reach out with pricing and onboarding details.
      </p>

      {submitted ? (
        <div className="mt-8 flex items-center gap-2 rounded-xl bg-success/10 px-5 py-4 text-success">
          <CheckCircle2 className="h-5 w-5" /> Thanks! We&apos;ll be in touch shortly.
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="mt-8 w-full max-w-md space-y-3 rounded-xl border border-gray-100 p-6 text-left shadow-card"
        >
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Business / Contact Name"
            className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-400"
          />
          <input
            required
            value={form.mobile}
            onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
            placeholder="Mobile Number"
            className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-400"
          />
          <textarea
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Tell us about your business (city, expected volume, etc.)"
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
          <Button type="submit" className="w-full" loading={mutation.isPending}>
            Register Interest
          </Button>
        </form>
      )}
    </div>
  );
}
