# Charts & Visualizations

## 1. Overview

AI Smart Screener uses multiple charting libraries for different purposes:
- **react-financial-charts**: Candlestick, OHLC, volume charts
- **Recharts**: P&L charts, analytics, pie charts
- **TradingView Widget** (optional): Advanced interactive charts

## 2. Stock Price Charts

### Candlestick Chart

```tsx
// components/charts/CandlestickChart.tsx
import {
  ChartCanvas,
  Chart,
  CandlestickSeries,
  XAxis,
  YAxis,
  CrossHairCursor,
  MouseCoordinateX,
  MouseCoordinateY,
  OHLCTooltip,
  EdgeIndicator,
  lastVisibleItemBasedZoomAnchor,
  withDeviceRatio,
  withSize,
} from 'react-financial-charts';
import { scaleTime } from 'd3-scale';
import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';

interface CandlestickChartProps {
  data: OHLCData[];
  width: number;
  height: number;
  ratio: number;
}

interface OHLCData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function CandlestickChartComponent({
  data,
  width,
  height,
  ratio,
}: CandlestickChartProps) {
  const xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
    (d: OHLCData) => d.date
  );
  
  const { data: chartData, xScale, xAccessor, displayXAccessor } = xScaleProvider(data);
  
  const max = xAccessor(chartData[chartData.length - 1]);
  const min = xAccessor(chartData[Math.max(0, chartData.length - 100)]);
  const xExtents = [min, max];
  
  const margin = { left: 0, right: 50, top: 10, bottom: 30 };
  const gridHeight = height - margin.top - margin.bottom;
  
  const candleChartExtents = (data: OHLCData) => {
    return [data.high, data.low];
  };
  
  const yEdgeIndicator = (data: OHLCData) => {
    return data.close;
  };
  
  const openCloseColor = (data: OHLCData) => {
    return data.close > data.open ? '#26a69a' : '#ef5350';
  };
  
  return (
    <ChartCanvas
      height={height}
      width={width}
      ratio={ratio}
      margin={margin}
      data={chartData}
      displayXAccessor={displayXAccessor}
      seriesName="Stock"
      xScale={xScale}
      xAccessor={xAccessor}
      xExtents={xExtents}
      zoomAnchor={lastVisibleItemBasedZoomAnchor}
    >
      <Chart id={1} yExtents={candleChartExtents}>
        <XAxis
          axisAt="bottom"
          orient="bottom"
          showTicks={true}
          tickFormat={timeFormat('%b %d')}
        />
        <YAxis
          axisAt="right"
          orient="right"
          tickFormat={format('.2f')}
        />
        <CandlestickSeries
          fill={openCloseColor}
          stroke={openCloseColor}
          wickStroke={openCloseColor}
        />
        <EdgeIndicator
          itemType="last"
          orient="right"
          edgeAt="right"
          yAccessor={yEdgeIndicator}
          fill={openCloseColor}
        />
        <OHLCTooltip
          origin={[8, 16]}
          textFill={(d: OHLCData) => (d.close > d.open ? '#26a69a' : '#ef5350')}
        />
        <MouseCoordinateY
          at="right"
          orient="right"
          displayFormat={format('.2f')}
        />
      </Chart>
      <CrossHairCursor />
    </ChartCanvas>
  );
}

export const CandlestickChart = withSize({
  style: { minHeight: 400 },
})(withDeviceRatio()(CandlestickChartComponent));
```

### Volume Chart

```tsx
// components/charts/VolumeChart.tsx
import {
  ChartCanvas,
  Chart,
  BarSeries,
  XAxis,
  YAxis,
} from 'react-financial-charts';

interface VolumeChartProps {
  data: OHLCData[];
  width: number;
  height: number;
  ratio: number;
}

function VolumeChartComponent({ data, width, height, ratio }: VolumeChartProps) {
  const volumeColor = (d: OHLCData) => {
    return d.close > d.open
      ? 'rgba(38, 166, 154, 0.5)' // Green with opacity
      : 'rgba(239, 83, 80, 0.5)'; // Red with opacity
  };
  
  return (
    <ChartCanvas
      height={height}
      width={width}
      ratio={ratio}
      margin={{ left: 0, right: 50, top: 10, bottom: 30 }}
      data={data}
      xScale={xScale}
      xAccessor={xAccessor}
    >
      <Chart id={2} yExtents={(d) => d.volume}>
        <YAxis
          axisAt="right"
          orient="right"
          tickFormat={formatVolume}
        />
        <BarSeries
          yAccessor={(d) => d.volume}
          fill={volumeColor}
        />
      </Chart>
    </ChartCanvas>
  );
}

function formatVolume(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}
```

## 3. Analytics Charts

### P&L Line Chart

```tsx
// components/charts/PLChart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';

interface PLDataPoint {
  date: string;
  pnl: number;
  cumulative: number;
}

interface PLChartProps {
  data: PLDataPoint[];
  height?: number;
}

export function PLChart({ data, height = 300 }: PLChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => format(new Date(value), 'MMM d')}
          className="text-xs"
        />
        <YAxis
          tickFormatter={(value) => `$${value}`}
          className="text-xs"
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload) return null;
            return (
              <div className="bg-card border rounded-lg p-3 shadow-lg">
                <p className="text-sm text-muted-foreground">
                  {format(new Date(label), 'MMM d, yyyy')}
                </p>
                <p className={cn(
                  'font-bold',
                  payload[0].value >= 0 ? 'text-green-500' : 'text-red-500'
                )}>
                  ${payload[0].value.toFixed(2)}
                </p>
                <p className="text-sm">
                  Cumulative: ${payload[1]?.value.toFixed(2)}
                </p>
              </div>
            );
          }}
        />
        <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
        <Area
          type="monotone"
          dataKey="cumulative"
          fill="url(#colorCumulative)"
          stroke="hsl(var(--primary))"
          fillOpacity={0.3}
        />
        <Line
          type="monotone"
          dataKey="pnl"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
        />
        <defs>
          <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
      </ComposedChart>
    </ResponsiveContainer>
  );
}
```

### Win/Loss Donut Chart

```tsx
// components/charts/WinLossChart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface WinLossChartProps {
  wins: number;
  losses: number;
  height?: number;
}

export function WinLossChart({ wins, losses, height = 250 }: WinLossChartProps) {
  const data = [
    { name: 'Wins', value: wins, color: '#22c55e' },
    { name: 'Losses', value: losses, color: '#ef4444' },
  ];
  
  const winRate = wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0;
  
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload) return null;
              return (
                <div className="bg-card border rounded-lg p-2 shadow-lg">
                  <p className="text-sm font-medium">{payload[0].name}</p>
                  <p className="text-lg font-bold">{payload[0].value}</p>
                </div>
              );
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-3xl font-bold">{winRate.toFixed(0)}%</p>
          <p className="text-sm text-muted-foreground">Win Rate</p>
        </div>
      </div>
    </div>
  );
}
```

### Bar Chart for R-Multiples

```tsx
// components/charts/RMultipleChart.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';

interface RMultipleData {
  trade: string;
  rMultiple: number;
}

export function RMultipleChart({ data }: { data: RMultipleData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="trade" className="text-xs" />
        <YAxis
          tickFormatter={(value) => `${value}R`}
          domain={['dataMin - 1', 'dataMax + 1']}
          className="text-xs"
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload) return null;
            const value = payload[0].value as number;
            return (
              <div className="bg-card border rounded-lg p-2 shadow-lg">
                <p className="text-sm">{payload[0].payload.trade}</p>
                <p className={cn(
                  'font-bold',
                  value >= 0 ? 'text-green-500' : 'text-red-500'
                )}>
                  {value >= 0 ? '+' : ''}{value.toFixed(2)}R
                </p>
              </div>
            );
          }}
        />
        <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
        <Bar dataKey="rMultiple" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.rMultiple >= 0 ? '#22c55e' : '#ef4444'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
```

## 4. Mini Sparkline Charts

```tsx
// components/charts/Sparkline.tsx
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function Sparkline({ 
  data, 
  color = 'hsl(var(--primary))',
  height = 30 
}: SparklineProps) {
  const chartData = data.map((value, index) => ({ value, index }));
  const isPositive = data[data.length - 1] >= data[0];
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={isPositive ? '#22c55e' : '#ef4444'}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

## 5. TradingView Widget Integration (Optional)

```tsx
// components/charts/TradingViewWidget.tsx
import { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  theme?: 'light' | 'dark';
  height?: number;
}

export function TradingViewWidget({
  symbol,
  theme = 'dark',
  height = 400,
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `NASDAQ:${symbol}`,
      interval: '5',
      timezone: 'America/New_York',
      theme: theme,
      style: '1',
      locale: 'en',
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      studies: ['MASimple@tv-basicstudies', 'VWAP@tv-basicstudies'],
      container_id: `tradingview_${symbol}`,
    });
    
    containerRef.current.appendChild(script);
    
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, theme]);
  
  return (
    <div
      id={`tradingview_${symbol}`}
      ref={containerRef}
      style={{ height }}
      className="rounded-lg overflow-hidden"
    />
  );
}
```

## 6. Chart Loading States

```tsx
// components/charts/ChartSkeleton.tsx
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div 
      className="bg-muted animate-pulse rounded-lg"
      style={{ height }}
    >
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}
```

## 7. Chart Container with Controls

```tsx
// components/charts/ChartContainer.tsx
interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  timeframes?: string[];
  onTimeframeChange?: (tf: string) => void;
  activeTimeframe?: string;
}

export function ChartContainer({
  title,
  children,
  timeframes = ['1D', '1W', '1M', '3M', '1Y'],
  onTimeframeChange,
  activeTimeframe = '1M',
}: ChartContainerProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {timeframes && (
          <div className="flex gap-1">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                variant={activeTimeframe === tf ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTimeframeChange?.(tf)}
              >
                {tf}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
```
