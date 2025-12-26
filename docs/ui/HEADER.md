# Header Component

## 1. Overview

The Header provides top-level navigation, search, notifications, and user menu. It's fixed at the top and responsive across devices. Uses glassmorphism styling for the premium dark UI.

## 2. Visual Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ≡  AI Smart Screener    │    🔍 Search stocks...    │  🛡️ 🔔  👤  ⚙️        │
│ (menu)  (logo)          │    (command palette)      │ (admin)(notif)(user) │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3. Glass Header Implementation

```tsx
// components/layout/GlassHeader.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Command,
  Shield,
} from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassBadge } from '@/components/ui/glass-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationCenter } from '@/features/notifications';
import { useAuth } from '@/hooks/useAuth';
import { useUserAccess } from '@/hooks/useUserAccess';
import { CommandMenu } from './CommandMenu';
import { MarketStatusBadge } from './MarketStatusBadge';
import { cn } from '@/lib/utils';

interface GlassHeaderProps {
  onMenuClick?: () => void;
}

export function GlassHeader({ onMenuClick }: GlassHeaderProps) {
  const { user, signOut } = useAuth();
  const { userAccess } = useUserAccess();
  const navigate = useNavigate();
  const [commandOpen, setCommandOpen] = useState(false);
  
  const isAdmin = userAccess?.role === 'ADMIN';
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 glass">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <GlassButton
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </GlassButton>
          
          {/* Logo */}
          <Link to="/app" className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white hidden sm:inline-block">
              AI Smart Screener
            </span>
          </Link>
          
          {/* Market Status */}
          <div className="hidden md:block">
            <MarketStatusBadge />
          </div>
        </div>
        
        {/* Center Section - Search */}
        <div className="flex-1 max-w-xl px-4 hidden md:block">
          <button
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl glass-subtle border border-white/10 text-slate-400 hover:border-white/20 transition-colors"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left text-sm">Search stocks, trades...</span>
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-xs font-mono text-slate-500">
              <Command className="h-3 w-3" />K
            </kbd>
          </button>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Admin Link */}
          {isAdmin && (
            <Link to="/admin">
              <GlassButton variant="ghost" size="sm">
                <Shield className="h-4 w-4 text-amber-400" />
              </GlassButton>
            </Link>
          )}
          
          {/* Mobile Search */}
          <GlassButton
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="h-4 w-4" />
          </GlassButton>
          
          {/* Notifications */}
          <NotificationCenter />
          
          {/* Settings */}
          <Link to="/app/settings">
            <GlassButton variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </GlassButton>
          </Link>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass border-white/10">
              <DropdownMenuLabel className="text-slate-400">
                <div className="flex flex-col">
                  <span className="text-white font-medium">{user?.name}</span>
                  <span className="text-xs text-slate-500">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                className="text-slate-300 hover:bg-white/10"
                onClick={() => navigate('/app/profile')}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-slate-300 hover:bg-white/10"
                onClick={() => navigate('/app/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    className="text-amber-400 hover:bg-white/10"
                    onClick={() => navigate('/admin')}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                className="text-red-400 hover:bg-red-500/10"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Command Menu */}
      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
    </header>
  );
}
```

## 4. Market Status Badge

```tsx
// components/layout/MarketStatusBadge.tsx
import { useMarketStatus } from '@/hooks/useMarketStatus';
import { GlassBadge } from '@/components/ui/glass-badge';
import { Clock, Sun, Moon } from 'lucide-react';

export function MarketStatusBadge() {
  const { isOpen, timeUntilChange, session } = useMarketStatus();
  
  return (
    <GlassBadge 
      variant={isOpen ? 'success' : 'default'}
      className="gap-1.5"
    >
      {isOpen ? (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Market Open</span>
        </>
      ) : session === 'PRE_MARKET' ? (
        <>
          <Sun className="w-3 h-3" />
          <span>Pre-Market</span>
        </>
      ) : session === 'AFTER_HOURS' ? (
        <>
          <Moon className="w-3 h-3" />
          <span>After Hours</span>
        </>
      ) : (
        <>
          <Clock className="w-3 h-3" />
          <span>Closed • {timeUntilChange}</span>
        </>
      )}
    </GlassBadge>
  );
}
```

## 5. Command Palette

```tsx
// components/layout/CommandMenu.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Home,
  Sparkles,
  Filter,
  TrendingUp,
  History,
  MessageSquare,
  Settings,
  Search,
  Calculator,
  Shield,
  Lightbulb,
} from 'lucide-react';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { useUserAccess } from '@/hooks/useUserAccess';

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { recentSearches, addSearch } = useRecentSearches();
  const { userAccess } = useUserAccess();
  const isAdmin = userAccess?.role === 'ADMIN';
  
  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);
  
  const runCommand = (callback: () => void) => {
    onOpenChange(false);
    callback();
  };
  
  const handleStockSearch = (ticker: string) => {
    addSearch(ticker);
    runCommand(() => navigate(`/app/stock/${ticker.toUpperCase()}`));
  };
  
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search stocks, navigate, or type a command..."
        value={search}
        onValueChange={setSearch}
        className="glass-input"
      />
      <CommandList className="glass">
        <CommandEmpty>No results found.</CommandEmpty>
        
        {/* Stock Search */}
        {search.length > 0 && search.match(/^[A-Za-z]{1,5}$/) && (
          <CommandGroup heading="Stock Search">
            <CommandItem onSelect={() => handleStockSearch(search)}>
              <Search className="mr-2 h-4 w-4" />
              Search for "{search.toUpperCase()}"
            </CommandItem>
          </CommandGroup>
        )}
        
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <CommandGroup heading="Recent Searches">
            {recentSearches.slice(0, 5).map((ticker) => (
              <CommandItem
                key={ticker}
                onSelect={() => handleStockSearch(ticker)}
              >
                <History className="mr-2 h-4 w-4" />
                {ticker}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        
        <CommandSeparator />
        
        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate('/app'))}>
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/app/ai-screener'))}>
            <Sparkles className="mr-2 h-4 w-4" />
            AI Screener
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/app/ai-screener/pipeline'))}>
            <Filter className="mr-2 h-4 w-4" />
            Pipeline View
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/app/suggestions'))}>
            <Lightbulb className="mr-2 h-4 w-4" />
            Suggestions
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/app/trades'))}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Open Trades
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/app/history'))}>
            <History className="mr-2 h-4 w-4" />
            Trade History
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/app/assistant'))}>
            <MessageSquare className="mr-2 h-4 w-4" />
            AI Assistant
          </CommandItem>
        </CommandGroup>
        
        {isAdmin && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Admin">
              <CommandItem onSelect={() => runCommand(() => navigate('/admin'))}>
                <Shield className="mr-2 h-4 w-4 text-amber-400" />
                Admin Dashboard
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate('/admin/users'))}>
                <Shield className="mr-2 h-4 w-4 text-amber-400" />
                User Management
              </CommandItem>
            </CommandGroup>
          </>
        )}
        
        <CommandSeparator />
        
        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => navigate('/app/trades?new=true'))}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Add New Trade
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/app/settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
```

## 6. Breadcrumbs

```tsx
// components/layout/Breadcrumbs.tsx
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const routeLabels: Record<string, string> = {
  'app': 'Dashboard',
  'ai-screener': 'AI Screener',
  'pipeline': 'Pipeline',
  'filter-screener': 'Filter Screener',
  'high-upside': 'High Upside',
  'undervalued': 'Undervalued',
  'suggestions': 'Suggestions',
  'trades': 'Open Trades',
  'history': 'Trade History',
  'assistant': 'AI Assistant',
  'reviewer': 'Trade Reviewer',
  'settings': 'Settings',
  'profile': 'Profile',
  'admin': 'Admin',
  'access-requests': 'Access Requests',
  'users': 'User Management',
  'parameters': 'Screening Parameters',
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  if (pathnames.length <= 1) return null;
  
  return (
    <nav className="flex items-center space-x-1 text-sm text-slate-400 mb-4">
      <Link
        to="/app"
        className="flex items-center hover:text-white transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {pathnames.slice(1).map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 2).join('/')}`;
        const isLast = index === pathnames.length - 2;
        const label = routeLabels[name] || name;
        
        return (
          <div key={name} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1 text-slate-600" />
            {isLast ? (
              <span className="font-medium text-white">{label}</span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-white transition-colors"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
```

## 7. Mobile Header

```tsx
// Simplified glass header for mobile
export function MobileGlassHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-white/10 glass px-4 md:hidden">
      <GlassButton variant="ghost" size="sm" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </GlassButton>
      
      <Link to="/app" className="flex items-center gap-2">
        <div className="p-1 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-white">SmartScreener</span>
      </Link>
      
      <NotificationCenter />
    </header>
  );
}
```

## 8. Header States

### Loading State
```tsx
// Show skeleton while user loads
{isLoadingUser ? (
  <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
) : (
  <UserAvatar user={user} />
)}
```

### Offline State
```tsx
// Show offline indicator
{!isOnline && (
  <GlassBadge variant="danger" className="mr-2">
    <WifiOff className="h-3 w-3 mr-1" />
    Offline
  </GlassBadge>
)}
```

## 9. Route Structure Summary

All app routes use the `/app` prefix:
- `/app` - Dashboard
- `/app/ai-screener` - AI Screening results
- `/app/ai-screener/pipeline` - Pipeline view
- `/app/filter-screener/high-upside` - High upside stocks
- `/app/filter-screener/undervalued` - Undervalued stocks
- `/app/suggestions` - Trade suggestions
- `/app/trades` - Open positions
- `/app/history` - Trade history
- `/app/assistant` - AI chat
- `/app/reviewer` - Performance review
- `/app/settings` - User settings
- `/app/profile` - User profile

Admin routes use `/admin` prefix:
- `/admin` - Admin dashboard
- `/admin/access-requests` - Pending requests
- `/admin/users` - User management
- `/admin/parameters` - Screening config
