import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const glassBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors backdrop-blur-sm border',
  {
    variants: {
      variant: {
        default:
          'bg-white/10 text-slate-300 border-white/15',
        primary:
          'bg-blue-500/20 text-blue-300 border-blue-500/30',
        success:
          'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        warning:
          'bg-amber-500/20 text-amber-300 border-amber-500/30',
        destructive:
          'bg-red-500/20 text-red-300 border-red-500/30',
        info:
          'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        purple:
          'bg-purple-500/20 text-purple-300 border-purple-500/30',
        outline:
          'bg-transparent text-slate-300 border-white/20',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[10px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface GlassBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassBadgeVariants> {
  pulse?: boolean;
}

function GlassBadge({
  className,
  variant,
  size,
  pulse = false,
  children,
  ...props
}: GlassBadgeProps) {
  return (
    <div
      className={cn(
        glassBadgeVariants({ variant, size }),
        pulse && 'animate-pulse',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { GlassBadge, glassBadgeVariants };
