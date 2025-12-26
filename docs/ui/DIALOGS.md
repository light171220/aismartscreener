# Dialogs & Modals

## 1. Overview

Dialogs are used for focused interactions like trade entry, confirmations, and detail views. Built with Radix UI Dialog primitive via shadcn/ui.

## 2. Base Dialog Component

```tsx
// components/ui/dialog.tsx
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
);

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
```

## 3. Add Trade Dialog

```tsx
// features/trades/components/AddTradeDialog.tsx
interface AddTradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillData?: Partial<TradeFormData>;
  onSuccess?: () => void;
}

export function AddTradeDialog({
  open,
  onOpenChange,
  prefillData,
  onSuccess,
}: AddTradeDialogProps) {
  const { mutate: addTrade, isPending } = useAddTrade();
  
  const handleSubmit = async (data: TradeFormData) => {
    addTrade(data, {
      onSuccess: () => {
        toast.success('Trade added successfully');
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        toast.error('Failed to add trade');
        console.error(error);
      },
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Add New Trade
          </DialogTitle>
          <DialogDescription>
            Enter your trade details below. All fields with * are required.
          </DialogDescription>
        </DialogHeader>
        
        <TradeForm
          onSubmit={handleSubmit}
          defaultValues={prefillData}
          isLoading={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}

// Usage
function TradesPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  return (
    <>
      <Button onClick={() => setShowAddDialog(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Add Trade
      </Button>
      
      <AddTradeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </>
  );
}
```

## 4. Close Trade Dialog

```tsx
// features/trades/components/CloseTradeDialog.tsx
interface CloseTradeDialogProps {
  trade: Trade;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CloseTradeDialog({
  trade,
  open,
  onOpenChange,
  onSuccess,
}: CloseTradeDialogProps) {
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [exitReason, setExitReason] = useState<string>('TARGET_HIT');
  const [notes, setNotes] = useState<string>('');
  
  const { mutate: closeTrade, isPending } = useCloseTrade();
  
  // Calculate P&L
  const profit = (sellPrice - trade.buyPrice) * trade.quantity;
  const profitPct = ((sellPrice - trade.buyPrice) / trade.buyPrice) * 100;
  const isProfit = profit >= 0;
  
  const handleClose = () => {
    closeTrade({
      id: trade.id,
      sellPrice,
      sellDate: new Date().toISOString().split('T')[0],
      sellTime: new Date().toTimeString().split(' ')[0].slice(0, 5),
      exitReason,
      notes,
    }, {
      onSuccess: () => {
        toast.success('Trade closed successfully');
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Close Trade: {trade.ticker}</DialogTitle>
          <DialogDescription>
            {trade.quantity} shares @ ${trade.buyPrice.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Sell Price Input */}
          <div>
            <Label htmlFor="sellPrice">Sell Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="sellPrice"
                type="number"
                step="0.01"
                className="pl-7"
                value={sellPrice || ''}
                onChange={(e) => setSellPrice(Number(e.target.value))}
                placeholder="0.00"
              />
            </div>
          </div>
          
          {/* P&L Preview */}
          {sellPrice > 0 && (
            <div className={cn(
              'rounded-lg p-4 text-center',
              isProfit ? 'bg-green-500/10' : 'bg-red-500/10'
            )}>
              <p className="text-sm text-muted-foreground mb-1">
                Realized P&L
              </p>
              <p className={cn(
                'text-3xl font-bold',
                isProfit ? 'text-green-500' : 'text-red-500'
              )}>
                {isProfit ? '+' : ''}${profit.toFixed(2)}
              </p>
              <p className={cn(
                'text-sm',
                isProfit ? 'text-green-500' : 'text-red-500'
              )}>
                {isProfit ? '+' : ''}{profitPct.toFixed(2)}%
              </p>
            </div>
          )}
          
          {/* Exit Reason */}
          <div>
            <Label htmlFor="exitReason">Exit Reason</Label>
            <Select value={exitReason} onValueChange={setExitReason}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TARGET_HIT">Target Hit</SelectItem>
                <SelectItem value="STOP_HIT">Stop Loss Hit</SelectItem>
                <SelectItem value="PARTIAL_PROFIT">Partial Profit</SelectItem>
                <SelectItem value="TRAILING_STOP">Trailing Stop</SelectItem>
                <SelectItem value="TIME_STOP">Time Stop (EOD)</SelectItem>
                <SelectItem value="MANUAL">Manual Exit</SelectItem>
                <SelectItem value="NEWS">News/Event</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you learn from this trade?"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleClose}
            disabled={!sellPrice || isPending}
            variant={isProfit ? 'default' : 'destructive'}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Closing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Close Trade
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## 5. Stock Detail Dialog

```tsx
// features/screener/components/StockDetailDialog.tsx
interface StockDetailDialogProps {
  stock: ScreenedStock;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTrade?: (stock: ScreenedStock) => void;
}

export function StockDetailDialog({
  stock,
  open,
  onOpenChange,
  onTrade,
}: StockDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{stock.ticker}</DialogTitle>
              <DialogDescription>{stock.companyName}</DialogDescription>
            </div>
            <Badge variant={stock.setupQuality === 'A+' ? 'success' : 'default'}>
              {stock.setupQuality} Setup
            </Badge>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="technicals">Technicals</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Price & Change */}
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold">
                ${stock.lastPrice?.toFixed(2)}
              </span>
              <Badge variant={stock.gapPercent >= 0 ? 'success' : 'destructive'}>
                {stock.gapPercent >= 0 ? '+' : ''}{stock.gapPercent?.toFixed(2)}%
              </Badge>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Volume</p>
                <p className="font-bold">{formatVolume(stock.volume)}</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Avg Volume</p>
                <p className="font-bold">{formatVolume(stock.avgVolume)}</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Market Cap</p>
                <p className="font-bold">{formatMarketCap(stock.marketCap)}</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Float</p>
                <p className="font-bold">{formatVolume(stock.float)}</p>
              </div>
            </div>
            
            {/* Setup Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trade Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Setup Type</p>
                    <Badge variant="outline">
                      {stock.setupType?.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Risk/Reward</p>
                    <p className="font-bold">{stock.riskReward || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Catalyst</p>
                    <p className="text-sm">{stock.catalyst || 'No catalyst identified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* AI Analysis */}
            {stock.aiAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{stock.aiAnalysis}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="technicals" className="space-y-4">
            {/* Price Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Price Chart (5min)</CardTitle>
              </CardHeader>
              <CardContent>
                <CandlestickChart ticker={stock.ticker} timeframe="5min" />
              </CardContent>
            </Card>
            
            {/* Technical Levels */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground">VWAP</p>
                <p className="font-bold">${stock.vwap?.toFixed(2) || 'N/A'}</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground">9 EMA</p>
                <p className="font-bold">${stock.ema9?.toFixed(2) || 'N/A'}</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground">20 SMA</p>
                <p className="font-bold">${stock.sma20?.toFixed(2) || 'N/A'}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="news" className="space-y-4">
            {stock.recentNews?.map((news, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <a
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    <h4 className="font-medium mb-1">{news.title}</h4>
                  </a>
                  <p className="text-sm text-muted-foreground mb-2">
                    {news.source} • {formatRelativeTime(news.publishedAt)}
                  </p>
                  <p className="text-sm">{news.summary}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onTrade && (
            <Button onClick={() => onTrade(stock)}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Trade {stock.ticker}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## 6. Confirmation Dialog

```tsx
// components/ui/confirm-dialog.tsx
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Usage
<ConfirmDialog
  open={showDeleteConfirm}
  onOpenChange={setShowDeleteConfirm}
  title="Delete Trade"
  description="Are you sure you want to delete this trade? This action cannot be undone."
  confirmText="Delete"
  variant="destructive"
  onConfirm={handleDelete}
  isLoading={isDeleting}
/>
```

## 7. Alert Dialog (Non-dismissible)

```tsx
// components/ui/alert-dialog.tsx
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';

export function AlertDialog({
  open,
  title,
  description,
  actionText,
  onAction,
}: {
  open: boolean;
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
}) {
  return (
    <AlertDialogPrimitive.Root open={open}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80" />
        <AlertDialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg">
          <AlertDialogPrimitive.Title className="text-lg font-semibold">
            {title}
          </AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description className="text-sm text-muted-foreground">
            {description}
          </AlertDialogPrimitive.Description>
          <div className="flex justify-end">
            <AlertDialogPrimitive.Action asChild>
              <Button onClick={onAction}>{actionText}</Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
```

## 8. Sheet (Side Panel)

```tsx
// components/ui/sheet.tsx
import * as SheetPrimitive from '@radix-ui/react-dialog';

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & {
    side?: 'top' | 'bottom' | 'left' | 'right';
  }
>(({ side = 'right', className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80" />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 gap-4 bg-background p-6 shadow-lg transition',
        side === 'right' && 'inset-y-0 right-0 h-full w-3/4 sm:max-w-sm border-l',
        side === 'left' && 'inset-y-0 left-0 h-full w-3/4 sm:max-w-sm border-r',
        side === 'top' && 'inset-x-0 top-0 border-b',
        side === 'bottom' && 'inset-x-0 bottom-0 border-t',
        className
      )}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
));

// Usage: Trade Detail Sheet
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost">View Details</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Trade Details</SheetTitle>
    </SheetHeader>
    <TradeDetails trade={selectedTrade} />
  </SheetContent>
</Sheet>
```

## 9. Dialog Best Practices

### Accessibility
- Focus trapping within dialog
- Escape key closes dialog
- Proper ARIA labels
- Return focus on close

### UX Guidelines
- Don't stack dialogs
- Provide clear escape routes
- Show loading states
- Validate before submit
- Confirm destructive actions

### Performance
- Lazy load dialog content
- Use Suspense for async content
- Avoid heavy computations in render

---

## 10. User Permission Dialog (Admin)

Dialog for editing user feature permissions.

```tsx
// features/admin/components/EditPermissionsDialog.tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PermissionEditForm } from './PermissionEditForm';
import { client } from '@/lib/amplify-client';

interface EditPermissionsDialogProps {
  user: UserAccess | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPermissionsDialog({ user, open, onOpenChange }: EditPermissionsDialogProps) {
  const queryClient = useQueryClient();
  
  const { mutate: updatePermissions, isPending } = useMutation({
    mutationFn: async ({ permissions, preset }: { permissions: string[]; preset: string }) => {
      if (!user) throw new Error('No user selected');
      
      return client.models.UserAccess.update({
        id: user.id,
        permissions,
        permissionPreset: preset,
        updatedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Permissions updated', {
        description: `${user?.fullName}'s permissions have been saved.`,
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Failed to update permissions', {
        description: error.message,
      });
    },
  });
  
  if (!user) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-500/20">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            Edit Permissions
          </DialogTitle>
          <DialogDescription>
            Configure feature access for <span className="text-white font-medium">{user.fullName}</span>
            <span className="text-slate-500"> ({user.email})</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <PermissionEditForm
            user={user}
            onSave={(permissions, preset) => updatePermissions({ permissions, preset })}
            onCancel={() => onOpenChange(false)}
            isLoading={isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 11. Access Request Review Dialog (Admin)

Dialog for reviewing and approving/rejecting access requests.

```tsx
// features/admin/components/AccessRequestReviewDialog.tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassBadge } from '@/components/ui/glass-badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { client } from '@/lib/amplify-client';
import { formatRelativeTime } from '@/lib/formatters';
import { Check, X, User, Mail, Clock, FileText, Award, Loader2 } from 'lucide-react';

const PERMISSION_PRESETS = [
  { value: 'FULL_ACCESS', label: 'Full Access' },
  { value: 'BASIC', label: 'Basic' },
  { value: 'SCREENING_ONLY', label: 'Screening Only' },
  { value: 'TRADING_ONLY', label: 'Trading Only' },
  { value: 'DASHBOARD_ONLY', label: 'Dashboard Only' },
];

interface AccessRequestReviewDialogProps {
  request: AccessRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccessRequestReviewDialog({ request, open, onOpenChange }: AccessRequestReviewDialogProps) {
  const queryClient = useQueryClient();
  const [selectedPreset, setSelectedPreset] = useState('BASIC');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  
  const { mutate: approveRequest, isPending: isApproving } = useMutation({
    mutationFn: async () => {
      if (!request) throw new Error('No request selected');
      
      // Update access request status
      await client.models.AccessRequest.update({
        id: request.id,
        status: 'APPROVED',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'admin', // Would come from auth context
      });
      
      // Create UserAccess record
      await client.models.UserAccess.create({
        email: request.email,
        fullName: request.fullName,
        role: 'USER',
        accessStatus: 'ACTIVE',
        permissionPreset: selectedPreset,
        permissions: getPresetPermissions(selectedPreset),
        approvedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Request approved!', {
        description: `${request?.fullName} now has access to the platform.`,
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Failed to approve request', { description: error.message });
    },
  });
  
  const { mutate: rejectRequest, isPending: isRejecting } = useMutation({
    mutationFn: async () => {
      if (!request) throw new Error('No request selected');
      
      await client.models.AccessRequest.update({
        id: request.id,
        status: 'REJECTED',
        rejectionReason: rejectionReason || undefined,
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'admin',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
      toast.success('Request rejected', {
        description: `${request?.fullName}'s request has been declined.`,
      });
      onOpenChange(false);
      setRejectionReason('');
      setShowRejectionInput(false);
    },
    onError: (error) => {
      toast.error('Failed to reject request', { description: error.message });
    },
  });
  
  if (!request) return null;
  
  const isPending = isApproving || isRejecting;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-500/20">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            Review Access Request
          </DialogTitle>
          <DialogDescription>
            Review this user's request for platform access
          </DialogDescription>
        </DialogHeader>
        
        {/* Request Details */}
        <div className="space-y-4 py-4">
          {/* User Info */}
          <div className="glass-subtle p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {request.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">{request.fullName}</p>
                <p className="text-slate-400 text-sm">{request.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300">
                  {request.tradingExperience?.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300">
                  {formatRelativeTime(new Date(request.submittedAt))}
                </span>
              </div>
            </div>
          </div>
          
          {/* Reason */}
          <div>
            <Label className="text-slate-400 text-xs">Reason for Access</Label>
            <div className="mt-1 p-3 glass-subtle rounded-lg">
              <p className="text-white text-sm">{request.reason}</p>
            </div>
          </div>
          
          {/* Permission Preset Selection */}
          {!showRejectionInput && (
            <div>
              <Label>Permission Level (for approval)</Label>
              <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                <SelectTrigger className="glass-input mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERMISSION_PRESETS.map(preset => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Rejection Reason */}
          {showRejectionInput && (
            <div>
              <Label>Rejection Reason (optional)</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this request is being rejected..."
                rows={3}
                className="glass-input mt-1"
              />
            </div>
          )}
        </div>
        
        <DialogFooter className="flex gap-2">
          {!showRejectionInput ? (
            <>
              <GlassButton
                variant="outline"
                onClick={() => setShowRejectionInput(true)}
                disabled={isPending}
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </GlassButton>
              <GlassButton
                variant="success"
                onClick={() => approveRequest()}
                disabled={isPending}
              >
                {isApproving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Approving...</>
                ) : (
                  <><Check className="w-4 h-4 mr-2" /> Approve</>
                )}
              </GlassButton>
            </>
          ) : (
            <>
              <GlassButton
                variant="outline"
                onClick={() => setShowRejectionInput(false)}
                disabled={isPending}
              >
                Back
              </GlassButton>
              <GlassButton
                variant="danger"
                onClick={() => rejectRequest()}
                disabled={isPending}
              >
                {isRejecting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Rejecting...</>
                ) : (
                  <><X className="w-4 h-4 mr-2" /> Confirm Reject</>
                )}
              </GlassButton>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 12. Admin Action Confirmation Dialogs

Reusable confirmation dialogs for dangerous admin actions.

```tsx
// features/admin/components/AdminConfirmDialog.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, AlertTriangle, Pause, Ban, RefreshCw } from 'lucide-react';

type ActionType = 'suspend' | 'revoke' | 'reactivate' | 'delete';

const ACTION_CONFIG: Record<ActionType, {
  title: string;
  description: string;
  icon: React.ReactNode;
  confirmText: string;
  variant: 'warning' | 'danger' | 'success';
}> = {
  suspend: {
    title: 'Suspend User Access',
    description: 'This will temporarily disable the user\'s access to the platform. They can be reactivated later.',
    icon: <Pause className="w-5 h-5 text-amber-400" />,
    confirmText: 'Suspend',
    variant: 'warning',
  },
  revoke: {
    title: 'Revoke User Access',
    description: 'This will permanently revoke the user\'s access. They will need to submit a new access request to regain access.',
    icon: <Ban className="w-5 h-5 text-red-400" />,
    confirmText: 'Revoke Access',
    variant: 'danger',
  },
  reactivate: {
    title: 'Reactivate User',
    description: 'This will restore the user\'s access to the platform with their previous permissions.',
    icon: <RefreshCw className="w-5 h-5 text-emerald-400" />,
    confirmText: 'Reactivate',
    variant: 'success',
  },
  delete: {
    title: 'Delete User',
    description: 'This will permanently delete the user and all their data. This action cannot be undone.',
    icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
    confirmText: 'Delete Forever',
    variant: 'danger',
  },
};

interface AdminConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: ActionType;
  userName: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function AdminConfirmDialog({
  open,
  onOpenChange,
  actionType,
  userName,
  onConfirm,
  isLoading,
}: AdminConfirmDialogProps) {
  const config = ACTION_CONFIG[actionType];
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-full',
              config.variant === 'danger' && 'bg-red-500/20',
              config.variant === 'warning' && 'bg-amber-500/20',
              config.variant === 'success' && 'bg-emerald-500/20',
            )}>
              {config.icon}
            </div>
            {config.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-2">
            <p>{config.description}</p>
            <p className="mt-2 text-white">
              User: <span className="font-medium">{userName}</span>
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <GlassButton variant="outline" disabled={isLoading}>
              Cancel
            </GlassButton>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <GlassButton
              variant={config.variant === 'success' ? 'primary' : config.variant}
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                config.confirmText
              )}
            </GlassButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Usage
<AdminConfirmDialog
  open={showSuspendDialog}
  onOpenChange={setShowSuspendDialog}
  actionType="suspend"
  userName={selectedUser?.fullName}
  onConfirm={() => suspendUser(selectedUser?.id)}
  isLoading={isSuspending}
/>
```

---

## 13. Stock Detail Dialog

Dialog showing comprehensive stock analysis.

```tsx
// features/ai-screener/components/StockDetailDialog.tsx
interface StockDetailDialogProps {
  stock: AIScreeningResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTakeTrade?: (stock: AIScreeningResult) => void;
}

export function StockDetailDialog({ stock, open, onOpenChange, onTakeTrade }: StockDetailDialogProps) {
  if (!stock) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">{stock.ticker}</span>
              <GlassBadge variant="success">
                <Sparkles className="w-3 h-3 mr-1" />
                A+ Setup
              </GlassBadge>
            </DialogTitle>
            <div className="text-right">
              <p className="text-2xl font-mono font-bold text-white">
                ${stock.currentPrice?.toFixed(2)}
              </p>
              <p className={cn(
                'text-sm',
                stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
              </p>
            </div>
          </div>
          <DialogDescription>
            {stock.companyName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Setup Overview */}
          <div className="grid grid-cols-3 gap-4">
            <GlassCard className="text-center p-4">
              <p className="text-xs text-slate-400 mb-1">Setup Type</p>
              <p className="text-white font-medium">{stock.setupType?.replace('_', ' ')}</p>
            </GlassCard>
            <GlassCard className="text-center p-4">
              <p className="text-xs text-slate-400 mb-1">Risk/Reward</p>
              <p className="text-emerald-400 font-bold">{stock.riskRewardRatio?.toFixed(2)}:1</p>
            </GlassCard>
            <GlassCard className="text-center p-4">
              <p className="text-xs text-slate-400 mb-1">Catalyst</p>
              <p className="text-blue-400 font-medium">{stock.catalystType?.replace('_', ' ') || 'None'}</p>
            </GlassCard>
          </div>
          
          {/* Last Closing Price & Gap (Planned) */}
          {stock.previousClose && (
            <div className="flex items-center justify-between p-4 glass-subtle rounded-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Previous Close</p>
                  <p className="text-lg font-mono font-bold text-slate-300">
                    ${stock.previousClose.toFixed(2)}
                  </p>
                </div>
              </div>
              {stock.gapFromClosePercent !== undefined && (
                <div className="text-right">
                  <p className="text-xs text-slate-400">Gap from Close</p>
                  <p className={cn(
                    'text-lg font-bold',
                    stock.gapFromClosePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {stock.gapFromClosePercent >= 0 ? '+' : ''}{stock.gapFromClosePercent.toFixed(2)}%
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Average Target Price & Growth % (Implemented) */}
          {(() => {
            const avgTarget = stock.suggestedTarget1 && stock.suggestedTarget2
              ? (stock.suggestedTarget1 + stock.suggestedTarget2) / 2
              : stock.suggestedTarget1 || stock.suggestedTarget2;
            const growthPct = avgTarget && stock.currentPrice
              ? ((avgTarget - stock.currentPrice) / stock.currentPrice) * 100
              : null;
            
            return avgTarget ? (
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div>
                  <p className="text-xs text-slate-400">Avg Target Price</p>
                  <p className="text-xl font-mono font-bold text-emerald-400">
                    ${avgTarget.toFixed(2)}
                  </p>
                </div>
                {growthPct !== null && (
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Potential Growth</p>
                    <p className="text-xl font-bold text-emerald-400 flex items-center justify-end gap-1">
                      <TrendingUp className="w-5 h-5" />
                      +{growthPct.toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            ) : null;
          })()}
          
          {/* Price Ranges (Planned) */}
          {stock.priceRanges && (
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Price Ranges
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {/* 5 Days */}
                <div className="p-3 glass-subtle rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">5 Days</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Low</span>
                      <span className="text-xs font-mono text-red-400">${stock.priceRanges.days5.low.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">High</span>
                      <span className="text-xs font-mono text-emerald-400">${stock.priceRanges.days5.high.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                {/* 30 Days */}
                <div className="p-3 glass-subtle rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">30 Days</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Low</span>
                      <span className="text-xs font-mono text-red-400">${stock.priceRanges.days30.low.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">High</span>
                      <span className="text-xs font-mono text-emerald-400">${stock.priceRanges.days30.high.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                {/* 52 Weeks */}
                <div className="p-3 glass-subtle rounded-lg border border-blue-500/20">
                  <p className="text-xs text-blue-400 mb-2">52 Weeks</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">Low</span>
                      <span className="text-xs font-mono text-red-400">${stock.priceRanges.weeks52.low.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500">High</span>
                      <span className="text-xs font-mono text-emerald-400">${stock.priceRanges.weeks52.high.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 52-Week Position Indicator */}
              {(() => {
                const { low, high } = stock.priceRanges.weeks52;
                const position = ((stock.currentPrice - low) / (high - low)) * 100;
                return (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>52W Low</span>
                      <span>52W High</span>
                    </div>
                    <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full w-full" />
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg border-2 border-blue-500"
                        style={{ left: `calc(${Math.min(Math.max(position, 0), 100)}% - 6px)` }}
                      />
                    </div>
                    <p className="text-center text-xs text-slate-400 mt-1">
                      {position.toFixed(0)}% of 52W range
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
          
          {/* AI-Identified Entry & Exit Prices (Planned) */}
          {stock.aiIdentifiedLevels && (
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-blue-400" />
                AI-Identified Trade Levels
                <GlassBadge 
                  variant={stock.aiIdentifiedLevels.confidence === 'HIGH' ? 'success' : 
                           stock.aiIdentifiedLevels.confidence === 'MEDIUM' ? 'warning' : 'default'}
                  size="sm"
                >
                  {stock.aiIdentifiedLevels.confidence} Confidence
                </GlassBadge>
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {/* AI Entry */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowDownToLine className="w-4 h-4 text-blue-400" />
                    <p className="text-xs text-slate-400">AI Entry Price</p>
                  </div>
                  <p className="text-xl font-mono font-bold text-blue-400">
                    ${stock.aiIdentifiedLevels.entryPrice.toFixed(2)}
                  </p>
                  {stock.aiIdentifiedLevels.entryReason && (
                    <p className="text-xs text-slate-500 mt-1">
                      {stock.aiIdentifiedLevels.entryReason}
                    </p>
                  )}
                </div>
                {/* AI Exit */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpFromLine className="w-4 h-4 text-emerald-400" />
                    <p className="text-xs text-slate-400">AI Exit Price</p>
                  </div>
                  <p className="text-xl font-mono font-bold text-emerald-400">
                    ${stock.aiIdentifiedLevels.exitPrice.toFixed(2)}
                  </p>
                  {stock.aiIdentifiedLevels.exitReason && (
                    <p className="text-xs text-slate-500 mt-1">
                      {stock.aiIdentifiedLevels.exitReason}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Entry to Exit Progress */}
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span>Entry</span>
                  <span>Current</span>
                  <span>Exit</span>
                </div>
                <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                    style={{ 
                      width: `${Math.min(Math.max(
                        ((stock.currentPrice - stock.aiIdentifiedLevels.entryPrice) / 
                         (stock.aiIdentifiedLevels.exitPrice - stock.aiIdentifiedLevels.entryPrice)) * 100
                      , 0), 100)}%` 
                    }}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg border-2 border-blue-500"
                    style={{ 
                      left: `calc(${Math.min(Math.max(
                        ((stock.currentPrice - stock.aiIdentifiedLevels.entryPrice) / 
                         (stock.aiIdentifiedLevels.exitPrice - stock.aiIdentifiedLevels.entryPrice)) * 100
                      , 0), 100)}% - 6px)` 
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Trade Levels */}
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-3">Suggested Trade Levels</h4>
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 glass-subtle rounded-lg">
                <p className="text-xs text-slate-400">Entry</p>
                <p className="text-blue-400 font-mono font-bold">${stock.suggestedEntry?.toFixed(2)}</p>
              </div>
              <div className="p-3 glass-subtle rounded-lg">
                <p className="text-xs text-slate-400">Stop Loss</p>
                <p className="text-red-400 font-mono font-bold">${stock.suggestedStop?.toFixed(2)}</p>
              </div>
              <div className="p-3 glass-subtle rounded-lg">
                <p className="text-xs text-slate-400">Target 1</p>
                <p className="text-emerald-400 font-mono font-bold">${stock.suggestedTarget1?.toFixed(2)}</p>
              </div>
              <div className="p-3 glass-subtle rounded-lg">
                <p className="text-xs text-slate-400">Target 2</p>
                <p className="text-emerald-400 font-mono font-bold">${stock.suggestedTarget2?.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          {/* Screening Methods */}
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-3">Screening Results</h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Method 1 */}
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <GlassBadge variant="success" size="sm">✓</GlassBadge>
                  <span className="font-medium text-white">Method 1: Scanner</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Liquidity</span>
                    <span className="text-emerald-400">✓ Passed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Volatility</span>
                    <span className="text-emerald-400">✓ Passed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Catalyst</span>
                    <span className="text-emerald-400">✓ Passed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Technical</span>
                    <span className="text-emerald-400">✓ Passed</span>
                  </div>
                </div>
              </GlassCard>
              
              {/* Method 2 */}
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <GlassBadge variant="success" size="sm">✓</GlassBadge>
                  <span className="font-medium text-white">Method 2: GATE</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gate 1</span>
                    <span className="text-emerald-400">✓ Pre-Market</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gate 2</span>
                    <span className="text-emerald-400">✓ Technical</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gate 3</span>
                    <span className="text-emerald-400">✓ Execution</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gate 4</span>
                    <span className="text-emerald-400">✓ Risk Check</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
          
          {/* Market Context */}
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-3">Market Context</h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">SPY:</span>
                <GlassBadge variant={stock.spyTrend === 'UP' ? 'success' : stock.spyTrend === 'DOWN' ? 'danger' : 'default'}>
                  {stock.spyTrend === 'UP' ? '↑ Bullish' : stock.spyTrend === 'DOWN' ? '↓ Bearish' : '→ Neutral'}
                </GlassBadge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">QQQ:</span>
                <GlassBadge variant={stock.qqqTrend === 'UP' ? 'success' : stock.qqqTrend === 'DOWN' ? 'danger' : 'default'}>
                  {stock.qqqTrend === 'UP' ? '↑ Bullish' : stock.qqqTrend === 'DOWN' ? '↓ Bearish' : '→ Neutral'}
                </GlassBadge>
              </div>
            </div>
          </div>
          
          {/* Catalyst Details */}
          {stock.catalystDescription && (
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-2">Catalyst Details</h4>
              <p className="text-white text-sm glass-subtle p-3 rounded-lg">
                {stock.catalystDescription}
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2">
          <GlassButton variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </GlassButton>
          {onTakeTrade && (
            <GlassButton variant="primary" glow onClick={() => onTakeTrade(stock)}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Take Trade
            </GlassButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```
