import type { Metadata } from 'next';
import { Open_Sans, Poppins } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/context/QueryProvider';
import { ToastProvider } from '@/context/ToastContext';

const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans', display: 'swap' });
const poppins = Poppins({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-poppins', display: 'swap' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'TrackingZoom — Real-Time GPS Tracking, Real-Time Control',
    template: '%s | TrackingZoom',
  },
  description:
    'Navigate your journey with precision and confidence. Real-time GPS tracking for cars, buses, school vehicles, personal use and business assets.',
  openGraph: {
    type: 'website',
    siteName: 'TrackingZoom',
    title: 'TrackingZoom — Real-Time GPS Tracking, Real-Time Control',
    description:
      'Navigate your journey with precision and confidence. Real-time GPS tracking for cars, buses, school vehicles, personal use and business assets.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${openSans.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
