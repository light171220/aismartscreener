# AI Stock Screening Feature Implementation

## 1. Overview

The AI Screening system uses **TWO PARALLEL screening methods** that run simultaneously. The final result is the **INTERSECTION** (common stocks) from both methods - only stocks that pass BOTH methods are shown as AI Screening results.

### Dual-Method Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI SCREENING - DUAL METHOD                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────┐       ┌─────────────────────────┐              │
│  │     METHOD 1            │       │      METHOD 2           │              │
│  │   (Column G)            │       │    (Column L)           │              │
│  │                         │       │                         │              │
│  │  Scanner-Based          │       │   GATE System           │              │
│  │  Screening              │       │   (4 Gates)             │              │
│  │                         │       │                         │              │
│  │  • Liquidity Rules      │       │  • Gate 1: Pre-Market   │              │
│  │  • Volatility Filters   │       │  • Gate 2: Technical    │              │
│  │  • Catalyst Check       │       │  • Gate 3: Execution    │              │
│  │  • Technical Setup      │       │  • Gate 4: Risk         │              │
│  │                         │       │                         │              │
│  └───────────┬─────────────┘       └───────────┬─────────────┘              │
│              │                                  │                            │
│              │    ┌─────────────────────┐      │                            │
│              └───►│    INTERSECTION     │◄─────┘                            │
│                   │                     │                                    │
│                   │  Common Stocks from │                                    │
│                   │  BOTH Methods       │                                    │
│                   └──────────┬──────────┘                                    │
│                              │                                               │
│                              ▼                                               │
│                   ┌─────────────────────┐                                    │
│                   │  FINAL AI RESULTS   │                                    │
│                   │  "Ready to Buy"     │                                    │
│                   └─────────────────────┘                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Detailed Timing Schedule (VERIFIED FROM EXCEL)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      VERIFIED TIMING SCHEDULE (ET)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║  PARALLEL EXECUTION - BOTH METHODS RUN SIMULTANEOUSLY                 ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                              │
│  TIME        METHOD 1 (Scanner)              METHOD 2 (GATE System)         │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 8:45 AM   BOTH METHODS START SIMULTANEOUSLY                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  8:45 AM     Step 1: Pre-Market AI Scan      Gate 1: Pre-Market Universe    │
│              (Window: 8:30-9:30 AM)          (Window: 06:00-09:00 AM)       │
│              ┌───────────────────┐           ┌───────────────────┐          │
│              │ • Pre-mkt vol >5× │           │ • Price $10-$500  │          │
│              │ • Gap ±3-10%      │           │ • Avg Vol >1M     │          │
│              │ • ATR expansion   │           │ • Vol Spike ≥2×   │          │
│              │ • News catalyst   │           │ • ATR ≥2%         │          │
│              │                   │           │ • Exclude ETFs    │          │
│              │ 10,000+ → ~120    │           │ 10,000+ → ~50     │          │
│              └───────────────────┘           └───────────────────┘          │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                              │
│  9:15 AM     Step 2: AI News Scoring         (Gate 1 complete, waiting)     │
│              ┌───────────────────┐                                          │
│              │ • AI scores news  │                                          │
│              │ • Impact vs noise │                                          │
│              │ • Real catalysts  │                                          │
│              │                   │                                          │
│              │ ~120 → ~12 stocks │                                          │
│              │ (with catalysts)  │                                          │
│              └───────────────────┘                                          │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                              │
│  9:25 AM     (Step 2 complete, waiting)      Gate 2: Technical Alignment    │
│                                              ┌───────────────────┐          │
│                                              │ • Above VWAP      │          │
│                                              │ • Above 9 EMA     │          │
│                                              │ • Above 20 EMA    │          │
│                                              │ • RVol >1.5       │          │
│                                              │ • SPY/QQQ aligned │          │
│                                              │                   │          │
│                                              │ ~50 → ~18 stocks  │          │
│                                              └───────────────────┘          │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                              │
│  9:35 AM     Step 3: Technical Filtering     Gate 3: Execution Filter       │
│              ┌───────────────────┐           ┌───────────────────┐          │
│              │ • VWAP reclaim    │           │ • 5-min holds VWAP│          │
│              │ • ORB breakout    │           │ • No reject wick  │          │
│              │ • HRV pullback    │           │ • Volume expansion│          │
│              │ • Trend cont.     │           │ • SPY agrees      │          │
│              │                   │           │                   │          │
│              │ ~12 → ~3-6 setups │           │ ~18 → ~8 stocks   │          │
│              └───────────────────┘           └───────────────────┘          │
│              ⚠️ METHOD 1 COMPLETE            ⚡ Gate 3 STARTS               │
│                 (Results locked)                                             │
│                                                                              │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║  9:35 AM - FIRST INTERSECTION CHECK                                   ║  │
│  ║  Find common stocks from BOTH methods → Show in "Ready to Buy"        ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                              │
│  9:35 AM     ┌───────────────────┐           Gate 3 Run #1                  │
│  9:40 AM     │                   │           Gate 3 Run #2                  │
│  9:45 AM     │  Method 1 results │           Gate 3 Run #3                  │
│  9:50 AM     │  are STATIC       │           Gate 3 Run #4                  │
│  9:55 AM     │                   │           Gate 3 Run #5                  │
│  10:00 AM    │  No new scans     │           Gate 3 Run #6                  │
│  10:05 AM    │                   │           Gate 3 Run #7                  │
│  ...         │  INTERSECTION     │           ...continues...                │
│  10:55 AM    │  runs after each  │           Gate 3 Run #16                 │
│  11:00 AM    │  Gate 3 pass      │           Gate 3 Run #17 (FINAL)         │
│              └───────────────────┘                                          │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                              │
│  ON GATE 3   Step 4: Entry/Stop/Risk         Gate 4: Risk Validation        │
│  PASS        (User decides)                  ┌───────────────────┐          │
│                                              │ • All gates passed│          │
│              Step 5: Execution Checkpoint    │ • Risk ≤ max loss │          │
│              (Ready-to-trade prompt)         │ • VIX acceptable  │          │
│                                              │                   │          │
│                                              │ NOTIFICATION SENT │          │
│                                              │ "Ready to Buy"    │          │
│                                              └───────────────────┘          │
│                                                                              │
│  ═══════════════════════════════════════════════════════════════════════    │
│                                                                              │
│  FINAL       Method 1: ~3-6 stocks           Method 2: ~6 stocks            │
│              ╔═══════════════════════════════════════════════════════════╗  │
│              ║  INTERSECTION = ~3-5 stocks (Common to BOTH methods)      ║  │
│              ║  → Displayed in "Ready to Buy" table                      ║  │
│              ╚═══════════════════════════════════════════════════════════╝  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Verified Timeline Summary Table

| Time (ET) | Method 1 (Scanner) | Method 2 (GATE) | Action |
|-----------|-------------------|-----------------|--------|
| **8:45 AM** | Step 1: Pre-Market Scan (8:30-9:30 window) | Gate 1: Pre-Market Universe (6:00-9:00 window) | **BOTH START** |
| | • Pre-mkt vol >5×, Gap ±3-10%, ATR, News | • Price $10-$500, Vol >1M, Spike ≥2×, ATR ≥2% | |
| | • Output: 10,000+ → ~120 stocks | • Output: 10,000+ → ~50 stocks | |
| **9:15 AM** | Step 2: AI News Scoring | (waiting for Gate 2) | |
| | • AI scores headlines, filters noise | | |
| | • Output: ~120 → ~12 with real catalysts | | |
| **9:25 AM** | (waiting for Step 3) | Gate 2: Technical Alignment | |
| | | • Above VWAP, 9 EMA, 20 EMA | |
| | | • RVol >1.5, Market aligned | |
| | | • Output: ~50 → ~18 stocks | |
| **9:35 AM** | Step 3: Technical Filter ⚠️ **COMPLETES** | Gate 3: Execution Filter ⚡ **STARTS** | **FIRST INTERSECTION** |
| | • VWAP/ORB/HRV/Trend setups | • 5-min holds VWAP, No reject, Vol expand | |
| | • Output: ~12 → ~3-6 setups | • Output: ~18 → ~8 stocks | |
| | **Results LOCKED** | Runs every 5 min | |
| **9:40 AM** | (static) | Gate 3 Run #2 | Intersection check |
| **9:45 AM** | (static) | Gate 3 Run #3 | Intersection check |
| **...** | (static) | Every 5 minutes | Intersection check |
| **11:00 AM** | (static) | Gate 3 Run #17 (FINAL) | Final intersection |
| **On G3 Pass** | Step 4-5: User Entry/Execution | Gate 4: Risk Validation → Notification | Alert sent |

### ⚠️ Critical Timing Notes

1. **8:45 AM - Both methods START simultaneously**
   - Method 1: Pre-market scan begins
   - Method 2: Gate 1 pre-market universe scan begins

2. **9:15 AM - Only Method 1 runs (Step 2)**
   - Method 1: AI scores news headlines for catalysts
   - Method 2: Gate 1 complete, waiting for Gate 2

3. **9:25 AM - Only Method 2 runs (Gate 2)**
   - Method 1: Step 2 complete, waiting for Step 3
   - Method 2: Technical alignment check runs

4. **9:35 AM - CRITICAL CONVERGENCE POINT**
   - Method 1: Step 3 completes → **Results are LOCKED for the day**
   - Method 2: Gate 3 STARTS → Will run 17 times until 11:00 AM
   - **FIRST INTERSECTION**: Find common stocks from both methods

5. **9:35-11:00 AM - Continuous Gate 3 Execution**
   - Method 2 Gate 3 runs every 5 minutes (17 total runs)
   - Each Gate 3 pass triggers:
     - Gate 4 validation (risk check)
     - Intersection check with Method 1 (static) results
     - New stocks may appear in "Ready to Buy"

6. **Gate 4 triggers ON EACH Gate 3 pass**
   - Not scheduled - event-driven
   - Sends notification when stock passes all 4 gates

7. **Method 1 does NOT run after 9:35 AM**
   - Its results are fixed for the day
   - Only Method 2 continues scanning

### Scheduled Lambda Functions (AWS Cron - UTC)

| Function | Cron Expression | ET Time | Runs |
|----------|-----------------|---------|------|
| `method1-step1-scan` | `cron(45 12 ? * MON-FRI *)` | 8:45 AM | Once |
| `method1-step2-news` | `cron(15 13 ? * MON-FRI *)` | 9:15 AM | Once |
| `method1-step3-technical` | `cron(35 13 ? * MON-FRI *)` | 9:35 AM | Once |
| `method2-gate1` | `cron(45 12 ? * MON-FRI *)` | 8:45 AM | Once |
| `method2-gate2` | `cron(25 13 ? * MON-FRI *)` | 9:25 AM | Once |
| `method2-gate3` | `cron(35-59/5 13 ? * MON-FRI *)` | 9:35-9:55 AM | 5 runs |
| `method2-gate3` | `cron(0-55/5 14 ? * MON-FRI *)` | 10:00-10:55 AM | 12 runs |
| `method2-gate3` | `cron(0 15 ? * MON-FRI *)` | 11:00 AM | 1 run |
| `method2-gate4` | Event-driven | On Gate 3 pass | Per stock |
| `intersection-combiner` | `cron(35-59/5 13 ? * MON-FRI *)` | After each Gate 3 | 17 runs |

**Note:** UTC is ET + 4 hours (EST) or ET + 5 hours (EDT). Cron uses UTC.

---

## 2. METHOD 1: Scanner-Based Screening (Column G)

### 2.1 Liquidity Rules (Non-Negotiable)

| Parameter | Value | Description |
|-----------|-------|-------------|
| Price | $5 – $300 | Avoid penny stocks and expensive names |
| Avg Volume | ≥ 1,000,000 | Ensure sufficient liquidity |
| Relative Volume (RVol) | ≥ 1.5 | Above average activity |
| Spread | ≤ $0.05 | Tight bid-ask spread |

### 2.2 Volatility Sweet Spot

| Parameter | Value | Description |
|-----------|-------|-------------|
| ATR (5-14 day) | ≥ $0.30 | Sufficient price movement |
| Intraday Range Potential | ≥ 1% | Room for profit |

### 2.3 Catalyst Requirement (At Least ONE)

- ✅ Earnings (pre/post market)
- ✅ Analyst upgrade/downgrade
- ✅ Sector momentum
- ✅ Macro sympathy (SPY, QQQ move)
- ✅ News (FDA, guidance, contracts, M&A)

### 2.4 Technical Setup Conditions (Win-Rate Focused)

**Entry Conditions:**
| Condition | Description |
|-----------|-------------|
| Stock above VWAP | Price trading above volume-weighted average |
| Higher highs / higher lows | Uptrend structure confirmed |
| Market aligned (SPY/QQQ) | Broader market trending same direction |

**Entry Triggers:**
| Trigger | Description |
|---------|-------------|
| Pullback to VWAP | Enter on VWAP touch and bounce |
| Pullback to 9-20 EMA | Enter on EMA touch and bounce |
| Confirmation candle | Wait for green candle to confirm |

**Stop Loss Rules:**
| Rule | Description |
|------|-------------|
| Below VWAP | If VWAP is key support |
| Below last higher low | Structure-based stop |

**Profit Targets:**
| Target | Action |
|--------|--------|
| T1: Prior high | Take 50% off position |
| T2: HOD / extension | Let remaining shares run |

### 2.5 Method 1 Data Model

```typescript
// amplify/data/resource.ts
Method1Stock: a.model({
  id: a.id().required(),
  ticker: a.string().required(),
  companyName: a.string(),
  
  // Liquidity Checks
  lastPrice: a.float().required(),
  avgVolume: a.float().required(),
  relativeVolume: a.float(),
  spread: a.float(),
  liquidityPassed: a.boolean(),
  
  // Volatility Checks
  atr: a.float(),
  atrPercent: a.float(),
  intradayRangePct: a.float(),
  volatilityPassed: a.boolean(),
  
  // Catalyst
  hasCatalyst: a.boolean(),
  catalystType: a.enum([
    'EARNINGS',
    'ANALYST_UPGRADE',
    'ANALYST_DOWNGRADE',
    'SECTOR_MOMENTUM',
    'MACRO_SYMPATHY',
    'NEWS_FDA',
    'NEWS_GUIDANCE',
    'NEWS_CONTRACT',
    'NEWS_MA',
    'OTHER'
  ]),
  catalystDescription: a.string(),
  catalystPassed: a.boolean(),
  
  // Technical Setup
  aboveVWAP: a.boolean(),
  higherHighsLows: a.boolean(),
  marketAligned: a.boolean(),
  technicalSetupPassed: a.boolean(),
  
  // Entry Levels
  vwap: a.float(),
  ema9: a.float(),
  ema20: a.float(),
  suggestedEntry: a.float(),
  suggestedStop: a.float(),
  target1: a.float(),
  target2: a.float(),
  
  // Overall Status
  passedMethod1: a.boolean().default(false),
  
  screenDate: a.date().required(),
  screenTime: a.string(),
  createdAt: a.datetime(),
})
.secondaryIndexes((index) => [
  index('screenDate').sortKeys(['passedMethod1']),
])
.authorization((allow) => [
  allow.authenticated().to(['read']),
  allow.group('admin').to(['create', 'update', 'delete']),
]),
```

### 2.6 Method 1 Lambda Function

```typescript
// amplify/functions/method1-scanner/handler.ts
import { Polygon } from '@polygon.io/client-js';
import { generateClient } from 'aws-amplify/data';

const polygon = new Polygon(process.env.POLYGON_API_KEY);

interface Method1Criteria {
  // Liquidity
  minPrice: number;
  maxPrice: number;
  minAvgVolume: number;
  minRelativeVolume: number;
  maxSpread: number;
  // Volatility
  minATR: number;
  minIntradayRange: number;
}

const CRITERIA: Method1Criteria = {
  minPrice: 5,
  maxPrice: 300,
  minAvgVolume: 1000000,
  minRelativeVolume: 1.5,
  maxSpread: 0.05,
  minATR: 0.30,
  minIntradayRange: 1.0,
};

export const handler = async (event: any) => {
  const client = generateClient();
  const today = new Date().toISOString().split('T')[0];
  
  console.log(`[METHOD 1] Starting scanner-based screening for ${today}`);
  
  try {
    // Step 1: Get all active stocks with pre-market activity
    const snapshot = await polygon.stocks.snapshotAllTickers();
    const allStocks = snapshot.tickers || [];
    
    console.log(`[METHOD 1] Scanning ${allStocks.length} stocks`);
    
    // Step 2: Get market context
    const marketContext = await getMarketContext();
    
    const passedStocks: Method1Stock[] = [];
    
    for (const stock of allStocks) {
      try {
        const ticker = stock.ticker;
        const price = stock.day?.c || stock.prevDay?.c || 0;
        
        // === LIQUIDITY CHECKS ===
        
        // Price filter
        if (price < CRITERIA.minPrice || price > CRITERIA.maxPrice) continue;
        
        // Volume filter
        const avgVolume = stock.prevDay?.v || 0;
        if (avgVolume < CRITERIA.minAvgVolume) continue;
        
        // Relative volume
        const currentVolume = stock.day?.v || 0;
        const relativeVolume = avgVolume > 0 ? currentVolume / (avgVolume / 6.5) : 0;
        if (relativeVolume < CRITERIA.minRelativeVolume) continue;
        
        // Spread check (from quote)
        const quote = await polygon.stocks.lastQuote(ticker);
        const spread = (quote.results?.P || 0) - (quote.results?.p || 0);
        if (spread > CRITERIA.maxSpread) continue;
        
        const liquidityPassed = true;
        
        // === VOLATILITY CHECKS ===
        
        const atr = await calculateATR(ticker, 14);
        if (atr < CRITERIA.minATR) continue;
        
        const intradayRangePct = ((stock.day?.h || 0) - (stock.day?.l || 0)) / price * 100;
        if (intradayRangePct < CRITERIA.minIntradayRange) continue;
        
        const volatilityPassed = true;
        
        // === CATALYST CHECK ===
        
        const catalyst = await checkCatalyst(ticker);
        if (!catalyst.hasCatalyst) continue;
        
        const catalystPassed = true;
        
        // === TECHNICAL SETUP CHECK ===
        
        const technicals = await getTechnicalIndicators(ticker);
        
        const aboveVWAP = price > technicals.vwap;
        const aboveEMA9 = price > technicals.ema9;
        const aboveEMA20 = price > technicals.ema20;
        const higherHighsLows = await checkHigherHighsLows(ticker);
        const marketAligned = marketContext.trend === 'BULLISH';
        
        const technicalSetupPassed = aboveVWAP && aboveEMA9 && aboveEMA20 && 
                                      higherHighsLows && marketAligned;
        
        if (!technicalSetupPassed) continue;
        
        // === PASSED ALL CHECKS ===
        
        // Calculate entry levels
        const suggestedEntry = price;
        const suggestedStop = Math.min(technicals.vwap - 0.10, technicals.ema20 - 0.05);
        const risk = suggestedEntry - suggestedStop;
        const target1 = suggestedEntry + (risk * 2);
        const target2 = suggestedEntry + (risk * 3);
        
        passedStocks.push({
          ticker,
          companyName: stock.name,
          lastPrice: price,
          avgVolume,
          relativeVolume,
          spread,
          liquidityPassed,
          atr,
          atrPercent: (atr / price) * 100,
          intradayRangePct,
          volatilityPassed,
          hasCatalyst: catalyst.hasCatalyst,
          catalystType: catalyst.type,
          catalystDescription: catalyst.description,
          catalystPassed,
          aboveVWAP,
          higherHighsLows,
          marketAligned,
          technicalSetupPassed,
          vwap: technicals.vwap,
          ema9: technicals.ema9,
          ema20: technicals.ema20,
          suggestedEntry,
          suggestedStop,
          target1,
          target2,
          passedMethod1: true,
          screenDate: today,
          screenTime: new Date().toTimeString().slice(0, 5),
        });
        
      } catch (stockError) {
        // Skip stocks with errors
        continue;
      }
    }
    
    // Save to database
    for (const stock of passedStocks) {
      await client.models.Method1Stock.create(stock);
    }
    
    console.log(`[METHOD 1] ${passedStocks.length} stocks passed all criteria`);
    
    return {
      statusCode: 200,
      body: {
        date: today,
        method: 'SCANNER',
        totalScanned: allStocks.length,
        passed: passedStocks.length,
        tickers: passedStocks.map(s => s.ticker),
      },
    };
    
  } catch (error) {
    console.error('[METHOD 1] Error:', error);
    throw error;
  }
};

async function checkCatalyst(ticker: string) {
  const news = await polygon.reference.tickerNews({ ticker, limit: 5 });
  const headlines = news.results?.map(n => n.title?.toLowerCase() || '') || [];
  const text = headlines.join(' ');
  
  if (headlines.length === 0) {
    return { hasCatalyst: false, type: null, description: null };
  }
  
  let type = 'OTHER';
  if (text.includes('earnings') || text.includes('revenue')) type = 'EARNINGS';
  else if (text.includes('upgrade')) type = 'ANALYST_UPGRADE';
  else if (text.includes('downgrade')) type = 'ANALYST_DOWNGRADE';
  else if (text.includes('fda')) type = 'NEWS_FDA';
  else if (text.includes('guidance')) type = 'NEWS_GUIDANCE';
  else if (text.includes('contract') || text.includes('deal')) type = 'NEWS_CONTRACT';
  else if (text.includes('acquisition') || text.includes('merger')) type = 'NEWS_MA';
  
  return {
    hasCatalyst: true,
    type,
    description: news.results?.[0]?.title || '',
  };
}

async function getMarketContext() {
  const spy = await polygon.stocks.snapshotTicker('SPY');
  const qqq = await polygon.stocks.snapshotTicker('QQQ');
  
  const spyChange = spy.ticker?.todaysChangePerc || 0;
  const qqqChange = qqq.ticker?.todaysChangePerc || 0;
  
  const trend = (spyChange > 0.1 && qqqChange > 0.1) ? 'BULLISH' :
                (spyChange < -0.1 && qqqChange < -0.1) ? 'BEARISH' : 'NEUTRAL';
  
  return { spyChange, qqqChange, trend };
}
```

---

## 3. METHOD 2: GATE System (Column L)

### 3.1 GATE 1 – Pre-Market Universe Builder

**Time:** 8:45 AM ET (06:00–09:00 window)  
**Purpose:** Reduce 10,000+ stocks → ~50 candidates

| Filter | Value |
|--------|-------|
| Price | $10 – $500 |
| Avg Volume (30D) | > 1,000,000 |
| Pre-market Volume Spike | ≥ 2× average |
| ATR | ≥ 2% |
| Exclusions | Penny stocks, ETFs |

### 3.2 GATE 2 – Technical Alignment Screener

**Time:** 9:25 AM ET  
**Purpose:** Identify stocks technically prepared

| Condition | Description |
|-----------|-------------|
| Price above VWAP | Trading above volume-weighted average |
| Above 9 EMA | Above short-term trend |
| Above 20 EMA | Above medium-term trend |
| Relative Volume > 1.5 | Above average participation |
| Market trend aligned | SPY/QQQ trending same direction |

### 3.3 GATE 3 – Time-Based Execution Filter

**Time:** 9:35 AM – 11:00 AM ET (every 5 minutes)  
**Purpose:** Prevent early chop & fake breakouts

| Condition | Description |
|-----------|-------------|
| First 5-min candle holds above VWAP | Confirms strength |
| No VWAP rejection wick | No bearish rejection |
| Volume expansion > previous candle | Increasing participation |
| SPY trend agrees | Market confirmation |

### 3.4 GATE 4 – Risk & Execution Validator

**Trigger:** On every Gate 3 pass  
**Purpose:** Final validation before "Ready to Buy"

| Check | Description |
|-------|-------------|
| ✅ Passed Gate 1 | Pre-market filter |
| ✅ Passed Gate 2 | Technical alignment |
| ✅ Passed Gate 3 | Execution timing |
| ✅ Risk ≤ max loss | Within position sizing |
| ✅ Market volatility OK | VIX acceptable |

### 3.5 Method 2 Data Model

```typescript
// amplify/data/resource.ts
Method2Stock: a.model({
  id: a.id().required(),
  ticker: a.string().required(),
  companyName: a.string(),
  
  // Gate 1 Data
  lastPrice: a.float().required(),
  avgVolume30D: a.float(),
  preMarketVolume: a.float(),
  volumeSpike: a.float(),
  atrPercent: a.float(),
  passedGate1: a.boolean().default(false),
  gate1Time: a.string(),
  
  // Gate 2 Data
  vwap: a.float(),
  ema9: a.float(),
  ema20: a.float(),
  aboveVWAP: a.boolean(),
  aboveEMA9: a.boolean(),
  aboveEMA20: a.boolean(),
  relativeVolume: a.float(),
  spyTrend: a.enum(['BULLISH', 'BEARISH', 'NEUTRAL']),
  qqqTrend: a.enum(['BULLISH', 'BEARISH', 'NEUTRAL']),
  marketAligned: a.boolean(),
  passedGate2: a.boolean().default(false),
  gate2Time: a.string(),
  
  // Gate 3 Data
  holdsAboveVWAP: a.boolean(),
  noRejectionWick: a.boolean(),
  volumeExpansion: a.boolean(),
  spyAgrees: a.boolean(),
  passedGate3: a.boolean().default(false),
  gate3Time: a.string(),
  
  // Gate 4 Data
  riskPerShare: a.float(),
  maxShares: a.integer(),
  riskCheckPassed: a.boolean(),
  vixLevel: a.float(),
  marketVolatilityOK: a.boolean(),
  passedGate4: a.boolean().default(false),
  gate4Time: a.string(),
  
  // Setup Info
  setupType: a.enum([
    'VWAP_RECLAIM',
    'VWAP_REJECTION',
    'ORB_BREAKOUT',
    'HRV_PULLBACK',
    'TREND_CONTINUATION',
    'GAP_AND_GO',
  ]),
  setupQuality: a.enum(['A_PLUS', 'A', 'B', 'C']),
  
  // Entry Levels
  suggestedEntry: a.float(),
  suggestedStop: a.float(),
  suggestedTarget1: a.float(),
  suggestedTarget2: a.float(),
  riskRewardRatio: a.float(),
  
  // Overall Status
  passedMethod2: a.boolean().default(false),
  
  screenDate: a.date().required(),
  createdAt: a.datetime(),
})
.secondaryIndexes((index) => [
  index('screenDate').sortKeys(['passedMethod2']),
])
.authorization((allow) => [
  allow.authenticated().to(['read']),
  allow.group('admin').to(['create', 'update', 'delete']),
]),
```

### 3.6 Method 2 Lambda Functions

#### Gate 1 Function (8:45 AM)

```typescript
// amplify/functions/method2-gate1/handler.ts
export const handler = async (event: any) => {
  const client = generateClient();
  const today = new Date().toISOString().split('T')[0];
  
  console.log(`[METHOD 2 - GATE 1] Starting pre-market scan`);
  
  const snapshot = await polygon.stocks.snapshotAllTickers();
  const candidates: Method2Stock[] = [];
  
  for (const stock of snapshot.tickers || []) {
    const price = stock.day?.c || stock.prevDay?.c || 0;
    
    // Gate 1 Filters
    if (price < 10 || price > 500) continue;
    
    const avgVolume = stock.prevDay?.v || 0;
    if (avgVolume < 1000000) continue;
    
    const preMarketVolume = stock.day?.v || 0;
    const volumeSpike = avgVolume > 0 ? preMarketVolume / (avgVolume / 6.5) : 0;
    if (volumeSpike < 2.0) continue;
    
    const atr = Math.abs((stock.day?.h || 0) - (stock.day?.l || 0));
    const atrPercent = price > 0 ? (atr / price) * 100 : 0;
    if (atrPercent < 2.0) continue;
    
    // Skip ETFs (would need additional check)
    
    candidates.push({
      ticker: stock.ticker,
      lastPrice: price,
      avgVolume30D: avgVolume,
      preMarketVolume,
      volumeSpike,
      atrPercent,
      passedGate1: true,
      gate1Time: new Date().toTimeString().slice(0, 5),
      screenDate: today,
    });
  }
  
  // Save candidates
  for (const stock of candidates.slice(0, 50)) {
    await client.models.Method2Stock.create(stock);
  }
  
  console.log(`[METHOD 2 - GATE 1] ${candidates.length} passed, saved top 50`);
  
  return { passed: Math.min(candidates.length, 50), tickers: candidates.slice(0, 50).map(s => s.ticker) };
};
```

#### Gate 2 Function (9:25 AM)

```typescript
// amplify/functions/method2-gate2/handler.ts
export const handler = async (event: any) => {
  const client = generateClient();
  const today = new Date().toISOString().split('T')[0];
  
  console.log(`[METHOD 2 - GATE 2] Starting technical alignment check`);
  
  // Get Gate 1 passed stocks
  const gate1Stocks = await client.models.Method2Stock.list({
    filter: { screenDate: { eq: today }, passedGate1: { eq: true } },
  });
  
  const marketContext = await getMarketContext();
  let passedCount = 0;
  
  for (const stock of gate1Stocks.data || []) {
    const technicals = await getTechnicalIndicators(stock.ticker);
    
    const aboveVWAP = stock.lastPrice > technicals.vwap;
    const aboveEMA9 = stock.lastPrice > technicals.ema9;
    const aboveEMA20 = stock.lastPrice > technicals.ema20;
    const highRVol = technicals.relativeVolume > 1.5;
    const marketAligned = marketContext.trend === 'BULLISH';
    
    const passedGate2 = aboveVWAP && aboveEMA9 && aboveEMA20 && highRVol && marketAligned;
    
    if (passedGate2) {
      await client.models.Method2Stock.update({
        id: stock.id,
        vwap: technicals.vwap,
        ema9: technicals.ema9,
        ema20: technicals.ema20,
        aboveVWAP,
        aboveEMA9,
        aboveEMA20,
        relativeVolume: technicals.relativeVolume,
        spyTrend: marketContext.spyTrend,
        qqqTrend: marketContext.qqqTrend,
        marketAligned,
        passedGate2: true,
        gate2Time: new Date().toTimeString().slice(0, 5),
      });
      passedCount++;
    }
  }
  
  console.log(`[METHOD 2 - GATE 2] ${passedCount} passed technical alignment`);
  
  return { passed: passedCount };
};
```

#### Gate 3 Function (9:35-11:00 AM, every 5 min)

```typescript
// amplify/functions/method2-gate3/handler.ts
export const handler = async (event: any) => {
  const client = generateClient();
  const today = new Date().toISOString().split('T')[0];
  
  console.log(`[METHOD 2 - GATE 3] Running execution filter`);
  
  // Get Gate 2 passed stocks
  const gate2Stocks = await client.models.Method2Stock.list({
    filter: { screenDate: { eq: today }, passedGate2: { eq: true }, passedGate3: { eq: false } },
  });
  
  const spyTrend = await getCurrentSpyTrend();
  let passedCount = 0;
  
  for (const stock of gate2Stocks.data || []) {
    const candles = await getLast5MinCandles(stock.ticker, 2);
    if (candles.length < 2) continue;
    
    const current = candles[1];
    const previous = candles[0];
    
    const holdsAboveVWAP = current.low > stock.vwap;
    const noRejectionWick = !hasRejectionWick(current, stock.vwap);
    const volumeExpansion = current.volume > previous.volume;
    const spyAgrees = spyTrend === 'BULLISH';
    
    const passedGate3 = holdsAboveVWAP && noRejectionWick && volumeExpansion && spyAgrees;
    
    if (passedGate3) {
      const setupType = determineSetupType(stock, current);
      const setupQuality = calculateSetupQuality(stock);
      const levels = calculateLevels(current, stock.vwap);
      
      await client.models.Method2Stock.update({
        id: stock.id,
        holdsAboveVWAP,
        noRejectionWick,
        volumeExpansion,
        spyAgrees,
        passedGate3: true,
        gate3Time: new Date().toTimeString().slice(0, 5),
        setupType,
        setupQuality,
        suggestedEntry: levels.entry,
        suggestedStop: levels.stop,
        suggestedTarget1: levels.target1,
        suggestedTarget2: levels.target2,
        riskRewardRatio: levels.rr,
      });
      passedCount++;
      
      // Trigger Gate 4 validation
      await triggerGate4(stock.id);
    }
  }
  
  console.log(`[METHOD 2 - GATE 3] ${passedCount} passed execution filter`);
  
  return { passed: passedCount };
};
```

#### Gate 4 Function (On Gate 3 Pass)

```typescript
// amplify/functions/method2-gate4/handler.ts
export const handler = async (event: any) => {
  const client = generateClient();
  const stockId = event.stockId;
  
  const stock = await client.models.Method2Stock.get({ id: stockId });
  if (!stock.data) return { passed: false };
  
  // Risk validation
  const maxRiskPercent = 0.01; // 1%
  const accountSize = 25000;
  const maxRiskDollars = accountSize * maxRiskPercent;
  
  const riskPerShare = stock.data.suggestedEntry - stock.data.suggestedStop;
  const maxShares = Math.floor(maxRiskDollars / riskPerShare);
  const riskCheckPassed = riskPerShare > 0 && maxShares >= 1;
  
  // Market volatility check
  const vix = await getVIXLevel();
  const marketVolatilityOK = vix < 25;
  
  const passedGate4 = riskCheckPassed && marketVolatilityOK && 
                      stock.data.setupQuality !== 'C';
  
  await client.models.Method2Stock.update({
    id: stockId,
    riskPerShare,
    maxShares,
    riskCheckPassed,
    vixLevel: vix,
    marketVolatilityOK,
    passedGate4,
    gate4Time: new Date().toTimeString().slice(0, 5),
    passedMethod2: passedGate4,
  });
  
  console.log(`[METHOD 2 - GATE 4] ${stock.data.ticker}: ${passedGate4 ? 'PASSED' : 'FAILED'}`);
  
  return { passed: passedGate4, ticker: stock.data.ticker };
};
```

---

## 4. INTERSECTION: Combining Both Methods

### 4.1 Final Results Data Model

```typescript
// amplify/data/resource.ts
AIScreeningResult: a.model({
  id: a.id().required(),
  ticker: a.string().required(),
  companyName: a.string(),
  
  // Method References
  method1StockId: a.string().required(),
  method2StockId: a.string().required(),
  
  // Combined Status
  passedMethod1: a.boolean().default(true),
  passedMethod2: a.boolean().default(true),
  passedBothMethods: a.boolean().default(true),
  
  // Best Values from Both Methods
  currentPrice: a.float().required(),
  changePercent: a.float(),
  vwap: a.float(),
  
  // ═══════════════════════════════════════════════════════════════
  // LAST CLOSING PRICE (Planned)
  // Source: Polygon API /v2/aggs/ticker/{ticker}/prev
  // ═══════════════════════════════════════════════════════════════
  previousClose: a.float(),              // Previous day's closing price
  gapFromClose: a.float(),               // currentPrice - previousClose
  gapFromClosePercent: a.float(),        // ((current - prev) / prev) * 100
  
  // ═══════════════════════════════════════════════════════════════
  // PRICE RANGES (Planned)
  // Source: Polygon API /v2/aggs/ticker/{ticker}/range/1/day/{from}/{to}
  // ═══════════════════════════════════════════════════════════════
  priceRanges: a.customType({
    days5: a.customType({
      low: a.float(),                    // 5-day low price
      high: a.float(),                   // 5-day high price
    }),
    days30: a.customType({
      low: a.float(),                    // 30-day low price
      high: a.float(),                   // 30-day high price
    }),
    weeks52: a.customType({
      low: a.float(),                    // 52-week low price
      high: a.float(),                   // 52-week high price
    }),
  }),
  
  // ═══════════════════════════════════════════════════════════════
  // AI-IDENTIFIED ENTRY & EXIT PRICES (Planned)
  // Source: AI analysis in method1-step3-technical or method2-gate3
  // ═══════════════════════════════════════════════════════════════
  aiIdentifiedLevels: a.customType({
    entryPrice: a.float(),               // AI-identified optimal entry
    exitPrice: a.float(),                // AI-identified target exit
    entryReason: a.string(),             // e.g., "VWAP support + 9 EMA bounce"
    exitReason: a.string(),              // e.g., "52-week high resistance"
    confidence: a.enum(['HIGH', 'MEDIUM', 'LOW']),
    analysisFactors: a.string().array(), // Factors considered
  }),
  
  // Setup (from Method 2 GATE system)
  setupType: a.enum([
    'VWAP_RECLAIM',
    'VWAP_REJECTION',
    'ORB_BREAKOUT',
    'HRV_PULLBACK',
    'TREND_CONTINUATION',
    'GAP_AND_GO',
  ]),
  setupQuality: a.enum(['A_PLUS', 'A', 'B', 'C']),
  
  // Catalyst (from Method 1)
  catalystType: a.string(),
  catalystDescription: a.string(),
  
  // Entry Levels (consensus from both) - IMPLEMENTED
  suggestedEntry: a.float(),
  suggestedStop: a.float(),
  suggestedTarget1: a.float(),           // Used to calculate avgTargetPrice
  suggestedTarget2: a.float(),           // Used to calculate avgTargetPrice
  riskRewardRatio: a.float(),
  // Note: avgTargetPrice = (target1 + target2) / 2 (calculated in UI)
  // Note: growthPercent = ((avgTarget - currentPrice) / currentPrice) * 100
  
  // Risk Info
  riskPerShare: a.float(),
  maxShares: a.integer(),
  
  // Market Context
  spyTrend: a.enum(['BULLISH', 'BEARISH', 'NEUTRAL']),
  qqqTrend: a.enum(['BULLISH', 'BEARISH', 'NEUTRAL']),
  vixLevel: a.float(),
  
  // Status
  isActive: a.boolean().default(true),
  alertSentAt: a.datetime(),
  
  screenDate: a.date().required(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
})
.secondaryIndexes((index) => [
  index('screenDate').sortKeys(['setupQuality']),
  index('isActive'),
])
.authorization((allow) => [allow.authenticated()]),
```

### 4.2 Intersection Lambda Function

```typescript
// amplify/functions/intersection-combiner/handler.ts
import { generateClient } from 'aws-amplify/data';

export const handler = async (event: any) => {
  const client = generateClient();
  const today = new Date().toISOString().split('T')[0];
  
  console.log(`[INTERSECTION] Combining results from both methods for ${today}`);
  
  try {
    // Get all stocks that passed Method 1
    const method1Passed = await client.models.Method1Stock.list({
      filter: { screenDate: { eq: today }, passedMethod1: { eq: true } },
    });
    const method1Tickers = new Map(
      (method1Passed.data || []).map(s => [s.ticker, s])
    );
    
    // Get all stocks that passed Method 2 (all 4 gates)
    const method2Passed = await client.models.Method2Stock.list({
      filter: { screenDate: { eq: today }, passedMethod2: { eq: true } },
    });
    const method2Tickers = new Map(
      (method2Passed.data || []).map(s => [s.ticker, s])
    );
    
    console.log(`[INTERSECTION] Method 1: ${method1Tickers.size} stocks`);
    console.log(`[INTERSECTION] Method 2: ${method2Tickers.size} stocks`);
    
    // Find INTERSECTION (common stocks)
    const commonTickers: string[] = [];
    for (const ticker of method1Tickers.keys()) {
      if (method2Tickers.has(ticker)) {
        commonTickers.push(ticker);
      }
    }
    
    console.log(`[INTERSECTION] Common stocks: ${commonTickers.length}`);
    console.log(`[INTERSECTION] Tickers: ${commonTickers.join(', ')}`);
    
    // Create final AI Screening Results
    const finalResults: AIScreeningResult[] = [];
    
    for (const ticker of commonTickers) {
      const m1 = method1Tickers.get(ticker)!;
      const m2 = method2Tickers.get(ticker)!;
      
      const result: AIScreeningResult = {
        ticker,
        companyName: m1.companyName || m2.companyName,
        method1StockId: m1.id,
        method2StockId: m2.id,
        passedMethod1: true,
        passedMethod2: true,
        passedBothMethods: true,
        currentPrice: m2.lastPrice || m1.lastPrice,
        vwap: m2.vwap || m1.vwap,
        
        // Setup from Method 2 (GATE system)
        setupType: m2.setupType,
        setupQuality: m2.setupQuality,
        
        // Catalyst from Method 1
        catalystType: m1.catalystType,
        catalystDescription: m1.catalystDescription,
        
        // Entry levels (use Method 2 as primary, Method 1 as fallback)
        suggestedEntry: m2.suggestedEntry || m1.suggestedEntry,
        suggestedStop: m2.suggestedStop || m1.suggestedStop,
        suggestedTarget1: m2.suggestedTarget1 || m1.target1,
        suggestedTarget2: m2.suggestedTarget2 || m1.target2,
        riskRewardRatio: m2.riskRewardRatio || 2.0,
        
        // Risk info from Method 2
        riskPerShare: m2.riskPerShare,
        maxShares: m2.maxShares,
        
        // Market context
        spyTrend: m2.spyTrend,
        qqqTrend: m2.qqqTrend,
        vixLevel: m2.vixLevel,
        
        isActive: true,
        screenDate: today,
      };
      
      // Save to database
      const created = await client.models.AIScreeningResult.create(result);
      finalResults.push(created.data);
      
      // Send real-time notification
      console.log(`[INTERSECTION] 🎯 READY TO BUY: ${ticker} (${result.setupQuality})`);
    }
    
    return {
      statusCode: 200,
      body: {
        date: today,
        method1Count: method1Tickers.size,
        method2Count: method2Tickers.size,
        intersectionCount: commonTickers.length,
        finalResults: finalResults.map(r => ({
          ticker: r.ticker,
          setup: r.setupType,
          quality: r.setupQuality,
          catalyst: r.catalystType,
          entry: r.suggestedEntry,
          stop: r.suggestedStop,
          target: r.suggestedTarget1,
          rr: r.riskRewardRatio,
        })),
      },
    };
    
  } catch (error) {
    console.error('[INTERSECTION] Error:', error);
    throw error;
  }
};
```

### 4.3 Scheduled Functions Summary

| Function | Schedule (ET) | Purpose |
|----------|---------------|---------|
| `method1-scanner` | 8:45 AM | Method 1: Full scanner check |
| `method2-gate1` | 8:45 AM | Method 2: Gate 1 pre-market |
| `method2-gate2` | 9:25 AM | Method 2: Gate 2 technical |
| `method2-gate3` | 9:35-11:00 AM (every 5 min) | Method 2: Gate 3 execution |
| `method2-gate4` | On Gate 3 pass | Method 2: Gate 4 risk |
| `intersection-combiner` | 9:35 AM + every 5 min | Combine & find common stocks |

---

## 5. Frontend UI - Final AI Results

```tsx
// features/ai-screener/components/AIScreeningResultsTable.tsx
export function AIScreeningResultsTable() {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: results, isLoading } = useQuery({
    queryKey: ['ai-screening-results', today],
    queryFn: async () => {
      const result = await client.models.AIScreeningResult.list({
        filter: { screenDate: { eq: today }, isActive: { eq: true } },
      });
      return result.data?.sort((a, b) => {
        const qualityOrder = { 'A_PLUS': 0, 'A': 1, 'B': 2, 'C': 3 };
        return (qualityOrder[a.setupQuality] || 3) - (qualityOrder[b.setupQuality] || 3);
      });
    },
    refetchInterval: 30000,
  });
  
  // Real-time subscription for new results
  useEffect(() => {
    const subscription = client.models.AIScreeningResult.onCreate().subscribe({
      next: (data) => {
        toast.success(`🎯 New AI Result: ${data.ticker} (${data.setupQuality})`, {
          description: `Passed BOTH screening methods!`,
          action: { label: 'View', onClick: () => scrollToStock(data.ticker) },
        });
        queryClient.invalidateQueries(['ai-screening-results']);
      },
    });
    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              AI Screening Results
            </CardTitle>
            <CardDescription>
              Stocks that passed BOTH Method 1 (Scanner) AND Method 2 (GATE System)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Method 1 ✓
            </Badge>
            <Badge variant="outline">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Method 2 ✓
            </Badge>
            <Badge variant="default">
              {results?.length || 0} stocks
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={3} columns={9} />
        ) : results?.length === 0 ? (
          <EmptyState
            icon={<Search className="w-12 h-12" />}
            title="No intersection results yet"
            description="The AI is running both screening methods. Results appear when stocks pass BOTH methods."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticker</TableHead>
                <TableHead>Setup</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Catalyst</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>Stop</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>R:R</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results?.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{stock.ticker}</span>
                      <Badge variant="success" className="text-xs">
                        ✓ Both
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {stock.setupType?.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      stock.setupQuality === 'A_PLUS' ? 'success' :
                      stock.setupQuality === 'A' ? 'default' : 'secondary'
                    }>
                      {stock.setupQuality === 'A_PLUS' ? 'A+' : stock.setupQuality}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {stock.catalystType?.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">
                    ${stock.suggestedEntry?.toFixed(2)}
                  </TableCell>
                  <TableCell className="font-mono text-red-500">
                    ${stock.suggestedStop?.toFixed(2)}
                  </TableCell>
                  <TableCell className="font-mono text-green-500">
                    ${stock.suggestedTarget1?.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={stock.riskRewardRatio >= 2 ? 'success' : 'default'}>
                      {stock.riskRewardRatio?.toFixed(1)}:1
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => openLogTradeDialog(stock)}>
                      Log Trade
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 7. Screening Pipeline Page - Detailed Results View

This page provides transparency into the screening process by showing results at each stage of both methods.

### 7.1 Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI SCREENING PIPELINE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      PIPELINE OVERVIEW                               │    │
│  │  ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐    │    │
│  │  │ M1  │───►│ M2  │───►│ M2  │───►│ M2  │───►│ M2  │───►│FINAL│    │    │
│  │  │     │    │ G1  │    │ G2  │    │ G3  │    │ G4  │    │     │    │    │
│  │  │ 45  │    │ 50  │    │ 18  │    │  8  │    │  6  │    │  4  │    │    │
│  │  └─────┘    └─────┘    └─────┘    └─────┘    └─────┘    └─────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐        │
│  │       METHOD 1 RESULTS       │  │       METHOD 2 RESULTS       │        │
│  │       (Scanner-Based)        │  │       (GATE System)          │        │
│  │                              │  │                              │        │
│  │  [Tabs: All | Liquidity |   │  │  [Tabs: Gate1 | Gate2 |      │        │
│  │   Volatility | Catalyst |   │  │   Gate3 | Gate4 | Final]     │        │
│  │   Technical]                │  │                              │        │
│  │                              │  │                              │        │
│  │  ┌────────────────────────┐ │  │  ┌────────────────────────┐  │        │
│  │  │     Results Table      │ │  │  │     Results Table      │  │        │
│  │  │                        │ │  │  │                        │  │        │
│  │  └────────────────────────┘ │  │  └────────────────────────┘  │        │
│  └──────────────────────────────┘  └──────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Pipeline Overview Component

```tsx
// features/ai-screener/components/PipelineOverview.tsx
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

interface PipelineStats {
  method1Count: number;
  gate1Count: number;
  gate2Count: number;
  gate3Count: number;
  gate4Count: number;
  finalCount: number;
  lastUpdated: string;
}

export function PipelineOverview({ stats }: { stats: PipelineStats }) {
  const stages = [
    { label: 'Method 1', sublabel: 'Scanner', count: stats.method1Count, color: 'bg-blue-500' },
    { label: 'Gate 1', sublabel: 'Pre-Market', count: stats.gate1Count, color: 'bg-purple-500' },
    { label: 'Gate 2', sublabel: 'Technical', count: stats.gate2Count, color: 'bg-indigo-500' },
    { label: 'Gate 3', sublabel: 'Execution', count: stats.gate3Count, color: 'bg-cyan-500' },
    { label: 'Gate 4', sublabel: 'Risk', count: stats.gate4Count, color: 'bg-teal-500' },
    { label: 'Final', sublabel: 'Intersection', count: stats.finalCount, color: 'bg-green-500' },
  ];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Screening Pipeline</CardTitle>
          <span className="text-sm text-muted-foreground">
            Last updated: {stats.lastUpdated}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-2">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.label}>
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl',
                  stage.color
                )}>
                  {stage.count}
                </div>
                <span className="mt-2 font-medium text-sm">{stage.label}</span>
                <span className="text-xs text-muted-foreground">{stage.sublabel}</span>
              </div>
              {index < stages.length - 1 && (
                <ArrowRight className="w-6 h-6 text-muted-foreground flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Conversion rates */}
        <div className="mt-6 grid grid-cols-5 gap-4 text-center text-sm">
          <div>
            <span className="text-muted-foreground">G1 Pass Rate</span>
            <p className="font-medium">
              {stats.gate1Count > 0 ? ((stats.gate2Count / stats.gate1Count) * 100).toFixed(0) : 0}%
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">G2 Pass Rate</span>
            <p className="font-medium">
              {stats.gate2Count > 0 ? ((stats.gate3Count / stats.gate2Count) * 100).toFixed(0) : 0}%
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">G3 Pass Rate</span>
            <p className="font-medium">
              {stats.gate3Count > 0 ? ((stats.gate4Count / stats.gate3Count) * 100).toFixed(0) : 0}%
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">G4 Pass Rate</span>
            <p className="font-medium">
              {stats.gate4Count > 0 ? ((stats.finalCount / stats.gate4Count) * 100).toFixed(0) : 0}%
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Overall</span>
            <p className="font-medium text-green-500">
              {stats.gate1Count > 0 ? ((stats.finalCount / stats.gate1Count) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 7.3 Method 1 Detailed Results

```tsx
// features/ai-screener/components/Method1Results.tsx
export function Method1Results() {
  const today = new Date().toISOString().split('T')[0];
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: stocks, isLoading } = useQuery({
    queryKey: ['method1-stocks', today],
    queryFn: async () => {
      const result = await client.models.Method1Stock.list({
        filter: { screenDate: { eq: today } },
      });
      return result.data;
    },
  });
  
  // Filter based on tab
  const filteredStocks = useMemo(() => {
    if (!stocks) return [];
    switch (activeTab) {
      case 'liquidity':
        return stocks.filter(s => s.liquidityPassed);
      case 'volatility':
        return stocks.filter(s => s.liquidityPassed && s.volatilityPassed);
      case 'catalyst':
        return stocks.filter(s => s.liquidityPassed && s.volatilityPassed && s.catalystPassed);
      case 'technical':
        return stocks.filter(s => s.passedMethod1);
      default:
        return stocks;
    }
  }, [stocks, activeTab]);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-500" />
              Method 1: Scanner Results
            </CardTitle>
            <CardDescription>
              Liquidity → Volatility → Catalyst → Technical Setup
            </CardDescription>
          </div>
          <Badge variant="outline">
            {filteredStocks.length} stocks
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              All ({stocks?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="liquidity">
              Liquidity ({stocks?.filter(s => s.liquidityPassed).length || 0})
            </TabsTrigger>
            <TabsTrigger value="volatility">
              Volatility ({stocks?.filter(s => s.volatilityPassed).length || 0})
            </TabsTrigger>
            <TabsTrigger value="catalyst">
              Catalyst ({stocks?.filter(s => s.catalystPassed).length || 0})
            </TabsTrigger>
            <TabsTrigger value="technical">
              Passed ✓ ({stocks?.filter(s => s.passedMethod1).length || 0})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            <Method1Table stocks={filteredStocks} activeTab={activeTab} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Method 1 Table with conditional columns based on tab
function Method1Table({ stocks, activeTab }: { stocks: Method1Stock[], activeTab: string }) {
  const columns: ColumnDef<Method1Stock>[] = [
    {
      accessorKey: 'ticker',
      header: 'Ticker',
      cell: ({ row }) => (
        <span className="font-bold">{row.getValue('ticker')}</span>
      ),
    },
    {
      accessorKey: 'lastPrice',
      header: 'Price',
      cell: ({ row }) => `${row.getValue<number>('lastPrice')?.toFixed(2)}`,
    },
    // Liquidity columns
    {
      accessorKey: 'avgVolume',
      header: 'Avg Volume',
      cell: ({ row }) => formatVolume(row.getValue('avgVolume')),
    },
    {
      accessorKey: 'relativeVolume',
      header: 'RVol',
      cell: ({ row }) => (
        <Badge variant={row.getValue<number>('relativeVolume') >= 1.5 ? 'success' : 'secondary'}>
          {row.getValue<number>('relativeVolume')?.toFixed(1)}x
        </Badge>
      ),
    },
    {
      accessorKey: 'spread',
      header: 'Spread',
      cell: ({ row }) => (
        <Badge variant={row.getValue<number>('spread') <= 0.05 ? 'success' : 'destructive'}>
          ${row.getValue<number>('spread')?.toFixed(2)}
        </Badge>
      ),
    },
    // Volatility columns
    {
      accessorKey: 'atr',
      header: 'ATR',
      cell: ({ row }) => `${row.getValue<number>('atr')?.toFixed(2)}`,
    },
    {
      accessorKey: 'intradayRangePct',
      header: 'Range %',
      cell: ({ row }) => (
        <Badge variant={row.getValue<number>('intradayRangePct') >= 1 ? 'success' : 'secondary'}>
          {row.getValue<number>('intradayRangePct')?.toFixed(1)}%
        </Badge>
      ),
    },
    // Catalyst column
    {
      accessorKey: 'catalystType',
      header: 'Catalyst',
      cell: ({ row }) => (
        row.original.hasCatalyst ? (
          <Badge variant="outline">
            {row.getValue<string>('catalystType')?.replace(/_/g, ' ')}
          </Badge>
        ) : (
          <span className="text-muted-foreground">None</span>
        )
      ),
    },
    // Technical columns
    {
      accessorKey: 'aboveVWAP',
      header: 'VWAP',
      cell: ({ row }) => (
        row.getValue('aboveVWAP') ? 
          <CheckCircle2 className="w-4 h-4 text-green-500" /> : 
          <XCircle className="w-4 h-4 text-red-500" />
      ),
    },
    {
      accessorKey: 'marketAligned',
      header: 'Mkt Align',
      cell: ({ row }) => (
        row.getValue('marketAligned') ? 
          <CheckCircle2 className="w-4 h-4 text-green-500" /> : 
          <XCircle className="w-4 h-4 text-red-500" />
      ),
    },
    // Status column
    {
      accessorKey: 'passedMethod1',
      header: 'Status',
      cell: ({ row }) => (
        row.getValue('passedMethod1') ? (
          <Badge variant="success">Passed</Badge>
        ) : (
          <Badge variant="secondary">Filtered</Badge>
        )
      ),
    },
  ];
  
  return (
    <DataTable columns={columns} data={stocks} />
  );
}
```

### 7.4 Method 2 (GATE System) Detailed Results

```tsx
// features/ai-screener/components/Method2Results.tsx
export function Method2Results() {
  const today = new Date().toISOString().split('T')[0];
  const [activeGate, setActiveGate] = useState('gate1');
  
  const { data: stocks, isLoading } = useQuery({
    queryKey: ['method2-stocks', today],
    queryFn: async () => {
      const result = await client.models.Method2Stock.list({
        filter: { screenDate: { eq: today } },
      });
      return result.data;
    },
  });
  
  // Filter based on gate
  const filteredStocks = useMemo(() => {
    if (!stocks) return [];
    switch (activeGate) {
      case 'gate1':
        return stocks.filter(s => s.passedGate1);
      case 'gate2':
        return stocks.filter(s => s.passedGate2);
      case 'gate3':
        return stocks.filter(s => s.passedGate3);
      case 'gate4':
        return stocks.filter(s => s.passedGate4);
      case 'final':
        return stocks.filter(s => s.passedMethod2);
      default:
        return stocks;
    }
  }, [stocks, activeGate]);
  
  // Gate info for display
  const gateInfo = {
    gate1: {
      title: 'Gate 1: Pre-Market Universe',
      description: 'Price $10-$500, Volume >1M, Spike ≥2×, ATR ≥2%',
      time: '8:45 AM ET',
    },
    gate2: {
      title: 'Gate 2: Technical Alignment',
      description: 'Above VWAP, Above EMAs, RVol >1.5, Market aligned',
      time: '9:25 AM ET',
    },
    gate3: {
      title: 'Gate 3: Execution Filter',
      description: 'Holds VWAP, No rejection, Volume expansion, SPY agrees',
      time: '9:35-11:00 AM ET',
    },
    gate4: {
      title: 'Gate 4: Risk Validation',
      description: 'Risk check, VIX check, Quality filter',
      time: 'On Gate 3 pass',
    },
    final: {
      title: 'Final: All Gates Passed',
      description: 'Stocks that passed all 4 gates',
      time: 'Continuous',
    },
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-500" />
              Method 2: GATE System Results
            </CardTitle>
            <CardDescription>
              {gateInfo[activeGate].description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {gateInfo[activeGate].time}
            </span>
            <Badge variant="outline">
              {filteredStocks.length} stocks
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeGate} onValueChange={setActiveGate}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="gate1" className="flex flex-col">
              <span>Gate 1</span>
              <span className="text-xs text-muted-foreground">
                {stocks?.filter(s => s.passedGate1).length || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger value="gate2" className="flex flex-col">
              <span>Gate 2</span>
              <span className="text-xs text-muted-foreground">
                {stocks?.filter(s => s.passedGate2).length || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger value="gate3" className="flex flex-col">
              <span>Gate 3</span>
              <span className="text-xs text-muted-foreground">
                {stocks?.filter(s => s.passedGate3).length || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger value="gate4" className="flex flex-col">
              <span>Gate 4</span>
              <span className="text-xs text-muted-foreground">
                {stocks?.filter(s => s.passedGate4).length || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger value="final" className="flex flex-col">
              <span>Final ✓</span>
              <span className="text-xs text-muted-foreground">
                {stocks?.filter(s => s.passedMethod2).length || 0}
              </span>
            </TabsTrigger>
          </TabsList>
          
          {/* Gate-specific info banner */}
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertTitle>{gateInfo[activeGate].title}</AlertTitle>
            <AlertDescription>
              {gateInfo[activeGate].description}
            </AlertDescription>
          </Alert>
          
          <TabsContent value={activeGate} className="mt-4">
            <GateTable stocks={filteredStocks} gate={activeGate} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Gate-specific table with conditional columns
function GateTable({ stocks, gate }: { stocks: Method2Stock[], gate: string }) {
  const getColumns = (): ColumnDef<Method2Stock>[] => {
    const baseColumns: ColumnDef<Method2Stock>[] = [
      {
        accessorKey: 'ticker',
        header: 'Ticker',
        cell: ({ row }) => (
          <span className="font-bold">{row.getValue('ticker')}</span>
        ),
      },
      {
        accessorKey: 'lastPrice',
        header: 'Price',
        cell: ({ row }) => `${row.getValue<number>('lastPrice')?.toFixed(2)}`,
      },
    ];
    
    // Gate 1 specific columns
    if (gate === 'gate1') {
      return [
        ...baseColumns,
        {
          accessorKey: 'avgVolume30D',
          header: 'Avg Volume',
          cell: ({ row }) => formatVolume(row.getValue('avgVolume30D')),
        },
        {
          accessorKey: 'volumeSpike',
          header: 'Vol Spike',
          cell: ({ row }) => (
            <Badge variant={row.getValue<number>('volumeSpike') >= 2 ? 'success' : 'secondary'}>
              {row.getValue<number>('volumeSpike')?.toFixed(1)}×
            </Badge>
          ),
        },
        {
          accessorKey: 'atrPercent',
          header: 'ATR %',
          cell: ({ row }) => (
            <Badge variant={row.getValue<number>('atrPercent') >= 2 ? 'success' : 'secondary'}>
              {row.getValue<number>('atrPercent')?.toFixed(1)}%
            </Badge>
          ),
        },
        {
          accessorKey: 'gate1Time',
          header: 'Time',
          cell: ({ row }) => row.getValue('gate1Time'),
        },
      ];
    }
    
    // Gate 2 specific columns
    if (gate === 'gate2') {
      return [
        ...baseColumns,
        {
          accessorKey: 'vwap',
          header: 'VWAP',
          cell: ({ row }) => `${row.getValue<number>('vwap')?.toFixed(2)}`,
        },
        {
          accessorKey: 'aboveVWAP',
          header: '> VWAP',
          cell: ({ row }) => <StatusIcon passed={row.getValue('aboveVWAP')} />,
        },
        {
          accessorKey: 'aboveEMA9',
          header: '> EMA9',
          cell: ({ row }) => <StatusIcon passed={row.getValue('aboveEMA9')} />,
        },
        {
          accessorKey: 'aboveEMA20',
          header: '> EMA20',
          cell: ({ row }) => <StatusIcon passed={row.getValue('aboveEMA20')} />,
        },
        {
          accessorKey: 'relativeVolume',
          header: 'RVol',
          cell: ({ row }) => (
            <Badge variant={row.getValue<number>('relativeVolume') >= 1.5 ? 'success' : 'secondary'}>
              {row.getValue<number>('relativeVolume')?.toFixed(1)}×
            </Badge>
          ),
        },
        {
          accessorKey: 'marketAligned',
          header: 'Mkt Align',
          cell: ({ row }) => <StatusIcon passed={row.getValue('marketAligned')} />,
        },
        {
          accessorKey: 'gate2Time',
          header: 'Time',
          cell: ({ row }) => row.getValue('gate2Time'),
        },
      ];
    }
    
    // Gate 3 specific columns
    if (gate === 'gate3') {
      return [
        ...baseColumns,
        {
          accessorKey: 'holdsAboveVWAP',
          header: 'Holds VWAP',
          cell: ({ row }) => <StatusIcon passed={row.getValue('holdsAboveVWAP')} />,
        },
        {
          accessorKey: 'noRejectionWick',
          header: 'No Reject',
          cell: ({ row }) => <StatusIcon passed={row.getValue('noRejectionWick')} />,
        },
        {
          accessorKey: 'volumeExpansion',
          header: 'Vol Expand',
          cell: ({ row }) => <StatusIcon passed={row.getValue('volumeExpansion')} />,
        },
        {
          accessorKey: 'spyAgrees',
          header: 'SPY Agrees',
          cell: ({ row }) => <StatusIcon passed={row.getValue('spyAgrees')} />,
        },
        {
          accessorKey: 'setupType',
          header: 'Setup',
          cell: ({ row }) => (
            <Badge variant="outline">
              {row.getValue<string>('setupType')?.replace(/_/g, ' ')}
            </Badge>
          ),
        },
        {
          accessorKey: 'gate3Time',
          header: 'Time',
          cell: ({ row }) => row.getValue('gate3Time'),
        },
      ];
    }
    
    // Gate 4 specific columns
    if (gate === 'gate4' || gate === 'final') {
      return [
        ...baseColumns,
        {
          accessorKey: 'setupType',
          header: 'Setup',
          cell: ({ row }) => (
            <Badge variant="outline">
              {row.getValue<string>('setupType')?.replace(/_/g, ' ')}
            </Badge>
          ),
        },
        {
          accessorKey: 'setupQuality',
          header: 'Quality',
          cell: ({ row }) => (
            <Badge variant={
              row.getValue('setupQuality') === 'A_PLUS' ? 'success' :
              row.getValue('setupQuality') === 'A' ? 'default' : 'secondary'
            }>
              {row.getValue('setupQuality') === 'A_PLUS' ? 'A+' : row.getValue('setupQuality')}
            </Badge>
          ),
        },
        {
          accessorKey: 'riskPerShare',
          header: 'Risk/Share',
          cell: ({ row }) => `${row.getValue<number>('riskPerShare')?.toFixed(2)}`,
        },
        {
          accessorKey: 'maxShares',
          header: 'Max Shares',
          cell: ({ row }) => row.getValue('maxShares'),
        },
        {
          accessorKey: 'vixLevel',
          header: 'VIX',
          cell: ({ row }) => (
            <Badge variant={row.getValue<number>('vixLevel') < 25 ? 'success' : 'destructive'}>
              {row.getValue<number>('vixLevel')?.toFixed(1)}
            </Badge>
          ),
        },
        {
          accessorKey: 'riskRewardRatio',
          header: 'R:R',
          cell: ({ row }) => (
            <Badge variant="success">
              {row.getValue<number>('riskRewardRatio')?.toFixed(1)}:1
            </Badge>
          ),
        },
        {
          accessorKey: 'gate4Time',
          header: 'Time',
          cell: ({ row }) => row.getValue('gate4Time'),
        },
      ];
    }
    
    return baseColumns;
  };
  
  return <DataTable columns={getColumns()} data={stocks} />;
}

function StatusIcon({ passed }: { passed: boolean }) {
  return passed ? (
    <CheckCircle2 className="w-4 h-4 text-green-500" />
  ) : (
    <XCircle className="w-4 h-4 text-red-500" />
  );
}
```

### 7.5 Main Pipeline Page Component

```tsx
// features/ai-screener/pages/ScreeningPipelinePage.tsx
export function ScreeningPipelinePage() {
  const today = new Date().toISOString().split('T')[0];
  
  // Fetch counts for pipeline overview
  const { data: pipelineStats } = useQuery({
    queryKey: ['pipeline-stats', today],
    queryFn: async () => {
      const [method1, method2, final] = await Promise.all([
        client.models.Method1Stock.list({ filter: { screenDate: { eq: today } } }),
        client.models.Method2Stock.list({ filter: { screenDate: { eq: today } } }),
        client.models.AIScreeningResult.list({ filter: { screenDate: { eq: today } } }),
      ]);
      
      const m2Stocks = method2.data || [];
      
      return {
        method1Count: method1.data?.filter(s => s.passedMethod1).length || 0,
        gate1Count: m2Stocks.filter(s => s.passedGate1).length,
        gate2Count: m2Stocks.filter(s => s.passedGate2).length,
        gate3Count: m2Stocks.filter(s => s.passedGate3).length,
        gate4Count: m2Stocks.filter(s => s.passedGate4).length,
        finalCount: final.data?.length || 0,
        lastUpdated: new Date().toLocaleTimeString(),
      };
    },
    refetchInterval: 30000,
  });
  
  return (
    <PageContainer
      title="AI Screening Pipeline"
      description="View detailed results from each screening stage"
      actions={
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      }
    >
      {/* Pipeline Overview */}
      {pipelineStats && (
        <PipelineOverview stats={pipelineStats} />
      )}
      
      {/* Two-column layout for Method 1 and Method 2 */}
      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        {/* Method 1 Results */}
        <Method1Results />
        
        {/* Method 2 Results */}
        <Method2Results />
      </div>
      
      {/* Final Intersection Results */}
      <div className="mt-6">
        <AIScreeningResultsTable />
      </div>
    </PageContainer>
  );
}
```

### 7.6 Sidebar Navigation Update

Add the Pipeline page to the sidebar:

```tsx
// In sidebar navigation config
const aiScreenerItems = [
  {
    title: 'AI Results',
    href: '/ai-screener',
    icon: Sparkles,
    description: 'Final screening results (intersection)',
  },
  {
    title: 'Pipeline View',
    href: '/ai-screener/pipeline',
    icon: GitBranch,
    description: 'Detailed view of each screening stage',
  },
];
```

### 7.7 Route Configuration

```tsx
// routes.tsx
{
  path: 'ai-screener',
  children: [
    {
      index: true,
      element: <AIScreenerPage />,  // Shows final intersection results
    },
    {
      path: 'pipeline',
      element: <ScreeningPipelinePage />,  // Shows detailed pipeline view
    },
  ],
},
```

---

## 8. Summary

### Dual-Method Architecture

| Method | Source | Criteria | Output |
|--------|--------|----------|--------|
| **Method 1** | Column G | Liquidity + Volatility + Catalyst + Technical Setup | Stocks meeting scanner criteria |
| **Method 2** | Column L | 4-GATE System (Pre-market → Technical → Execution → Risk) | Stocks passing all gates |
| **Final** | Intersection | Common stocks from BOTH methods | Ready to Buy |

### Key Points

- ✅ **Two parallel screening methods** run simultaneously
- ✅ **Method 1** focuses on scanner-based liquidity, volatility, and catalyst checks
- ✅ **Method 2** uses the 4-GATE progressive filtering system
- ✅ **Final results** are the **INTERSECTION** (common stocks only)
- ✅ Only stocks that pass **BOTH** methods are shown to users
- ✅ Real-time notifications when new intersection results appear
- ✅ Integration with Trade Management for logging trades
