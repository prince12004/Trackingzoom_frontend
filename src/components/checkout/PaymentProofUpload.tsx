'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { QrCode, UploadCloud, CheckCircle2, Clock } from 'lucide-react';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';

interface PublicPaymentSettings {
  payment: { qrPaymentEnabled: boolean; qrCodeImage?: string; upiId?: string };
}

export function PaymentProofUpload({
  orderId,
  hasScreenshot,
  onSubmitted,
}: {
  orderId: string;
  hasScreenshot: boolean;
  onSubmitted: () => void;
}) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(hasScreenshot);

  const { data: settings } = useQuery({
    queryKey: ['settings-public'],
    queryFn: async () => (await api.get<ApiEnvelope<PublicPaymentSettings>>('/settings/public')).data.data,
    staleTime: 5 * 60 * 1000,
  });

  const submitMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const uploadRes = await api.post<ApiEnvelope<{ url: string }>>('/uploads/payment-screenshot', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await api.post(`/orders/${orderId}/payment-proof`, { screenshotUrl: uploadRes.data.data.url });
    },
    onSuccess: () => {
      setSubmitted(true);
      showToast('Payment screenshot submitted — we will verify and confirm shortly.', 'success');
      onSubmitted();
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  if (submitted) {
    return (
      <div className="mt-6 flex items-center gap-3 rounded-xl border border-accent-200 bg-accent-50 p-4">
        <Clock className="h-5 w-5 shrink-0 text-accent-600" />
        <div>
          <p className="text-sm font-semibold text-accent-800">Payment verification pending</p>
          <p className="text-xs text-accent-700">
            We&apos;ve received your payment screenshot and will confirm it shortly. You&apos;ll get a notification once verified.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 rounded-xl border border-brand-100 bg-brand-50/40 p-5"
    >
      <h2 className="mb-1 flex items-center gap-2 font-semibold text-gray-900">
        <QrCode className="h-5 w-5 text-brand-600" /> Complete Your Payment
      </h2>
      <p className="mb-4 text-sm text-gray-500">Scan the QR code below with any UPI app, then upload a screenshot of the successful payment.</p>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        {settings?.payment.qrCodeImage ? (
          <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
            <Image src={settings.payment.qrCodeImage} alt="UPI QR code" fill className="object-contain p-2" />
          </div>
        ) : (
          <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-300">
            <QrCode className="h-10 w-10" />
          </div>
        )}

        <div className="flex-1 text-center sm:text-left">
          {settings?.payment.upiId && (
            <p className="mb-3 text-sm text-gray-600">
              UPI ID: <span className="font-semibold text-gray-900">{settings.payment.upiId}</span>
            </p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) submitMutation.mutate(file);
              e.target.value = '';
            }}
          />
          <Button loading={submitMutation.isPending} onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="h-4 w-4" /> Upload Payment Screenshot
          </Button>
          <p className="mt-2 flex items-center justify-center gap-1 text-xs text-gray-400 sm:justify-start">
            <CheckCircle2 className="h-3.5 w-3.5" /> Your order is already placed — this just confirms your payment
          </p>
        </div>
      </div>
    </motion.div>
  );
}
