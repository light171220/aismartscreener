# Dashboard Feature Implementation

## 1. Overview

The Dashboard is the main landing page that displays a consolidated view of all screening results, live trades, and quick analytics.

## 2. Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            DASHBOARD                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    COMBINED RESULTS (9:35 AM)                    │    │
│  │  AI Screened + Filter Screened stocks ready to trade            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌──────────────────────────┐  ┌──────────────────────────┐            │
│  │    UNDERRATED STOCKS     │  │   100%+ UPSIDE STOCKS    │            │
│  │    (Below Low Target)    │  │  (High Target Potential) │            │
│  │    Top 5 by diff %       │  │    Top 5 by diff %       │            │
│  └──────────────────────────┘  └──────────────────────────┘            │
│                                                                          │
│  ┌──────────────────────────┐  ┌──────────────────────────┐            │
│  │      OPEN TRADES         │  │    TODAY'S CLOSED        │            │
│  │   Current positions      │  │   Realized P&L           │            │
│  └──────────────────────────┘  └──────────────────────────┘            │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     QUICK STATS                                  │    │
│  │  Total P/L: $XXX | Success Rate: XX% | Open Positions: X        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. Data Requirements

### Combined Results (9:35 AM)
- Source: AI Screening + Filter Screening
- Update: Auto-refresh at 9:35 AM ET on weekdays
- Manual refresh available

### Underrated Stocks
- Query: Stocks where `lastPrice < lowTargetPrice`
- Sorted by: `(lowTargetPrice - lastPrice) / lowTargetPrice DESC`
- Limit: Top 5
- Update: 9:00 AM ET daily

### 100%+ Upside Stocks
- Query: Stocks where `(avgTargetPrice - lastPrice) / lastPrice >= 1.0`
- Sorted by: Upside percentage DESC
- Limit: Top 5
- Update: 9:00 AM ET daily

## 4. Implementation

### Dashboard Page Component

```tsx
// features/dashboard/components/DashboardPage.tsx
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/amplify-client';
import { CombinedResults } from './CombinedResults';
import { UnderratedStocks } from './UnderratedStocks';
import { UpsideStocks } from './UpsideStocks';
import { OpenTradesWidget } from './OpenTradesWidget';
import { ClosedTodayWidget } from './ClosedTodayWidget';
import { QuickStats } from './QuickStats';

export function DashboardPage() {
  const today = new Date().toISOString().split('T')[0];
  
  // Fetch combined screening results
  const { data: screenedStocks, isLoading: loadingScreened } = useQuery({
    queryKey: ['screened-stocks', today],
    queryFn: async () => {
      const result = await client.models.ScreenedStock.list({
        filter: {
          screenDate: { eq: today },
          suggested935: { eq: true },
        },
      });
      return result.data;
    },
    refetchInterval: 60_000, // Refetch every minute
  });
  
  // Fetch underrated stocks (below low target)
  const { data: underratedStocks, isLoading: loadingUnderrated } = useQuery({
    queryKey: ['filter-stocks', 'underrated', today],
    queryFn: async () => {
      const result = await client.models.FilteredStock.list({
        filter: {
          screenDate: { eq: today },
          belowLowTargetPct: { gt: 0 },
        },
      });
      return result.data
        ?.sort((a, b) => (b.belowLowTargetPct || 0) - (a.belowLowTargetPct || 0))
        .slice(0, 5);
    },
  });
  
  // Fetch high upside stocks
  const { data: upsideStocks, isLoading: loadingUpside } = useQuery({
    queryKey: ['filter-stocks', 'upside', today],
    queryFn: async () => {
      const result = await client.models.FilteredStock.list({
        filter: {
          screenDate: { eq: today },
          upsidePct: { gte: 100 },
        },
      });
      return result.data
        ?.sort((a, b) => (b.upsidePct || 0) - (a.upsidePct || 0))
        .slice(0, 5);
    },
  });
  
  // Fetch open trades
  const { data: openTrades } = useQuery({
    queryKey: ['trades', 'open'],
    queryFn: async () => {
      const result = await client.models.Trade.list({
        filter: { status: { eq: 'OPEN' } },
      });
      return result.data;
    },
  });
  
  // Fetch today's closed trades
  const { data: closedToday } = useQuery({
    queryKey: ['trades', 'closed', today],
    queryFn: async () => {
      const result = await client.models.Trade.list({
        filter: {
          status: { eq: 'CLOSED' },
          sellDate: { eq: today },
        },
      });
      return result.data;
    },
  });
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {formatDate(today, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <MarketStatusBadge />
          <Button variant="outline" onClick={refreshAll}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <QuickStats 
        openTrades={openTrades || []}
        closedToday={closedToday || []}
      />
      
      {/* Combined Results - Full Width */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Combined Results (9:35 AM)
              </CardTitle>
              <CardDescription>
                AI + Filter screened stocks ready to trade
              </CardDescription>
            </div>
            <Badge variant="outline">
              {screenedStocks?.length || 0} stocks
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loadingScreened ? (
            <TableSkeleton rows={5} />
          ) : (
            <CombinedResults stocks={screenedStocks || []} />
          )}
        </CardContent>
      </Card>
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Underrated Stocks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-blue-500" />
              Underrated Stocks
            </CardTitle>
            <CardDescription>
              Trading below analyst low target
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUnderrated ? (
              <TableSkeleton rows={5} />
            ) : (
              <UnderratedStocks stocks={underratedStocks || []} />
            )}
          </CardContent>
        </Card>
        
        {/* 100%+ Upside */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-green-500" />
              100%+ Upside Potential
            </CardTitle>
            <CardDescription>
              High target price relative to current
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUpside ? (
              <TableSkeleton rows={5} />
            ) : (
              <UpsideStocks stocks={upsideStocks || []} />
            )}
          </CardContent>
        </Card>
        
        {/* Open Trades Widget */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-500" />
                Open Trades
              </CardTitle>
              <Link to="/trades">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <OpenTradesWidget trades={openTrades || []} />
          </CardContent>
        </Card>
        
        {/* Closed Today Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              Closed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ClosedTodayWidget trades={closedToday || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### Quick Stats Component

```tsx
// features/dashboard/components/QuickStats.tsx
interface QuickStatsProps {
  openTrades: Trade[];
  closedToday: Trade[];
}

export function QuickStats({ openTrades, closedToday }: QuickStatsProps) {
  const totalOpenValue = openTrades.reduce(
    (sum, t) => sum + t.buyPrice * t.quantity,
    0
  );
  
  const todayPL = closedToday.reduce(
    (sum, t) => sum + (t.profit || 0),
    0
  );
  
  const todayWinRate = closedToday.length > 0
    ? (closedToday.filter((t) => (t.profit || 0) > 0).length / closedToday.length) * 100
    : 0;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="Open Positions"
        value={openTrades.length}
        icon={<Briefcase className="w-5 h-5" />}
        description={`$${totalOpenValue.toLocaleString()} invested`}
      />
      <StatCard
        title="Today's P&L"
        value={`${todayPL >= 0 ? '+' : ''}$${todayPL.toFixed(2)}`}
        icon={<DollarSign className="w-5 h-5" />}
        variant={todayPL >= 0 ? 'success' : 'destructive'}
        description={`${closedToday.length} trades closed`}
      />
      <StatCard
        title="Today's Win Rate"
        value={`${todayWinRate.toFixed(0)}%`}
        icon={<Target className="w-5 h-5" />}
        variant={todayWinRate >= 50 ? 'success' : 'warning'}
      />
      <StatCard
        title="Market Status"
        value={<MarketStatus />}
        icon={<Clock className="w-5 h-5" />}
      />
    </div>
  );
}
```

### Combined Results Table

```tsx
// features/dashboard/components/CombinedResults.tsx
const columns: ColumnDef<ScreenedStock>[] = [
  {
    accessorKey: 'ticker',
    header: 'Ticker',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-bold">{row.getValue('ticker')}</span>
        {row.original.screenType === 'AI_SCREENER' && (
          <Badge variant="outline" className="text-xs">AI</Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'lastPrice',
    header: 'Price',
    cell: ({ row }) => `${row.getValue<number>('lastPrice')?.toFixed(2)}`,
  },
  // ═══ PREVIOUS CLOSE & GAP (Planned) ═══
  {
    accessorKey: 'previousClose',
    header: 'Prev Close',
    cell: ({ row }) => {
      const prevClose = row.original.previousClose;
      const gapPct = row.original.gapFromClosePercent;
      if (!prevClose) return '-';
      return (
        <div className="flex flex-col">
          <span className="font-mono">${prevClose.toFixed(2)}</span>
          {gapPct && (
            <span className={cn(
              "text-xs",
              gapPct >= 0 ? "text-emerald-400" : "text-red-400"
            )}>
              {gapPct >= 0 ? '+' : ''}{gapPct.toFixed(1)}% gap
            </span>
          )}
        </div>
      );
    },
  },
  // ═══ AVERAGE TARGET & GROWTH (Implemented) ═══
  {
    accessorKey: 'avgTarget',
    header: 'Avg Target',
    cell: ({ row }) => {
      const target1 = row.original.suggestedTarget1;
      const target2 = row.original.suggestedTarget2;
      const currentPrice = row.original.lastPrice;
      if (!target1 || !target2) return '-';
      
      const avgTarget = (target1 + target2) / 2;
      const growthPct = ((avgTarget - currentPrice) / currentPrice) * 100;
      
      return (
        <div className="flex flex-col">
          <span className="font-mono text-emerald-400">${avgTarget.toFixed(2)}</span>
          <span className="text-xs text-emerald-400">+{growthPct.toFixed(1)}%</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'setupType',
    header: 'Setup',
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.getValue<string>('setupType')?.replace('_', ' ')}
      </Badge>
    ),
  },
  {
    accessorKey: 'setupQuality',
    header: 'Quality',
    cell: ({ row }) => {
      const quality = row.getValue<string>('setupQuality');
      return (
        <Badge 
          variant={quality === 'A+' ? 'success' : quality === 'B' ? 'default' : 'secondary'}
        >
          {quality}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'catalyst',
    header: 'Catalyst',
    cell: ({ row }) => (
      <span className="text-sm truncate max-w-[200px]">
        {row.getValue('catalyst')}
      </span>
    ),
  },
  // ═══ 52W PRICE RANGE (Planned) ═══
  {
    accessorKey: 'priceRange52W',
    header: '52W Range',
    cell: ({ row }) => {
      const low = row.original.priceRange52WLow;
      const high = row.original.priceRange52WHigh;
      const current = row.original.lastPrice;
      if (!low || !high) return '-';
      
      const position = ((current - low) / (high - low)) * 100;
      
      return (
        <div className="w-24">
          <div className="h-1.5 bg-slate-700 rounded-full relative">
            <div 
              className="absolute h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 rounded-full"
              style={{ width: '100%' }}
            />
            <div 
              className="absolute w-2 h-2 bg-white rounded-full -top-0.5 border border-slate-600"
              style={{ left: `${Math.min(100, Math.max(0, position))}%`, transform: 'translateX(-50%)' }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-0.5">
            <span>${low.toFixed(0)}</span>
            <span>${high.toFixed(0)}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'riskReward',
    header: 'R:R',
    cell: ({ row }) => row.getValue('riskReward') || '-',
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button 
          size="sm" 
          onClick={() => handleAddToWatchlist(row.original)}
        >
          Watch
        </Button>
        <Button 
          size="sm" 
          variant="default"
          onClick={() => handleQuickTrade(row.original)}
        >
          Trade
        </Button>
      </div>
    ),
  },
];

export function CombinedResults({ stocks }: { stocks: ScreenedStock[] }) {
  const table = useReactTable({
    data: stocks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  
  if (stocks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No stocks screened yet today.</p>
        <p className="text-sm">Results will appear at 9:35 AM ET.</p>
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## 5. Real-time Updates

```tsx
// Subscribe to screening updates
useEffect(() => {
  const subscription = client.models.ScreenedStock.observeQuery({
    filter: { screenDate: { eq: today } },
  }).subscribe({
    next: ({ items }) => {
      queryClient.setQueryData(['screened-stocks', today], items);
    },
  });
  
  return () => subscription.unsubscribe();
}, [today]);
```

## 6. Auto-Refresh Logic

```tsx
// Auto-refresh at specific times
useEffect(() => {
  const checkRefreshTime = () => {
    const now = new Date();
    const etTime = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).format(now);
    
    const [hour, minute] = etTime.split(':').map(Number);
    
    // Refresh at 9:00, 9:35, 10:00, 10:30, 11:00
    const refreshTimes = [
      [9, 0], [9, 35], [10, 0], [10, 30], [11, 0]
    ];
    
    if (refreshTimes.some(([h, m]) => h === hour && m === minute)) {
      queryClient.invalidateQueries(['screened-stocks']);
      queryClient.invalidateQueries(['filter-stocks']);
    }
  };
  
  const interval = setInterval(checkRefreshTime, 60_000);
  return () => clearInterval(interval);
}, []);
```

## 7. Market Status Component

```tsx
function MarketStatus() {
  const [status, setStatus] = useState<'pre' | 'open' | 'closed'>('closed');
  
  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const etTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
        weekday: 'short',
      }).format(now);
      
      const [weekday, time] = etTime.split(' ');
      const [hour, minute] = time.split(':').map(Number);
      const totalMinutes = hour * 60 + minute;
      
      // Check if weekend
      if (['Sat', 'Sun'].includes(weekday)) {
        setStatus('closed');
        return;
      }
      
      // Pre-market: 4:00 AM - 9:30 AM ET
      if (totalMinutes >= 240 && totalMinutes < 570) {
        setStatus('pre');
      }
      // Market hours: 9:30 AM - 4:00 PM ET
      else if (totalMinutes >= 570 && totalMinutes < 960) {
        setStatus('open');
      }
      // Closed
      else {
        setStatus('closed');
      }
    };
    
    updateStatus();
    const interval = setInterval(updateStatus, 60_000);
    return () => clearInterval(interval);
  }, []);
  
  const statusConfig = {
    pre: { label: 'Pre-Market', color: 'bg-yellow-500' },
    open: { label: 'Market Open', color: 'bg-green-500' },
    closed: { label: 'Market Closed', color: 'bg-gray-500' },
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className={cn('w-2 h-2 rounded-full animate-pulse', statusConfig[status].color)} />
      <span className="text-sm">{statusConfig[status].label}</span>
    </div>
  );
}
```
