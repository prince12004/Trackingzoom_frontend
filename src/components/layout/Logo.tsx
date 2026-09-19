import Link from 'next/link';
import Image from 'next/image';

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href="/"
      className={`relative block shrink-0 ${compact ? 'h-8 w-8' : 'h-11 w-[175px] sm:h-12 sm:w-[205px]'} ${className || ''}`}
      aria-label="TrackingZoom GPS home"
    >
      <Image
        src={compact ? '/assets/logo/icon-square.png' : '/assets/logo/logo.png'}
        alt="TrackingZoom GPS"
        fill
        priority
        sizes="200px"
        className="object-contain object-left"
      />
    </Link>
  );
}
