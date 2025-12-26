# Amplify AI Kit Implementation Guide

## 1. Overview

The Amplify AI Kit is the quickest way to build fullstack AI applications with React and AWS. It provides pre-built components, type-safe clients, and seamless integration with Amazon Bedrock LLMs.

---

## 2. Core Concepts

### 2.1 AI Routes

AI Routes are API endpoints for interacting with AI functionality. There are two types:

| Type | Description | Use Case |
|------|-------------|----------|
| **Conversation** | Multi-turn, streaming chat API | Chat assistants, trade analysis |
| **Generation** | Single request-response API | Stock screening, data generation |

### 2.2 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                            │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │
│  │ useAIConversation │  │ AIConversation  │  │ generateClient  │     │
│  │    (Hook)       │  │  (Component)    │  │                 │     │
│  └────────────────┘  └────────────────┘  └────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AWS AppSync (GraphQL)                        │
│                  Real-time Subscriptions                         │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Lambda Function                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ • Retrieves conversation history                         │    │
│  │ • Invokes Bedrock converse API                          │    │
│  │ • Handles tool use (data queries)                       │    │
│  │ • Streams responses back to AppSync                     │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  ┌──────────────────┐           ┌──────────────────┐            │
│  │  Amazon Bedrock  │           │    DynamoDB      │            │
│  │  (Claude LLM)    │           │ (Conversation    │            │
│  │                  │           │  Storage)        │            │
│  └──────────────────┘           └──────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Supported Models

The Amplify AI Kit supports these Amazon Bedrock models:

| Model | ID | Best For |
|-------|----| ---------|
| Claude 3.5 Sonnet | `anthropic.claude-3-5-sonnet-*` | Complex reasoning, analysis |
| Claude 3 Haiku | `anthropic.claude-3-haiku-*` | Fast responses, simple tasks |
| Claude 3 Opus | `anthropic.claude-3-opus-*` | Most capable, complex tasks |

---

## 4. AI Routes Configuration

### 4.1 Conversation Routes

#### amplify/data/resource.ts
```typescript
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // ═══════════════════════════════════════════════════════════════
  // CONVERSATION ROUTE: Trade Assistant
  // ═══════════════════════════════════════════════════════════════
  tradeAssistant: a.conversation({
    aiModel: a.ai.model('Claude 3.5 Sonnet'),
    systemPrompt: `You are an expert day trading assistant for the AI Smart Screener platform. 
    
Your role is to:
- Help analyze stocks from the AI screening results
- Explain trade setups (VWAP reclaim, ORB breakout, etc.)
- Provide risk management guidance
- Answer questions about the 4-GATE screening system
- Review open positions and suggest management strategies

You have access to the user's screening results and trade data through tools.
Always be specific with price levels and risk/reward calculations.
Never recommend specific buy/sell actions - only educate and analyze.`,
    
    tools: [
      // AI Screening Results - Final intersection
      a.ai.dataTool({
        name: 'getAIScreeningResults',
        description: 'Get stocks that passed BOTH Method 1 and Method 2 screening today',
        model: a.ref('AIScreeningResult'),
        modelOperation: 'list',
      }),
      
      // Method 1 Results - Scanner-based
      a.ai.dataTool({
        name: 'getMethod1Stocks',
        description: 'Get stocks from Method 1 (scanner-based) screening with liquidity, volatility, catalyst, and technical data',
        model: a.ref('Method1Stock'),
        modelOperation: 'list',
      }),
      
      // Method 2 Results - GATE system
      a.ai.dataTool({
        name: 'getMethod2Stocks',
        description: 'Get stocks from Method 2 (4-GATE system) with Gate 1-4 data and setup quality ratings',
        model: a.ref('Method2Stock'),
        modelOperation: 'list',
      }),
      
      // Filter Screening Suggestions
      a.ai.dataTool({
        name: 'getSuggestions',
        description: 'Get suggested stocks from filter screening (HIGH_UPSIDE or UNDERVALUED)',
        model: a.ref('SuggestedStock'),
        modelOperation: 'list',
      }),
      
      // User's Open Trades
      a.ai.dataTool({
        name: 'getOpenTrades',
        description: 'Get the user\'s currently open trades with entry, stop, and target prices',
        model: a.ref('Trade'),
        modelOperation: 'list',
      }),
      
      // User's Trade History
      a.ai.dataTool({
        name: 'getTradeHistory',
        description: 'Get the user\'s closed trades for performance analysis',
        model: a.ref('TradeHistory'),
        modelOperation: 'list',
      }),
    ],
  })
  .authorization((allow) => allow.owner()),

  // ═══════════════════════════════════════════════════════════════
  // CONVERSATION ROUTE: Trade Reviewer
  // ═══════════════════════════════════════════════════════════════
  tradeReviewer: a.conversation({
    aiModel: a.ai.model('Claude 3.5 Sonnet'),
    systemPrompt: `You are a trading performance coach and reviewer.
    
Your role is to:
- Review the user's trade history and identify patterns
- Calculate win rate, average R-multiple, and other metrics
- Identify common mistakes and areas for improvement
- Provide constructive feedback on trade execution
- Help develop better trading habits

Be specific with data and examples from their actual trades.
Focus on process improvement, not just results.`,
    
    tools: [
      a.ai.dataTool({
        name: 'getTradeHistory',
        description: 'Get all closed trades for performance review',
        model: a.ref('TradeHistory'),
        modelOperation: 'list',
      }),
      a.ai.dataTool({
        name: 'getOpenTrades',
        description: 'Get current open positions',
        model: a.ref('Trade'),
        modelOperation: 'list',
      }),
    ],
  })
  .authorization((allow) => allow.owner()),
});
```

### 4.2 Generation Routes

```typescript
const schema = a.schema({
  // ═══════════════════════════════════════════════════════════════
  // GENERATION ROUTE: Filter Screening
  // ═══════════════════════════════════════════════════════════════
  generateFilteredStocks: a.generation({
    aiModel: a.ai.model('Claude 3.5 Sonnet'),
    systemPrompt: `You are a stock screening analyst. Given filter criteria, 
analyze stocks and return those that match ALL criteria.

Return a JSON array with this structure:
{
  "stocks": [
    {
      "ticker": "AAPL",
      "companyName": "Apple Inc",
      "lastPrice": 150.00,
      "avgTargetPrice": 200.00,
      "upsidePct": 33.3,
      "analystCoverage": 45,
      "avgRating": "BUY",
      "marketCap": 2500000000000,
      "reasoning": "Strong analyst coverage with significant upside potential"
    }
  ],
  "totalScanned": 500,
  "totalMatched": 15
}`,
  })
  .arguments({
    minUpsidePct: a.float(),
    minAnalystCoverage: a.integer(),
    minRating: a.string(),
    minMarketCap: a.float(),
    maxMarketCap: a.float(),
    minPrice: a.float(),
    maxPrice: a.float(),
  })
  .returns(a.json())
  .authorization((allow) => [allow.authenticated()]),

  // ═══════════════════════════════════════════════════════════════
  // GENERATION ROUTE: Trade Validation
  // ═══════════════════════════════════════════════════════════════
  validateTrade: a.generation({
    aiModel: a.ai.model('Claude 3.5 Sonnet'),
    systemPrompt: `You are a trade validation assistant. Analyze proposed trades 
and provide quality assessments.

Evaluate:
1. Risk/Reward ratio (should be ≥ 2:1 for A+ quality)
2. Setup type validity
3. Market alignment (is SPY/QQQ trending in same direction?)
4. Position sizing relative to risk

Return JSON:
{
  "quality": "A+" | "A" | "B" | "C" | "REJECT",
  "riskRewardRatio": 2.5,
  "marketAlignment": "ALIGNED" | "NEUTRAL" | "AGAINST",
  "riskAssessment": "LOW" | "MEDIUM" | "HIGH",
  "recommendation": "PROCEED" | "REDUCE_SIZE" | "WAIT" | "REJECT",
  "reasoning": "Detailed explanation..."
}`,
  })
  .arguments({
    ticker: a.string().required(),
    entryPrice: a.float().required(),
    stopLoss: a.float().required(),
    target: a.float().required(),
    setupType: a.string().required(),
    marketBias: a.string(),
  })
  .returns(a.json())
  .authorization((allow) => [allow.authenticated()]),
});
```

---

## 5. AI Routes Summary

| Route | Type | Description | Tools |
|-------|------|-------------|-------|
| `tradeAssistant` | Conversation | Multi-turn trade analysis chat | getAIScreeningResults, getMethod1Stocks, getMethod2Stocks, getSuggestions, getOpenTrades, getTradeHistory |
| `tradeReviewer` | Conversation | Performance review chat | getTradeHistory, getOpenTrades |
| `generateFilteredStocks` | Generation | Filter screening | - |
| `validateTrade` | Generation | Trade quality check | - |

---

## 6. Frontend Client Setup

### 6.1 Amplify Client Configuration

#### src/lib/amplify-client.ts
```typescript
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import outputs from '../../amplify_outputs.json';

Amplify.configure(outputs);

export const client = generateClient<Schema>();

// Export AI hooks for conversations
export const { useAIConversation, useAIGeneration } = client;
```

### 6.2 Using Conversation Routes

#### src/features/ai-assistant/components/TradeAssistant.tsx
```typescript
import { useAIConversation } from '../../../lib/amplify-client';
import { AIConversation } from '@aws-amplify/ui-react-ai';

export function TradeAssistant() {
  const [
    {
      data: { messages },
      isLoading,
    },
    sendMessage,
  ] = useAIConversation('tradeAssistant');

  return (
    <AIConversation
      messages={messages}
      handleSendMessage={sendMessage}
      isLoading={isLoading}
      
      // Custom response components for rich displays
      responseComponents={{
        // Display AI Screening Results
        AIScreeningCard: {
          description: 'Display an AI-screened stock with setup details',
          component: ({ ticker, setupType, setupQuality, riskReward, catalyst }) => (
            <div className="glass p-4 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xl font-bold text-white">{ticker}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  setupQuality === 'A+' ? 'bg-emerald-500/20 text-emerald-400' :
                  setupQuality === 'A' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {setupQuality} Setup
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-400">Setup:</span>
                  <span className="ml-2 text-white">{setupType?.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-slate-400">R:R:</span>
                  <span className="ml-2 text-emerald-400">{riskReward}</span>
                </div>
              </div>
              {catalyst && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <span className="text-slate-400 text-xs">Catalyst:</span>
                  <p className="text-white text-sm">{catalyst}</p>
                </div>
              )}
            </div>
          ),
          props: {
            ticker: { type: 'string', required: true },
            setupType: { type: 'string', required: true },
            setupQuality: { type: 'string', required: true },
            riskReward: { type: 'string', required: false },
            catalyst: { type: 'string', required: false },
          },
        },
        
        // Display Trade Analysis
        TradeAnalysis: {
          description: 'Display trade analysis with risk assessment',
          component: ({ ticker, entry, stop, target, quality, recommendation }) => (
            <div className={`glass p-4 rounded-xl border-l-4 ${
              quality === 'A+' || quality === 'A' ? 'border-l-emerald-500' :
              quality === 'B' ? 'border-l-amber-500' : 'border-l-red-500'
            }`}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold text-white">{ticker}</span>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  recommendation === 'PROCEED' ? 'bg-emerald-500/20 text-emerald-400' :
                  recommendation === 'REDUCE_SIZE' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {recommendation}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-xs text-slate-400">Entry</p>
                  <p className="text-white font-bold">${entry}</p>
                </div>
                <div className="bg-red-500/10 rounded-lg p-2">
                  <p className="text-xs text-red-400">Stop</p>
                  <p className="text-red-400 font-bold">${stop}</p>
                </div>
                <div className="bg-emerald-500/10 rounded-lg p-2">
                  <p className="text-xs text-emerald-400">Target</p>
                  <p className="text-emerald-400 font-bold">${target}</p>
                </div>
              </div>
            </div>
          ),
          props: {
            ticker: { type: 'string', required: true },
            entry: { type: 'number', required: true },
            stop: { type: 'number', required: true },
            target: { type: 'number', required: true },
            quality: { type: 'string', required: true },
            recommendation: { type: 'string', required: true },
          },
        },
        
        // Display Method Comparison
        MethodComparison: {
          description: 'Compare Method 1 and Method 2 results for a stock',
          component: ({ ticker, method1Passed, method2Passed, method1Score, method2Gate }) => (
            <div className="glass p-4 rounded-xl">
              <h4 className="text-white font-bold mb-3">{ticker} - Screening Analysis</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg ${method1Passed ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                  <p className="text-xs text-slate-400 mb-1">Method 1 (Scanner)</p>
                  <p className={method1Passed ? 'text-emerald-400' : 'text-red-400'}>
                    {method1Passed ? '✓ Passed' : '✗ Failed'}
                  </p>
                  {method1Score && <p className="text-xs text-slate-400 mt-1">Score: {method1Score}</p>}
                </div>
                <div className={`p-3 rounded-lg ${method2Passed ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                  <p className="text-xs text-slate-400 mb-1">Method 2 (GATE)</p>
                  <p className={method2Passed ? 'text-emerald-400' : 'text-red-400'}>
                    {method2Passed ? '✓ Passed' : '✗ Failed'}
                  </p>
                  {method2Gate && <p className="text-xs text-slate-400 mt-1">Last Gate: {method2Gate}</p>}
                </div>
              </div>
              {method1Passed && method2Passed && (
                <div className="mt-3 p-2 bg-emerald-500/20 rounded-lg text-center">
                  <span className="text-emerald-400 font-medium">⭐ A+ Priority - Passed Both Methods</span>
                </div>
              )}
            </div>
          ),
          props: {
            ticker: { type: 'string', required: true },
            method1Passed: { type: 'boolean', required: true },
            method2Passed: { type: 'boolean', required: true },
            method1Score: { type: 'number', required: false },
            method2Gate: { type: 'string', required: false },
          },
        },
      }}
      
      // Suggested prompts
      suggestedPrompts={[
        { inputText: 'Show me today\'s top AI screening results' },
        { inputText: 'Which stocks passed both Method 1 and Method 2?' },
        { inputText: 'Analyze my open trades' },
        { inputText: 'What\'s the market bias today?' },
        { inputText: 'Explain the 4-GATE screening system' },
        { inputText: 'Review my trade history this week' },
      ]}
      
      // Avatar customization
      avatars={{
        user: { username: 'Trader' },
        ai: { 
          username: 'AI Assistant',
          avatar: '🤖',
        },
      }}
    />
  );
}
```

### 6.3 Using Generation Routes

#### src/hooks/useStockScreener.ts
```typescript
import { client } from '../lib/amplify-client';

interface ScreeningCriteria {
  minUpsidePct: number;
  minAnalystCoverage: number;
  minRating: string;
  minMarketCap: number;
  maxMarketCap: number;
  minPrice: number;
  maxPrice: number;
}

export async function screenStocks(criteria: ScreeningCriteria) {
  try {
    const response = await client.generations.generateFilteredStocks({
      minUpsidePct: criteria.minUpsidePct,
      minAnalystCoverage: criteria.minAnalystCoverage,
      minRating: criteria.minRating,
      minMarketCap: criteria.minMarketCap,
      maxMarketCap: criteria.maxMarketCap,
      minPrice: criteria.minPrice,
      maxPrice: criteria.maxPrice,
    });
    
    return JSON.parse(response.data);
  } catch (error) {
    console.error('Stock screening failed:', error);
    throw error;
  }
}
```

#### src/hooks/useTradeValidator.ts
```typescript
import { client } from '../lib/amplify-client';

interface TradeSetup {
  ticker: string;
  entryPrice: number;
  stopLoss: number;
  target: number;
  setupType: string;
  marketBias?: string;
}

export async function validateTrade(setup: TradeSetup) {
  const response = await client.generations.validateTrade({
    ticker: setup.ticker,
    entryPrice: setup.entryPrice,
    stopLoss: setup.stopLoss,
    target: setup.target,
    setupType: setup.setupType,
    marketBias: setup.marketBias || 'NEUTRAL',
  });
  
  return JSON.parse(response.data);
  // Returns: { quality, riskRewardRatio, marketAlignment, riskAssessment, recommendation, reasoning }
}
```

---

## 7. AI Tools (Function Calling)

AI Tools allow the LLM to query your data or execute custom logic.

### 7.1 Data Tools

Data tools query your Amplify data models:

```typescript
// Query AI screening results
a.ai.dataTool({
  name: 'getAIScreeningResults',
  description: 'Get stocks that passed both screening methods today',
  model: a.ref('AIScreeningResult'),
  modelOperation: 'list',
})

// Query Method 1 stocks
a.ai.dataTool({
  name: 'getMethod1Stocks',
  description: 'Get Method 1 scanner-based screening results',
  model: a.ref('Method1Stock'),
  modelOperation: 'list',
})

// Query Method 2 stocks
a.ai.dataTool({
  name: 'getMethod2Stocks',
  description: 'Get Method 2 GATE system screening results',
  model: a.ref('Method2Stock'),
  modelOperation: 'list',
})
```

### 7.2 Custom Lambda Tools

For custom logic, define a custom conversation handler:

#### amplify/functions/stock-analyzer/resource.ts
```typescript
import { defineConversationHandlerFunction } from '@aws-amplify/backend-ai/conversation';

export const stockAnalyzer = defineConversationHandlerFunction({
  name: 'stock-analyzer',
  entry: './handler.ts',
  models: [
    {
      modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    },
  ],
});
```

#### amplify/functions/stock-analyzer/handler.ts
```typescript
import {
  ConversationTurnEvent,
  createExecutableTool,
  handleConversationTurnEvent,
} from '@aws-amplify/backend-ai/conversation/runtime';

// Define custom tool for Polygon data
const polygonDataTool = createExecutableTool(
  'getPolygonData',
  'Fetch real-time stock data from Polygon.io',
  {
    ticker: { type: 'string', description: 'Stock ticker symbol', required: true },
    dataType: { type: 'string', description: 'Type: quote, bars, news', required: true },
  },
  async (input) => {
    const { ticker, dataType } = input;
    
    const response = await fetch(
      `https://api.polygon.io/v2/${dataType}/${ticker}?apiKey=${process.env.POLYGON_API_KEY}`
    );
    
    return await response.json();
  }
);

export const handler = async (event: ConversationTurnEvent) => {
  return await handleConversationTurnEvent(event, {
    tools: [polygonDataTool],
  });
};
```

---

## 8. Conversation History

Conversations are automatically persisted in DynamoDB and scoped to users.

### Managing Conversations
```typescript
// List all conversations
const conversations = await client.conversations.tradeAssistant.list();

// Get specific conversation
const conversation = await client.conversations.tradeAssistant.get({
  id: 'conversation-id',
});

// Delete conversation
await client.conversations.tradeAssistant.delete({
  id: 'conversation-id',
});
```

---

## 9. Best Practices

### 9.1 System Prompts
- Be specific and detailed about the assistant's role
- Include examples of desired output format
- Define clear boundaries and rules
- Mention available tools and when to use them
- Reference the dual-method screening system

### 9.2 Tool Design
- Use descriptive names and descriptions
- Keep tool scope focused
- Return structured data (JSON)
- Handle errors gracefully
- Include relevant model fields only

### 9.3 Response Components
- Create reusable UI components
- Define clear prop schemas
- Handle loading and error states
- Keep components simple
- Use glassmorphism styling for consistency

### 9.4 Cost Management
- Use Claude Haiku for simple tasks
- Use Claude Sonnet for complex analysis
- Cache frequent queries
- Implement rate limiting

---

## 10. Cost Estimates

| Model | Input (1M tokens) | Output (1M tokens) |
|-------|-------------------|-------------------|
| Claude 3 Haiku | $0.25 | $1.25 |
| Claude 3.5 Sonnet | $3.00 | $15.00 |
| Claude 3 Opus | $15.00 | $75.00 |

Estimated monthly costs for AI Smart Screener:
- 100 screening queries/day × 30 days = 3,000 queries
- Average 1,000 tokens per query = 3M tokens
- Using Sonnet: ~$15-50/month

---

## 11. Error Handling

```typescript
try {
  const response = await client.generations.validateTrade({ ... });
} catch (error) {
  if (error.name === 'ThrottlingException') {
    // Rate limited - implement backoff
  } else if (error.name === 'ValidationException') {
    // Invalid input
  } else if (error.name === 'ModelNotReadyException') {
    // Model not available - retry
  }
}
```

---

## 12. Security Considerations

- **Owner Authorization**: Conversations are user-scoped
- **OIDC Token Passing**: Secure identity propagation
- **Data Tool Authorization**: Tools respect model auth rules
- **CloudWatch Redaction**: Tokens are redacted from logs
