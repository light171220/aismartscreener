import * as React from 'react';
import { cn } from '@/lib/utils';

export interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

const GlassTextarea = React.forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ className, error, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-white mb-2">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-lg border bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500',
            'border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
            'backdrop-blur-sm transition-all duration-200',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-none',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

GlassTextarea.displayName = 'GlassTextarea';

export { GlassTextarea };
