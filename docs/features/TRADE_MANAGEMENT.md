# Trade Management Feature Implementation

## 1. Overview

Trade Management is a **manual trade journaling system** that allows users to track trades they execute on third-party platforms (Robinhood, TD Ameritrade, Webull, etc.) based on the app's screening suggestions.

### Key Points
- ✅ This app does **NOT** execute trades - it's a screening and journaling tool
- ✅ Users manually enter their trades after executing them on their preferred broker
- ✅ The "Suggestions" section shows stocks identified by the 2 filter methods
- ✅ Trade history helps users analyze their performance and improve

## 2. Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TRADE MANAGEMENT FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐                                                       │
│  │  SUGGESTIONS     │  ← Stocks from Filter Screening (2 methods)           │
│  │  (Planned)       │    Method 1: High Upside (100%+ target)               │
│  │                  │    Method 2: Undervalued (below low target)           │
│  └────────┬─────────┘                                                       │
│           │                                                                  │
│           │ User reviews suggestions                                         │
│           │ User executes trade on THIRD-PARTY BROKER                       │
│           │ (Robinhood, TD Ameritrade, Webull, Fidelity, etc.)              │
│           ▼                                                                  │
│  ┌──────────────────┐                                                       │
│  │  LOG TRADE       │  ← User logs trade details in this app                │
│  │  (Manual Entry)  │    (ticker, qty, buy price, buy date, stop, target)   │
│  └────────┬─────────┘                                                       │
│           │                                                                  │
│           │ Trade saved as "OPEN"                                            │
│           │ User monitors position                                           │
│           ▼                                                                  │
│  ┌──────────────────┐                                                       │
│  │  OPEN TRADES     │  ← Active positions being tracked                     │
│  │  (Live View)     │    Shows unrealized P&L                               │
│  └────────┬─────────┘                                                       │
│           │                                                                  │
│           │ User closes position on broker                                   │
│           │ User logs exit in app                                            │
│           ▼                                                                  │
│  ┌──────────────────┐                                                       │
│  │  CLOSE TRADE     │  ← User enters sell price & sell date                 │
│  │  (Log Exit)      │    Trade status changes to "CLOSED"                   │
│  └────────┬─────────┘                                                       │
│           │                                                                  │
│           │ Trade moved to history                                           │
│           ▼                                                                  │
│  ┌──────────────────┐                                                       │
│  │  TRADE HISTORY   │  ← All closed trades for analysis                     │
│  │                  │    Ticker, Buy Date, Buy Price,                       │
│  │                  │    Sell Date, Sell Price, Profit/Loss                 │
│  └──────────────────┘                                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Suggestions (From Filter Screening)

The "Suggestions" section displays stocks identified through the **2 filter screening methods**:

### Method 1: High Upside Potential (100%+ Target)
| Criteria | Value |
|----------|-------|
| Avg Target Price | ≥100% above current price |
| Analyst Coverage | Minimum 3 analysts |
| Rating | Hold or better |
| Market Cap | $1B - $1.5B |
| Price Range | $2.50 - $60 |

### Method 2: Undervalued Stocks (Below Low Target)
| Criteria | Value |
|----------|-------|
| Current Price | 1-100% below analyst low target |
| Analyst Coverage | Minimum 3 analysts |
| Rating | Hold or better |
| Market Cap | $1B - $1.5B |
| Price Range | $2.50 - $60 |

### Suggestions Data Model

```typescript
// amplify/data/resource.ts
SuggestedStock: a.model({
  id: a.id().required(),
  ticker: a.string().required(),
  companyName: a.string(),
  
  // Current price
  lastPrice: a.float().required(),
  
  // Analyst data
  avgTargetPrice: a.float(),
  lowTargetPrice: a.float(),
  highTargetPrice: a.float(),
  analystCount: a.integer(),
  avgRating: a.string(), // SELL, HOLD, BUY, STRONG_BUY
  
  // Calculated
  upsidePct: a.float(),         // % to avg target (Method 1)
  belowLowTargetPct: a.float(), // % below low target (Method 2)
  
  // Screening info
  screenDate: a.date().required(),
  screenType: a.enum(['HIGH_UPSIDE', 'UNDERVALUED']),
  
  // Tracking
  tradeTaken: a.boolean().default(false),
  tradeId: a.string(),
  
  createdAt: a.datetime(),
})
.authorization((allow) => [
  allow.authenticated().to(['read']),
  allow.group('admin').to(['create', 'update', 'delete']),
]),
```

### Suggestions Page

```tsx
// features/suggestions/components/SuggestionsPage.tsx
export function SuggestionsPage() {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: highUpsideStocks } = useQuery({
    queryKey: ['suggestions', 'HIGH_UPSIDE', today],
    queryFn: () => fetchSuggestions('HIGH_UPSIDE', today),
  });
  
  const { data: undervaluedStocks } = useQuery({
    queryKey: ['suggestions', 'UNDERVALUED', today],
    queryFn: () => fetchSuggestions('UNDERVALUED', today),
  });
  
  return (
    <PageContainer
      title="Today's Suggestions"
      description="Stocks identified by our screening methods. Execute on your broker, then log here."
    >
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>How to use</AlertTitle>
        <AlertDescription>
          1. Review these suggestions and do your research<br/>
          2. Execute trades on your broker (Robinhood, TD Ameritrade, etc.)<br/>
          3. Log your trades here to track performance
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="high-upside">
        <TabsList>
          <TabsTrigger value="high-upside">
            100%+ Upside ({highUpsideStocks?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="undervalued">
            Undervalued ({undervaluedStocks?.length || 0})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="high-upside">
          <SuggestionsTable stocks={highUpsideStocks} type="HIGH_UPSIDE" />
        </TabsContent>
        
        <TabsContent value="undervalued">
          <SuggestionsTable stocks={undervaluedStocks} type="UNDERVALUED" />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
```

### Suggestions Table

```tsx
// features/suggestions/components/SuggestionsTable.tsx
const columns: ColumnDef<SuggestedStock>[] = [
  {
    accessorKey: 'ticker',
    header: 'Ticker',
    cell: ({ row }) => (
      <span className="font-bold">{row.getValue('ticker')}</span>
    ),
  },
  {
    accessorKey: 'lastPrice',
    header: 'Current Price',
    cell: ({ row }) => `$${row.getValue<number>('lastPrice')?.toFixed(2)}`,
  },
  {
    accessorKey: 'avgTargetPrice',
    header: 'Avg Target',
    cell: ({ row }) => (
      <span className="text-green-500">
        ${row.getValue<number>('avgTargetPrice')?.toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: 'upsidePct',
    header: 'Upside %',
    cell: ({ row }) => (
      <Badge variant="success">+{row.getValue<number>('upsidePct')?.toFixed(0)}%</Badge>
    ),
  },
  {
    accessorKey: 'analystCount',
    header: 'Analysts',
  },
  {
    accessorKey: 'avgRating',
    header: 'Rating',
    cell: ({ row }) => <Badge>{row.getValue('avgRating')}</Badge>,
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Button size="sm" onClick={() => openLogTradeDialog(row.original)}>
        <Plus className="w-4 h-4 mr-1" />
        Log Trade
      </Button>
    ),
  },
];
```

---

## 4. Trade Data Model

```typescript
// amplify/data/resource.ts
Trade: a.model({
  id: a.id().required(),
  
  // Core trade info
  ticker: a.string().required(),
  quantity: a.integer().required(),
  
  // Entry (required when logging)
  buyPrice: a.float().required(),
  buyDate: a.date().required(),
  
  // Exit (filled when closing)
  sellPrice: a.float(),
  sellDate: a.date(),
  
  // Status
  status: a.enum(['OPEN', 'CLOSED']).default('OPEN'),
  
  // Calculated on close
  profit: a.float(),      // (sellPrice - buyPrice) * quantity
  profitPct: a.float(),   // percentage gain/loss
  
  // Risk management (optional)
  stopLoss: a.float(),
  targetPrice: a.float(),
  
  // Classification
  tradeType: a.enum(['SWING', 'DAY', 'POSITION', 'SCALP', 'OTHER']),
  
  // Source tracking
  screenSource: a.enum(['HIGH_UPSIDE', 'UNDERVALUED', 'MANUAL']),
  suggestedStockId: a.string(),
  
  // Broker info (optional)
  brokerName: a.string(),
  
  // Notes
  entryNotes: a.string(),
  exitNotes: a.string(),
  
  // Owner
  owner: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
})
.authorization((allow) => [allow.owner()]),
```

---

## 5. Log Trade (Manual Entry)

### Log Trade Form

```tsx
// features/trades/components/LogTradeForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const logTradeSchema = z.object({
  ticker: z.string().min(1).max(5).transform(v => v.toUpperCase()),
  quantity: z.number().min(1),
  buyPrice: z.number().positive(),
  buyDate: z.string(),
  stopLoss: z.number().positive().optional(),
  targetPrice: z.number().positive().optional(),
  tradeType: z.enum(['SWING', 'DAY', 'POSITION', 'SCALP', 'OTHER']),
  brokerName: z.string().optional(),
  entryNotes: z.string().optional(),
  screenSource: z.enum(['HIGH_UPSIDE', 'UNDERVALUED', 'MANUAL']),
  suggestedStockId: z.string().optional(),
});

export function LogTradeForm({ onSubmit, prefillData, isLoading }) {
  const form = useForm({
    resolver: zodResolver(logTradeSchema),
    defaultValues: {
      buyDate: new Date().toISOString().split('T')[0],
      tradeType: 'SWING',
      screenSource: prefillData?.suggestedStockId ? 'HIGH_UPSIDE' : 'MANUAL',
      ...prefillData,
    },
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Ticker & Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ticker"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ticker *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="AAPL" className="uppercase" />
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
                <FormLabel>Shares *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Buy Price & Buy Date */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="buyPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buy Price *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      className="pl-7"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="buyDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buy Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Stop Loss & Target (Optional) */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stopLoss"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stop Loss</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      className="pl-7"
                      {...field}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="targetPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Price</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      className="pl-7"
                      {...field}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        {/* Trade Type & Broker */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tradeType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trade Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SWING">Swing Trade</SelectItem>
                    <SelectItem value="DAY">Day Trade</SelectItem>
                    <SelectItem value="POSITION">Position Trade</SelectItem>
                    <SelectItem value="SCALP">Scalp</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="brokerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Broker</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select broker" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="robinhood">Robinhood</SelectItem>
                    <SelectItem value="td_ameritrade">TD Ameritrade</SelectItem>
                    <SelectItem value="webull">Webull</SelectItem>
                    <SelectItem value="fidelity">Fidelity</SelectItem>
                    <SelectItem value="schwab">Charles Schwab</SelectItem>
                    <SelectItem value="etrade">E*TRADE</SelectItem>
                    <SelectItem value="interactive_brokers">Interactive Brokers</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
        
        {/* Notes */}
        <FormField
          control={form.control}
          name="entryNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Why did you take this trade?" rows={3} />
              </FormControl>
            </FormItem>
          )}
        />
        
        {/* Submit */}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Log Trade'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### Log Trade Dialog

```tsx
// features/trades/components/LogTradeDialog.tsx
export function LogTradeDialog({ open, onOpenChange, suggestedStock }) {
  const { mutate: createTrade, isPending } = useCreateTrade();
  
  const handleSubmit = (data) => {
    createTrade({
      ...data,
      status: 'OPEN',
    }, {
      onSuccess: () => {
        toast.success('Trade logged successfully');
        onOpenChange(false);
      },
    });
  };
  
  const prefillData = suggestedStock ? {
    ticker: suggestedStock.ticker,
    buyPrice: suggestedStock.lastPrice,
    targetPrice: suggestedStock.avgTargetPrice,
    screenSource: suggestedStock.screenType,
    suggestedStockId: suggestedStock.id,
  } : undefined;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log Trade</DialogTitle>
          <DialogDescription>
            Log your trade after executing it on your broker.
          </DialogDescription>
        </DialogHeader>
        <LogTradeForm
          onSubmit={handleSubmit}
          prefillData={prefillData}
          isLoading={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
```

---

## 6. Open Trades

```tsx
// features/trades/components/OpenTradesPage.tsx
export function OpenTradesPage() {
  const [showLogDialog, setShowLogDialog] = useState(false);
  
  const { data: openTrades, isLoading } = useQuery({
    queryKey: ['trades', 'open'],
    queryFn: async () => {
      const result = await client.models.Trade.list({
        filter: { status: { eq: 'OPEN' } },
      });
      return result.data;
    },
  });
  
  return (
    <PageContainer
      title="Open Trades"
      description="Your current positions (logged from third-party brokers)"
      actions={
        <Button onClick={() => setShowLogDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Log Trade
        </Button>
      }
    >
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : openTrades?.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="w-12 h-12" />}
          title="No open trades"
          description="Execute a trade on your broker, then log it here."
          action={{
            label: 'Log Trade',
            onClick: () => setShowLogDialog(true),
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {openTrades?.map((trade) => (
            <OpenTradeCard key={trade.id} trade={trade} />
          ))}
        </div>
      )}
      
      <LogTradeDialog open={showLogDialog} onOpenChange={setShowLogDialog} />
    </PageContainer>
  );
}
```

### Open Trade Card

```tsx
// features/trades/components/OpenTradeCard.tsx
export function OpenTradeCard({ trade }) {
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{trade.ticker}</CardTitle>
            <CardDescription>
              {trade.quantity} shares @ ${trade.buyPrice.toFixed(2)}
            </CardDescription>
          </div>
          <Badge>{trade.tradeType}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Buy Date</p>
            <p className="font-medium">{format(new Date(trade.buyDate), 'MMM dd, yyyy')}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Buy Price</p>
            <p className="font-medium">${trade.buyPrice.toFixed(2)}</p>
          </div>
          {trade.stopLoss && (
            <div>
              <p className="text-muted-foreground">Stop Loss</p>
              <p className="font-medium text-red-500">${trade.stopLoss.toFixed(2)}</p>
            </div>
          )}
          {trade.targetPrice && (
            <div>
              <p className="text-muted-foreground">Target</p>
              <p className="font-medium text-green-500">${trade.targetPrice.toFixed(2)}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowCloseDialog(true)}
        >
          Close Trade
        </Button>
      </CardFooter>
      
      <CloseTradeDialog
        trade={trade}
        open={showCloseDialog}
        onOpenChange={setShowCloseDialog}
      />
    </Card>
  );
}
```

---

## 7. Close Trade

```tsx
// features/trades/components/CloseTradeDialog.tsx
export function CloseTradeDialog({ trade, open, onOpenChange }) {
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [sellDate, setSellDate] = useState(new Date().toISOString().split('T')[0]);
  const [exitNotes, setExitNotes] = useState('');
  
  const { mutate: closeTrade, isPending } = useCloseTrade();
  
  // Calculate P&L
  const profit = sellPrice ? (sellPrice - trade.buyPrice) * trade.quantity : 0;
  const profitPct = sellPrice ? ((sellPrice - trade.buyPrice) / trade.buyPrice) * 100 : 0;
  const isProfit = profit >= 0;
  
  const handleClose = () => {
    closeTrade({
      id: trade.id,
      sellPrice,
      sellDate,
      profit,
      profitPct,
      exitNotes,
      status: 'CLOSED',
    }, {
      onSuccess: () => {
        toast.success('Trade closed');
        onOpenChange(false);
      },
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Trade: {trade.ticker}</DialogTitle>
          <DialogDescription>
            {trade.quantity} shares @ ${trade.buyPrice.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Sell Price */}
          <div>
            <Label>Sell Price *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
              <Input
                type="number"
                step="0.01"
                className="pl-7"
                value={sellPrice || ''}
                onChange={(e) => setSellPrice(Number(e.target.value))}
              />
            </div>
          </div>
          
          {/* Sell Date */}
          <div>
            <Label>Sell Date *</Label>
            <Input
              type="date"
              value={sellDate}
              onChange={(e) => setSellDate(e.target.value)}
            />
          </div>
          
          {/* P&L Preview */}
          {sellPrice > 0 && (
            <div className={cn(
              'rounded-lg p-4 text-center',
              isProfit ? 'bg-green-500/10' : 'bg-red-500/10'
            )}>
              <p className="text-sm text-muted-foreground">Profit/Loss</p>
              <p className={cn(
                'text-3xl font-bold',
                isProfit ? 'text-green-500' : 'text-red-500'
              )}>
                {isProfit ? '+' : ''}${profit.toFixed(2)}
              </p>
              <p className="text-sm">
                ({isProfit ? '+' : ''}{profitPct.toFixed(2)}%)
              </p>
            </div>
          )}
          
          {/* Notes */}
          <div>
            <Label>Exit Notes</Label>
            <Textarea
              value={exitNotes}
              onChange={(e) => setExitNotes(e.target.value)}
              placeholder="What did you learn?"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleClose} disabled={!sellPrice || isPending}>
            {isPending ? 'Closing...' : 'Close Trade'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 8. Trade History

### Required Columns

| Column | Field | Description |
|--------|-------|-------------|
| **Ticker** | `ticker` | Stock symbol (AAPL, TSLA) |
| **Buy Date** | `buyDate` | Date position was opened |
| **Buy Price** | `buyPrice` | Entry price per share |
| **Sell Date** | `sellDate` | Date position was closed |
| **Sell Price** | `sellPrice` | Exit price per share |
| **Profit/Loss** | `profit` | Total P&L in dollars |

### Sample Data

```
┌──────────┬──────────────┬───────────┬──────────────┬────────────┬─────────────┐
│  Ticker  │   Buy Date   │ Buy Price │  Sell Date   │ Sell Price │ Profit/Loss │
├──────────┼──────────────┼───────────┼──────────────┼────────────┼─────────────┤
│  AAPL    │ Dec 20, 2024 │  $175.50  │ Dec 23, 2024 │   $182.30  │   +$680.00  │
│  TSLA    │ Dec 18, 2024 │  $245.00  │ Dec 22, 2024 │   $238.50  │   -$325.00  │
│  NVDA    │ Dec 15, 2024 │  $485.25  │ Dec 20, 2024 │   $512.00  │ +$1,337.50  │
│  AMD     │ Dec 12, 2024 │  $142.80  │ Dec 18, 2024 │   $148.60  │   +$290.00  │
│  META    │ Dec 10, 2024 │  $565.00  │ Dec 15, 2024 │   $558.20  │   -$136.00  │
└──────────┴──────────────┴───────────┴──────────────┴────────────┴─────────────┘
```

### Trade History Table

```tsx
// features/history/components/TradeHistoryTable.tsx
import { format } from 'date-fns';

const columns: ColumnDef<Trade>[] = [
  {
    accessorKey: 'ticker',
    header: 'Ticker',
    cell: ({ row }) => (
      <span className="font-bold">{row.getValue('ticker')}</span>
    ),
  },
  {
    accessorKey: 'buyDate',
    header: 'Buy Date',
    cell: ({ row }) => format(new Date(row.getValue('buyDate')), 'MMM dd, yyyy'),
  },
  {
    accessorKey: 'buyPrice',
    header: 'Buy Price',
    cell: ({ row }) => `$${row.getValue<number>('buyPrice').toFixed(2)}`,
  },
  {
    accessorKey: 'sellDate',
    header: 'Sell Date',
    cell: ({ row }) => format(new Date(row.getValue('sellDate')), 'MMM dd, yyyy'),
  },
  {
    accessorKey: 'sellPrice',
    header: 'Sell Price',
    cell: ({ row }) => `$${row.getValue<number>('sellPrice').toFixed(2)}`,
  },
  {
    accessorKey: 'profit',
    header: 'Profit/Loss',
    cell: ({ row }) => {
      const profit = row.getValue<number>('profit');
      const isProfit = profit >= 0;
      return (
        <span className={cn(
          'font-bold',
          isProfit ? 'text-green-500' : 'text-red-500'
        )}>
          {isProfit ? '+' : ''}${profit.toFixed(2)}
        </span>
      );
    },
  },
];

export function TradeHistoryTable({ trades }: { trades: Trade[] }) {
  const table = useReactTable({
    data: trades,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      sorting: [{ id: 'sellDate', desc: true }],
      pagination: { pageSize: 10 },
    },
  });
  
  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="cursor-pointer"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No trade history yet.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t">
        <span className="text-sm text-muted-foreground">
          {trades.length} total trades
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Trade History Page

```tsx
// features/history/components/TradeHistoryPage.tsx
export function TradeHistoryPage() {
  const { data: closedTrades, isLoading } = useQuery({
    queryKey: ['trades', 'closed'],
    queryFn: async () => {
      const result = await client.models.Trade.list({
        filter: { status: { eq: 'CLOSED' } },
      });
      return result.data?.sort((a, b) =>
        new Date(b.sellDate).getTime() - new Date(a.sellDate).getTime()
      );
    },
  });
  
  // Stats
  const stats = useMemo(() => {
    if (!closedTrades?.length) return null;
    const wins = closedTrades.filter(t => t.profit > 0);
    const totalProfit = closedTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    return {
      totalTrades: closedTrades.length,
      wins: wins.length,
      losses: closedTrades.length - wins.length,
      winRate: (wins.length / closedTrades.length) * 100,
      totalProfit,
    };
  }, [closedTrades]);
  
  return (
    <PageContainer
      title="Trade History"
      description="All your closed trades"
      actions={
        <Button variant="outline" onClick={() => exportTradesToCSV(closedTrades)}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      }
    >
      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <StatCard title="Total Trades" value={stats.totalTrades} />
          <StatCard
            title="Win Rate"
            value={`${stats.winRate.toFixed(0)}%`}
            description={`${stats.wins}W / ${stats.losses}L`}
          />
          <StatCard
            title="Total P&L"
            value={`${stats.totalProfit >= 0 ? '+' : ''}$${stats.totalProfit.toFixed(2)}`}
            variant={stats.totalProfit >= 0 ? 'success' : 'destructive'}
          />
          <StatCard
            title="Avg per Trade"
            value={`$${(stats.totalProfit / stats.totalTrades).toFixed(2)}`}
          />
        </div>
      )}
      
      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Trades</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : (
            <TradeHistoryTable trades={closedTrades || []} />
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
```

### Export to CSV

```tsx
// features/history/utils/exportTrades.ts
export function exportTradesToCSV(trades: Trade[]) {
  const headers = ['Ticker', 'Buy Date', 'Buy Price', 'Sell Date', 'Sell Price', 'Profit/Loss'];
  
  const rows = trades.map(trade => [
    trade.ticker,
    format(new Date(trade.buyDate), 'yyyy-MM-dd'),
    trade.buyPrice.toFixed(2),
    format(new Date(trade.sellDate), 'yyyy-MM-dd'),
    trade.sellPrice.toFixed(2),
    trade.profit.toFixed(2),
  ]);
  
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `trade-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
}
```

---

## 9. Summary

| Feature | Description |
|---------|-------------|
| **Suggestions** | Stocks from 2 filter methods (High Upside & Undervalued) |
| **Log Trade** | Manual entry after executing on third-party broker |
| **Open Trades** | Active positions with buy details |
| **Close Trade** | Log exit price and date |
| **Trade History** | Ticker, Buy Date, Buy Price, Sell Date, Sell Price, Profit/Loss |

### Key Reminders
- ❌ This app does NOT execute trades
- ✅ Users execute on their broker (Robinhood, TD Ameritrade, etc.)
- ✅ Users manually log trades here to track performance
- ✅ Trade history shows all 6 required columns
- ✅ Export to CSV available
