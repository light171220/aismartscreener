# Notifications & Alerts

## 1. Overview

The notification system provides feedback to users through toasts, alerts, and badges. Uses Sonner for toasts and custom Alert components.

## 2. Toast Notifications (Sonner)

### Setup

```tsx
// app/providers.tsx
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
          className: 'font-sans',
        }}
      />
    </>
  );
}
```

### Usage Examples

```tsx
import { toast } from 'sonner';

// Success toast
toast.success('Trade added successfully', {
  description: 'AAPL 100 shares @ $150.00',
});

// Error toast
toast.error('Failed to add trade', {
  description: 'Please check your input and try again.',
});

// Warning toast
toast.warning('Risk too high', {
  description: 'This trade exceeds your 1% risk limit.',
});

// Info toast
toast.info('Market opens in 5 minutes', {
  description: 'Your pre-market scans will run at 9:30 AM.',
});

// Loading toast with promise
toast.promise(addTrade(data), {
  loading: 'Adding trade...',
  success: 'Trade added successfully!',
  error: 'Failed to add trade',
});

// Custom toast with action
toast('New AI screening results', {
  description: '5 new stocks identified',
  action: {
    label: 'View',
    onClick: () => navigate('/ai-screener'),
  },
});

// Dismissible progress toast
const toastId = toast.loading('Processing...');
// Later:
toast.dismiss(toastId);
// Or update it:
toast.success('Done!', { id: toastId });
```

### Custom Toast Styles

```tsx
// components/ui/toaster.tsx
import { Toaster as Sonner } from 'sonner';
import { useTheme } from 'next-themes';

export function Toaster() {
  const { theme } = useTheme();
  
  return (
    <Sonner
      theme={theme as 'light' | 'dark'}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          success: 'group-[.toaster]:border-green-500/50 group-[.toaster]:bg-green-500/10',
          error: 'group-[.toaster]:border-red-500/50 group-[.toaster]:bg-red-500/10',
          warning: 'group-[.toaster]:border-yellow-500/50 group-[.toaster]:bg-yellow-500/10',
        },
      }}
    />
  );
}
```

## 3. Alert Components

### Basic Alert

```tsx
// components/ui/alert.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive bg-destructive/10',
        success:
          'border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-500 bg-green-500/10',
        warning:
          'border-yellow-500/50 text-yellow-700 dark:text-yellow-400 [&>svg]:text-yellow-500 bg-yellow-500/10',
        info:
          'border-blue-500/50 text-blue-700 dark:text-blue-400 [&>svg]:text-blue-500 bg-blue-500/10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));

export { Alert, AlertTitle, AlertDescription };
```

### Alert with Icon

```tsx
// components/feedback/AlertWithIcon.tsx
interface AlertWithIconProps {
  variant: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  title: string;
  description?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const icons = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

export function AlertWithIcon({
  variant,
  title,
  description,
  dismissible = false,
  onDismiss,
}: AlertWithIconProps) {
  const Icon = icons[variant];
  
  return (
    <Alert variant={variant}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
      {dismissible && (
        <button
          onClick={onDismiss}
          className="absolute right-2 top-2 rounded-md p-1 opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </Alert>
  );
}

// Usage
<AlertWithIcon
  variant="warning"
  title="High Risk Trade"
  description="This trade exceeds your 1% risk limit. Consider reducing position size."
  dismissible
  onDismiss={() => setShowWarning(false)}
/>
```

## 4. Inline Notifications

```tsx
// components/feedback/InlineNotification.tsx
interface InlineNotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  className?: string;
}

export function InlineNotification({ 
  type, 
  message, 
  className 
}: InlineNotificationProps) {
  const config = {
    success: {
      icon: CheckCircle,
      bg: 'bg-green-500/10',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-500/20',
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-red-500/10',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-500/20',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-600 dark:text-yellow-400',
      border: 'border-yellow-500/20',
    },
    info: {
      icon: Info,
      bg: 'bg-blue-500/10',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/20',
    },
  };
  
  const { icon: Icon, bg, text, border } = config[type];
  
  return (
    <div className={cn(
      'flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
      bg, text, border,
      className
    )}>
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// Usage in forms
{errors.ticker && (
  <InlineNotification type="error" message={errors.ticker.message} />
)}
```

## 5. Notification Badge

```tsx
// components/feedback/NotificationBadge.tsx
interface NotificationBadgeProps {
  count: number;
  max?: number;
  variant?: 'default' | 'destructive' | 'success';
  className?: string;
}

export function NotificationBadge({
  count,
  max = 99,
  variant = 'default',
  className,
}: NotificationBadgeProps) {
  if (count === 0) return null;
  
  const displayCount = count > max ? `${max}+` : count;
  
  const variants = {
    default: 'bg-primary text-primary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    success: 'bg-green-500 text-white',
  };
  
  return (
    <span
      className={cn(
        'absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {displayCount}
    </span>
  );
}

// Usage
<div className="relative">
  <Bell className="h-5 w-5" />
  <NotificationBadge count={notifications.length} />
</div>
```

## 6. Status Dot Indicator

```tsx
// components/feedback/StatusDot.tsx
interface StatusDotProps {
  status: 'online' | 'offline' | 'busy' | 'away';
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusDot({ status, pulse = false, size = 'md' }: StatusDotProps) {
  const colors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };
  
  const sizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };
  
  return (
    <span className="relative flex">
      <span className={cn(
        'rounded-full',
        colors[status],
        sizes[size]
      )} />
      {pulse && status === 'online' && (
        <span className={cn(
          'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
          colors[status]
        )} />
      )}
    </span>
  );
}
```

## 7. Real-time Notification Center

```tsx
// features/notifications/components/NotificationCenter.tsx
interface Notification {
  id: string;
  type: 'screening' | 'trade' | 'alert' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { notifications, markAsRead, clearAll } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <NotificationBadge count={unreadCount} variant="destructive" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold">Notifications</h4>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear all
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={() => markAsRead(notification.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: () => void;
}) {
  const icons = {
    screening: Sparkles,
    trade: TrendingUp,
    alert: AlertCircle,
    system: Info,
  };
  
  const Icon = icons[notification.type];
  
  return (
    <button
      onClick={onRead}
      className={cn(
        'w-full px-4 py-3 text-left hover:bg-muted transition-colors',
        !notification.read && 'bg-primary/5'
      )}
    >
      <div className="flex gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm truncate',
            !notification.read && 'font-medium'
          )}>
            {notification.title}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatRelativeTime(notification.timestamp)}
          </p>
        </div>
        {!notification.read && (
          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
        )}
      </div>
    </button>
  );
}
```

## 8. Push Notification Hook

```tsx
// hooks/usePushNotifications.ts
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    Notification.permission
  );
  
  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };
  
  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') return;
    
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/badge.png',
      ...options,
    });
  };
  
  return { permission, requestPermission, sendNotification };
}

// Usage: Send notification when screening completes
useEffect(() => {
  if (screeningComplete && !document.hasFocus()) {
    sendNotification('AI Screening Complete', {
      body: `${results.length} stocks identified`,
      tag: 'screening-complete',
    });
  }
}, [screeningComplete]);
```
