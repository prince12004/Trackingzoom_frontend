'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, Copy, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';

export default function ReferEarnPage() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login?redirect=/refer-earn');
  }, [loading, user, router]);

  if (loading || !user) return <div className="container-page py-16 text-center text-gray-400">Loading...</div>;

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/login?ref=${user.referralCode}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast('Referral link copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container-page flex flex-col items-center py-16 text-center">
      <Gift className="h-14 w-14 text-accent-500" />
      <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Refer &amp; Earn</h1>
      <p className="mt-2 max-w-md text-gray-500">
        Share your referral code with friends and family. Your unique code and rewards program details will appear
        here.
      </p>

      <div className="mt-8 flex w-full max-w-md items-center gap-2 rounded-xl border border-gray-200 p-2">
        <code className="flex-1 truncate px-2 text-sm text-gray-700">{referralLink}</code>
        <Button size="sm" onClick={copyLink}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>

      <p className="mt-6 text-sm text-gray-400">
        Your referral code: <span className="font-semibold text-gray-700">{user.referralCode}</span>
      </p>
    </div>
  );
}
