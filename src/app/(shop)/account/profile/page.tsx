'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { BadgeCheck, Copy } from 'lucide-react';
import { api, extractApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', gender: '', dob: '' });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        gender: user.gender || '',
        dob: user.dob ? user.dob.slice(0, 10) : '',
      });
    }
  }, [user]);

  const saveMutation = useMutation({
    mutationFn: async () => api.patch('/users/me', { ...form, gender: form.gender || undefined, dob: form.dob || undefined }),
    onSuccess: async () => {
      await refreshUser();
      showToast('Profile updated', 'success');
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const copyReferral = async () => {
    if (!user) return;
    await navigator.clipboard.writeText(user.referralCode);
    showToast('Referral code copied', 'success');
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Profile</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
        className="max-w-lg space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-card"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Full Name</span>
          <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Mobile Number</span>
          <div className="flex items-center gap-2">
            <input disabled value={user?.mobile || ''} className="input bg-gray-50 text-gray-400" />
            {user?.mobileVerified && <BadgeCheck className="h-5 w-5 shrink-0 text-success" />}
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Email Address</span>
          <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input" placeholder="you@example.com" />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Gender</span>
            <select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} className="input">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Date of Birth</span>
            <input type="date" value={form.dob} onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))} className="input" />
          </label>
        </div>

        <div className="rounded-lg bg-brand-50 p-3">
          <p className="text-xs font-medium text-brand-700">Your Referral Code</p>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-mono text-sm font-bold text-brand-900">{user?.referralCode}</span>
            <button type="button" onClick={copyReferral} className="text-brand-600 hover:text-brand-800">
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Button type="submit" loading={saveMutation.isPending}>
          Save Changes
        </Button>
      </form>
    </div>
  );
}
