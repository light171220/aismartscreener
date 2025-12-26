# Polygon.io (Massive) API Integration Guide

## 1. Overview

Polygon.io (now rebranded as Massive) provides comprehensive US stock market data through REST APIs, WebSockets, and flat files. We're using the **Starter Plan ($29/month)** for AI Smart Screener.

## 2. Plan Comparison

| Feature | Basic (Free) | Starter ($29/mo) | Developer ($79/mo) | Advanced ($199/mo) |
|---------|--------------|------------------|--------------------|--------------------|
| API Calls | 5/minute | Unlimited | Unlimited | Unlimited |
| Historical Data | 2 years | 5 years | 10 years | 20+ years |
| Data Delay | EOD only | 15-minute | 15-minute | Real-time |
| WebSockets | ❌ | ✅ | ✅ | ✅ |
| Trades Data | ❌ | ❌ | ✅ | ✅ |
| Quotes Data | ❌ | ❌ | ❌ | ✅ |
| Snapshot | ❌ | ✅ | ✅ | ✅ |

**Why Starter Plan?**
- Unlimited API calls for batch screening
- 5 years history for backtesting
- 15-minute delay acceptable for pre-market screening (runs before market opens)
- WebSocket support for live updates
- Snapshot API for quick market overview

## 3. API Endpoints We'll Use

### 3.1 Stock Aggregates (OHLCV Bars)
```
GET /v2/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from}/{to}
```

**Parameters:**
- `ticker`: Stock symbol (e.g., AAPL)
- `multiplier`: Size of timespan multiplier
- `timespan`: minute, hour, day, week, month, quarter, year
- `from`: Start date (YYYY-MM-DD or timestamp)
- `to`: End date

**Example Response:**
```json
{
  "ticker": "AAPL",
  "results": [
    {
      "v": 15000000,    // Volume
      "vw": 175.25,     // Volume-weighted average price
      "o": 174.50,      // Open
      "c": 176.00,      // Close
      "h": 176.50,      // High
      "l": 174.00,      // Low
      "t": 1703116800000, // Timestamp (ms)
      "n": 50000        // Number of transactions
    }
  ]
}
```

### 3.2 Previous Day Close
```
GET /v2/aggs/ticker/{ticker}/prev
```

### 3.3 Grouped Daily (All Tickers)
```
GET /v2/aggs/grouped/locale/us/market/stocks/{date}
```

### 3.4 Snapshot - All Tickers
```
GET /v2/snapshot/locale/us/markets/stocks/tickers
```

**Response includes:**
- Day's OHLCV
- Previous day close
- Today's change
- Today's change percent
- Updated timestamp

### 3.5 Snapshot - Gainers/Losers
```
GET /v2/snapshot/locale/us/markets/stocks/{direction}
```
- `direction`: gainers | losers

### 3.6 Previous Day Close (Planned Feature)
```
GET /v2/aggs/ticker/{ticker}/prev
```

**Purpose:** Get last closing price for gap analysis

**Response:**
```json
{
  "ticker": "AAPL",
  "results": [{
    "c": 175.50,    // Close price (previousClose)
    "h": 176.25,    // High
    "l": 174.00,    // Low
    "o": 174.50,    // Open
    "v": 45000000,  // Volume
    "t": 1703030400000  // Timestamp
  }]
}
```

**Usage in Lambda:**
```typescript
// method1-step1-liquidity or method2-gate1
const prevClose = await polygon.stocks.previousClose(ticker);
const previousClose = prevClose.results[0].c;
const gapFromClose = currentPrice - previousClose;
const gapFromClosePercent = ((currentPrice - previousClose) / previousClose) * 100;
```

### 3.7 Price Range Aggregates (Planned Feature)
```
GET /v2/aggs/ticker/{ticker}/range/1/day/{from}/{to}
```

**Purpose:** Calculate 5-day, 30-day, and 52-week price ranges

**Usage in Lambda:**
```typescript
// Calculate price ranges for dashboard display
async function getPriceRanges(ticker: string): Promise<PriceRanges> {
  const today = new Date();
  
  // 5-day range
  const from5D = subDays(today, 5).toISOString().split('T')[0];
  const bars5D = await polygon.stocks.aggregates(ticker, 1, 'day', from5D, today);
  const days5 = {
    low: Math.min(...bars5D.results.map(b => b.l)),
    high: Math.max(...bars5D.results.map(b => b.h)),
  };
  
  // 30-day range
  const from30D = subDays(today, 30).toISOString().split('T')[0];
  const bars30D = await polygon.stocks.aggregates(ticker, 1, 'day', from30D, today);
  const days30 = {
    low: Math.min(...bars30D.results.map(b => b.l)),
    high: Math.max(...bars30D.results.map(b => b.h)),
  };
  
  // 52-week range (alternative: use ticker details endpoint)
  const from52W = subDays(today, 365).toISOString().split('T')[0];
  const bars52W = await polygon.stocks.aggregates(ticker, 1, 'day', from52W, today);
  const weeks52 = {
    low: Math.min(...bars52W.results.map(b => b.l)),
    high: Math.max(...bars52W.results.map(b => b.h)),
  };
  
  return { days5, days30, weeks52 };
}
```

### 3.8 Ticker Details
```
GET /v3/reference/tickers/{ticker}
```

**Purpose:** Get company info and 52-week high/low (alternative to calculating from aggregates)

**Response includes:**
- Company name
- Market cap
- Description
- SIC code
- List date
- Locale

**Note:** 52-week high/low may also be available in ticker details for some tickers.

### 3.9 Ticker News
```
GET /v2/reference/news?ticker={ticker}
```

### 3.10 Technical Indicators
```
GET /v1/indicators/sma/{ticker}
GET /v1/indicators/ema/{ticker}
GET /v1/indicators/macd/{ticker}
GET /v1/indicators/rsi/{ticker}
```

**Purpose:** Get technical indicators for AI entry/exit analysis

**Usage in Lambda (AI Entry/Exit):**
```typescript
// method1-step3-technical or method2-gate3
async function calculateAIEntryExit(ticker: string, currentPrice: number) {
  // Get technical indicators
  const [sma20, ema9, ema20, rsi] = await Promise.all([
    polygon.stocks.sma(ticker, { window: 20, timespan: 'day' }),
    polygon.stocks.ema(ticker, { window: 9, timespan: 'day' }),
    polygon.stocks.ema(ticker, { window: 20, timespan: 'day' }),
    polygon.stocks.rsi(ticker, { window: 14, timespan: 'day' }),
  ]);
  
  // Get price ranges for support/resistance
  const priceRanges = await getPriceRanges(ticker);
  
  // AI identifies entry based on support levels
  const entryFactors: string[] = [];
  let entryPrice = currentPrice;
  
  if (currentPrice > sma20.values[0].value) {
    entryFactors.push('Above SMA20');
    entryPrice = Math.max(entryPrice, sma20.values[0].value);
  }
  if (currentPrice > ema9.values[0].value) {
    entryFactors.push('Above 9 EMA');
  }
  if (currentPrice > ema20.values[0].value) {
    entryFactors.push('Above 20 EMA');
  }
  
  // AI identifies exit based on resistance levels
  const exitFactors: string[] = [];
  let exitPrice = priceRanges.weeks52.high;
  
  if (priceRanges.days30.high < priceRanges.weeks52.high) {
    exitPrice = priceRanges.days30.high;
    exitFactors.push('30-day high resistance');
  }
  exitFactors.push('52-week high target');
  
  // Determine confidence based on alignment
  const confidence = entryFactors.length >= 3 ? 'HIGH' : 
                     entryFactors.length >= 2 ? 'MEDIUM' : 'LOW';
  
  return {
    aiEntryPrice: entryPrice,
    aiExitPrice: exitPrice,
    aiEntryReason: entryFactors.join(' + '),
    aiExitReason: exitFactors.join(' + '),
    aiConfidence: confidence,
    aiAnalysisFactors: [...entryFactors, ...exitFactors],
  };
}
```

## 4. Implementation

### 4.1 Polygon Client Class

#### amplify/functions/lib/polygon-client.ts
```typescript
import { RESTClient } from '@polygon.io/client-js';

export class PolygonClient {
  private client: RESTClient;

  constructor() {
    this.client = new RESTClient(process.env.POLYGON_API_KEY);
  }

  // Get daily bars for a ticker
  async getDailyBars(ticker: string, from: string, to: string) {
    const response = await this.client.stocks.aggregates(
      ticker,
      1,
      'day',
      from,
      to
    );
    return response.results;
  }

  // Get pre-market snapshot for all tickers
  async getMarketSnapshot() {
    const response = await this.client.stocks.snapshotAllTickers();
    return response.tickers;
  }

  // Get top gainers
  async getTopGainers() {
    const response = await this.client.stocks.snapshotGainersLosers('gainers');
    return response.tickers;
  }

  // Get ticker details
  async getTickerDetails(ticker: string) {
    const response = await this.client.reference.tickerDetails(ticker);
    return response.results;
  }

  // Get SMA indicator
  async getSMA(ticker: string, window: number = 20) {
    const response = await this.client.stocks.sma(ticker, {
      window,
      timespan: 'day',
      series_type: 'close',
    });
    return response.results;
  }

  // Get RSI indicator
  async getRSI(ticker: string, window: number = 14) {
    const response = await this.client.stocks.rsi(ticker, {
      window,
      timespan: 'day',
      series_type: 'close',
    });
    return response.results;
  }

  // Get MACD indicator
  async getMACD(ticker: string) {
    const response = await this.client.stocks.macd(ticker, {
      short_window: 12,
      long_window: 26,
      signal_window: 9,
      timespan: 'day',
      series_type: 'close',
    });
    return response.results;
  }

  // Get ticker news
  async getTickerNews(ticker: string, limit: number = 10) {
    const response = await this.client.reference.tickerNews({
      ticker,
      limit,
    });
    return response.results;
  }
}
```

### 4.2 Pre-Market Screener Implementation

#### amplify/jobs/premarket-scanner/handler.ts
```typescript
import { PolygonClient } from '../lib/polygon-client';
import { BedrockRuntime } from '@aws-sdk/client-bedrock-runtime';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const polygon = new PolygonClient();
const bedrock = new BedrockRuntime({ region: 'us-east-1' });
const dynamodb = new DynamoDBClient({ region: 'us-east-1' });

interface ScreeningCriteria {
  minPrice: number;
  maxPrice: number;
  minVolume: number;
  minRelativeVolume: number;
  minATR: number;
}

const DEFAULT_CRITERIA: ScreeningCriteria = {
  minPrice: 5,
  maxPrice: 300,
  minVolume: 1000000,
  minRelativeVolume: 1.5,
  minATR: 0.30,
};

export const handler = async () => {
  console.log('Starting pre-market scan...');
  
  // 1. Get market snapshot
  const snapshot = await polygon.getMarketSnapshot();
  
  // 2. Apply GATE 1 filters
  const candidates = snapshot.filter((stock) => {
    const price = stock.day?.c || stock.prevDay?.c;
    const volume = stock.day?.v || 0;
    const prevVolume = stock.prevDay?.v || 1;
    const relativeVolume = volume / prevVolume;
    
    return (
      price >= DEFAULT_CRITERIA.minPrice &&
      price <= DEFAULT_CRITERIA.maxPrice &&
      prevVolume >= DEFAULT_CRITERIA.minVolume &&
      relativeVolume >= DEFAULT_CRITERIA.minRelativeVolume
    );
  });
  
  console.log(`GATE 1 passed: ${candidates.length} stocks`);
  
  // 3. Get news for top candidates
  const withNews = await Promise.all(
    candidates.slice(0, 50).map(async (stock) => {
      const news = await polygon.getTickerNews(stock.ticker, 5);
      return {
        ...stock,
        news: news || [],
        hasNews: news && news.length > 0,
      };
    })
  );
  
  // 4. Send to Bedrock for AI analysis
  const aiResponse = await bedrock.invokeModel({
    modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Analyze these pre-market stocks and rank the top 10 for day trading potential.
          
Stocks data:
${JSON.stringify(withNews, null, 2)}

For each stock, evaluate:
1. Pre-market volume spike significance
2. Gap percentage (if any)
3. News catalyst quality (1-10 score)
4. Overall day trading potential

Return JSON array with format:
[{
  "ticker": "AAPL",
  "rank": 1,
  "volumeScore": 8,
  "gapPercent": 3.5,
  "newsScore": 9,
  "catalyst": "Strong earnings beat",
  "overallScore": 85,
  "reasoning": "..."
}]`,
        },
      ],
    }),
  });
  
  const aiResult = JSON.parse(
    JSON.parse(new TextDecoder().decode(aiResponse.body)).content[0].text
  );
  
  // 5. Store results in DynamoDB
  const today = new Date().toISOString().split('T')[0];
  
  for (const stock of aiResult) {
    await dynamodb.send(
      new PutItemCommand({
        TableName: process.env.SCREENED_STOCKS_TABLE,
        Item: {
          ticker: { S: stock.ticker },
          screenDate: { S: today },
          screenTime: { S: 'PREMARKET_845' },
          screenType: { S: 'AI_SCREENER' },
          overallScore: { N: String(stock.overallScore) },
          catalyst: { S: stock.catalyst },
          volumeScore: { N: String(stock.volumeScore) },
          gapPercent: { N: String(stock.gapPercent) },
          newsScore: { N: String(stock.newsScore) },
          reasoning: { S: stock.reasoning },
          createdAt: { S: new Date().toISOString() },
        },
      })
    );
  }
  
  console.log(`Stored ${aiResult.length} screened stocks`);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Pre-market scan complete',
      stocksScreened: aiResult.length,
    }),
  };
};
```

### 4.3 Filter-Based Screener

#### amplify/jobs/filter-screener/handler.ts
```typescript
import { PolygonClient } from '../lib/polygon-client';

const polygon = new PolygonClient();

interface FilterCriteria {
  minUpsidePct: number;        // Avg target vs current price
  minAnalystCoverage: number;
  minRating: 'HOLD' | 'BUY' | 'STRONG_BUY';
  minMarketCap: number;
  maxMarketCap: number;
  minPrice: number;
  maxPrice: number;
}

const UPSIDE_CRITERIA: FilterCriteria = {
  minUpsidePct: 100,           // 100% upside potential
  minAnalystCoverage: 3,
  minRating: 'HOLD',
  minMarketCap: 1000000000,    // $1B
  maxMarketCap: 1500000000,    // $1.5B
  minPrice: 2.5,
  maxPrice: 60,
};

export const handler = async () => {
  // 1. Get all tickers with details
  const allTickers = await polygon.getAllTickers();
  
  // 2. Filter by market cap and price
  const filtered = allTickers.filter((ticker) => {
    return (
      ticker.market_cap >= UPSIDE_CRITERIA.minMarketCap &&
      ticker.market_cap <= UPSIDE_CRITERIA.maxMarketCap
    );
  });
  
  // 3. Get analyst data (would need external source like Benzinga)
  // For now, this is a placeholder
  
  // 4. Calculate upside potential
  const withUpside = filtered.map((ticker) => ({
    ...ticker,
    upsidePct: calculateUpside(ticker),
  }));
  
  // 5. Sort by upside and return top 10
  const topStocks = withUpside
    .filter((s) => s.upsidePct >= UPSIDE_CRITERIA.minUpsidePct)
    .sort((a, b) => b.upsidePct - a.upsidePct)
    .slice(0, 10);
  
  return topStocks;
};
```

## 5. WebSocket Integration (Real-time)

### 5.1 WebSocket Client

```typescript
import WebSocket from 'ws';

class PolygonWebSocket {
  private ws: WebSocket;
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.ws = new WebSocket('wss://socket.polygon.io/stocks');
    
    this.ws.on('open', () => {
      this.authenticate();
    });
    
    this.ws.on('message', (data) => {
      this.handleMessage(JSON.parse(data.toString()));
    });
  }
  
  authenticate() {
    this.ws.send(JSON.stringify({
      action: 'auth',
      params: this.apiKey,
    }));
  }
  
  subscribeToTrades(tickers: string[]) {
    this.ws.send(JSON.stringify({
      action: 'subscribe',
      params: tickers.map((t) => `T.${t}`).join(','),
    }));
  }
  
  subscribeToAggregates(tickers: string[]) {
    this.ws.send(JSON.stringify({
      action: 'subscribe',
      params: tickers.map((t) => `A.${t}`).join(','),
    }));
  }
  
  handleMessage(data: any) {
    for (const msg of data) {
      switch (msg.ev) {
        case 'T': // Trade
          console.log(`Trade: ${msg.sym} @ ${msg.p}`);
          break;
        case 'A': // Aggregate
          console.log(`Agg: ${msg.sym} O:${msg.o} H:${msg.h} L:${msg.l} C:${msg.c}`);
          break;
      }
    }
  }
}
```

## 6. Rate Limiting & Best Practices

### 6.1 Rate Limits

| Plan | Limit |
|------|-------|
| Basic (Free) | 5 requests/minute |
| Starter+ | Unlimited |

### 6.2 Best Practices

1. **Batch Requests**: Use grouped endpoints instead of individual ticker calls
2. **Caching**: Cache static data (ticker details) locally
3. **Pagination**: Use `limit` and `next_url` for large datasets
4. **Error Handling**: Implement exponential backoff for failures
5. **Time Zones**: All timestamps are in UTC

### 6.3 Error Handling

```typescript
async function fetchWithRetry(fn: () => Promise<any>, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 429) {
        // Rate limited - wait and retry
        await sleep(1000 * (i + 1));
        continue;
      }
      if (error.status >= 500) {
        // Server error - retry
        await sleep(500 * (i + 1));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

## 7. Data Mapping

### Polygon Response → Our Schema

```typescript
function mapPolygonToScreenedStock(polygonData: any): ScreenedStock {
  return {
    ticker: polygonData.ticker,
    companyName: polygonData.name,
    lastPrice: polygonData.day?.c || polygonData.prevDay?.c,
    dayHigh: polygonData.day?.h,
    dayLow: polygonData.day?.l,
    volume: polygonData.day?.v,
    prevClose: polygonData.prevDay?.c,
    changePercent: polygonData.todaysChangePerc,
    marketCap: polygonData.market_cap,
    relativeVolume: polygonData.day?.v / (polygonData.prevDay?.v || 1),
  };
}
```

## 8. Starter Plan Limitations

| Limitation | Impact | Workaround |
|------------|--------|------------|
| 15-min delay | No real-time trading | Run screeners before market open |
| No tick data | No order flow analysis | Use aggregates + volume |
| No quotes | No bid-ask spread | Use last trade price |
| 5 year history | Limited backtesting | Sufficient for recent patterns |

## 9. Upgrading Considerations

Consider upgrading to **Developer ($79/mo)** if:
- Need 10 years of historical data
- Want trade-level granularity
- Building more advanced backtesting

Consider upgrading to **Advanced ($199/mo)** if:
- Need real-time data for live trading
- Require quote data for spread analysis
- Building automated trading systems
