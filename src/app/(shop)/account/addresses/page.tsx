'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Plus, Pencil, Trash2, Star } from 'lucide-react';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';
import { Address } from '@/types';
import { AddressForm, AddressFormValues } from '@/components/account/AddressForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

export default function AddressesPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => (await api.get<ApiEnvelope<Address[]>>('/addresses')).data.data,
  });

  const saveMutation = useMutation({
    mutationFn: async (values: AddressFormValues) => {
      if (editing) return api.patch(`/addresses/${editing._id}`, values);
      return api.post('/addresses', values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      showToast(editing ? 'Address updated' : 'Address added', 'success');
      setShowForm(false);
      setEditing(null);
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      showToast('Address removed', 'success');
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
        {!showForm && (
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add Address
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-card"
          >
            <h2 className="mb-4 font-semibold text-gray-900">{editing ? 'Edit Address' : 'Add New Address'}</h2>
            <AddressForm
              initial={editing || undefined}
              loading={saveMutation.isPending}
              onSubmit={(values) => saveMutation.mutate(values)}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <p className="text-gray-400">Loading addresses...</p>
      ) : !data || data.length === 0 ? (
        !showForm && <EmptyState icon={MapPin} title="No addresses saved" description="Add an address to speed up checkout." actionLabel="Add Address" onAction={() => setShowForm(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data.map((addr) => (
            <div key={addr._id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-card">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-semibold capitalize text-gray-800">
                  <MapPin className="h-4 w-4 text-brand-600" /> {addr.label}
                  {addr.isDefault && (
                    <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                      <Star className="h-2.5 w-2.5 fill-current" /> Default
                    </span>
                  )}
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setEditing(addr);
                      setShowForm(true);
                    }}
                    className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                    aria-label="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(addr._id)} className="rounded-lg p-1.5 text-danger hover:bg-red-50" aria-label="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700">{addr.name}, {addr.mobile}</p>
              <p className="text-sm text-gray-500">
                {addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
