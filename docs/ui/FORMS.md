# Form Components

## 1. Overview

Forms in AI Smart Screener use React Hook Form with Zod validation for type-safe, performant form handling.

## 2. Form Setup

### Dependencies
```bash
npm install react-hook-form @hookform/resolvers zod
```

### Base Form Components

```tsx
// components/ui/form.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

const Form = FormProvider;

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return <Controller {...props} />;
};

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('space-y-2', className)} {...props} />
  );
});

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  const { error } = useFormField();
  return (
    <Label
      ref={ref}
      className={cn(error && 'text-destructive', className)}
      {...props}
    />
  );
});

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();
  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) return null;

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  );
});

export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
```

## 3. Trade Entry Form

```tsx
// components/forms/TradeForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const tradeSchema = z.object({
  ticker: z
    .string()
    .min(1, 'Ticker is required')
    .max(5, 'Ticker must be 5 characters or less')
    .transform((val) => val.toUpperCase()),
  quantity: z
    .number({ invalid_type_error: 'Must be a number' })
    .min(1, 'Minimum 1 share'),
  buyPrice: z
    .number({ invalid_type_error: 'Must be a number' })
    .positive('Must be positive'),
  stopLoss: z
    .number({ invalid_type_error: 'Must be a number' })
    .positive('Must be positive'),
  targetPrice: z
    .number({ invalid_type_error: 'Must be a number' })
    .positive('Must be positive'),
  target2Price: z
    .number({ invalid_type_error: 'Must be a number' })
    .positive('Must be positive')
    .optional(),
  setupType: z.enum([
    'VWAP_RECLAIM',
    'ORB_BREAKOUT',
    'TREND_PULLBACK',
    'GAP_AND_GO',
    'REVERSAL',
    'MOMENTUM',
    'OTHER',
  ]),
  entryNotes: z.string().optional(),
}).refine((data) => data.stopLoss < data.buyPrice, {
  message: 'Stop must be below entry for long trades',
  path: ['stopLoss'],
}).refine((data) => data.targetPrice > data.buyPrice, {
  message: 'Target must be above entry for long trades',
  path: ['targetPrice'],
});

type TradeFormData = z.infer<typeof tradeSchema>;

interface TradeFormProps {
  onSubmit: (data: TradeFormData) => void;
  defaultValues?: Partial<TradeFormData>;
  isLoading?: boolean;
}

export function TradeForm({ onSubmit, defaultValues, isLoading }: TradeFormProps) {
  const form = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      setupType: 'VWAP_RECLAIM',
      ...defaultValues,
    },
  });
  
  // Watch values for real-time calculations
  const buyPrice = form.watch('buyPrice');
  const stopLoss = form.watch('stopLoss');
  const targetPrice = form.watch('targetPrice');
  const quantity = form.watch('quantity');
  
  // Calculate risk/reward
  const risk = buyPrice && stopLoss ? (buyPrice - stopLoss) * (quantity || 0) : 0;
  const reward = buyPrice && targetPrice ? (targetPrice - buyPrice) * (quantity || 0) : 0;
  const riskReward = risk > 0 ? (reward / risk).toFixed(2) : '0';
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Row 1: Ticker & Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ticker"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ticker Symbol</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="AAPL"
                    className="uppercase"
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="100"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Row 2: Entry, Stop, Target */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="buyPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entry Price</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      className="pl-7"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="stopLoss"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-red-500">Stop Loss</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      className="pl-7 border-red-500/50 focus:border-red-500"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-red-500">
                  Risk: ${risk.toFixed(2)}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="targetPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-green-500">Target Price</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      className="pl-7 border-green-500/50 focus:border-green-500"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-green-500">
                  Reward: ${reward.toFixed(2)}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Risk/Reward Summary */}
        <div className="bg-muted rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Risk</p>
              <p className="text-xl font-bold text-red-500">${risk.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reward</p>
              <p className="text-xl font-bold text-green-500">${reward.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">R:R Ratio</p>
              <p className={cn(
                'text-xl font-bold',
                Number(riskReward) >= 2 ? 'text-green-500' : 
                Number(riskReward) >= 1 ? 'text-yellow-500' : 'text-red-500'
              )}>
                {riskReward}:1
              </p>
            </div>
          </div>
        </div>
        
        {/* Setup Type */}
        <FormField
          control={form.control}
          name="setupType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Setup Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select setup type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="VWAP_RECLAIM">VWAP Reclaim</SelectItem>
                  <SelectItem value="ORB_BREAKOUT">ORB Breakout</SelectItem>
                  <SelectItem value="TREND_PULLBACK">Trend Pullback</SelectItem>
                  <SelectItem value="GAP_AND_GO">Gap & Go</SelectItem>
                  <SelectItem value="REVERSAL">Reversal</SelectItem>
                  <SelectItem value="MOMENTUM">Momentum</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Notes */}
        <FormField
          control={form.control}
          name="entryNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entry Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Why am I taking this trade? What's the catalyst?"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Submit */}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Trade
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

## 4. Screener Filter Form

```tsx
// components/forms/ScreenerFilterForm.tsx
const filterSchema = z.object({
  minPrice: z.number().min(0).default(2.5),
  maxPrice: z.number().min(0).default(60),
  minMarketCap: z.number().min(0).default(1_000_000_000),
  maxMarketCap: z.number().min(0).default(1_500_000_000),
  minUpsidePct: z.number().min(0).optional(),
  minAnalystCoverage: z.number().min(1).default(3),
  minRating: z.enum(['SELL', 'HOLD', 'BUY', 'STRONG_BUY']).default('HOLD'),
});

export function ScreenerFilterForm({ onSubmit, onReset }: ScreenerFilterFormProps) {
  const form = useForm({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      minPrice: 2.5,
      maxPrice: 60,
      minMarketCap: 1_000_000_000,
      maxMarketCap: 1_500_000_000,
      minAnalystCoverage: 3,
      minRating: 'HOLD',
    },
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Price Range */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        {/* Market Cap Range */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minMarketCap"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Market Cap</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  {formatMarketCap(field.value)}
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxMarketCap"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Market Cap</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  {formatMarketCap(field.value)}
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
        
        {/* Analyst Filters */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minAnalystCoverage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Analyst Coverage</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Rating</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SELL">Sell</SelectItem>
                    <SelectItem value="HOLD">Hold</SelectItem>
                    <SelectItem value="BUY">Buy</SelectItem>
                    <SelectItem value="STRONG_BUY">Strong Buy</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
        
        {/* Upside Filter */}
        <FormField
          control={form.control}
          name="minUpsidePct"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Upside Potential (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g., 100 for 100%+ upside"
                />
              </FormControl>
              <FormDescription>
                Leave empty to skip this filter
              </FormDescription>
            </FormItem>
          )}
        />
        
        {/* Actions */}
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            <Search className="w-4 h-4 mr-2" />
            Run Screen
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              onReset?.();
            }}
          >
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

## 5. Form Validation Patterns

### Real-time Validation
```tsx
// Validate on change
<Input
  {...field}
  onChange={(e) => {
    field.onChange(e);
    form.trigger(field.name); // Trigger validation immediately
  }}
/>
```

### Cross-field Validation
```tsx
const schema = z.object({
  buyPrice: z.number().positive(),
  stopLoss: z.number().positive(),
}).refine((data) => data.stopLoss < data.buyPrice, {
  message: 'Stop must be below entry',
  path: ['stopLoss'],
});
```

### Async Validation
```tsx
const schema = z.object({
  ticker: z.string().refine(async (ticker) => {
    const exists = await checkTickerExists(ticker);
    return exists;
  }, 'Invalid ticker symbol'),
});
```

## 6. Form States

### Loading State
```tsx
<Button disabled={isSubmitting}>
  {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit'}
</Button>
```

### Error State
```tsx
{form.formState.errors.root && (
  <Alert variant="destructive">
    {form.formState.errors.root.message}
  </Alert>
)}
```

### Success State
```tsx
{isSuccess && (
  <Alert variant="success">
    Trade added successfully!
  </Alert>
)}
```

---

## 7. Access Request Form

Form for visitors to request platform access.

```tsx
// features/access-request/components/AccessRequestForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const accessRequestSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address'),
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  tradingExperience: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL'], {
    required_error: 'Please select your trading experience',
  }),
  reason: z
    .string()
    .min(20, 'Please provide at least 20 characters explaining why you want access')
    .max(500, 'Reason must be 500 characters or less'),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the terms'),
});

type AccessRequestData = z.infer<typeof accessRequestSchema>;

interface AccessRequestFormProps {
  onSuccess?: () => void;
}

export function AccessRequestForm({ onSuccess }: AccessRequestFormProps) {
  const navigate = useNavigate();
  const form = useForm<AccessRequestData>({
    resolver: zodResolver(accessRequestSchema),
    defaultValues: {
      email: '',
      fullName: '',
      reason: '',
      agreeToTerms: false,
    },
  });
  
  const { mutate: submitRequest, isPending } = useMutation({
    mutationFn: async (data: AccessRequestData) => {
      // Submit via public API (no auth required)
      return client.models.AccessRequest.create({
        email: data.email,
        fullName: data.fullName,
        tradingExperience: data.tradingExperience,
        reason: data.reason,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast.success('Access request submitted!', {
        description: 'We\'ll review your request and get back to you soon.',
      });
      onSuccess?.();
      navigate('/pending-approval');
    },
    onError: (error) => {
      toast.error('Failed to submit request', {
        description: error.message,
      });
    },
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => submitRequest(data))} className="space-y-6">
        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <GlassInput
                  {...field}
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail className="w-4 h-4" />}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Full Name */}
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <GlassInput
                  {...field}
                  placeholder="John Doe"
                  icon={<User className="w-4 h-4" />}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Trading Experience */}
        <FormField
          control={form.control}
          name="tradingExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trading Experience</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="BEGINNER">
                    <div className="flex items-center gap-2">
                      <span>🌱</span>
                      <div>
                        <p className="font-medium">Beginner</p>
                        <p className="text-xs text-slate-400">Less than 1 year trading</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="INTERMEDIATE">
                    <div className="flex items-center gap-2">
                      <span>📈</span>
                      <div>
                        <p className="font-medium">Intermediate</p>
                        <p className="text-xs text-slate-400">1-3 years trading</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="ADVANCED">
                    <div className="flex items-center gap-2">
                      <span>🎯</span>
                      <div>
                        <p className="font-medium">Advanced</p>
                        <p className="text-xs text-slate-400">3-5 years trading</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="PROFESSIONAL">
                    <div className="flex items-center gap-2">
                      <span>🏆</span>
                      <div>
                        <p className="font-medium">Professional</p>
                        <p className="text-xs text-slate-400">5+ years or licensed</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Reason */}
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Why do you want access?</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Tell us about your trading goals and how AI Smart Screener can help you..."
                  rows={4}
                  className="glass-input resize-none"
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0}/500 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Terms Agreement */}
        <FormField
          control={form.control}
          name="agreeToTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm">
                  I agree to the{' '}
                  <a href="/terms" className="text-blue-400 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-blue-400 hover:underline">
                    Privacy Policy
                  </a>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        
        {/* Submit Button */}
        <GlassButton
          type="submit"
          variant="primary"
          glow
          disabled={isPending}
          className="w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Request Access
            </>
          )}
        </GlassButton>
        
        {/* Already have access link */}
        <p className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <a href="/login" className="text-blue-400 hover:underline">
            Sign in
          </a>
        </p>
      </form>
    </Form>
  );
}
```

---

## 8. Admin Permission Edit Form

Form for admins to edit user permissions.

```tsx
// features/admin/components/PermissionEditForm.tsx
const FEATURES = [
  { id: 'dashboard', label: 'Dashboard', description: 'Main dashboard access', locked: true },
  { id: 'ai_screener', label: 'AI Screener', description: 'View AI-generated stock picks' },
  { id: 'ai_screener_pipeline', label: 'Pipeline View', description: 'View screening stages' },
  { id: 'filter_screener', label: 'Filter Screener', description: 'Custom filter screening' },
  { id: 'filter_high_upside', label: 'High Upside', description: '100%+ upside stocks' },
  { id: 'filter_undervalued', label: 'Undervalued', description: 'Below analyst targets' },
  { id: 'suggestions', label: 'Suggestions', description: 'AI-recommended setups' },
  { id: 'open_trades', label: 'Open Trades', description: 'Track active positions' },
  { id: 'trade_history', label: 'Trade History', description: 'View closed trades' },
  { id: 'trade_assistant', label: 'Trade Assistant', description: 'AI chat for analysis' },
  { id: 'trade_reviewer', label: 'Trade Reviewer', description: 'AI review of performance' },
] as const;

const PRESETS = [
  { value: 'FULL_ACCESS', label: 'Full Access', features: FEATURES.map(f => f.id) },
  { value: 'DASHBOARD_ONLY', label: 'Dashboard Only', features: ['dashboard'] },
  { value: 'SCREENING_ONLY', label: 'Screening Only', features: ['dashboard', 'ai_screener', 'ai_screener_pipeline', 'filter_screener', 'filter_high_upside', 'filter_undervalued'] },
  { value: 'TRADING_ONLY', label: 'Trading Only', features: ['dashboard', 'suggestions', 'open_trades', 'trade_history'] },
  { value: 'BASIC', label: 'Basic', features: ['dashboard', 'ai_screener', 'open_trades', 'trade_history'] },
  { value: 'CUSTOM', label: 'Custom', features: [] },
];

interface PermissionEditFormProps {
  user: UserAccess;
  onSave: (permissions: string[], preset: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PermissionEditForm({ user, onSave, onCancel, isLoading }: PermissionEditFormProps) {
  const [selectedPreset, setSelectedPreset] = useState(user.permissionPreset || 'CUSTOM');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    user.permissions || PRESETS.find(p => p.value === user.permissionPreset)?.features || []
  );
  
  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    if (preset !== 'CUSTOM') {
      const presetConfig = PRESETS.find(p => p.value === preset);
      setSelectedFeatures(presetConfig?.features || []);
    }
  };
  
  const handleFeatureToggle = (featureId: string) => {
    setSelectedPreset('CUSTOM');
    setSelectedFeatures(prev => 
      prev.includes(featureId)
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Preset Selection */}
      <div>
        <label className="text-sm font-medium text-white mb-2 block">Permission Preset</label>
        <Select value={selectedPreset} onValueChange={handlePresetChange}>
          <SelectTrigger className="glass-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRESETS.map(preset => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Feature Checkboxes */}
      <div>
        <label className="text-sm font-medium text-white mb-3 block">Features</label>
        <div className="space-y-2">
          {FEATURES.map(feature => (
            <div 
              key={feature.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg transition-colors',
                selectedFeatures.includes(feature.id) 
                  ? 'bg-blue-500/10 border border-blue-500/30' 
                  : 'bg-white/5 border border-transparent'
              )}
            >
              <Checkbox
                checked={selectedFeatures.includes(feature.id)}
                onCheckedChange={() => handleFeatureToggle(feature.id)}
                disabled={feature.locked}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{feature.label}</p>
                <p className="text-xs text-slate-400">{feature.description}</p>
              </div>
              {feature.locked && (
                <GlassBadge variant="default" size="sm">Required</GlassBadge>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-white/10">
        <GlassButton variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </GlassButton>
        <GlassButton 
          variant="primary" 
          onClick={() => onSave(selectedFeatures, selectedPreset)}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Permissions
            </>
          )}
        </GlassButton>
      </div>
    </div>
  );
}
```

---

## 9. Screening Parameters Form

Admin form for configuring screening parameters.

```tsx
// features/admin/components/ScreeningParametersForm.tsx
const parameterSchema = z.object({
  // Method 1 Parameters
  m1_minPrice: z.number().min(0).default(5),
  m1_maxPrice: z.number().min(0).default(300),
  m1_minAvgVolume: z.number().min(0).default(1000000),
  m1_minRelativeVolume: z.number().min(0).default(1.5),
  m1_maxSpread: z.number().min(0).max(1).default(0.05),
  m1_minATR: z.number().min(0).default(0.30),
  m1_minIntradayRange: z.number().min(0).default(1.0),
  
  // Method 2 Gate 1
  m2_g1_minPrice: z.number().min(0).default(10),
  m2_g1_maxPrice: z.number().min(0).default(500),
  m2_g1_minAvgVolume: z.number().min(0).default(1000000),
  m2_g1_minVolumeSpike: z.number().min(0).default(2.0),
  m2_g1_minATRPercent: z.number().min(0).default(2.0),
  
  // Method 2 Gate 2
  m2_g2_minRelativeVolume: z.number().min(0).default(1.5),
  m2_g2_requireAboveVWAP: z.boolean().default(true),
  m2_g2_requireMarketAligned: z.boolean().default(true),
  
  // Method 2 Gate 3
  m2_g3_startTime: z.string().default('09:35'),
  m2_g3_endTime: z.string().default('11:00'),
  m2_g3_intervalMinutes: z.number().min(1).default(5),
  
  // Method 2 Gate 4
  m2_g4_maxRiskPercent: z.number().min(0).max(100).default(1.0),
  m2_g4_maxVIX: z.number().min(0).default(25),
  m2_g4_minSetupQuality: z.enum(['A_PLUS', 'A', 'B', 'C']).default('B'),
  m2_g4_minRiskReward: z.number().min(0).default(2.0),
});

export function ScreeningParametersForm({ parameters, onSave, isLoading }) {
  const form = useForm({
    resolver: zodResolver(parameterSchema),
    defaultValues: parameters,
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-8">
        {/* Method 1 Section */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Method 1: Scanner-Based Parameters</GlassCardTitle>
            <GlassCardDescription>Configure price, volume, and volatility thresholds</GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="m1_minPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Price ($)</FormLabel>
                  <FormControl>
                    <GlassInput type="number" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="m1_maxPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Price ($)</FormLabel>
                  <FormControl>
                    <GlassInput type="number" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="m1_minAvgVolume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Avg Volume</FormLabel>
                  <FormControl>
                    <GlassInput type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>{formatVolume(field.value)}</FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="m1_minRelativeVolume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Relative Volume</FormLabel>
                  <FormControl>
                    <GlassInput type="number" step="0.1" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>{field.value}x average</FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="m1_minATR"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min ATR ($)</FormLabel>
                  <FormControl>
                    <GlassInput type="number" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="m1_maxSpread"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Spread (%)</FormLabel>
                  <FormControl>
                    <GlassInput type="number" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>{(field.value * 100).toFixed(1)}%</FormDescription>
                </FormItem>
              )}
            />
          </GlassCardContent>
        </GlassCard>
        
        {/* Method 2 Gate 4 Section */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Method 2: Gate 4 Risk Parameters</GlassCardTitle>
            <GlassCardDescription>Configure risk management thresholds</GlassCardDescription>
          </GlassCardHeader>
          <GlassCardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="m2_g4_maxRiskPercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Risk %</FormLabel>
                  <FormControl>
                    <GlassInput type="number" step="0.1" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="m2_g4_maxVIX"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max VIX</FormLabel>
                  <FormControl>
                    <GlassInput type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="m2_g4_minSetupQuality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Setup Quality</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="glass-input">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A_PLUS">A+</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="m2_g4_minRiskReward"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min R:R Ratio</FormLabel>
                  <FormControl>
                    <GlassInput type="number" step="0.1" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>{field.value}:1</FormDescription>
                </FormItem>
              )}
            />
          </GlassCardContent>
        </GlassCard>
        
        {/* Submit */}
        <div className="flex justify-end">
          <GlassButton type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Save Parameters</>
            )}
          </GlassButton>
        </div>
      </form>
    </Form>
  );
}
```
