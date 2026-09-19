'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  motionProps?: HTMLMotionProps<'button'>;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_4px_14px_-2px_rgba(0,168,232,0.45)] hover:shadow-[0_6px_20px_-2px_rgba(0,168,232,0.55)] hover:brightness-110',
  secondary:
    'bg-gradient-to-br from-accent-400 to-accent-600 text-white shadow-[0_4px_14px_-2px_rgba(240,148,13,0.45)] hover:shadow-[0_6px_20px_-2px_rgba(240,148,13,0.55)] hover:brightness-110',
  outline: 'border border-gray-300 text-gray-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700',
  ghost: 'text-gray-700 hover:bg-gray-100',
  danger: 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-[0_4px_14px_-2px_rgba(220,38,38,0.4)] hover:brightness-110',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:hover:brightness-100',
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
