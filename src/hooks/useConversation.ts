import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generateClient } from 'aws-amplify/api';
import { createAIHooks } from '@aws-amplify/ui-react-ai';
import type { Schema } from '../../amplify/data/resource';

const aiClient = generateClient<Schema>({ authMode: 'userPool' });
const { useAIConversation: useAmplifyAIConversation } = createAIHooks(aiClient);

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

function convertMessages(aiMessages: Array<{
  id?: string;
  role: string;
  content: unknown;
  createdAt?: string;
}>): Message[] {
  return aiMessages.map((msg) => ({
    id: msg.id || `msg-${Date.now()}-${Math.random()}`,
    role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: Array.isArray(msg.content) 
      ? msg.content.map((c) => (c as { text?: string }).text || '').join('')
      : String(msg.content || ''),
    timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
  }));
}

export function useTradeAssistant(initialConversationId?: string) {
  const [conversationId, setConversationId] = useState(() => initialConversationId || `conv-${Date.now()}`);
  
  const [state, sendMessage] = useAmplifyAIConversation('tradeAssistant', { 
    id: conversationId 
  });
  
  const messages = useMemo(() => {
    return convertMessages(state.data?.messages || []);
  }, [state.data?.messages]);

  const send = useCallback((content: string) => {
    if (!content.trim()) return;
    sendMessage({ content: [{ text: content.trim() }] });
  }, [sendMessage]);

  const clearConversation = useCallback(() => {
    setConversationId(`conv-${Date.now()}`);
  }, []);

  const retry = useCallback(() => {
    setConversationId(`conv-${Date.now()}`);
  }, []);

  return {
    conversationId,
    messages,
    isLoading: state.isLoading,
    error: state.hasError ? 'Failed to communicate with AI. Please try again.' : null,
    sendMessage: send,
    clearConversation,
    retry,
  };
}

export function useTradeReviewer(initialConversationId?: string) {
  const [conversationId, setConversationId] = useState(() => initialConversationId || `conv-${Date.now()}`);
  
  const [state, sendMessage] = useAmplifyAIConversation('tradeReviewer', { 
    id: conversationId 
  });
  
  const messages = useMemo(() => {
    return convertMessages(state.data?.messages || []);
  }, [state.data?.messages]);

  const send = useCallback((content: string) => {
    if (!content.trim()) return;
    sendMessage({ content: [{ text: content.trim() }] });
  }, [sendMessage]);

  const clearConversation = useCallback(() => {
    setConversationId(`conv-${Date.now()}`);
  }, []);

  const retry = useCallback(() => {
    setConversationId(`conv-${Date.now()}`);
  }, []);

  return {
    conversationId,
    messages,
    isLoading: state.isLoading,
    error: state.hasError ? 'Failed to communicate with AI. Please try again.' : null,
    sendMessage: send,
    clearConversation,
    retry,
  };
}

export function useConversation(conversationType: ConversationType = 'TRADE_ASSISTANT') {
  const assistantHook = useTradeAssistant();
  const reviewerHook = useTradeReviewer();
  
  if (conversationType === 'TRADE_REVIEWER') {
    return reviewerHook;
  }
  return assistantHook;
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

export function useAnalyzeStock() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const analyzeStock = useCallback(async (input: {
    ticker: string;
    priceData: Record<string, unknown>;
    technicals?: Record<string, unknown>;
    news?: string;
  }) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await client.generations.analyzeStock({
        ticker: input.ticker,
        priceData: input.priceData,
        technicals: input.technicals,
        news: input.news,
      });

      return response.data;
    } catch (err) {
      console.error('Error analyzing stock:', err);
      setAnalysisError('Failed to analyze stock. Please try again.');
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    analyzeStock,
    isAnalyzing,
    analysisError,
  };
}

export default useConversation;
