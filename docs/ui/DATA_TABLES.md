# Data Tables Component

## 1. Overview

Data tables are used throughout the application to display stocks, trades, and history. Built with TanStack Table (react-table) for powerful features.

## 2. Features

- Sorting (single and multi-column)
- Filtering (global and column-specific)
- Pagination
- Row selection
- Column visibility toggle
- Column resizing
- Row expansion
- Virtual scrolling for large datasets

## 3. Base Table Component

```tsx
// components/ui/data-table.tsx
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  showPagination?: boolean;
  showColumnToggle?: boolean;
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
  showPagination = true,
  showColumnToggle = true,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });
  
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        {searchKey && (
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
            onChange={(e) =>
              table.getColumn(searchKey)?.setFilterValue(e.target.value)
            }
            className="max-w-sm"
          />
        )}
        
        {showColumnToggle && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          'flex items-center gap-2',
                          header.column.getCanSort() && 'cursor-pointer select-none'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <SortingIndicator column={header.column} />
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onRowClick?.(row.original)}
                  className={onRowClick ? 'cursor-pointer hover:bg-muted' : ''}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <div className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </div>
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
      )}
    </div>
  );
}

function SortingIndicator({ column }: { column: any }) {
  if (!column.getIsSorted()) {
    return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
  }
  
  return column.getIsSorted() === 'asc' ? (
    <ArrowUp className="h-4 w-4" />
  ) : (
    <ArrowDown className="h-4 w-4" />
  );
}
```

## 4. Screened Stocks Table

```tsx
// features/dashboard/components/ScreenedStocksTable.tsx
const columns: ColumnDef<ScreenedStock>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'ticker',
    header: 'Ticker',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-bold text-primary">
          {row.getValue('ticker')}
        </span>
        {row.original.screenType === 'AI_SCREENER' && (
          <Badge variant="outline" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            AI
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'companyName',
    header: 'Company',
    cell: ({ row }) => (
      <span className="text-muted-foreground truncate max-w-[200px]">
        {row.getValue('companyName')}
      </span>
    ),
  },
  {
    accessorKey: 'lastPrice',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('lastPrice'));
      return <span className="font-mono">${price.toFixed(2)}</span>;
    },
  },
  {
    accessorKey: 'gapPercent',
    header: 'Gap %',
    cell: ({ row }) => {
      const gap = row.getValue<number>('gapPercent');
      if (!gap) return '-';
      return (
        <Badge variant={gap >= 0 ? 'success' : 'destructive'}>
          {gap >= 0 ? '+' : ''}{gap.toFixed(2)}%
        </Badge>
      );
    },
  },
  {
    accessorKey: 'setupType',
    header: 'Setup',
    cell: ({ row }) => {
      const setup = row.getValue<string>('setupType');
      return (
        <Badge variant="secondary">
          {setup?.replace('_', ' ') || '-'}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'setupQuality',
    header: 'Quality',
    cell: ({ row }) => {
      const quality = row.getValue<string>('setupQuality');
      const variant = quality === 'A+' ? 'success' : 
                      quality === 'B' ? 'default' : 'secondary';
      return <Badge variant={variant}>{quality || '-'}</Badge>;
    },
  },
  {
    accessorKey: 'catalyst',
    header: 'Catalyst',
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="text-left">
            <span className="truncate max-w-[150px] block">
              {row.getValue('catalyst') || '-'}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{row.getValue('catalyst')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: 'riskReward',
    header: 'R:R',
    cell: ({ row }) => {
      const rr = row.getValue<string>('riskReward');
      return <span className="font-mono">{rr || '-'}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const stock = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetails(stock)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddToWatchlist(stock)}>
              <Star className="mr-2 h-4 w-4" />
              Add to Watchlist
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleQuickTrade(stock)}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Quick Trade
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function ScreenedStocksTable({ stocks }: { stocks: ScreenedStock[] }) {
  return (
    <DataTable
      columns={columns}
      data={stocks}
      searchKey="ticker"
      searchPlaceholder="Search by ticker..."
    />
  );
}
```

## 5. Trades Table

```tsx
// features/trades/components/TradesTable.tsx
const tradeColumns: ColumnDef<Trade>[] = [
  {
    accessorKey: 'ticker',
    header: 'Ticker',
    cell: ({ row }) => (
      <span className="font-bold">{row.getValue('ticker')}</span>
    ),
  },
  {
    accessorKey: 'quantity',
    header: 'Qty',
    cell: ({ row }) => (
      <span className="font-mono">{row.getValue('quantity')}</span>
    ),
  },
  {
    accessorKey: 'buyPrice',
    header: 'Entry',
    cell: ({ row }) => (
      <span className="font-mono">
        ${row.getValue<number>('buyPrice').toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: 'buyDate',
    header: 'Date',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {format(new Date(row.getValue('buyDate')), 'MMM d, yyyy')}
      </span>
    ),
  },
  {
    accessorKey: 'stopLoss',
    header: 'Stop',
    cell: ({ row }) => (
      <span className="font-mono text-red-500">
        ${row.getValue<number>('stopLoss').toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: 'targetPrice',
    header: 'Target',
    cell: ({ row }) => (
      <span className="font-mono text-green-500">
        ${row.getValue<number>('targetPrice').toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue<string>('status');
      return (
        <Badge variant={status === 'OPEN' ? 'default' : 'secondary'}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'profit',
    header: 'P&L',
    cell: ({ row }) => {
      const profit = row.getValue<number>('profit');
      if (profit === null || profit === undefined) return '-';
      return (
        <span className={cn(
          'font-mono font-bold',
          profit >= 0 ? 'text-green-500' : 'text-red-500'
        )}>
          {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
        </span>
      );
    },
  },
];
```

## 6. Virtual Table for Large Datasets

```tsx
// components/ui/virtual-table.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualTable<TData>({
  data,
  columns,
  estimatedRowHeight = 52,
}: {
  data: TData[];
  columns: ColumnDef<TData>[];
  estimatedRowHeight?: number;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  
  const { rows } = table.getRowModel();
  
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: 10,
  });
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          {/* Header rows */}
        </TableHeader>
        <TableBody>
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <TableRow
                  key={row.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {/* Row cells */}
                </TableRow>
              );
            })}
          </div>
        </TableBody>
      </Table>
    </div>
  );
}
```

## 7. Table Skeleton Loading

```tsx
// components/ui/table-skeleton.tsx
export function TableSkeleton({ 
  rows = 5, 
  columns = 6 
}: { 
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: columns }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-full" />
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

## 8. Responsive Table

On mobile, tables transform to card view:

```tsx
// components/ui/responsive-table.tsx
export function ResponsiveTable<TData>({ 
  data, 
  columns,
  mobileCardComponent: MobileCard,
}: {
  data: TData[];
  columns: ColumnDef<TData>[];
  mobileCardComponent: React.ComponentType<{ data: TData }>;
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (isMobile) {
    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <MobileCard key={index} data={item} />
        ))}
      </div>
    );
  }
  
  return <DataTable data={data} columns={columns} />;
}
```

---

## 9. AI Screening Result Table (Final Results)

Table for stocks that passed BOTH Method 1 and Method 2 screening.

```tsx
// features/ai-screener/components/AIScreeningResultsTable.tsx
const aiScreeningColumns: ColumnDef<AIScreeningResult>[] = [
  {
    accessorKey: 'ticker',
    header: 'Ticker',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-bold text-white">{row.getValue('ticker')}</span>
        <GlassBadge variant="success" size="sm">
          <Sparkles className="w-3 h-3 mr-1" />
          A+
        </GlassBadge>
      </div>
    ),
  },
  {
    accessorKey: 'currentPrice',
    header: 'Price',
    cell: ({ row }) => (
      <span className="font-mono text-white">
        ${row.getValue<number>('currentPrice')?.toFixed(2)}
      </span>
    ),
  },
  // Last Closing Price (Planned)
  {
    accessorKey: 'previousClose',
    header: 'Prev Close',
    cell: ({ row }) => {
      const prevClose = row.getValue<number>('previousClose');
      const gapPct = row.original.gapFromClosePercent;
      return prevClose ? (
        <div className="text-right">
          <span className="font-mono text-slate-300">${prevClose.toFixed(2)}</span>
          {gapPct !== undefined && (
            <span className={cn(
              'ml-1 text-xs',
              gapPct >= 0 ? 'text-emerald-400' : 'text-red-400'
            )}>
              ({gapPct >= 0 ? '+' : ''}{gapPct.toFixed(1)}%)
            </span>
          )}
        </div>
      ) : <span className="text-slate-500">-</span>;
    },
  },
  // Average Target Price & Growth % (Implemented)
  {
    accessorKey: 'avgTargetPrice',
    header: 'Avg Target',
    cell: ({ row }) => {
      const target1 = row.original.suggestedTarget1;
      const target2 = row.original.suggestedTarget2;
      const avgTarget = target1 && target2 ? (target1 + target2) / 2 : target1 || target2;
      const currentPrice = row.original.currentPrice;
      const growthPct = avgTarget && currentPrice 
        ? ((avgTarget - currentPrice) / currentPrice) * 100 
        : null;
      
      return avgTarget ? (
        <div className="text-right">
          <span className="font-mono text-emerald-400">${avgTarget.toFixed(2)}</span>
          {growthPct !== null && (
            <p className="text-xs text-emerald-400">+{growthPct.toFixed(1)}%</p>
          )}
        </div>
      ) : <span className="text-slate-500">-</span>;
    },
  },
  // 52-Week Range (Planned)
  {
    accessorKey: 'priceRanges',
    header: '52W Range',
    cell: ({ row }) => {
      const ranges = row.original.priceRanges;
      if (!ranges?.weeks52) return <span className="text-slate-500">-</span>;
      
      const { low, high } = ranges.weeks52;
      const current = row.original.currentPrice;
      const position = current ? ((current - low) / (high - low)) * 100 : null;
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="w-20">
                <div className="relative h-1.5 bg-slate-700/50 rounded-full">
                  {position !== null && (
                    <div 
                      className="absolute w-2 h-2 bg-blue-400 rounded-full -top-0.5"
                      style={{ left: `calc(${Math.min(Math.max(position, 0), 100)}% - 4px)` }}
                    />
                  )}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>${low.toFixed(0)}</span>
                  <span>${high.toFixed(0)}</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <p>5D: ${ranges.days5?.low.toFixed(2)} - ${ranges.days5?.high.toFixed(2)}</p>
                <p>30D: ${ranges.days30?.low.toFixed(2)} - ${ranges.days30?.high.toFixed(2)}</p>
                <p>52W: ${low.toFixed(2)} - ${high.toFixed(2)}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  // AI-Identified Entry (Planned)
  {
    accessorKey: 'aiIdentifiedLevels',
    header: 'AI Entry/Exit',
    cell: ({ row }) => {
      const levels = row.original.aiIdentifiedLevels;
      if (!levels) return <span className="text-slate-500">-</span>;
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="text-center">
                <p className="text-xs text-blue-400">${levels.entryPrice.toFixed(2)}</p>
                <p className="text-xs text-emerald-400">${levels.exitPrice.toFixed(2)}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <p className="text-blue-400">Entry: ${levels.entryPrice.toFixed(2)}</p>
                {levels.entryReason && <p className="text-slate-400">{levels.entryReason}</p>}
                <p className="text-emerald-400">Exit: ${levels.exitPrice.toFixed(2)}</p>
                {levels.exitReason && <p className="text-slate-400">{levels.exitReason}</p>}
                <p>Confidence: {levels.confidence}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: 'setupType',
    header: 'Setup',
    cell: ({ row }) => (
      <GlassBadge variant="primary">
        {row.getValue<string>('setupType')?.replace('_', ' ')}
      </GlassBadge>
    ),
  },
  {
    accessorKey: 'setupQuality',
    header: 'Quality',
    cell: ({ row }) => {
      const quality = row.getValue<string>('setupQuality');
      const variant = quality === 'A_PLUS' ? 'success' : 
                      quality === 'A' ? 'primary' : 
                      quality === 'B' ? 'warning' : 'default';
      return <GlassBadge variant={variant}>{quality?.replace('_', '+')}</GlassBadge>;
    },
  },
  {
    accessorKey: 'catalystType',
    header: 'Catalyst',
    cell: ({ row }) => {
      const catalyst = row.getValue<string>('catalystType');
      return catalyst ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <GlassBadge variant="info">{catalyst?.replace('_', ' ')}</GlassBadge>
            </TooltipTrigger>
            <TooltipContent>
              {row.original.catalystDescription}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : <span className="text-slate-500">-</span>;
    },
  },
  {
    accessorKey: 'suggestedEntry',
    header: 'Entry',
    cell: ({ row }) => (
      <span className="font-mono text-blue-400">
        ${row.getValue<number>('suggestedEntry')?.toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: 'suggestedStop',
    header: 'Stop',
    cell: ({ row }) => (
      <span className="font-mono text-red-400">
        ${row.getValue<number>('suggestedStop')?.toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: 'suggestedTarget1',
    header: 'Target',
    cell: ({ row }) => (
      <span className="font-mono text-emerald-400">
        ${row.getValue<number>('suggestedTarget1')?.toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: 'riskRewardRatio',
    header: 'R:R',
    cell: ({ row }) => {
      const rr = row.getValue<number>('riskRewardRatio');
      return (
        <span className={cn(
          'font-mono font-bold',
          rr >= 2 ? 'text-emerald-400' : rr >= 1.5 ? 'text-amber-400' : 'text-red-400'
        )}>
          {rr?.toFixed(2)}:1
        </span>
      );
    },
  },
  {
    accessorKey: 'spyTrend',
    header: 'Market',
    cell: ({ row }) => {
      const spy = row.original.spyTrend;
      const qqq = row.original.qqqTrend;
      return (
        <div className="flex gap-1">
          <span className={cn(
            'text-xs',
            spy === 'UP' ? 'text-emerald-400' : spy === 'DOWN' ? 'text-red-400' : 'text-slate-400'
          )}>
            SPY {spy === 'UP' ? '↑' : spy === 'DOWN' ? '↓' : '→'}
          </span>
          <span className={cn(
            'text-xs',
            qqq === 'UP' ? 'text-emerald-400' : qqq === 'DOWN' ? 'text-red-400' : 'text-slate-400'
          )}>
            QQQ {qqq === 'UP' ? '↑' : qqq === 'DOWN' ? '↓' : '→'}
          </span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <GlassButton variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </GlassButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleViewDetails(row.original)}>
            <Eye className="mr-2 h-4 w-4" /> View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleQuickTrade(row.original)}>
            <TrendingUp className="mr-2 h-4 w-4" /> Quick Trade
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
```

---

## 10. Method 1 Stock Table (Scanner-Based)

Table for stocks screened via Method 1 (Liquidity, Volatility, Catalyst, Technical).

```tsx
// features/ai-screener/components/Method1Table.tsx
const method1Columns: ColumnDef<Method1Stock>[] = [
  {
    accessorKey: 'ticker',
    header: 'Ticker',
    cell: ({ row }) => (
      <span className="font-bold text-white">{row.getValue('ticker')}</span>
    ),
  },
  {
    accessorKey: 'lastPrice',
    header: 'Price',
    cell: ({ row }) => (
      <span className="font-mono text-white">
        ${row.getValue<number>('lastPrice')?.toFixed(2)}
      </span>
    ),
  },
  // Liquidity Checks
  {
    accessorKey: 'liquidityPassed',
    header: 'Liquidity',
    cell: ({ row }) => {
      const passed = row.getValue<boolean>('liquidityPassed');
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <GlassBadge variant={passed ? 'success' : 'danger'}>
                {passed ? '✓' : '✗'}
              </GlassBadge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <p>Vol: {formatVolume(row.original.avgVolume)}</p>
                <p>RelVol: {row.original.relativeVolume?.toFixed(2)}x</p>
                <p>Spread: {(row.original.spread * 100)?.toFixed(2)}%</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  // Volatility Checks
  {
    accessorKey: 'volatilityPassed',
    header: 'Volatility',
    cell: ({ row }) => {
      const passed = row.getValue<boolean>('volatilityPassed');
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <GlassBadge variant={passed ? 'success' : 'danger'}>
                {passed ? '✓' : '✗'}
              </GlassBadge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <p>ATR: ${row.original.atr?.toFixed(2)}</p>
                <p>ATR%: {row.original.atrPercent?.toFixed(2)}%</p>
                <p>Range: {row.original.intradayRangePct?.toFixed(2)}%</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  // Catalyst
  {
    accessorKey: 'catalystPassed',
    header: 'Catalyst',
    cell: ({ row }) => {
      const passed = row.getValue<boolean>('catalystPassed');
      const type = row.original.catalystType;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <GlassBadge variant={passed ? 'success' : 'danger'}>
                {passed ? type?.replace('_', ' ') : '✗'}
              </GlassBadge>
            </TooltipTrigger>
            <TooltipContent>
              {row.original.catalystDescription || 'No catalyst'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  // Technical
  {
    accessorKey: 'technicalSetupPassed',
    header: 'Technical',
    cell: ({ row }) => {
      const passed = row.getValue<boolean>('technicalSetupPassed');
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <GlassBadge variant={passed ? 'success' : 'danger'}>
                {passed ? '✓' : '✗'}
              </GlassBadge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <p>Above VWAP: {row.original.aboveVWAP ? '✓' : '✗'}</p>
                <p>HH/HL: {row.original.higherHighsLows ? '✓' : '✗'}</p>
                <p>Market Aligned: {row.original.marketAligned ? '✓' : '✗'}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  // Final Status
  {
    accessorKey: 'passedMethod1',
    header: 'Status',
    cell: ({ row }) => {
      const passed = row.getValue<boolean>('passedMethod1');
      return (
        <GlassBadge variant={passed ? 'success' : 'default'}>
          {passed ? 'PASSED' : 'FAILED'}
        </GlassBadge>
      );
    },
  },
];
```

---

## 11. Method 2 Stock Table (4-GATE System)

Table for stocks screened via Method 2 (Gate 1-4).

```tsx
// features/ai-screener/components/Method2Table.tsx
const method2Columns: ColumnDef<Method2Stock>[] = [
  {
    accessorKey: 'ticker',
    header: 'Ticker',
    cell: ({ row }) => (
      <span className="font-bold text-white">{row.getValue('ticker')}</span>
    ),
  },
  {
    accessorKey: 'lastPrice',
    header: 'Price',
    cell: ({ row }) => (
      <span className="font-mono text-white">
        ${row.getValue<number>('lastPrice')?.toFixed(2)}
      </span>
    ),
  },
  // Gate 1: Pre-Market Universe
  {
    accessorKey: 'passedGate1',
    header: 'G1',
    cell: ({ row }) => {
      const passed = row.getValue<boolean>('passedGate1');
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <GlassBadge variant={passed ? 'success' : 'danger'} size="sm">
                {passed ? '✓' : '✗'}
              </GlassBadge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <p className="font-bold">Gate 1: Pre-Market Universe</p>
                <p>Vol 30D: {formatVolume(row.original.avgVolume30D)}</p>
                <p>PreMkt Vol: {formatVolume(row.original.preMarketVolume)}</p>
                <p>Vol Spike: {row.original.volumeSpike?.toFixed(2)}x</p>
                <p>ATR%: {row.original.atrPercent?.toFixed(2)}%</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  // Gate 2: Technical Alignment
  {
    accessorKey: 'passedGate2',
    header: 'G2',
    cell: ({ row }) => {
      const passed = row.getValue<boolean>('passedGate2');
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <GlassBadge variant={passed ? 'success' : passed === false ? 'danger' : 'default'} size="sm">
                {passed ? '✓' : passed === false ? '✗' : '-'}
              </GlassBadge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <p className="font-bold">Gate 2: Technical Alignment</p>
                <p>Above VWAP: {row.original.aboveVWAP ? '✓' : '✗'}</p>
                <p>Above EMA9: {row.original.aboveEMA9 ? '✓' : '✗'}</p>
                <p>Above EMA20: {row.original.aboveEMA20 ? '✓' : '✗'}</p>
                <p>RelVol: {row.original.relativeVolume?.toFixed(2)}x</p>
                <p>SPY: {row.original.spyTrend} | QQQ: {row.original.qqqTrend}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  // Gate 3: Execution Window
  {
    accessorKey: 'passedGate3',
    header: 'G3',
    cell: ({ row }) => {
      const passed = row.getValue<boolean>('passedGate3');
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <GlassBadge variant={passed ? 'success' : passed === false ? 'danger' : 'default'} size="sm">
                {passed ? '✓' : passed === false ? '✗' : '-'}
              </GlassBadge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <p className="font-bold">Gate 3: Execution Window</p>
                <p>Holds VWAP: {row.original.holdsAboveVWAP ? '✓' : '✗'}</p>
                <p>No Rejection: {row.original.noRejectionWick ? '✓' : '✗'}</p>
                <p>Vol Expansion: {row.original.volumeExpansion ? '✓' : '✗'}</p>
                <p>SPY Agrees: {row.original.spyAgrees ? '✓' : '✗'}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  // Gate 4: Risk Check
  {
    accessorKey: 'passedGate4',
    header: 'G4',
    cell: ({ row }) => {
      const passed = row.getValue<boolean>('passedGate4');
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <GlassBadge variant={passed ? 'success' : passed === false ? 'danger' : 'default'} size="sm">
                {passed ? '✓' : passed === false ? '✗' : '-'}
              </GlassBadge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <p className="font-bold">Gate 4: Risk Check</p>
                <p>Risk/Share: ${row.original.riskPerShare?.toFixed(2)}</p>
                <p>Max Shares: {row.original.maxShares}</p>
                <p>VIX: {row.original.vixLevel?.toFixed(2)}</p>
                <p>Mkt Vol OK: {row.original.marketVolatilityOK ? '✓' : '✗'}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  // Setup Type
  {
    accessorKey: 'setupType',
    header: 'Setup',
    cell: ({ row }) => {
      const setup = row.getValue<string>('setupType');
      return setup ? (
        <GlassBadge variant="primary">
          {setup.replace('_', ' ')}
        </GlassBadge>
      ) : <span className="text-slate-500">-</span>;
    },
  },
  // Setup Quality
  {
    accessorKey: 'setupQuality',
    header: 'Quality',
    cell: ({ row }) => {
      const quality = row.getValue<string>('setupQuality');
      const variant = quality === 'A_PLUS' ? 'success' : 
                      quality === 'A' ? 'primary' : 
                      quality === 'B' ? 'warning' : 'default';
      return quality ? (
        <GlassBadge variant={variant}>
          {quality.replace('_', '+')}
        </GlassBadge>
      ) : <span className="text-slate-500">-</span>;
    },
  },
  // Entry Levels
  {
    accessorKey: 'suggestedEntry',
    header: 'Entry',
    cell: ({ row }) => {
      const entry = row.getValue<number>('suggestedEntry');
      return entry ? (
        <span className="font-mono text-blue-400">${entry.toFixed(2)}</span>
      ) : <span className="text-slate-500">-</span>;
    },
  },
  // R:R
  {
    accessorKey: 'riskRewardRatio',
    header: 'R:R',
    cell: ({ row }) => {
      const rr = row.getValue<number>('riskRewardRatio');
      return rr ? (
        <span className={cn(
          'font-mono font-bold',
          rr >= 2 ? 'text-emerald-400' : rr >= 1.5 ? 'text-amber-400' : 'text-red-400'
        )}>
          {rr.toFixed(2)}:1
        </span>
      ) : <span className="text-slate-500">-</span>;
    },
  },
  // Final Status
  {
    accessorKey: 'passedMethod2',
    header: 'Status',
    cell: ({ row }) => {
      const passed = row.getValue<boolean>('passedMethod2');
      return (
        <GlassBadge variant={passed ? 'success' : 'default'}>
          {passed ? 'PASSED' : 'IN PROGRESS'}
        </GlassBadge>
      );
    },
  },
];
```

---

## 12. Suggested Stock Table

Table for filter screening suggestions.

```tsx
// features/suggestions/components/SuggestionsTable.tsx
const suggestedStockColumns: ColumnDef<SuggestedStock>[] = [
  {
    accessorKey: 'ticker',
    header: 'Ticker',
    cell: ({ row }) => (
      <span className="font-bold text-white">{row.getValue('ticker')}</span>
    ),
  },
  {
    accessorKey: 'companyName',
    header: 'Company',
    cell: ({ row }) => (
      <span className="text-slate-400 truncate max-w-[150px]">
        {row.getValue('companyName')}
      </span>
    ),
  },
  {
    accessorKey: 'lastPrice',
    header: 'Price',
    cell: ({ row }) => (
      <span className="font-mono text-white">
        ${row.getValue<number>('lastPrice')?.toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: 'avgTargetPrice',
    header: 'Avg Target',
    cell: ({ row }) => (
      <span className="font-mono text-emerald-400">
        ${row.getValue<number>('avgTargetPrice')?.toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: 'upsidePct',
    header: 'Upside',
    cell: ({ row }) => {
      const upside = row.getValue<number>('upsidePct');
      return (
        <GlassBadge variant={upside >= 100 ? 'success' : 'warning'}>
          +{upside?.toFixed(0)}%
        </GlassBadge>
      );
    },
  },
  {
    accessorKey: 'screenType',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue<string>('screenType');
      return (
        <GlassBadge variant={type === 'HIGH_UPSIDE' ? 'primary' : 'info'}>
          {type?.replace('_', ' ')}
        </GlassBadge>
      );
    },
  },
  {
    accessorKey: 'analystCount',
    header: 'Analysts',
    cell: ({ row }) => (
      <span className="text-white">{row.getValue('analystCount')}</span>
    ),
  },
  {
    accessorKey: 'avgRating',
    header: 'Rating',
    cell: ({ row }) => {
      const rating = row.getValue<string>('avgRating');
      const variant = rating === 'STRONG_BUY' ? 'success' : 
                      rating === 'BUY' ? 'primary' : 'default';
      return <GlassBadge variant={variant}>{rating}</GlassBadge>;
    },
  },
  {
    accessorKey: 'tradeTaken',
    header: 'Traded',
    cell: ({ row }) => {
      const taken = row.getValue<boolean>('tradeTaken');
      return taken ? (
        <GlassBadge variant="success">✓</GlassBadge>
      ) : (
        <GlassButton size="sm" variant="primary" onClick={() => handleTakeTrade(row.original)}>
          Trade
        </GlassButton>
      );
    },
  },
];
```

---

## 13. Admin Tables

### User Management Table

```tsx
// features/admin/components/UserTable.tsx
const userColumns: ColumnDef<UserAccess>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <span className="text-white">{row.getValue('email')}</span>
    ),
  },
  {
    accessorKey: 'fullName',
    header: 'Name',
    cell: ({ row }) => (
      <span className="text-slate-300">{row.getValue('fullName')}</span>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue<string>('role');
      return (
        <GlassBadge variant={role === 'ADMIN' ? 'primary' : 'default'}>
          {role}
        </GlassBadge>
      );
    },
  },
  {
    accessorKey: 'accessStatus',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue<string>('accessStatus');
      const variant = status === 'ACTIVE' ? 'success' : 
                      status === 'SUSPENDED' ? 'warning' : 'danger';
      return <GlassBadge variant={variant}>{status}</GlassBadge>;
    },
  },
  {
    accessorKey: 'permissionPreset',
    header: 'Permissions',
    cell: ({ row }) => (
      <GlassBadge variant="info">
        {row.getValue<string>('permissionPreset')?.replace('_', ' ')}
      </GlassBadge>
    ),
  },
  {
    accessorKey: 'lastLoginAt',
    header: 'Last Login',
    cell: ({ row }) => {
      const date = row.getValue<string>('lastLoginAt');
      return date ? (
        <span className="text-slate-400 text-sm">
          {formatRelativeTime(new Date(date))}
        </span>
      ) : <span className="text-slate-500">Never</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <GlassButton variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </GlassButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEditPermissions(row.original)}>
            <Shield className="mr-2 h-4 w-4" /> Edit Permissions
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSuspend(row.original)}>
            <Pause className="mr-2 h-4 w-4" /> Suspend
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleRevoke(row.original)}
            className="text-red-400"
          >
            <Ban className="mr-2 h-4 w-4" /> Revoke Access
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
```

### Access Requests Table

```tsx
// features/admin/components/AccessRequestsTable.tsx
const accessRequestColumns: ColumnDef<AccessRequest>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <span className="text-white">{row.getValue('email')}</span>
    ),
  },
  {
    accessorKey: 'fullName',
    header: 'Name',
    cell: ({ row }) => (
      <span className="text-slate-300">{row.getValue('fullName')}</span>
    ),
  },
  {
    accessorKey: 'tradingExperience',
    header: 'Experience',
    cell: ({ row }) => (
      <GlassBadge variant="info">
        {row.getValue<string>('tradingExperience')}
      </GlassBadge>
    ),
  },
  {
    accessorKey: 'reason',
    header: 'Reason',
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className="text-slate-400 truncate max-w-[200px] block">
              {row.getValue<string>('reason')?.substring(0, 50)}...
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            {row.getValue('reason')}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: 'submittedAt',
    header: 'Submitted',
    cell: ({ row }) => (
      <span className="text-slate-400 text-sm">
        {formatRelativeTime(new Date(row.getValue('submittedAt')))}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue<string>('status');
      const variant = status === 'PENDING' ? 'warning' : 
                      status === 'APPROVED' ? 'success' : 'danger';
      return <GlassBadge variant={variant}>{status}</GlassBadge>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const status = row.original.status;
      if (status !== 'PENDING') return null;
      
      return (
        <div className="flex gap-2">
          <GlassButton 
            size="sm" 
            variant="success" 
            onClick={() => handleApprove(row.original)}
          >
            <Check className="h-4 w-4" />
          </GlassButton>
          <GlassButton 
            size="sm" 
            variant="danger" 
            onClick={() => handleReject(row.original)}
          >
            <X className="h-4 w-4" />
          </GlassButton>
        </div>
      );
    },
  },
];
```
