'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { INDIAN_STATES, INDIAN_STATES_CITIES } from '@/lib/indianStatesCities';

export interface AddressFormValues {
  name: string;
  mobile: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  label: 'home' | 'work' | 'other';
  isDefault?: boolean;
}

const EMPTY: AddressFormValues = {
  name: '',
  mobile: '',
  addressLine1: '',
  addressLine2: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  label: 'home',
};

export function AddressForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial?: Partial<AddressFormValues>;
  onSubmit: (values: AddressFormValues) => void;
  onCancel?: () => void;
  loading?: boolean;
}) {
  const [values, setValues] = useState<AddressFormValues>({ ...EMPTY, ...initial });

  const set = <K extends keyof AddressFormValues>(key: K, value: AddressFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const citiesForState = values.state ? INDIAN_STATES_CITIES[values.state] || [] : [];
  const cityIsKnown = citiesForState.includes(values.city);
  const [cityIsOther, setCityIsOther] = useState(!!values.city && !cityIsKnown);

  const isValid =
    values.name.trim() &&
    /^[6-9]\d{9}$/.test(values.mobile) &&
    values.addressLine1.trim() &&
    values.city.trim() &&
    values.state.trim() &&
    /^[1-9][0-9]{5}$/.test(values.pincode);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) onSubmit(values);
      }}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      <input
        value={values.name}
        onChange={(e) => set('name', e.target.value)}
        placeholder="Full Name"
        className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-400 sm:col-span-2"
        required
      />
      <input
        value={values.mobile}
        onChange={(e) => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
        placeholder="Mobile Number"
        className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-400"
        required
      />
      <input
        value={values.email || ''}
        onChange={(e) => set('email', e.target.value)}
        placeholder="Email (optional)"
        className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-400"
      />
      <input
        value={values.addressLine1}
        onChange={(e) => set('addressLine1', e.target.value)}
        placeholder="Address (House No, Street)"
        className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-400 sm:col-span-2"
        required
      />
      <input
        value={values.addressLine2 || ''}
        onChange={(e) => set('addressLine2', e.target.value)}
        placeholder="Apartment / Flat (optional)"
        className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-400"
      />
      <input
        value={values.landmark || ''}
        onChange={(e) => set('landmark', e.target.value)}
        placeholder="Landmark (optional)"
        className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-400"
      />
      <select
        value={values.state}
        onChange={(e) => {
          set('state', e.target.value);
          set('city', '');
          setCityIsOther(false);
        }}
        className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-400"
        required
      >
        <option value="">Select State</option>
        {INDIAN_STATES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {cityIsOther ? (
        <input
          value={values.city}
          onChange={(e) => set('city', e.target.value)}
          placeholder="City name"
          className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-400"
          required
          autoFocus
        />
      ) : (
        <select
          value={values.city}
          onChange={(e) => {
            if (e.target.value === '__other__') {
              setCityIsOther(true);
              set('city', '');
            } else {
              set('city', e.target.value);
            }
          }}
          disabled={!values.state}
          className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-400 disabled:bg-gray-50 disabled:text-gray-400"
          required
        >
          <option value="">{values.state ? 'Select City' : 'Select state first'}</option>
          {citiesForState.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          <option value="__other__">Other (type manually)</option>
        </select>
      )}
      <input
        value={values.pincode}
        onChange={(e) => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="Pincode"
        className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-400"
        required
      />
      <select
        value={values.label}
        onChange={(e) => set('label', e.target.value as AddressFormValues['label'])}
        className="h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-brand-400"
      >
        <option value="home">Home</option>
        <option value="work">Work</option>
        <option value="other">Other</option>
      </select>

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={!isValid} loading={loading}>
          Save Address
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
