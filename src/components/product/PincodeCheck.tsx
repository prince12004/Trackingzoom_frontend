'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';

interface PincodeResult {
  serviceable: boolean;
  codAvailable: boolean;
  estimatedDeliveryDaysMin: number;
  estimatedDeliveryDaysMax: number;
}

export function PincodeCheck() {
  const [pincode, setPincode] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async () => (await api.get<ApiEnvelope<PincodeResult>>('/settings/pincode-check', { params: { pincode } })).data.data,
    onError: (err) => setError(extractApiError(err)),
  });

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-gray-500" />
        <input
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
            setError('');
          }}
          placeholder="Enter pincode"
          className="h-9 flex-1 rounded-lg border border-gray-200 px-2 text-sm outline-none focus:border-brand-400"
        />
        <button
          onClick={() => {
            if (!/^[1-9][0-9]{5}$/.test(pincode)) return setError('Enter a valid 6-digit pincode');
            mutation.mutate();
          }}
          className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800"
        >
          Check
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      {mutation.data && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-1 text-sm">
          {mutation.data.serviceable ? (
            <>
              <p className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="h-4 w-4" /> Delivery available to {pincode}
              </p>
              <p className="text-gray-500">
                Estimated delivery in {mutation.data.estimatedDeliveryDaysMin}-{mutation.data.estimatedDeliveryDaysMax} days
              </p>
              <p className="text-gray-500">{mutation.data.codAvailable ? 'Cash on Delivery available' : 'COD not available for this pincode'}</p>
            </>
          ) : (
            <p className="flex items-center gap-1.5 text-danger">
              <XCircle className="h-4 w-4" /> Sorry, we don&apos;t deliver to this pincode yet
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
