import * as React from 'react';
import { cn } from '@/lib/utils';

interface GlassTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface GlassTabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const GlassTabsContext = React.createContext<GlassTabsContextValue | null>(null);

function useGlassTabsContext() {
  const context = React.useContext(GlassTabsContext);
  if (!context) {
    throw new Error('GlassTabs components must be used within a GlassTabs provider');
  }
  return context;
}

export function GlassTabs({ value, onValueChange, children, className }: GlassTabsProps) {
  return (
    <GlassTabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn('w-full', className)}>
        {children}
      </div>
    </GlassTabsContext.Provider>
  );
}

interface GlassTabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassTabsList({ children, className }: GlassTabsListProps) {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-xl',
        'bg-white/5 p-1 backdrop-blur-sm border border-white/10',
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

interface GlassTabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function GlassTabsTrigger({ value, children, className, disabled }: GlassTabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useGlassTabsContext();
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      onClick={() => onValueChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5',
        'text-sm font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
        'disabled:pointer-events-none disabled:opacity-50',
        isSelected
          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
          : 'text-slate-400 hover:text-white hover:bg-white/5',
        className
      )}
    >
      {children}
    </button>
  );
}

interface GlassTabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function GlassTabsContent({ value, children, className }: GlassTabsContentProps) {
  const { value: selectedValue } = useGlassTabsContext();
  
  if (selectedValue !== value) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      className={cn(
        'mt-4 focus-visible:outline-none',
        'animate-in fade-in-0 slide-in-from-bottom-2 duration-200',
        className
      )}
    >
      {children}
    </div>
  );
}
