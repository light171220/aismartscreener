import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import { GlassSelect } from '@/components/ui/glass-select';
import { cn } from '@/lib/utils';

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
    .positive('Price must be positive'),
  buyDate: z.string().min(1, 'Date is required'),
  stopLoss: z
    .number({ invalid_type_error: 'Must be a number' })
    .positive('Stop loss must be positive')
    .optional(),
  targetPrice: z
    .number({ invalid_type_error: 'Must be a number' })
    .positive('Target must be positive')
    .optional(),
  setupType: z.string().optional(),
  notes: z.string().optional(),
  source: z.enum(['AI_SCREENER', 'FILTER_SCREENER', 'MANUAL']).default('MANUAL'),
});

export type TradeFormData = z.infer<typeof tradeSchema>;

interface TradeFormProps {
  onSubmit: (data: TradeFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  defaultValues?: Partial<TradeFormData>;
}

const setupTypes = [
  { value: 'GAP_AND_GO', label: 'Gap and Go' },
  { value: 'BREAKOUT', label: 'Breakout' },
  { value: 'REVERSAL', label: 'Reversal' },
  { value: 'MOMENTUM', label: 'Momentum' },
  { value: 'PULLBACK', label: 'Pullback' },
  { value: 'VWAP_BOUNCE', label: 'VWAP Bounce' },
  { value: 'OTHER', label: 'Other' },
];

const sourceOptions = [
  { value: 'AI_SCREENER', label: 'AI Screener' },
  { value: 'FILTER_SCREENER', label: 'Filter Screener' },
  { value: 'MANUAL', label: 'Manual Entry' },
];

export function TradeForm({ onSubmit, onCancel, isLoading, defaultValues }: TradeFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      buyDate: new Date().toISOString().split('T')[0],
      source: 'MANUAL',
      ...defaultValues,
    },
  });

  const buyPrice = watch('buyPrice');
  const stopLoss = watch('stopLoss');
  const targetPrice = watch('targetPrice');
  const quantity = watch('quantity');

  const riskAmount = buyPrice && stopLoss && quantity
    ? (buyPrice - stopLoss) * quantity
    : null;

  const rewardAmount = buyPrice && targetPrice && quantity
    ? (targetPrice - buyPrice) * quantity
    : null;

  const riskRewardRatio = riskAmount && rewardAmount && riskAmount > 0
    ? (rewardAmount / riskAmount).toFixed(2)
    : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Ticker *
          </label>
          <GlassInput
            {...register('ticker')}
            placeholder="AAPL"
            error={!!errors.ticker}
            className="uppercase"
          />
          {errors.ticker && (
            <p className="mt-1 text-sm text-red-400">{errors.ticker.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Quantity *
          </label>
          <GlassInput
            {...register('quantity', { valueAsNumber: true })}
            type="number"
            placeholder="100"
            error={!!errors.quantity}
          />
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-400">{errors.quantity.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Buy Price *
          </label>
          <GlassInput
            {...register('buyPrice', { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="150.00"
            error={!!errors.buyPrice}
          />
          {errors.buyPrice && (
            <p className="mt-1 text-sm text-red-400">{errors.buyPrice.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Buy Date *
          </label>
          <GlassInput
            {...register('buyDate')}
            type="date"
            error={!!errors.buyDate}
          />
          {errors.buyDate && (
            <p className="mt-1 text-sm text-red-400">{errors.buyDate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Stop Loss
          </label>
          <GlassInput
            {...register('stopLoss', { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="145.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Target Price
          </label>
          <GlassInput
            {...register('targetPrice', { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="165.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Setup Type
          </label>
          <GlassSelect {...register('setupType')}>
            <option value="">Select setup type</option>
            {setupTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </GlassSelect>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Source
          </label>
          <GlassSelect {...register('source')}>
            {sourceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </GlassSelect>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Notes
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="Trade thesis, catalyst, or other notes..."
          className={cn(
            'w-full bg-white/5 backdrop-blur-sm',
            'border border-white/10 rounded-lg',
            'px-4 py-2.5 text-white placeholder:text-slate-500',
            'focus:bg-white/8 focus:border-blue-500/50',
            'focus:outline-none resize-none'
          )}
        />
      </div>

      {(riskAmount || rewardAmount || riskRewardRatio) && (
        <GlassCard className="p-4 bg-white/5">
          <div className="grid grid-cols-3 gap-4 text-center">
            {riskAmount && (
              <div>
                <p className="text-xs text-slate-400">Risk</p>
                <p className="text-lg font-semibold text-red-400">
                  ${Math.abs(riskAmount).toFixed(2)}
                </p>
              </div>
            )}
            {rewardAmount && (
              <div>
                <p className="text-xs text-slate-400">Reward</p>
                <p className="text-lg font-semibold text-emerald-400">
                  ${rewardAmount.toFixed(2)}
                </p>
              </div>
            )}
            {riskRewardRatio && (
              <div>
                <p className="text-xs text-slate-400">R:R Ratio</p>
                <p className="text-lg font-semibold text-blue-400">
                  1:{riskRewardRatio}
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        {onCancel && (
          <GlassButton type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </GlassButton>
        )}
        <GlassButton type="submit" variant="primary" loading={isLoading}>
          Add Trade
        </GlassButton>
      </div>
    </form>
  );
}

export default TradeForm;
