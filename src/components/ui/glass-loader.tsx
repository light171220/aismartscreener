import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Sparkles } from 'lucide-react';

interface GlassLoaderProps {
  size?: 'sm' | 'default' | 'lg' | 'xl';
  className?: string;
}

export function GlassLoader({ size = 'default', className }: GlassLoaderProps) {
  const sizes = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <Loader2
      className={cn('animate-spin text-blue-400', sizes[size], className)}
    />
  );
}

interface GlassSpinnerProps {
  className?: string;
}

export function GlassSpinner({ className }: GlassSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-2 border-white/10" />
        <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    </div>
  );
}

interface GlassSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function GlassSkeleton({ className, ...props }: GlassSkeletonProps) {
  return (
    <div
      className={cn(
        'glass-skeleton rounded-lg bg-white/5',
        className
      )}
      {...props}
    />
  );
}

export function GlassCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <GlassSkeleton className="h-6 w-24" />
        <GlassSkeleton className="h-6 w-16" />
      </div>
      <GlassSkeleton className="h-10 w-32" />
      <div className="space-y-2">
        <GlassSkeleton className="h-4 w-full" />
        <GlassSkeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function GlassTableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="glass-table rounded-xl overflow-hidden">
      {}
      <div className="glass-table-header p-4 grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <GlassSkeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      {}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="glass-table-row p-4 grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <GlassSkeleton key={colIdx} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export function PageLoader({ message = 'Loading...', fullScreen = false }: PageLoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping" />
      </div>
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}

interface FullPageLoaderProps {
  message?: string;
}

export function FullPageLoader({ message }: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
      <PageLoader message={message} />
    </div>
  );
}
