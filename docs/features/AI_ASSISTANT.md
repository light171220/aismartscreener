# AI Assistant Feature Implementation

## 1. Overview

The AI Assistant provides conversational AI capabilities using the Amplify AI Kit and Amazon Bedrock (Claude). It offers two modes: Trade Assistant for analysis and Trade Reviewer for post-trade review.

## 2. AI Routes

### Trade Assistant (Main Chat)
- Multi-turn conversation
- Real-time streaming responses
- Access to user's trades and screened stocks
- Setup validation and trade planning

### Trade Reviewer
- Post-trade analysis
- Performance coaching
- Pattern identification
- Rule adherence tracking

## 3. Implementation

### AI Data Schema

```typescript
// amplify/data/resource.ts (AI routes section)

// Main Trade Assistant
tradeAssistant: a.conversation({
  aiModel: a.ai.model('Claude 3.5 Sonnet'),
  systemPrompt: `You are an expert day trading assistant for US equities.

## Your Role
- Analyze stocks for day trading potential
- Validate trade setups (entry, stop, target)
- Review open positions and suggest actions
- Provide market context (SPY/QQQ trend)
- Help maintain trading discipline

## Trading Framework
1. Only trade A+ or B setups
2. Risk max 0.5-1% per trade
3. Best setups: 9:35-11:00 AM ET
4. Key setups: VWAP reclaim, ORB, pullbacks
5. Always confirm with volume

## Response Style
- Be direct and specific
- Use numbers (prices, percentages)
- Give actionable advice
- Warn about risks clearly
- Reference actual data when available

## Available Tools
You have access to:
- User's screened stocks (AI + Filter results)
- User's open trades
- User's trade history

Use these tools to give personalized advice.`,

  tools: [
    a.ai.dataTool({
      name: 'getScreenedStocks',
      description: 'Get today\'s AI and filter screened stocks with setup details',
      model: a.ref('ScreenedStock'),
      modelOperation: 'list',
    }),
    a.ai.dataTool({
      name: 'getOpenTrades',
      description: 'Get user\'s current open positions with entry, stop, and target',
      model: a.ref('Trade'),
      modelOperation: 'list',
    }),
    a.ai.dataTool({
      name: 'getTradeHistory',
      description: 'Get user\'s past trades for pattern analysis',
      model: a.ref('TradeHistory'),
      modelOperation: 'list',
    }),
    a.ai.dataTool({
      name: 'getFilterCriteria',
      description: 'Get user\'s saved screening criteria',
      model: a.ref('FilterCriteria'),
      modelOperation: 'list',
    }),
  ],
})
.authorization((allow) => allow.owner()),

// Trade Reviewer (Post-trade analysis)
tradeReviewer: a.conversation({
  aiModel: a.ai.model('Claude 3.5 Sonnet'),
  systemPrompt: `You are a trading performance coach. Your job is to analyze completed trades and help the trader improve.

## Analysis Framework
For each trade, evaluate:
1. Setup Quality: Was it an A+ setup? Did all criteria align?
2. Execution: Entry timing, stop placement, exit execution
3. Rule Adherence: Did trader follow their rules?
4. Emotional Indicators: Signs of FOMO, revenge trading, overtrading
5. R-Multiple: What was the actual risk/reward?

## Daily Scorecard Goals
- Rule adherence: 100%
- Average R per trade: ≥ +0.5R
- Win rate: 45-60%
- Overtrades: 0
- Emotional trades: 0

## Coaching Style
- Be constructive but honest
- Focus on process, not outcomes
- Identify one specific improvement
- Reinforce one rule to follow tomorrow
- Track patterns over time

## Output Format
When reviewing trades, provide:
1. Trade Summary (ticker, entry, exit, result)
2. What Went Well
3. What Could Improve
4. One Lesson for Tomorrow
5. Updated Scorecard Metrics`,

  tools: [
    a.ai.dataTool({
      name: 'getRecentTrades',
      description: 'Get user\'s recently closed trades',
      model: a.ref('Trade'),
      modelOperation: 'list',
    }),
  ],
})
.authorization((allow) => allow.owner()),
```

### Trade Assistant Component

```tsx
// features/ai-assistant/components/TradeAssistant.tsx
import { useAIConversation } from '@/lib/amplify-client';
import { AIConversation } from '@aws-amplify/ui-react-ai';

export function TradeAssistant() {
  const [
    {
      data: { messages, conversation },
      isLoading,
      hasError,
    },
    sendMessage,
  ] = useAIConversation('tradeAssistant');
  
  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <AIConversation
        messages={messages}
        handleSendMessage={sendMessage}
        isLoading={isLoading}
        
        // Custom response components for rich UI
        responseComponents={{
          // Stock Card Component
          StockAnalysis: {
            description: 'Display detailed stock analysis',
            component: StockAnalysisCard,
            props: {
              ticker: { type: 'string', required: true },
              currentPrice: { type: 'number', required: true },
              setupType: { type: 'string', required: true },
              quality: { type: 'string', required: true },
              entry: { type: 'number', required: true },
              stop: { type: 'number', required: true },
              target: { type: 'number', required: true },
              catalyst: { type: 'string' },
              reasoning: { type: 'string' },
            },
          },
          
          // Trade Setup Component
          TradeSetup: {
            description: 'Display a trade setup recommendation',
            component: TradeSetupCard,
            props: {
              ticker: { type: 'string', required: true },
              direction: { type: 'string', required: true },
              entry: { type: 'number', required: true },
              stop: { type: 'number', required: true },
              target1: { type: 'number', required: true },
              target2: { type: 'number' },
              riskReward: { type: 'string', required: true },
              quality: { type: 'string', required: true },
              notes: { type: 'string' },
            },
          },
          
          // Market Summary Component
          MarketSummary: {
            description: 'Display market conditions summary',
            component: MarketSummaryCard,
            props: {
              spyTrend: { type: 'string', required: true },
              qqqTrend: { type: 'string', required: true },
              vix: { type: 'number' },
              marketBias: { type: 'string', required: true },
              sectors: { type: 'object' },
            },
          },
          
          // Trade List Component
          TradeList: {
            description: 'Display a list of trades',
            component: TradeListCard,
            props: {
              trades: { type: 'array', required: true },
              title: { type: 'string' },
            },
          },
        }}
        
        // Suggested prompts
        suggestedPrompts={[
          {
            header: 'Analyze Stocks',
            inputText: 'Show me today\'s top screened stocks and analyze the best setups',
          },
          {
            header: 'Review Trades',
            inputText: 'Review my open trades and suggest any actions',
          },
          {
            header: 'Market Context',
            inputText: 'What\'s the market bias today? Should I be looking for longs or shorts?',
          },
          {
            header: 'Validate Setup',
            inputText: 'I\'m looking at [TICKER] for a trade. Can you validate this setup?',
          },
          {
            header: 'Risk Check',
            inputText: 'What\'s my total risk exposure right now?',
          },
        ]}
        
        // Avatar configuration
        avatars={{
          user: {
            username: 'Trader',
          },
          ai: {
            username: 'AI Assistant',
            avatar: '/ai-avatar.png',
          },
        }}
        
        // Welcome message
        welcomeMessage={{
          content: `👋 Welcome! I'm your AI trading assistant.

I can help you:
• Analyze today's screened stocks
• Validate trade setups
• Review your open positions
• Provide market context

What would you like to explore?`,
        }}
        
        // Custom styles
        className="flex-1"
      />
    </div>
  );
}
```

### Response Components

```tsx
// features/ai-assistant/components/AIResponseComponents.tsx

// Stock Analysis Card
export function StockAnalysisCard({
  ticker,
  currentPrice,
  setupType,
  quality,
  entry,
  stop,
  target,
  catalyst,
  reasoning,
}: StockAnalysisProps) {
  const riskReward = ((target - entry) / (entry - stop)).toFixed(2);
  
  return (
    <Card className="my-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{ticker}</CardTitle>
          <Badge variant={quality === 'A+' ? 'success' : 'default'}>
            {quality} Setup
          </Badge>
        </div>
        <CardDescription>{setupType.replace('_', ' ')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Current</p>
            <p className="font-bold">${currentPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Entry</p>
            <p className="font-bold text-blue-500">${entry.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Stop</p>
            <p className="font-bold text-red-500">${stop.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Target</p>
            <p className="font-bold text-green-500">${target.toFixed(2)}</p>
          </div>
        </div>
        
        {catalyst && (
          <div className="mb-4">
            <p className="text-sm font-medium">Catalyst</p>
            <p className="text-sm text-muted-foreground">{catalyst}</p>
          </div>
        )}
        
        {reasoning && (
          <div className="mb-4">
            <p className="text-sm font-medium">Analysis</p>
            <p className="text-sm text-muted-foreground">{reasoning}</p>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-4 border-t">
          <Badge variant="outline">R:R {riskReward}:1</Badge>
          <Button size="sm" onClick={() => handleAddTrade(ticker, entry, stop, target)}>
            Add to Trades
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Trade Setup Card
export function TradeSetupCard({
  ticker,
  direction,
  entry,
  stop,
  target1,
  target2,
  riskReward,
  quality,
  notes,
}: TradeSetupProps) {
  return (
    <Card className={cn(
      'my-4 border-l-4',
      direction === 'LONG' ? 'border-l-green-500' : 'border-l-red-500'
    )}>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">{ticker}</h3>
            <Badge variant={direction === 'LONG' ? 'success' : 'destructive'}>
              {direction}
            </Badge>
          </div>
          <Badge variant={quality === 'A+' ? 'success' : 'secondary'}>
            {quality}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Entry:</span>
            <span className="font-medium">${entry.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stop:</span>
            <span className="font-medium text-red-500">${stop.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Target 1 (50%):</span>
            <span className="font-medium text-green-500">${target1.toFixed(2)}</span>
          </div>
          {target2 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target 2 (runner):</span>
              <span className="font-medium text-green-500">${target2.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t">
            <span className="text-muted-foreground">Risk/Reward:</span>
            <span className="font-bold">{riskReward}</span>
          </div>
        </div>
        
        {notes && (
          <p className="mt-4 text-sm text-muted-foreground italic">
            💡 {notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Market Summary Card
export function MarketSummaryCard({
  spyTrend,
  qqqTrend,
  vix,
  marketBias,
  sectors,
}: MarketSummaryProps) {
  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Market Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">SPY:</span>
            <TrendBadge trend={spyTrend} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">QQQ:</span>
            <TrendBadge trend={qqqTrend} />
          </div>
          {vix && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">VIX:</span>
              <span className={cn(
                'font-medium',
                vix > 25 ? 'text-red-500' : vix > 18 ? 'text-yellow-500' : 'text-green-500'
              )}>
                {vix.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Bias:</span>
            <Badge variant={
              marketBias === 'BULLISH' ? 'success' : 
              marketBias === 'BEARISH' ? 'destructive' : 'secondary'
            }>
              {marketBias}
            </Badge>
          </div>
        </div>
        
        {sectors && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">Sector Strength</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(sectors).map(([sector, strength]) => (
                <Badge 
                  key={sector}
                  variant={strength === 'strong' ? 'success' : strength === 'weak' ? 'destructive' : 'outline'}
                >
                  {sector}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Trade Reviewer Component

```tsx
// features/ai-assistant/components/TradeReviewer.tsx
export function TradeReviewer() {
  const [
    { data: { messages }, isLoading },
    sendMessage,
  ] = useAIConversation('tradeReviewer');
  
  // Get today's closed trades for context
  const { data: closedTrades } = useQuery({
    queryKey: ['trades', 'closed', 'today'],
    queryFn: () => fetchTodayClosedTrades(),
  });
  
  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Trade Summary Panel */}
      {closedTrades && closedTrades.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Today's Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Trades</p>
                <p className="text-xl font-bold">{closedTrades.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">P&L</p>
                <p className={cn(
                  'text-xl font-bold',
                  totalPL >= 0 ? 'text-green-500' : 'text-red-500'
                )}>
                  ${totalPL.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-xl font-bold">{winRate.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <AIConversation
        messages={messages}
        handleSendMessage={sendMessage}
        isLoading={isLoading}
        
        suggestedPrompts={[
          {
            header: 'Review Today',
            inputText: 'Review my trades from today and give me feedback',
          },
          {
            header: 'Weekly Analysis',
            inputText: 'Analyze my trading performance this week',
          },
          {
            header: 'Find Patterns',
            inputText: 'What patterns do you see in my losing trades?',
          },
          {
            header: 'Scorecard Update',
            inputText: 'Update my daily scorecard based on today\'s trades',
          },
        ]}
        
        welcomeMessage={{
          content: `📊 Ready to review your trades!

I'll help you:
• Analyze what went well and what didn't
• Identify patterns in your trading
• Track your scorecard metrics
• Suggest improvements

Let's learn from today's trades!`,
        }}
        
        className="flex-1"
      />
    </div>
  );
}
```

## 4. Conversation Management

```typescript
// features/ai-assistant/hooks/useConversations.ts
export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  
  // List all conversations
  const listConversations = async () => {
    const result = await client.conversations.tradeAssistant.list();
    setConversations(result.data);
  };
  
  // Create new conversation
  const createConversation = async () => {
    const result = await client.conversations.tradeAssistant.create({});
    return result.data;
  };
  
  // Delete conversation
  const deleteConversation = async (id: string) => {
    await client.conversations.tradeAssistant.delete({ id });
    setConversations((prev) => prev.filter((c) => c.id !== id));
  };
  
  return {
    conversations,
    listConversations,
    createConversation,
    deleteConversation,
  };
}
```

## 5. Cost Optimization

### Token Usage Estimation
- Average prompt: ~500 tokens
- Average response: ~1000 tokens
- Daily usage (20 conversations): ~30,000 tokens
- Monthly: ~900,000 tokens

### Cost Saving Strategies
1. Use Claude Haiku for simple queries
2. Cache frequent responses
3. Limit context window
4. Summarize long conversations
