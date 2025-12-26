import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
  GlassButton,
  GlassTextarea,
  PageLoader,
} from '@/components/ui';
import { useConversation } from '@/hooks/useConversation';
import {
  Bot,
  Send,
  Trash2,
  Loader2,
  User,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Target,
  BarChart3,
} from 'lucide-react';

const quickActions = [
  { label: 'Market Overview', prompt: 'Give me a quick overview of today\'s market conditions. What are SPY and QQQ doing?', icon: BarChart3 },
  { label: 'Setup Ideas', prompt: 'Based on current market conditions, what types of setups should I be looking for today?', icon: Target },
  { label: 'Risk Check', prompt: 'Help me assess my current risk exposure. What should I consider before taking new trades?', icon: AlertTriangle },
  { label: 'Trade Review', prompt: 'I want to review my recent trades. What questions should I be asking myself?', icon: TrendingUp },
];

export function TradeAssistantPage() {
  const { messages, isLoading, sendMessage, clearConversation, conversationId } = useConversation('TRADE_ASSISTANT');
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

  const handleQuickAction = async (prompt: string) => {
    if (isLoading) return;
    await sendMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Trade Assistant</h1>
            <p className="text-sm text-slate-400">AI-powered trading analysis</p>
          </div>
        </div>
        <GlassButton variant="ghost" size="sm" onClick={clearConversation}>
          <Trash2 className="w-4 h-4 mr-2" />
          New Chat
        </GlassButton>
      </div>

      {/* Chat Container */}
      <GlassCard className="flex-1 flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                <Sparkles className="w-10 h-10 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                How can I help you trade better?
              </h2>
              <p className="text-slate-400 max-w-md mb-6">
                Ask me about market conditions, trade setups, risk management, or get help analyzing specific stocks.
              </p>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 max-w-lg">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
                  >
                    <action.icon className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                    <span className="text-sm text-white group-hover:text-white/90">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="glass rounded-lg rounded-tl-none p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <GlassTextarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about market conditions, trade setups, or specific stocks..."
              className="flex-1 min-h-[48px] max-h-32 resize-none"
              rows={1}
              disabled={isLoading}
            />
            <GlassButton
              type="submit"
              variant="primary"
              disabled={!inputValue.trim() || isLoading}
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </GlassButton>
          </form>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Powered by Claude AI • Not financial advice • Always do your own research
          </p>
        </div>
      </GlassCard>
    </div>
  );
}

interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  };
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
        isUser 
          ? 'bg-emerald-500/20' 
          : 'bg-gradient-to-br from-blue-500 to-purple-600'
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-emerald-400" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      <div className={cn(
        'glass rounded-lg p-4 max-w-[80%]',
        isUser ? 'rounded-tr-none bg-emerald-500/10' : 'rounded-tl-none'
      )}>
        <FormattedMessage content={message.content} />
        <p className="text-xs text-slate-500 mt-2">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

function FormattedMessage({ content }: { content: string }) {
  // Simple markdown-like formatting
  const formatContent = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('###')) {
        return <h4 key={index} className="text-md font-semibold text-white mt-3 mb-1">{line.replace(/^###\s*/, '')}</h4>;
      }
      if (line.startsWith('##')) {
        return <h3 key={index} className="text-lg font-semibold text-white mt-3 mb-1">{line.replace(/^##\s*/, '')}</h3>;
      }
      if (line.startsWith('#')) {
        return <h2 key={index} className="text-xl font-bold text-white mt-3 mb-2">{line.replace(/^#\s*/, '')}</h2>;
      }
      
      // Bullet points
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <li key={index} className="text-slate-300 ml-4 list-disc">
            {formatInlineText(line.replace(/^[-•]\s*/, ''))}
          </li>
        );
      }
      
      // Numbered lists
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={index} className="text-slate-300 ml-4 list-decimal">
            {formatInlineText(line.replace(/^\d+\.\s*/, ''))}
          </li>
        );
      }
      
      // Empty lines
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
      // Regular paragraphs
      return <p key={index} className="text-slate-300 mb-1">{formatInlineText(line)}</p>;
    });
  };

  const formatInlineText = (text: string) => {
    // Bold text **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      // Price/number highlighting
      return part.split(/(\$[\d,.]+|\d+(?:\.\d+)?%)/g).map((subpart, j) => {
        if (subpart.startsWith('$') || subpart.endsWith('%')) {
          return <span key={`${i}-${j}`} className="text-emerald-400 font-mono">{subpart}</span>;
        }
        return subpart;
      });
    });
  };

  return <div className="space-y-1">{formatContent(content)}</div>;
}

export default TradeAssistantPage;
