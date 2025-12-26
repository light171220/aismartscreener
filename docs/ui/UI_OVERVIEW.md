# UI Components Overview - Glassmorphism Design System

## 1. Design Philosophy

### Modern Glassmorphism UI
AI Smart Screener uses a **modern, sober glassmorphism design** that creates depth through:
- Frosted glass effects with backdrop blur
- Subtle transparency and layering
- Soft shadows and borders
- Clean, minimal aesthetics
- Professional trading interface feel

### Design Principles
1. **Clarity**: Information hierarchy through visual depth
2. **Sophistication**: Professional, not playful
3. **Functionality**: Beauty that serves purpose
4. **Consistency**: Unified glass aesthetic throughout

---

## 2. Glassmorphism Design Tokens

### Core Glass Variables

```css
/* globals.css */
:root {
  /* ═══════════════════════════════════════════════════════════════ */
  /* GLASSMORPHISM VARIABLES                                          */
  /* ═══════════════════════════════════════════════════════════════ */
  
  /* Glass Background Colors */
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-bg-light: rgba(255, 255, 255, 0.15);
  --glass-bg-heavy: rgba(255, 255, 255, 0.25);
  --glass-bg-card: rgba(255, 255, 255, 0.08);
  --glass-bg-sidebar: rgba(15, 23, 42, 0.85);
  --glass-bg-header: rgba(15, 23, 42, 0.9);
  --glass-bg-modal: rgba(15, 23, 42, 0.95);
  
  /* Glass Borders */
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-border-light: rgba(255, 255, 255, 0.15);
  --glass-border-heavy: rgba(255, 255, 255, 0.25);
  --glass-border-accent: rgba(59, 130, 246, 0.5);
  
  /* Blur Values */
  --blur-sm: 8px;
  --blur-md: 16px;
  --blur-lg: 24px;
  --blur-xl: 40px;
  
  /* Glass Shadows */
  --glass-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --glass-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.15);
  --glass-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.2);
  --glass-shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.25);
  --glass-shadow-glow: 0 0 40px rgba(59, 130, 246, 0.15);
  --glass-shadow-inset: inset 0 1px 1px rgba(255, 255, 255, 0.1);
  
  /* Gradient Overlays */
  --glass-gradient: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  --glass-gradient-accent: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.1) 0%,
    rgba(147, 51, 234, 0.1) 100%
  );
  
  /* ═══════════════════════════════════════════════════════════════ */
  /* BASE COLOR PALETTE                                               */
  /* ═══════════════════════════════════════════════════════════════ */
  
  /* Background Gradient */
  --bg-gradient-start: #0f172a;    /* Slate 900 */
  --bg-gradient-mid: #1e1b4b;      /* Indigo 950 */
  --bg-gradient-end: #0f172a;      /* Slate 900 */
  
  /* Primary Colors */
  --primary: #3b82f6;              /* Blue 500 */
  --primary-hover: #2563eb;        /* Blue 600 */
  --primary-muted: rgba(59, 130, 246, 0.2);
  
  /* Accent Colors */
  --accent-purple: #8b5cf6;        /* Violet 500 */
  --accent-cyan: #06b6d4;          /* Cyan 500 */
  --accent-emerald: #10b981;       /* Emerald 500 */
  
  /* Text Colors */
  --text-primary: #f8fafc;         /* Slate 50 */
  --text-secondary: #94a3b8;       /* Slate 400 */
  --text-muted: #64748b;           /* Slate 500 */
  --text-accent: #3b82f6;          /* Blue 500 */
  
  /* Trading Colors */
  --profit: #10b981;               /* Emerald 500 */
  --profit-bg: rgba(16, 185, 129, 0.15);
  --loss: #ef4444;                 /* Red 500 */
  --loss-bg: rgba(239, 68, 68, 0.15);
  --warning: #f59e0b;              /* Amber 500 */
  --warning-bg: rgba(245, 158, 11, 0.15);
  --info: #3b82f6;                 /* Blue 500 */
  --info-bg: rgba(59, 130, 246, 0.15);
  
  /* Status Colors */
  --status-active: #10b981;
  --status-pending: #f59e0b;
  --status-inactive: #64748b;
  --status-error: #ef4444;
}
```

### Background Setup

```css
/* Main app background with gradient mesh */
body {
  background: var(--bg-gradient-start);
  background-image: 
    radial-gradient(
      ellipse at 20% 0%,
      rgba(59, 130, 246, 0.15) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 80% 100%,
      rgba(139, 92, 246, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 0% 100%,
      rgba(6, 182, 212, 0.08) 0%,
      transparent 40%
    );
  min-height: 100vh;
}

/* Subtle animated gradient (optional) */
@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

---

## 3. Glass Component Classes

### Tailwind Config Extension

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      backdropBlur: {
        xs: '4px',
      },
      boxShadow: {
        'glass': '0 4px 16px rgba(0, 0, 0, 0.15)',
        'glass-lg': '0 8px 32px rgba(0, 0, 0, 0.2)',
        'glass-glow': '0 0 40px rgba(59, 130, 246, 0.15)',
        'glass-inset': 'inset 0 1px 1px rgba(255, 255, 255, 0.1)',
      },
      colors: {
        glass: {
          white: 'rgba(255, 255, 255, 0.1)',
          'white-light': 'rgba(255, 255, 255, 0.15)',
          'white-heavy': 'rgba(255, 255, 255, 0.25)',
          border: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
};
```

### Reusable Glass Classes

```css
/* Base glass card */
.glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.15),
    inset 0 1px 1px rgba(255, 255, 255, 0.1);
}

/* Glass card hover effect */
.glass-hover {
  transition: all 0.3s ease;
}
.glass-hover:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.2),
    0 0 40px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

/* Glass sidebar */
.glass-sidebar {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

/* Glass header */
.glass-header {
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

/* Glass modal */
.glass-modal {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
}

/* Glass input */
.glass-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  transition: all 0.2s ease;
}
.glass-input:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

/* Glass button */
.glass-button {
  background: rgba(59, 130, 246, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: white;
  font-weight: 500;
  transition: all 0.2s ease;
}
.glass-button:hover {
  background: rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
}

/* Glass badge */
.glass-badge {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
}

/* Profit/Loss badges */
.glass-badge-profit {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
  color: #10b981;
}
.glass-badge-loss {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}
```

---

## 4. Component Library Structure

```
src/components/
├── ui/                        # Base glassmorphism components
│   ├── glass-card.tsx
│   ├── glass-button.tsx
│   ├── glass-input.tsx
│   ├── glass-select.tsx
│   ├── glass-badge.tsx
│   ├── glass-table.tsx
│   ├── glass-dialog.tsx
│   ├── glass-tabs.tsx
│   ├── glass-tooltip.tsx
│   └── index.ts
│
├── charts/                    # Chart components
│   ├── CandlestickChart.tsx
│   ├── VolumeChart.tsx
│   ├── PLChart.tsx
│   └── index.ts
│
├── forms/                     # Form components
│   ├── TradeForm.tsx
│   ├── ScreenerForm.tsx
│   ├── AccessRequestForm.tsx
│   └── index.ts
│
├── layout/                    # Layout components
│   ├── MainLayout.tsx
│   ├── GlassSidebar.tsx
│   ├── GlassHeader.tsx
│   ├── PageContainer.tsx
│   ├── PublicLayout.tsx       # For landing page
│   └── AdminLayout.tsx        # For admin pages
│
├── data-display/              # Data display components
│   ├── StockCard.tsx
│   ├── TradeCard.tsx
│   ├── StatCard.tsx
│   ├── GlassDataTable.tsx
│   └── index.ts
│
├── landing/                   # Landing page components
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── Pricing.tsx
│   ├── Testimonials.tsx
│   └── Footer.tsx
│
├── admin/                     # Admin components
│   ├── UserManagement.tsx
│   ├── AccessRequests.tsx
│   ├── ParameterConfig.tsx
│   └── index.ts
│
└── feedback/                  # Feedback components
    ├── GlassLoader.tsx
    ├── GlassToast.tsx
    ├── EmptyState.tsx
    └── index.ts
```

---

## 5. Core Glass Components

### GlassCard Component

```tsx
// components/ui/glass-card.tsx
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export function GlassCard({ 
  children, 
  className,
  hover = false,
  glow = false,
  padding = 'md',
}: GlassCardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div
      className={cn(
        // Base glass styles
        'bg-white/[0.08] backdrop-blur-xl',
        'border border-white/10 rounded-2xl',
        'shadow-[0_4px_16px_rgba(0,0,0,0.15)]',
        'shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]',
        
        // Padding
        paddingClasses[padding],
        
        // Hover effect
        hover && [
          'transition-all duration-300 ease-out',
          'hover:bg-white/[0.12]',
          'hover:border-white/20',
          'hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]',
          'hover:-translate-y-0.5',
        ],
        
        // Glow effect
        glow && 'shadow-[0_0_40px_rgba(59,130,246,0.15)]',
        
        className
      )}
    >
      {children}
    </div>
  );
}

export function GlassCardHeader({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn('pb-4 border-b border-white/10', className)}>
      {children}
    </div>
  );
}

export function GlassCardTitle({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <h3 className={cn('text-lg font-semibold text-white', className)}>
      {children}
    </h3>
  );
}

export function GlassCardDescription({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <p className={cn('text-sm text-slate-400 mt-1', className)}>
      {children}
    </p>
  );
}

export function GlassCardContent({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn('pt-4', className)}>
      {children}
    </div>
  );
}
```

### GlassButton Component

```tsx
// components/ui/glass-button.tsx
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'success' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  glow?: boolean;
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ 
    children, 
    className, 
    variant = 'default',
    size = 'md',
    loading = false,
    glow = false,
    disabled,
    ...props 
  }, ref) => {
    const variants = {
      default: [
        'bg-white/10 border-white/20 text-white',
        'hover:bg-white/15 hover:border-white/30',
      ],
      primary: [
        'bg-blue-500/20 border-blue-500/30 text-blue-400',
        'hover:bg-blue-500/30 hover:border-blue-500/50',
        glow && 'hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
      ],
      success: [
        'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
        'hover:bg-emerald-500/30 hover:border-emerald-500/50',
        glow && 'hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]',
      ],
      danger: [
        'bg-red-500/20 border-red-500/30 text-red-400',
        'hover:bg-red-500/30 hover:border-red-500/50',
        glow && 'hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]',
      ],
      ghost: [
        'bg-transparent border-transparent text-slate-400',
        'hover:bg-white/10 hover:text-white',
      ],
      outline: [
        'bg-transparent border-white/20 text-white',
        'hover:bg-white/10 hover:border-white/30',
      ],
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-4 py-2 text-sm rounded-lg',
      lg: 'px-6 py-3 text-base rounded-xl',
    };
    
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2',
          'backdrop-blur-sm border font-medium',
          'transition-all duration-200 ease-out',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          
          // Size
          sizes[size],
          
          // Variant
          variants[variant],
          
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

GlassButton.displayName = 'GlassButton';
```

### GlassInput Component

```tsx
// components/ui/glass-input.tsx
import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, error, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            // Base glass styles
            'w-full bg-white/5 backdrop-blur-sm',
            'border border-white/10 rounded-lg',
            'px-4 py-2.5 text-white placeholder:text-slate-500',
            'transition-all duration-200',
            
            // Focus styles
            'focus:bg-white/8 focus:border-blue-500/50',
            'focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]',
            'focus:outline-none',
            
            // Error styles
            error && [
              'border-red-500/50',
              'focus:border-red-500/50',
              'focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',
            ],
            
            // Icon padding
            icon && 'pl-10',
            
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
```

### GlassBadge Component

```tsx
// components/ui/glass-badge.tsx
import { cn } from '@/lib/utils';

interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function GlassBadge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: GlassBadgeProps) {
  const variants = {
    default: 'bg-white/10 border-white/15 text-white',
    primary: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
    success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    danger: 'bg-red-500/15 border-red-500/30 text-red-400',
    warning: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    info: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1',
        'backdrop-blur-sm border rounded-full',
        'font-medium',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
```

---

## 6. Typography System

```css
/* Typography with glass aesthetic */
.heading-1 {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.heading-2 {
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.2;
  color: #f8fafc;
}

.heading-3 {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
  color: #f8fafc;
}

.text-primary {
  color: #f8fafc;
}

.text-secondary {
  color: #94a3b8;
}

.text-muted {
  color: #64748b;
}

.text-accent {
  color: #3b82f6;
}

/* Gradient text for hero sections */
.gradient-text {
  background: linear-gradient(
    135deg,
    #3b82f6 0%,
    #8b5cf6 50%,
    #06b6d4 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## 7. Layout Structure

### Main App Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GLASS HEADER (h-16)                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Logo          Search              Notifications  User                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
├───────────────────┬─────────────────────────────────────────────────────────┤
│                   │                                                          │
│  GLASS SIDEBAR    │               MAIN CONTENT AREA                         │
│  (w-64)           │               (Gradient background)                     │
│                   │                                                          │
│  ┌─────────────┐  │    ┌─────────────────────────────────────────────┐     │
│  │ Dashboard   │  │    │                                              │     │
│  │ ─────────── │  │    │           GLASS CARDS                        │     │
│  │ AI Screener │  │    │           & CONTENT                          │     │
│  │   └ Results │  │    │                                              │     │
│  │   └ Pipeline│  │    │                                              │     │
│  │ ─────────── │  │    └─────────────────────────────────────────────┘     │
│  │ Filters     │  │                                                          │
│  │ ─────────── │  │    ┌─────────────────────────────────────────────┐     │
│  │ Trading     │  │    │                                              │     │
│  │   └ Open    │  │    │           MORE GLASS CARDS                   │     │
│  │   └ History │  │    │                                              │     │
│  │ ─────────── │  │    │                                              │     │
│  │ Admin       │  │    └─────────────────────────────────────────────┘     │
│  │   └ Users   │  │                                                          │
│  │   └ Config  │  │                                                          │
│  └─────────────┘  │                                                          │
│                   │                                                          │
└───────────────────┴─────────────────────────────────────────────────────────┘
```

### Landing Page Layout (Public)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FLOATING GLASS NAVBAR                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Logo                    Features  Pricing  About       Login  SignUp│    │
│  └─────────────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                              HERO SECTION                                    │
│            (Full viewport, gradient mesh background)                         │
│                                                                              │
│              ┌─────────────────────────────────────────┐                    │
│              │     AI-Powered Stock Screening          │                    │
│              │     For Professional Day Traders         │                    │
│              │                                          │                    │
│              │     [Request Access]  [Learn More]       │                    │
│              └─────────────────────────────────────────┘                    │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                            FEATURES SECTION                                  │
│                                                                              │
│     ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                    │
│     │ Glass Card  │   │ Glass Card  │   │ Glass Card  │                    │
│     │ AI Screening│   │ Real-time   │   │ Trade       │                    │
│     │             │   │ Alerts      │   │ Management  │                    │
│     └─────────────┘   └─────────────┘   └─────────────┘                    │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                           HOW IT WORKS                                       │
│                     (Timeline glass cards)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                              FOOTER                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Animation & Transitions

```css
/* Smooth transitions for glass effects */
.glass-transition {
  transition: 
    background-color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    transform 0.3s ease;
}

/* Subtle float animation for cards */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.glass-float {
  animation: float 6s ease-in-out infinite;
}

/* Glow pulse for important elements */
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); }
  50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.4); }
}

.glass-glow-pulse {
  animation: glowPulse 3s ease-in-out infinite;
}

/* Page transitions */
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.4s ease-out;
}

/* Loading shimmer */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.glass-skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}
```

---

## 9. Responsive Design

### Breakpoints
| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Mobile Adaptations
- Sidebar becomes bottom sheet or hamburger
- Glass blur reduced on lower-end devices
- Cards stack vertically
- Tables become scrollable or card lists

```css
/* Reduce blur on mobile for performance */
@media (max-width: 768px) {
  .glass {
    backdrop-filter: blur(8px);
  }
}

/* Fallback for browsers without backdrop-filter */
@supports not (backdrop-filter: blur(16px)) {
  .glass {
    background: rgba(15, 23, 42, 0.95);
  }
}
```

---

## 10. Accessibility

### Focus States
```css
/* Visible focus for keyboard navigation */
.glass-focus:focus-visible {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
}

/* Skip link */
.skip-link {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary);
  color: white;
  padding: 8px 16px;
  border-radius: 0 0 8px 8px;
  z-index: 9999;
}

.skip-link:focus {
  top: 0;
}
```

### Color Contrast
- All text meets WCAG AA standards
- Interactive elements have clear hover/focus states
- Error states use both color and icons

---

## 11. Data Models

### AIScreeningResult Type

Comprehensive data model for stocks identified through the AI screening process:

```typescript
// types/screening.ts
interface AIScreeningResult {
  // ═══════════════════════════════════════════════════════════════
  // CORE FIELDS (Implemented)
  // ═══════════════════════════════════════════════════════════════
  
  ticker: string;                      // Stock symbol
  companyName: string;                 // Company name
  currentPrice: number;                // Current trading price
  changePercent: number;               // Daily change percentage
  
  // Screening results
  setupType: string;                   // e.g., 'GAP_AND_GO', 'BREAKOUT'
  setupQuality: 'A_PLUS' | 'A' | 'B';  // Quality grade
  catalystType?: string;               // e.g., 'EARNINGS', 'NEWS'
  catalystDescription?: string;        // Catalyst details
  
  // Trade levels
  suggestedEntry?: number;             // Suggested entry price
  suggestedStop?: number;              // Stop loss level
  suggestedTarget1?: number;           // First price target
  suggestedTarget2?: number;           // Second price target
  riskRewardRatio?: number;            // Risk/reward ratio
  
  // Market context
  spyTrend?: 'UP' | 'DOWN' | 'NEUTRAL';
  qqqTrend?: 'UP' | 'DOWN' | 'NEUTRAL';
  
  // ═══════════════════════════════════════════════════════════════
  // AVERAGE TARGET PRICE & GROWTH % (Implemented)
  // ═══════════════════════════════════════════════════════════════
  // Calculated from suggestedTarget1 and suggestedTarget2
  // avgTargetPrice = (target1 + target2) / 2
  // growthPercent = ((avgTarget - currentPrice) / currentPrice) * 100
  
  // ═══════════════════════════════════════════════════════════════
  // LAST CLOSING PRICE (Planned)
  // ═══════════════════════════════════════════════════════════════
  previousClose?: number;              // Previous day's closing price
  gapFromClose?: number;               // Current price - previous close
  gapFromClosePercent?: number;        // Gap percentage from previous close
  
  // ═══════════════════════════════════════════════════════════════
  // PRICE RANGES (Planned)
  // ═══════════════════════════════════════════════════════════════
  priceRanges?: {
    days5: {
      low: number;                     // 5-day low price
      high: number;                    // 5-day high price
    };
    days30: {
      low: number;                     // 30-day low price
      high: number;                    // 30-day high price
    };
    weeks52: {
      low: number;                     // 52-week low price
      high: number;                    // 52-week high price
    };
  };
  
  // ═══════════════════════════════════════════════════════════════
  // AI-IDENTIFIED ENTRY & EXIT PRICES (Planned)
  // ═══════════════════════════════════════════════════════════════
  aiIdentifiedLevels?: {
    entryPrice: number;                // AI-identified optimal entry
    exitPrice: number;                 // AI-identified target exit
    entryReason?: string;              // e.g., "VWAP support + 9 EMA bounce"
    exitReason?: string;               // e.g., "52-week high resistance"
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';  // AI confidence level
    analysisFactors?: string[];        // Factors considered
  };
}
```

### Feature Status Summary

| Feature | Status | Location |
|---------|--------|----------|
| Average Target Price | ✅ Implemented | CARDS_AND_STATS.md |
| % Growth from Current | ✅ Implemented | CARDS_AND_STATS.md |
| Last Closing Price | ⏳ Planned | CARDS_AND_STATS.md Section 10 |
| Gap from Close % | ⏳ Planned | CARDS_AND_STATS.md Section 10 |
| 5-Day Low/High | ⏳ Planned | CARDS_AND_STATS.md Section 10 |
| 30-Day Low/High | ⏳ Planned | CARDS_AND_STATS.md Section 10 |
| 52-Week Low/High | ⏳ Planned | CARDS_AND_STATS.md Section 10 |
| AI Entry Price | ⏳ Planned | CARDS_AND_STATS.md Section 10 |
| AI Exit Price | ⏳ Planned | CARDS_AND_STATS.md Section 10 |

### Lambda Data Sources

| Data | Polygon API Endpoint | Lambda Function |
|------|---------------------|------------------|
| Previous Close | `/v2/aggs/ticker/{ticker}/prev` | method1-step1-liquidity |
| Price Ranges | `/v2/aggs/ticker/{ticker}/range/1/day/{from}/{to}` | method1-step2-news |
| 52W High/Low | `/v3/reference/tickers/{ticker}` | method1-step2-news |
| AI Entry/Exit | Technical analysis | method1-step3-technical |

---

## 12. Dark Mode (Default)

The glassmorphism design is optimized for dark mode:
- Rich dark backgrounds with subtle gradients
- Glass elements provide depth
- Accent colors pop against dark surfaces
- Reduced eye strain for extended trading sessions

Light mode is available but secondary:
```css
/* Light mode overrides */
[data-theme="light"] {
  --bg-gradient-start: #f1f5f9;
  --bg-gradient-mid: #e0e7ff;
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(0, 0, 0, 0.1);
  --text-primary: #0f172a;
  --text-secondary: #475569;
}
```
