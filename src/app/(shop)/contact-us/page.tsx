'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from 'lucide-react';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

interface PublicSettings {
  general: { contactNumber?: string; email?: string; address?: string; businessHours?: string };
  social: { whatsapp?: string };
}

export default function ContactUsPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', mobile: '', email: '', subject: '', message: '' });

  const { data: settings } = useQuery({
    queryKey: ['settings-public'],
    queryFn: async () => (await api.get<ApiEnvelope<PublicSettings>>('/settings/public')).data.data,
  });

  const mutation = useMutation({
    mutationFn: async () => api.post('/contact', form),
    onSuccess: () => {
      showToast('Message sent! We will get back to you soon.', 'success');
      setForm({ name: '', mobile: '', email: '', subject: '', message: '' });
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  return (
    <div className="container-page py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Contact Us</h1>
        <p className="mt-2 text-gray-500">We&apos;re here to help. Reach out anytime.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-gray-100 shadow-card">
            <iframe
              title="TrackingZoom office location"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                settings?.general?.address || 'Office No. 10, Pahlwan Market, Opp. JM Aroma, Sector 75, Noida, Uttar Pradesh 201301'
              )}&output=embed`}
              className="h-48 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          {settings?.general?.contactNumber && (
            <a href={`tel:${settings.general.contactNumber}`} className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 shadow-card">
              <Phone className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Call Us</p>
                <p className="text-sm text-gray-500">{settings.general.contactNumber}</p>
              </div>
            </a>
          )}
          {settings?.general?.email && (
            <a href={`mailto:${settings.general.email}`} className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 shadow-card">
              <Mail className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Email Us</p>
                <p className="text-sm text-gray-500">{settings.general.email}</p>
              </div>
            </a>
          )}
          {settings?.general?.address && (
            <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4 shadow-card">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Visit Us</p>
                <p className="text-sm text-gray-500">{settings.general.address}</p>
              </div>
            </div>
          )}
          {settings?.general?.businessHours && (
            <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-4 shadow-card">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Business Hours</p>
                <p className="text-sm text-gray-500">{settings.general.businessHours}</p>
              </div>
            </div>
          )}
          {settings?.social?.whatsapp && (
            <a
              href={settings.social.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-700"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-semibold">Chat on WhatsApp</span>
            </a>
          )}
        </motion.div>

        <motion.form
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 p-6 shadow-card sm:grid-cols-2"
        >
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Your Name"
            className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-400 sm:col-span-2"
          />
          <input
            required
            value={form.mobile}
            onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
            placeholder="Mobile Number"
            className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-400"
          />
          <input
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Email (optional)"
            className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-400"
          />
          <input
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            placeholder="Subject"
            className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-400 sm:col-span-2"
          />
          <textarea
            required
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Your Message"
            rows={5}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 sm:col-span-2"
          />
          <Button type="submit" loading={mutation.isPending} className="sm:col-span-2">
            <Send className="h-4 w-4" /> Send Message
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
