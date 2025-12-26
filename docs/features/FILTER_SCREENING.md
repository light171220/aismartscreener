# Filter-Based Screening Feature Implementation

## 1. Overview

The Filter-Based Screening feature provides a rule-based, quantitative approach to stock screening without relying on AI. Users can define custom criteria and the system will filter stocks accordingly.

## 2. Screening Queries

### Query 1: High Upside Potential (100%+ Target)

**Description:** Find stocks where average analyst target price is ≥100% higher than current price.

**Criteria:**
| Parameter | Min | Max | Type |
|-----------|-----|-----|------|
| Avg target vs current price | 100% | - | Percentage |
| Analyst coverage | 3 | - | Count |
| Rating | Hold | Strong Buy | Enum |
| Market cap | $1B | $1.5B | USD |
| Price | $2.50 | $60.50 | USD |

### Query 2: Undervalued Stocks (Below Low Target)

**Description:** Find stocks where current price is below the lowest analyst target.

**Criteria:**
| Parameter | Min | Max | Type |
|-----------|-----|-----|------|
| Price vs low target | 1% below | - | Percentage |
| Analyst coverage | 3 | 100 | Count |
| Rating | Hold | Strong Buy | Enum |
| Market cap | $1B | $1.5B | USD |
| Price | $2.50 | $60 | USD |

## 3. Data Schema

### Filter Criteria Model
```typescript
interface FilterCriteria {
  id: string;
  name: string;
  description: string;
  
  // Price filters
  minPrice: number;
  maxPrice: number;
  
  // Target price filters
  minUpsidePct?: number;      // Avg target vs current
  maxUpsidePct?: number;
  minBelowLowTarget?: number; // Current vs low target
  
  // Analyst filters
  minAnalystCoverage: number;
  maxAnalystCoverage?: number;
  minRating: 'SELL' | 'HOLD' | 'BUY' | 'STRONG_BUY';
  
  // Market cap filters
  minMarketCap: number;
  maxMarketCap: number;
  
  // Volume filters
  minAvgVolume?: number;
  minRelativeVolume?: number;
  
  // Technical filters
  aboveVWAP?: boolean;
  above50DMA?: boolean;
  above200DMA?: boolean;
  
  // Scheduling
  runTime: string; // "09:00" (ET)
  runDays: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI')[];
  autoRun: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  userId: string;
}
```

### Screened Result Model
```typescript
interface FilteredStock {
  ticker: string;
  companyName: string;
  lastPrice: number;
  avgTargetPrice: number;
  lowTargetPrice: number;
  highTargetPrice: number;
  upsidePct: number;         // (avgTarget - lastPrice) / lastPrice * 100
  belowLowTargetPct: number; // (lowTarget - lastPrice) / lowTarget * 100
  analystCoverage: number;
  buyRating: string;
  marketCap: number;
  avgVolume: number;
  screenDate: string;
  criteriaId: string;
}
```

## 4. Backend Implementation

### amplify/data/resource.ts
```typescript
// Add to existing schema

FilterCriteria: a
  .model({
    name: a.string().required(),
    description: a.string(),
    minPrice: a.float().default(2.5),
    maxPrice: a.float().default(60),
    minUpsidePct: a.float(),
    minBelowLowTarget: a.float(),
    minAnalystCoverage: a.integer().default(3),
    maxAnalystCoverage: a.integer(),
    minRating: a.enum(['SELL', 'HOLD', 'BUY', 'STRONG_BUY']).default('HOLD'),
    minMarketCap: a.float().default(1_000_000_000),
    maxMarketCap: a.float().default(1_500_000_000),
    minAvgVolume: a.integer(),
    minRelativeVolume: a.float(),
    aboveVWAP: a.boolean(),
    above50DMA: a.boolean(),
    above200DMA: a.boolean(),
    runTime: a.string().default('09:00'),
    runDays: a.string().array(),
    autoRun: a.boolean().default(false),
  })
  .authorization((allow) => [allow.owner()]),

FilteredStock: a
  .model({
    ticker: a.string().required(),
    companyName: a.string(),
    lastPrice: a.float().required(),
    avgTargetPrice: a.float(),
    lowTargetPrice: a.float(),
    highTargetPrice: a.float(),
    upsidePct: a.float(),
    belowLowTargetPct: a.float(),
    analystCoverage: a.integer(),
    buyRating: a.string(),
    marketCap: a.float(),
    avgVolume: a.integer(),
    screenDate: a.date().required(),
    criteriaId: a.string().required(),
  })
  .authorization((allow) => [
    allow.authenticated().to(['read']),
    allow.group('admin').to(['create', 'update', 'delete']),
  ]),

// Custom query for on-demand screening
runFilterScreen: a
  .query()
  .arguments({
    criteriaId: a.string().required(),
  })
  .returns(a.ref('FilteredStock').array())
  .handler(a.handler.function('filterScreener'))
  .authorization((allow) => [allow.authenticated()]),
```

### amplify/functions/filter-screener/handler.ts
```typescript
import { PolygonClient } from '../lib/polygon-client';

interface ScreenerInput {
  criteriaId: string;
}

export const handler = async (event: { arguments: ScreenerInput }) => {
  const { criteriaId } = event.arguments;
  
  // 1. Get criteria from DynamoDB
  const criteria = await getCriteria(criteriaId);
  
  if (!criteria) {
    throw new Error(`Criteria ${criteriaId} not found`);
  }
  
  // 2. Fetch market data from Polygon
  const polygon = new PolygonClient();
  const allStocks = await polygon.getMarketSnapshot();
  
  // 3. Get ticker details for market cap
  const stocksWithDetails = await Promise.all(
    allStocks.slice(0, 500).map(async (stock) => {
      try {
        const details = await polygon.getTickerDetails(stock.ticker);
        return { ...stock, ...details };
      } catch {
        return null;
      }
    })
  );
  
  const validStocks = stocksWithDetails.filter(Boolean);
  
  // 4. Apply filters
  const filtered = validStocks.filter((stock) => {
    const price = stock.day?.c || stock.prevDay?.c;
    
    // Price filter
    if (price < criteria.minPrice || price > criteria.maxPrice) {
      return false;
    }
    
    // Market cap filter
    if (stock.market_cap) {
      if (stock.market_cap < criteria.minMarketCap) return false;
      if (criteria.maxMarketCap && stock.market_cap > criteria.maxMarketCap) {
        return false;
      }
    }
    
    // Volume filter
    if (criteria.minAvgVolume && stock.prevDay?.v < criteria.minAvgVolume) {
      return false;
    }
    
    // Relative volume filter
    if (criteria.minRelativeVolume) {
      const relVol = (stock.day?.v || 0) / (stock.prevDay?.v || 1);
      if (relVol < criteria.minRelativeVolume) return false;
    }
    
    return true;
  });
  
  // 5. Fetch analyst data (would need Benzinga or similar)
  // For now, using mock data or external API
  const withAnalyst = await enrichWithAnalystData(filtered);
  
  // 6. Apply analyst filters
  const analystFiltered = withAnalyst.filter((stock) => {
    if (stock.analystCoverage < criteria.minAnalystCoverage) {
      return false;
    }
    
    if (criteria.maxAnalystCoverage && 
        stock.analystCoverage > criteria.maxAnalystCoverage) {
      return false;
    }
    
    // Rating filter
    const ratingOrder = ['SELL', 'HOLD', 'BUY', 'STRONG_BUY'];
    const minRatingIndex = ratingOrder.indexOf(criteria.minRating);
    const stockRatingIndex = ratingOrder.indexOf(stock.rating);
    if (stockRatingIndex < minRatingIndex) {
      return false;
    }
    
    // Upside filter
    if (criteria.minUpsidePct) {
      const upside = ((stock.avgTargetPrice - stock.lastPrice) / 
                      stock.lastPrice) * 100;
      if (upside < criteria.minUpsidePct) return false;
    }
    
    // Below low target filter
    if (criteria.minBelowLowTarget) {
      const belowLow = ((stock.lowTargetPrice - stock.lastPrice) / 
                        stock.lowTargetPrice) * 100;
      if (belowLow < criteria.minBelowLowTarget) return false;
    }
    
    return true;
  });
  
  // 7. Sort by upside potential (descending)
  const sorted = analystFiltered.sort((a, b) => {
    const upsideA = ((a.avgTargetPrice - a.lastPrice) / a.lastPrice) * 100;
    const upsideB = ((b.avgTargetPrice - b.lastPrice) / b.lastPrice) * 100;
    return upsideB - upsideA;
  });
  
  // 8. Take top 10
  const top10 = sorted.slice(0, 10);
  
  // 9. Store results
  const today = new Date().toISOString().split('T')[0];
  
  for (const stock of top10) {
    await storeFilteredStock({
      ticker: stock.ticker,
      companyName: stock.name,
      lastPrice: stock.lastPrice,
      avgTargetPrice: stock.avgTargetPrice,
      lowTargetPrice: stock.lowTargetPrice,
      highTargetPrice: stock.highTargetPrice,
      upsidePct: ((stock.avgTargetPrice - stock.lastPrice) / 
                  stock.lastPrice) * 100,
      belowLowTargetPct: ((stock.lowTargetPrice - stock.lastPrice) / 
                          stock.lowTargetPrice) * 100,
      analystCoverage: stock.analystCoverage,
      buyRating: stock.rating,
      marketCap: stock.market_cap,
      avgVolume: stock.prevDay?.v,
      screenDate: today,
      criteriaId,
    });
  }
  
  return top10;
};
```

## 5. Frontend Implementation

### Filter Form Component

```tsx
// features/filter-screener/components/FilterForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const filterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  minPrice: z.number().min(0).default(2.5),
  maxPrice: z.number().min(0).default(60),
  minUpsidePct: z.number().min(0).optional(),
  minBelowLowTarget: z.number().min(0).optional(),
  minAnalystCoverage: z.number().min(1).default(3),
  minRating: z.enum(['SELL', 'HOLD', 'BUY', 'STRONG_BUY']).default('HOLD'),
  minMarketCap: z.number().min(0).default(1_000_000_000),
  maxMarketCap: z.number().min(0).default(1_500_000_000),
  autoRun: z.boolean().default(false),
  runTime: z.string().optional(),
});

type FilterFormData = z.infer<typeof filterSchema>;

export function FilterForm({ 
  onSubmit, 
  defaultValues 
}: { 
  onSubmit: (data: FilterFormData) => void;
  defaultValues?: Partial<FilterFormData>;
}) {
  const form = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      name: '',
      minPrice: 2.5,
      maxPrice: 60,
      minAnalystCoverage: 3,
      minRating: 'HOLD',
      minMarketCap: 1_000_000_000,
      maxMarketCap: 1_500_000_000,
      autoRun: false,
      ...defaultValues,
    },
  });
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Price Range */}
        <FormField
          control={form.control}
          name="minPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Price ($)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="maxPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Price ($)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        {/* Market Cap Range */}
        <FormField
          control={form.control}
          name="minMarketCap"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Market Cap ($)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="1000000" 
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
              <FormLabel>Max Market Cap ($)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="1000000" 
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
        
        {/* Upside Potential */}
        <FormField
          control={form.control}
          name="minUpsidePct"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Upside Potential (%)</FormLabel>
              <FormControl>
                <Input type="number" step="1" {...field} />
              </FormControl>
              <FormDescription>
                Avg target price vs current price
              </FormDescription>
            </FormItem>
          )}
        />
        
        {/* Analyst Coverage */}
        <FormField
          control={form.control}
          name="minAnalystCoverage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Analyst Coverage</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        {/* Rating */}
        <FormField
          control={form.control}
          name="minRating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Rating</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SELL">Sell</SelectItem>
                  <SelectItem value="HOLD">Hold</SelectItem>
                  <SelectItem value="BUY">Buy</SelectItem>
                  <SelectItem value="STRONG_BUY">Strong Buy</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Includes this rating and higher
              </FormDescription>
            </FormItem>
          )}
        />
      </div>
      
      {/* Auto-run toggle */}
      <FormField
        control={form.control}
        name="autoRun"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2">
            <FormControl>
              <Switch 
                checked={field.value} 
                onCheckedChange={field.onChange} 
              />
            </FormControl>
            <FormLabel>Auto-run at 9:00 AM ET on weekdays</FormLabel>
          </FormItem>
        )}
      />
      
      <div className="flex gap-2">
        <Button type="submit">Save Criteria</Button>
        <Button type="button" variant="secondary" onClick={handleRunNow}>
          Run Now
        </Button>
      </div>
    </form>
  );
}
```

### Results Table Component

```tsx
// features/filter-screener/components/FilterResults.tsx
import { useMemo } from 'react';
import { 
  useReactTable, 
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';

const columns: ColumnDef<FilteredStock>[] = [
  {
    accessorKey: 'ticker',
    header: 'Ticker',
    cell: ({ row }) => (
      <span className="font-bold">{row.getValue('ticker')}</span>
    ),
  },
  {
    accessorKey: 'companyName',
    header: 'Company',
  },
  {
    accessorKey: 'lastPrice',
    header: 'Price',
    cell: ({ row }) => `$${row.getValue<number>('lastPrice').toFixed(2)}`,
  },
  {
    accessorKey: 'avgTargetPrice',
    header: 'Avg Target',
    cell: ({ row }) => `$${row.getValue<number>('avgTargetPrice').toFixed(2)}`,
  },
  {
    accessorKey: 'upsidePct',
    header: 'Upside %',
    cell: ({ row }) => {
      const value = row.getValue<number>('upsidePct');
      return (
        <Badge variant={value >= 100 ? 'success' : 'secondary'}>
          +{value.toFixed(1)}%
        </Badge>
      );
    },
  },
  {
    accessorKey: 'analystCoverage',
    header: 'Analysts',
  },
  {
    accessorKey: 'buyRating',
    header: 'Rating',
    cell: ({ row }) => {
      const rating = row.getValue<string>('buyRating');
      const variant = rating === 'STRONG_BUY' ? 'success' : 
                      rating === 'BUY' ? 'default' : 'secondary';
      return <Badge variant={variant}>{rating}</Badge>;
    },
  },
  {
    accessorKey: 'marketCap',
    header: 'Market Cap',
    cell: ({ row }) => formatMarketCap(row.getValue<number>('marketCap')),
  },
];

export function FilterResults({ stocks }: { stocks: FilteredStock[] }) {
  const table = useReactTable({
    data: stocks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
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
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

## 6. Preset Filters

### Default Filter Templates
```typescript
const PRESET_FILTERS = {
  highUpside: {
    name: 'High Upside (100%+)',
    minUpsidePct: 100,
    minAnalystCoverage: 3,
    minRating: 'HOLD',
    minMarketCap: 1_000_000_000,
    maxMarketCap: 1_500_000_000,
    minPrice: 2.5,
    maxPrice: 60,
  },
  undervalued: {
    name: 'Undervalued (Below Low Target)',
    minBelowLowTarget: 1,
    minAnalystCoverage: 3,
    minRating: 'HOLD',
    minMarketCap: 1_000_000_000,
    maxMarketCap: 1_500_000_000,
    minPrice: 2.5,
    maxPrice: 60,
  },
  smallCapValue: {
    name: 'Small Cap Value',
    minUpsidePct: 50,
    minAnalystCoverage: 2,
    minRating: 'BUY',
    minMarketCap: 100_000_000,
    maxMarketCap: 500_000_000,
    minPrice: 5,
    maxPrice: 30,
  },
};
```

## 7. Comparison with AI Screening

| Feature | Filter Screening | AI Screening |
|---------|------------------|--------------|
| Speed | Fast (seconds) | Slower (AI inference) |
| Cost | Polygon only | Polygon + Bedrock |
| Customization | User-defined criteria | Predefined prompts |
| Subjectivity | Objective rules | AI interpretation |
| Best For | Quantitative filters | Qualitative analysis |
| Updates | Manual or scheduled | Time-based (8:45, 9:15, 9:35) |
