import * as React from 'react';
import { cn } from '@/lib/utils';
import { Search, Eye, EyeOff } from 'lucide-react';

export interface GlassInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, type, error, icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';

    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={cn(
            'flex h-10 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500',
            'transition-all duration-200',
            'focus:outline-none focus:bg-white/8 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/10',
            icon && 'pl-10',
            isPassword && 'pr-10',
            className
          )}
          ref={ref}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    );
  }
);
GlassInput.displayName = 'GlassInput';

export interface GlassSearchInputProps
  extends Omit<GlassInputProps, 'icon'> {
  onSearch?: (value: string) => void;
}

const GlassSearchInput = React.forwardRef<HTMLInputElement, GlassSearchInputProps>(
  ({ className, onSearch, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onSearch?.(e.target.value);
    };

    return (
      <GlassInput
        ref={ref}
        className={className}
        icon={<Search className="h-4 w-4" />}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
GlassSearchInput.displayName = 'GlassSearchInput';

export interface GlassTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const GlassTextarea = React.forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500',
          'transition-all duration-200 resize-none',
          'focus:outline-none focus:bg-white/8 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/10',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
GlassTextarea.displayName = 'GlassTextarea';

export { GlassInput, GlassSearchInput, GlassTextarea };
