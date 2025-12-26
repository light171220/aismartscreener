import { cn } from '@/lib/utils';
import { LucideIcon, Inbox, Search, FileQuestion, AlertCircle } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';

type EmptyStateVariant = 'default' | 'search' | 'error' | 'no-data';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variantIcons: Record<EmptyStateVariant, LucideIcon> = {
  default: Inbox,
  search: Search,
  error: AlertCircle,
  'no-data': FileQuestion,
};

const variantColors: Record<EmptyStateVariant, string> = {
  default: 'text-slate-400',
  search: 'text-blue-400',
  error: 'text-red-400',
  'no-data': 'text-amber-400',
};

export function EmptyState({
  variant = 'default',
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = icon || variantIcons[variant];
  const iconColor = variantColors[variant];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      <div
        className={cn(
          'w-16 h-16 rounded-2xl mb-4',
          'bg-white/5 border border-white/10',
          'flex items-center justify-center'
        )}
      >
        <Icon className={cn('w-8 h-8', iconColor)} />
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      )}

      {action && (
        <GlassButton variant="primary" onClick={action.onClick}>
          {action.label}
        </GlassButton>
      )}
    </div>
  );
}

export function TableEmptyState({
  title = 'No data available',
  description,
  colSpan = 1,
}: {
  title?: string;
  description?: string;
  colSpan?: number;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12">
        <EmptyState
          variant="no-data"
          title={title}
          description={description}
        />
      </td>
    </tr>
  );
}

export function SearchEmptyState({
  query,
  onClear,
}: {
  query: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      description={`No results matching "${query}". Try adjusting your search terms.`}
      action={onClear ? { label: 'Clear search', onClick: onClear } : undefined}
    />
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading data. Please try again.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      variant="error"
      title={title}
      description={description}
      action={onRetry ? { label: 'Try again', onClick: onRetry } : undefined}
    />
  );
}
