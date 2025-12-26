import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  title?: string;
  conversationType: 'TRADE_ASSISTANT' | 'TRADE_REVIEWER' | 'GENERAL';
  messages: Message[];
  lastMessageAt: Date;
  tradeId?: string;
  contextData?: Record<string, unknown>;
  tokenCount?: number;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ConversationType = 'TRADE_ASSISTANT' | 'TRADE_REVIEWER' | 'GENERAL';

export const conversationKeys = {
  all: ['conversations'] as const,
  list: (type?: ConversationType) => [...conversationKeys.all, 'list', type] as const,
  detail: (id: string) => [...conversationKeys.all, id] as const,
  messages: (id: string) => [...conversationKeys.all, id, 'messages'] as const,
};

function generateAIResponse(userMessage: string, conversationType: ConversationType): string {
  const lowerMessage = userMessage.toLowerCase();

  if (conversationType === 'TRADE_ASSISTANT') {
    if (lowerMessage.includes('market') || lowerMessage.includes('overview') || lowerMessage.includes('spy') || lowerMessage.includes('qqq')) {
      return `**Current Market Analysis**

Here's what to consider for today's trading:

**Market Structure:**
- Monitor SPY and QQQ for overall direction in the first 30 minutes
- Check VIX levels - elevated volatility (>20) suggests caution
- Look for sector rotation opportunities

**Trading Approach:**
1. Wait for the opening range to establish (9:30-10:00 AM ET)
2. Identify stocks showing relative strength vs the indices
3. Focus on liquid names ($5-500 price range, 500K+ avg volume)

**Key Levels to Watch:**
- Previous day's high/low
- Pre-market high/low
- VWAP as intraday support/resistance

Would you like me to discuss specific setups or analyze a particular stock?`;
    }

    if (lowerMessage.includes('setup') || lowerMessage.includes('ideas') || lowerMessage.includes('looking for')) {
      return `**Trade Setup Ideas**

Based on effective day trading methodologies, here are setups to watch:

**For Bullish Bias:**
- **VWAP Reclaim:** Stock dips below VWAP, reclaims with volume → Entry above VWAP
- **Opening Range Breakout (ORB):** 15-min high break with volume confirmation
- **Gap and Go:** Pre-market gap with catalyst, continuation after open

**For Bearish Bias:**
- **VWAP Rejection:** Stock tests VWAP from below, rejects → Short below rejection candle
- **Failed Breakout:** Stock breaks high, immediately reverses → Short below failed level

**Entry Checklist:**
✅ Volume confirmation (1.5x+ relative volume)
✅ Market alignment (stock direction matches SPY/QQQ)
✅ Clear stop loss level defined
✅ Minimum 1.5:1 risk/reward ratio

Which setup type would you like to explore in more detail?`;
    }

    if (lowerMessage.includes('risk') || lowerMessage.includes('position') || lowerMessage.includes('size')) {
      return `**Risk Management Framework**

Proper risk management is the foundation of consistent trading:

**Position Sizing Rules:**
- Risk 1-2% of account per trade maximum
- Formula: Position Size = Risk Amount ÷ (Entry - Stop Loss)
- Example: $100 risk, $0.50 stop distance = 200 shares max

**Daily Risk Limits:**
- Max daily loss: 3-5% of account
- After 2-3 consecutive losses, step back and reassess
- Scale down position size during losing streaks

**Stop Loss Placement:**
- Below VWAP for long positions
- Below key support levels
- Never more than 2-3 ATR from entry

**Risk Reduction Tactics:**
1. Take partial profits at 1:1 R
2. Move stop to breakeven after partial exit
3. Trail stops on remaining position

Would you like help calculating position size for a specific trade?`;
    }

    if (lowerMessage.includes('vwap') || lowerMessage.includes('technical')) {
      return `**VWAP Trading Guide**

VWAP (Volume Weighted Average Price) is essential for intraday trading:

**Why VWAP Matters:**
- Shows the average price weighted by volume
- Institutional traders use it as a benchmark
- Acts as dynamic support/resistance

**VWAP Trading Rules:**
1. **Above VWAP = Bullish Bias**
   - Look for long setups
   - Use VWAP as support for entries
   
2. **Below VWAP = Bearish Bias**
   - Look for short setups
   - Use VWAP as resistance

**VWAP Setups:**
- **Reclaim:** Stock falls below VWAP, reclaims with volume → Long
- **Rejection:** Stock rises to VWAP, rejects → Short
- **Hold:** Stock pulls back to VWAP, bounces → Add to position

**Combining with EMAs:**
- EMA 9 for momentum
- EMA 20 for trend
- Above both + above VWAP = strongest long setup

What specific VWAP setup are you looking at?`;
    }
  }

  if (conversationType === 'TRADE_REVIEWER') {
    if (lowerMessage.includes('review') || lowerMessage.includes('analyze') || lowerMessage.includes('trade')) {
      return `**Trade Review Framework**

I'd be happy to review your trades! Please share:

**Trade Details Needed:**
1. **Entry:** Ticker, entry price, date/time, position size
2. **Exit:** Exit price, date/time, reason for exit
3. **Setup:** What was your thesis? What setup did you see?
4. **Risk:** Where was your stop loss? What was planned R:R?

**I'll Analyze:**
- Entry timing and execution quality
- Stop placement appropriateness
- Risk/reward realized vs planned
- What worked well
- Areas for improvement
- Patterns in your trading behavior

**Optional Context:**
- What was the market doing? (SPY/QQQ trend)
- Any emotional factors affecting the trade?
- Did you follow your trading plan?

Share your trade details and I'll provide detailed, constructive feedback!`;
    }

    if (lowerMessage.includes('pattern') || lowerMessage.includes('mistake') || lowerMessage.includes('improve')) {
      return `**Common Trading Patterns to Address**

Here are frequent issues and how to improve:

**Emotional Trading:**
- ❌ Revenge trading after losses
- ❌ FOMO entries without proper setup
- ✅ Solution: Take breaks after losses, use checklists

**Risk Management Issues:**
- ❌ Moving stop losses to avoid being stopped out
- ❌ Oversizing positions
- ✅ Solution: Use hard stops, pre-calculate position size

**Entry Problems:**
- ❌ Chasing extended moves
- ❌ Entering without volume confirmation
- ✅ Solution: Wait for pullbacks, require volume

**Exit Problems:**
- ❌ Taking profits too early (cutting winners)
- ❌ Holding losers too long (hope trading)
- ✅ Solution: Use scaling out, respect stops

**Journaling Questions:**
1. Did I follow my trading plan?
2. Was my entry at a good location?
3. Did I manage risk appropriately?
4. What would I do differently?

Would you like to discuss any specific pattern you've noticed?`;
    }
  }

  return `I'm your trading assistant, ready to help with:

**Analysis & Ideas:**
- Market overview and conditions
- Trade setup identification
- Technical analysis guidance

**Risk Management:**
- Position sizing calculations
- Stop loss placement strategies
- Risk/reward optimization

**Trade Review:**
- Entry/exit analysis
- Pattern identification
- Performance improvement

What would you like to explore? Feel free to ask about specific stocks, setups, or trading concepts!`;
}

export function useConversation(conversationType: ConversationType = 'TRADE_ASSISTANT') {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createConversation = useCallback(async () => {
    try {
      const response = await client.models.Conversation.create({
        conversationType,
        messages: JSON.stringify([]),
        lastMessageAt: new Date().toISOString(),
        isArchived: false,
      });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to create conversation');
      }

      const newId = response.data?.id;
      if (newId) {
        setConversationId(newId);
        setMessages([]);
      }
      return newId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      const tempId = `temp-${Date.now()}`;
      setConversationId(tempId);
      setMessages([]);
      return tempId;
    }
  }, [conversationType]);

  useEffect(() => {
    createConversation();
  }, [createConversation]);

  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId || !content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    try {
      const response = generateAIResponse(content, conversationType);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (!conversationId.startsWith('temp-')) {
        const allMessages = [...messages, userMessage, assistantMessage];
        await client.models.Conversation.update({
          id: conversationId,
          messages: JSON.stringify(allMessages),
          lastMessageAt: new Date().toISOString(),
        });

        await client.models.AIMessage.create({
          conversationId,
          role: 'USER',
          content: content.trim(),
          createdAt: new Date().toISOString(),
        });

        await client.models.AIMessage.create({
          conversationId,
          role: 'ASSISTANT',
          content: response,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, conversationType, messages]);

  const clearConversation = useCallback(async () => {
    if (conversationId && !conversationId.startsWith('temp-')) {
      try {
        await client.models.Conversation.update({
          id: conversationId,
          isArchived: true,
        });
      } catch (error) {
        console.error('Error archiving conversation:', error);
      }
    }
    
    await createConversation();
  }, [conversationId, createConversation]);

  const displayMessages = messages.filter(m => m.role !== 'system');

  return {
    conversationId,
    messages: displayMessages,
    isLoading,
    sendMessage,
    clearConversation,
  };
}

export function useConversationHistory(type?: ConversationType) {
  return useQuery({
    queryKey: conversationKeys.list(type),
    queryFn: async (): Promise<Conversation[]> => {
      const filter = type 
        ? { conversationType: { eq: type }, isArchived: { eq: false } }
        : { isArchived: { eq: false } };

      const response = await client.models.Conversation.list({ filter });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to fetch conversations');
      }

      const conversations = (response.data || []).map(conv => ({
        ...conv,
        messages: conv.messages ? JSON.parse(conv.messages as string) : [],
        lastMessageAt: new Date(conv.lastMessageAt || conv.createdAt || Date.now()),
      })) as unknown as Conversation[];

      return conversations.sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
    },
    staleTime: 60 * 1000,
  });
}

export function useConversationById(id: string) {
  return useQuery({
    queryKey: conversationKeys.detail(id),
    queryFn: async (): Promise<Conversation | null> => {
      const response = await client.models.Conversation.get({ id });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to fetch conversation');
      }

      if (!response.data) return null;

      return {
        ...response.data,
        messages: response.data.messages ? JSON.parse(response.data.messages as string) : [],
        lastMessageAt: new Date(response.data.lastMessageAt || response.data.createdAt || Date.now()),
      } as unknown as Conversation;
    },
    enabled: !!id,
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const messagesResponse = await client.models.AIMessage.list({
        filter: { conversationId: { eq: id } },
      });

      if (messagesResponse.data) {
        for (const message of messagesResponse.data) {
          await client.models.AIMessage.delete({ id: message.id });
        }
      }

      const response = await client.models.Conversation.delete({ id });

      if (response.errors) {
        throw new Error(response.errors[0]?.message || 'Failed to delete conversation');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}

export default useConversation;
