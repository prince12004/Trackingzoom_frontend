'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { Button } from '../ui/Button';

const STORAGE_KEY = 'tz_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-gray-200 bg-white/95 backdrop-blur"
        >
          <div className="container-page flex flex-col items-center justify-between gap-3 py-4 sm:flex-row">
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <Cookie className="h-5 w-5 shrink-0 text-accent-500" />
              We use cookies to improve your experience and, for logged-in customers, to enable GPS tracking
              features. Read our{' '}
              <Link href="/privacy-policy" className="font-medium text-brand-600 underline">
                Privacy Policy
              </Link>
              .
            </p>
            <Button size="sm" onClick={accept} className="shrink-0">
              Accept
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
