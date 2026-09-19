'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { UploadCloud } from 'lucide-react';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

interface Settings {
  general: { companyName: string; contactNumber?: string; email?: string; address?: string; businessHours?: string };
  business: { gstNumber?: string; currency: string; invoicePrefix: string };
  payment: {
    codEnabled: boolean;
    codMinOrderAmount: number;
    codMaxOrderAmount: number;
    codCharge: number;
    onlinePaymentEnabled: boolean;
    qrPaymentEnabled: boolean;
    qrCodeImage?: string;
    upiId?: string;
  };
  shipping: { freeShippingThreshold: number; defaultShippingCharge: number; estimatedDeliveryDaysMin: number; estimatedDeliveryDaysMax: number };
  social: { facebook?: string; instagram?: string; youtube?: string; linkedin?: string; whatsapp?: string };
  apps: { androidUrl?: string; iosUrl?: string };
  analytics: { ga4MeasurementId?: string; metaPixelId?: string; googleAdsConversionId?: string };
  security: { adminTwoFactorRequired: boolean; adminIpWhitelistEnabled: boolean };
}

const TABS = ['general', 'business', 'payment', 'shipping', 'social', 'apps', 'analytics', 'security'] as const;

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<(typeof TABS)[number]>('general');
  const [form, setForm] = useState<Settings | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => (await api.get<ApiEnvelope<Settings>>('/settings')).data.data,
  });

  useEffect(() => {
    if (data && !form) setForm(data);
  }, [data, form]);

  const saveMutation = useMutation({
    mutationFn: async () => api.patch('/settings', { [tab]: form?.[tab] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings-public'] });
      showToast('Settings saved', 'success');
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const set = (section: keyof Settings, key: string, value: unknown) => {
    setForm((f) => (f ? { ...f, [section]: { ...f[section], [key]: value } } : f));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingQr, setUploadingQr] = useState(false);

  const handleQrUpload = async (file: File) => {
    setUploadingQr(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post<ApiEnvelope<{ url: string }>>('/uploads/image?folder=qr-payment', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set('payment', 'qrCodeImage', res.data.data.url);
      showToast('QR code uploaded', 'success');
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setUploadingQr(false);
    }
  };

  if (isLoading || !form) return <p className="text-gray-400">Loading...</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Configure your store</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
              tab === t ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
        {tab === 'general' && (
          <div className="space-y-4">
            <Field label="Company Name">
              <input value={form.general.companyName} onChange={(e) => set('general', 'companyName', e.target.value)} className="input" />
            </Field>
            <Field label="Contact Number">
              <input value={form.general.contactNumber || ''} onChange={(e) => set('general', 'contactNumber', e.target.value)} className="input" />
            </Field>
            <Field label="Email">
              <input value={form.general.email || ''} onChange={(e) => set('general', 'email', e.target.value)} className="input" />
            </Field>
            <Field label="Address">
              <textarea value={form.general.address || ''} onChange={(e) => set('general', 'address', e.target.value)} rows={2} className="input" />
            </Field>
            <Field label="Business Hours">
              <input value={form.general.businessHours || ''} onChange={(e) => set('general', 'businessHours', e.target.value)} className="input" />
            </Field>
          </div>
        )}

        {tab === 'business' && (
          <div className="space-y-4">
            <Field label="GST Number">
              <input value={form.business.gstNumber || ''} onChange={(e) => set('business', 'gstNumber', e.target.value)} className="input" />
            </Field>
            <Field label="Currency">
              <input value={form.business.currency} onChange={(e) => set('business', 'currency', e.target.value)} className="input" />
            </Field>
            <Field label="Invoice Prefix">
              <input value={form.business.invoicePrefix} onChange={(e) => set('business', 'invoicePrefix', e.target.value)} className="input" />
            </Field>
          </div>
        )}

        {tab === 'payment' && (
          <div className="space-y-4">
            <Toggle label="COD Enabled" checked={form.payment.codEnabled} onChange={(v) => set('payment', 'codEnabled', v)} />
            <Toggle label="Online Payment Enabled" checked={form.payment.onlinePaymentEnabled} onChange={(v) => set('payment', 'onlinePaymentEnabled', v)} />
            <div className="grid grid-cols-3 gap-4">
              <Field label="COD Min Amount">
                <input type="number" value={form.payment.codMinOrderAmount} onChange={(e) => set('payment', 'codMinOrderAmount', Number(e.target.value))} className="input" />
              </Field>
              <Field label="COD Max Amount">
                <input type="number" value={form.payment.codMaxOrderAmount} onChange={(e) => set('payment', 'codMaxOrderAmount', Number(e.target.value))} className="input" />
              </Field>
              <Field label="COD Charge">
                <input type="number" value={form.payment.codCharge} onChange={(e) => set('payment', 'codCharge', Number(e.target.value))} className="input" />
              </Field>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="mb-3 text-sm font-bold text-gray-900">Manual QR Payment</p>
              <p className="mb-4 text-xs text-gray-500">
                Use this while Razorpay isn&apos;t connected yet — customers scan your UPI QR code and upload a payment screenshot; you verify it from Orders.
              </p>
              <Toggle label="QR Payment Enabled" checked={form.payment.qrPaymentEnabled} onChange={(v) => set('payment', 'qrPaymentEnabled', v)} />

              <div className="mt-4">
                <Field label="UPI ID (shown next to the QR code)">
                  <input
                    value={form.payment.upiId || ''}
                    onChange={(e) => set('payment', 'upiId', e.target.value)}
                    className="input"
                    placeholder="yourbusiness@upi"
                  />
                </Field>
              </div>

              <div className="mt-4">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">QR Code Image</span>
                <div className="flex items-center gap-4">
                  {form.payment.qrCodeImage ? (
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                      <Image src={form.payment.qrCodeImage} alt="UPI QR code" fill className="object-contain p-1" />
                    </div>
                  ) : (
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-300">
                      <UploadCloud className="h-8 w-8" />
                    </div>
                  )}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleQrUpload(file);
                        e.target.value = '';
                      }}
                    />
                    <Button type="button" variant="outline" size="sm" loading={uploadingQr} onClick={() => fileInputRef.current?.click()}>
                      <UploadCloud className="h-4 w-4" /> {form.payment.qrCodeImage ? 'Replace QR Code' : 'Upload QR Code'}
                    </Button>
                    <p className="mt-1.5 text-xs text-gray-400">JPEG/PNG, up to 5MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'shipping' && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Free Shipping Threshold (₹)">
              <input type="number" value={form.shipping.freeShippingThreshold} onChange={(e) => set('shipping', 'freeShippingThreshold', Number(e.target.value))} className="input" />
            </Field>
            <Field label="Default Shipping Charge (₹)">
              <input type="number" value={form.shipping.defaultShippingCharge} onChange={(e) => set('shipping', 'defaultShippingCharge', Number(e.target.value))} className="input" />
            </Field>
            <Field label="Min Delivery Days">
              <input type="number" value={form.shipping.estimatedDeliveryDaysMin} onChange={(e) => set('shipping', 'estimatedDeliveryDaysMin', Number(e.target.value))} className="input" />
            </Field>
            <Field label="Max Delivery Days">
              <input type="number" value={form.shipping.estimatedDeliveryDaysMax} onChange={(e) => set('shipping', 'estimatedDeliveryDaysMax', Number(e.target.value))} className="input" />
            </Field>
          </div>
        )}

        {tab === 'social' && (
          <div className="space-y-4">
            {(['facebook', 'instagram', 'youtube', 'linkedin', 'whatsapp'] as const).map((key) => (
              <Field key={key} label={key.charAt(0).toUpperCase() + key.slice(1) + ' URL'}>
                <input value={form.social[key] || ''} onChange={(e) => set('social', key, e.target.value)} className="input" placeholder="https://..." />
              </Field>
            ))}
          </div>
        )}

        {tab === 'apps' && (
          <div className="space-y-4">
            <Field label="Android App URL">
              <input value={form.apps.androidUrl || ''} onChange={(e) => set('apps', 'androidUrl', e.target.value)} className="input" />
            </Field>
            <Field label="iOS App URL">
              <input value={form.apps.iosUrl || ''} onChange={(e) => set('apps', 'iosUrl', e.target.value)} className="input" />
            </Field>
          </div>
        )}

        {tab === 'analytics' && (
          <div className="space-y-4">
            <Field label="GA4 Measurement ID">
              <input value={form.analytics.ga4MeasurementId || ''} onChange={(e) => set('analytics', 'ga4MeasurementId', e.target.value)} className="input" placeholder="G-XXXXXXX" />
            </Field>
            <Field label="Meta Pixel ID">
              <input value={form.analytics.metaPixelId || ''} onChange={(e) => set('analytics', 'metaPixelId', e.target.value)} className="input" />
            </Field>
            <Field label="Google Ads Conversion ID">
              <input value={form.analytics.googleAdsConversionId || ''} onChange={(e) => set('analytics', 'googleAdsConversionId', e.target.value)} className="input" />
            </Field>
          </div>
        )}

        {tab === 'security' && (
          <div className="space-y-4">
            <Toggle label="Require Admin 2FA" checked={form.security.adminTwoFactorRequired} onChange={(v) => set('security', 'adminTwoFactorRequired', v)} />
            <Toggle label="Enable Admin IP Whitelist" checked={form.security.adminIpWhitelistEnabled} onChange={(v) => set('security', 'adminIpWhitelistEnabled', v)} />
          </div>
        )}

        <Button className="mt-6" loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
          Save {tab} Settings
        </Button>
      </motion.div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="relative inline-flex cursor-pointer items-center">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <div className="h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-brand-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:after:translate-x-5" />
      </div>
    </label>
  );
}
