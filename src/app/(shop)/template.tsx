'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

// Skip the fade on the very first page load (it shows up as a flicker);
// keep it for client-side navigation between pages.
let hasNavigated = false;

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    hasNavigated = true;
  }, []);

  return (
    <motion.div
      initial={hasNavigated ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
