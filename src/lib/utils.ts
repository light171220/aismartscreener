import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toFixed(2);
}

export function formatMarketCap(value: number): string {
  if (value >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  return `$${formatNumber(value)}`;
}

export function formatVolume(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}

export function formatDate(date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    case 'long':
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    case 'time':
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    default:
      return d.toLocaleDateString();
  }
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d, 'short');
}

export function calculatePLPercent(entryPrice: number, currentPrice: number): number {
  return ((currentPrice - entryPrice) / entryPrice) * 100;
}

export function calculateRMultiple(entryPrice: number, exitPrice: number, stopPrice: number): number {
  const risk = Math.abs(entryPrice - stopPrice);
  if (risk === 0) return 0;
  const reward = exitPrice - entryPrice;
  return reward / risk;
}

export function calculateRiskReward(entryPrice: number, stopPrice: number, targetPrice: number): string {
  const risk = Math.abs(entryPrice - stopPrice);
  const reward = Math.abs(targetPrice - entryPrice);
  if (risk === 0) return 'N/A';
  const ratio = reward / risk;
  return `1:${ratio.toFixed(2)}`;
}

export function isMarketOpen(): boolean {
  const now = new Date();
  const etTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = etTime.getDay();
  const hours = etTime.getHours();
  const minutes = etTime.getMinutes();
  const time = hours * 60 + minutes;

  if (day === 0 || day === 6) return false;

  const marketOpen = 9 * 60 + 30;
  const marketClose = 16 * 60;

  return time >= marketOpen && time < marketClose;
}

export function getMarketStatus(): 'pre-market' | 'open' | 'after-hours' | 'closed' {
  const now = new Date();
  const etTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = etTime.getDay();
  const hours = etTime.getHours();
  const minutes = etTime.getMinutes();
  const time = hours * 60 + minutes;

  if (day === 0 || day === 6) return 'closed';

  const preMarketOpen = 4 * 60;
  const marketOpen = 9 * 60 + 30;
  const marketClose = 16 * 60;
  const afterHoursClose = 20 * 60;

  if (time >= preMarketOpen && time < marketOpen) return 'pre-market';
  if (time >= marketOpen && time < marketClose) return 'open';
  if (time >= marketClose && time < afterHoursClose) return 'after-hours';
  return 'closed';
}

export function getCurrentETTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function getSetupQualityColor(quality: string): string {
  switch (quality) {
    case 'A_PLUS':
    case 'A+':
      return 'text-emerald-400';
    case 'A':
      return 'text-green-400';
    case 'B':
      return 'text-yellow-400';
    case 'C':
      return 'text-orange-400';
    default:
      return 'text-slate-400';
  }
}

export function getSetupQualityVariant(quality: string): 'success' | 'warning' | 'default' {
  switch (quality) {
    case 'A_PLUS':
    case 'A+':
    case 'A':
      return 'success';
    case 'B':
      return 'warning';
    default:
      return 'default';
  }
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length)}...`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
