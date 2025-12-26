# Home Page (Landing Page)

## 1. Overview

The Home Page is the **public landing page** that visitors see before authentication. It serves as the entry point for new users to learn about AI Smart Screener and request access to the platform.

### Key Goals
- Showcase the platform's value proposition
- Highlight key features without exposing methodology
- Provide access request functionality
- Professional, modern glassmorphism aesthetic
- Convert visitors to access requests

---

## 2. Page Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    FLOATING GLASS NAVBAR                             │    │
│  │  Logo                Features  Pricing  About          Login  SignUp │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                           ╔═════════════════════╗                           │
│                           ║    HERO SECTION     ║                           │
│                           ║                     ║                           │
│                           ║  AI-Powered Stock   ║                           │
│                           ║  Screening for      ║                           │
│                           ║  Professional       ║                           │
│                           ║  Day Traders        ║                           │
│                           ║                     ║                           │
│                           ║  [Request Access]   ║                           │
│                           ╚═════════════════════╝                           │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                          FEATURES SECTION                                    │
│                                                                              │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│   │   Glass Card    │  │   Glass Card    │  │   Glass Card    │            │
│   │                 │  │                 │  │                 │            │
│   │  🤖 AI Powered  │  │  📊 Real-Time   │  │  📈 Trade       │            │
│   │                 │  │     Alerts      │  │     Management  │            │
│   │  Intelligent    │  │  Get notified   │  │  Track P&L,     │            │
│   │  stock          │  │  when high-     │  │  journal trades │            │
│   │  screening      │  │  quality setups │  │  AI review      │            │
│   │                 │  │  are found      │  │                 │            │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                              │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│   │   Glass Card    │  │   Glass Card    │  │   Glass Card    │            │
│   │                 │  │                 │  │                 │            │
│   │  🔒 Risk        │  │  💬 AI          │  │  📱 Mobile      │            │
│   │     Management  │  │     Assistant   │  │     Ready       │            │
│   │                 │  │                 │  │                 │            │
│   │  Built-in risk  │  │  Chat with AI   │  │  Access from    │            │
│   │  validation     │  │  for trade      │  │  anywhere       │            │
│   │  before alerts  │  │  analysis       │  │                 │            │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                        SOCIAL PROOF SECTION                                  │
│                                                                              │
│              "Trusted by professional day traders"                          │
│                                                                              │
│         ┌─────────┐    ┌─────────┐    ┌─────────┐                          │
│         │ 10,000+ │    │  Pre-   │    │  Risk   │                          │
│         │ Stocks  │    │ Market  │    │ Managed │                          │
│         │ Scanned │    │ Alerts  │    │ Setups  │                          │
│         └─────────┘    └─────────┘    └─────────┘                          │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                        REQUEST ACCESS SECTION                                │
│                                                                              │
│              ┌─────────────────────────────────────────────┐                │
│              │         GLASS FORM CARD                      │                │
│              │                                              │                │
│              │   Request Access to AI Smart Screener        │                │
│              │                                              │                │
│              │   ┌────────────────────────────────────┐    │                │
│              │   │ Full Name                          │    │                │
│              │   └────────────────────────────────────┘    │                │
│              │   ┌────────────────────────────────────┐    │                │
│              │   │ Email                              │    │                │
│              │   └────────────────────────────────────┘    │                │
│              │   ┌────────────────────────────────────┐    │                │
│              │   │ Trading Experience (dropdown)      │    │                │
│              │   └────────────────────────────────────┘    │                │
│              │   ┌────────────────────────────────────┐    │                │
│              │   │ Why do you want access? (textarea) │    │                │
│              │   └────────────────────────────────────┘    │                │
│              │                                              │                │
│              │           [Submit Request]                   │                │
│              └─────────────────────────────────────────────┘                │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                            FOOTER                                            │
│                                                                              │
│   Logo          Features | Pricing | About | Contact        © 2024          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Components Implementation

### 3.1 Floating Glass Navbar

```tsx
// components/landing/Navbar.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, TrendingUp } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'transition-all duration-300',
        isScrolled ? 'py-2' : 'py-4'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            'flex items-center justify-between',
            'px-6 py-3 rounded-2xl',
            'bg-slate-900/80 backdrop-blur-xl',
            'border border-white/10',
            'shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
            'transition-all duration-300',
            isScrolled && 'shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
          )}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              AI Smart<span className="text-blue-400">Screener</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#about">About</NavLink>
          </div>
          
          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <GlassButton variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </GlassButton>
            <GlassButton variant="primary" glow asChild>
              <Link to="/request-access">Request Access</Link>
            </GlassButton>
          </div>
          
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 p-4 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-white/10">
            <div className="flex flex-col gap-4">
              <NavLink href="#features" mobile>Features</NavLink>
              <NavLink href="#pricing" mobile>Pricing</NavLink>
              <NavLink href="#about" mobile>About</NavLink>
              <hr className="border-white/10" />
              <Link to="/login" className="text-slate-300 hover:text-white">
                Login
              </Link>
              <GlassButton variant="primary" className="w-full" asChild>
                <Link to="/request-access">Request Access</Link>
              </GlassButton>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ 
  href, 
  children, 
  mobile = false 
}: { 
  href: string; 
  children: React.ReactNode;
  mobile?: boolean;
}) {
  return (
    <a
      href={href}
      className={cn(
        'text-slate-300 hover:text-white transition-colors',
        mobile ? 'text-base' : 'text-sm font-medium'
      )}
    >
      {children}
    </a>
  );
}
```

### 3.2 Hero Section

```tsx
// components/landing/Hero.tsx
import { ArrowRight, Sparkles } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_100%,rgba(6,182,212,0.08),transparent_40%)]" />
      </div>
      
      {/* Floating orbs (decorative) */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">AI-Powered Stock Screening</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
              Find Winning Trades
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Before The Market Opens
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Our proprietary AI screening system analyzes thousands of stocks daily 
            to deliver only the highest-probability trading setups directly to you.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <GlassButton 
              size="lg" 
              variant="primary" 
              glow
              className="w-full sm:w-auto"
            >
              Request Access
              <ArrowRight className="w-5 h-5" />
            </GlassButton>
            <GlassButton 
              size="lg" 
              variant="outline"
              className="w-full sm:w-auto"
            >
              Learn More
            </GlassButton>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/40 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
```

### 3.3 Features Section

```tsx
// components/landing/Features.tsx
import { 
  Brain, 
  Bell, 
  LineChart, 
  Shield, 
  MessageSquare, 
  Smartphone
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Screening',
    description: 'Advanced algorithms analyze market data to identify high-probability trading opportunities before market open.',
    color: 'blue',
  },
  {
    icon: Bell,
    title: 'Real-Time Alerts',
    description: 'Get notified instantly when new setups are identified that match your trading criteria.',
    color: 'purple',
  },
  {
    icon: LineChart,
    title: 'Trade Management',
    description: 'Track open positions, journal your trades, calculate P&L, and analyze your performance over time.',
    color: 'cyan',
  },
  {
    icon: Shield,
    title: 'Risk Management',
    description: 'Built-in risk validation ensures every alert meets strict quality and risk criteria.',
    color: 'emerald',
  },
  {
    icon: MessageSquare,
    title: 'AI Trade Assistant',
    description: 'Chat with our AI assistant for trade analysis, setup validation, and performance coaching.',
    color: 'amber',
  },
  {
    icon: Smartphone,
    title: 'Access Anywhere',
    description: 'Responsive design works seamlessly on desktop, tablet, and mobile devices.',
    color: 'rose',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Professional-Grade Tools
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Everything you need to find, execute, and manage winning trades
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  color 
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400',
  };
  
  return (
    <GlassCard hover className="group">
      <div className={cn(
        'w-12 h-12 rounded-xl mb-4',
        'bg-gradient-to-br border',
        'flex items-center justify-center',
        'transition-transform duration-300 group-hover:scale-110',
        colorClasses[color]
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </GlassCard>
  );
}
```

### 3.4 Social Proof Section

```tsx
// components/landing/SocialProof.tsx
import { GlassCard } from '@/components/ui/glass-card';

const stats = [
  { value: '10,000+', label: 'Stocks Analyzed Daily' },
  { value: 'Pre-Market', label: 'Alerts Before Open' },
  { value: 'Risk-First', label: 'Validated Setups' },
];

export function SocialProof() {
  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-slate-400 text-lg">
            Trusted by professional day traders
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8">
          {stats.map((stat, index) => (
            <GlassCard key={index} className="text-center px-8 py-6">
              <div className="text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-400">
                {stat.label}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### 3.5 Access Request Form

```tsx
// components/landing/AccessRequestForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, CheckCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput } from '@/components/ui/glass-input';
import { cn } from '@/lib/utils';

const accessRequestSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  tradingExperience: z.enum(['beginner', 'intermediate', 'advanced', 'professional']),
  reason: z.string().min(20, 'Please provide at least 20 characters'),
});

type AccessRequestFormData = z.infer<typeof accessRequestSchema>;

export function AccessRequestSection() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccessRequestFormData>({
    resolver: zodResolver(accessRequestSchema),
  });
  
  const onSubmit = async (data: AccessRequestFormData) => {
    setIsLoading(true);
    
    try {
      await fetch('/api/access-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <section id="request-access" className="py-24 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlassCard padding="lg" className="relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          {isSubmitted ? (
            <div className="text-center py-8 relative z-10">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Request Submitted!
              </h3>
              <p className="text-slate-400">
                We'll review your request and get back to you within 24-48 hours.
                You'll receive an email once your access is approved.
              </p>
            </div>
          ) : (
            <div className="relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Request Access
                </h2>
                <p className="text-slate-400">
                  Fill out the form below and our team will review your application
                </p>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <GlassInput
                    {...register('fullName')}
                    placeholder="John Doe"
                    error={!!errors.fullName}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-400">{errors.fullName.message}</p>
                  )}
                </div>
                
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <GlassInput
                    {...register('email')}
                    type="email"
                    placeholder="john@example.com"
                    error={!!errors.email}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>
                
                {/* Trading Experience */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Trading Experience
                  </label>
                  <select
                    {...register('tradingExperience')}
                    className={cn(
                      'w-full bg-white/5 backdrop-blur-sm',
                      'border border-white/10 rounded-lg',
                      'px-4 py-2.5 text-white',
                      'focus:bg-white/8 focus:border-blue-500/50',
                      'focus:outline-none',
                      errors.tradingExperience && 'border-red-500/50'
                    )}
                  >
                    <option value="" className="bg-slate-900">Select experience level</option>
                    <option value="beginner" className="bg-slate-900">Beginner (0-1 years)</option>
                    <option value="intermediate" className="bg-slate-900">Intermediate (1-3 years)</option>
                    <option value="advanced" className="bg-slate-900">Advanced (3-5 years)</option>
                    <option value="professional" className="bg-slate-900">Professional (5+ years)</option>
                  </select>
                  {errors.tradingExperience && (
                    <p className="mt-1 text-sm text-red-400">{errors.tradingExperience.message}</p>
                  )}
                </div>
                
                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Why do you want access?
                  </label>
                  <textarea
                    {...register('reason')}
                    rows={4}
                    placeholder="Tell us about your trading goals..."
                    className={cn(
                      'w-full bg-white/5 backdrop-blur-sm',
                      'border border-white/10 rounded-lg',
                      'px-4 py-2.5 text-white placeholder:text-slate-500',
                      'focus:bg-white/8 focus:border-blue-500/50',
                      'focus:outline-none resize-none',
                      errors.reason && 'border-red-500/50'
                    )}
                  />
                  {errors.reason && (
                    <p className="mt-1 text-sm text-red-400">{errors.reason.message}</p>
                  )}
                </div>
                
                {/* Submit Button */}
                <GlassButton
                  type="submit"
                  variant="primary"
                  glow
                  className="w-full"
                  loading={isLoading}
                >
                  {isLoading ? 'Submitting...' : 'Submit Request'}
                  <Send className="w-4 h-4" />
                </GlassButton>
              </form>
            </div>
          )}
        </GlassCard>
      </div>
    </section>
  );
}
```

---

## 4. Main Landing Page Component

```tsx
// pages/HomePage.tsx
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { SocialProof } from '@/components/landing/SocialProof';
import { AccessRequestSection } from '@/components/landing/AccessRequestForm';
import { Footer } from '@/components/landing/Footer';

export function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <SocialProof />
        <AccessRequestSection />
      </main>
      <Footer />
    </div>
  );
}
```

---

## 5. Access Flow States

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER ACCESS FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐      │
│  │  Visitor │───▶│   Request    │───▶│   Pending    │───▶│ Approved │      │
│  │          │    │   Access     │    │   Review     │    │  User    │      │
│  └──────────┘    └──────────────┘    └──────────────┘    └──────────┘      │
│                                              │                   │          │
│                                              │                   │          │
│                                              ▼                   ▼          │
│                                       ┌──────────┐       ┌──────────┐      │
│                                       │ Rejected │       │  Admin   │      │
│                                       │          │       │ Revoked  │      │
│                                       └──────────┘       └──────────┘      │
│                                                                              │
│  States:                                                                     │
│  • VISITOR - Can view landing page, submit access request                   │
│  • PENDING - Waiting for admin approval, sees pending page                  │
│  • APPROVED - Full access to the platform                                   │
│  • REJECTED - Access denied, can re-apply after 30 days                     │
│  • REVOKED - Access removed by admin, blocked from platform                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```
