import * as React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { GlassButton } from '@/components/ui';
import { Sparkles, Menu, X } from 'lucide-react';

export function PublicLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // HomePage has its own custom layout with navbar and footer
  // So we render it without the shared navbar/footer
  if (isHomePage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-0 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navbar for auth pages */}
      <AuthNavbar />

      {/* Main content */}
      <main className="relative pt-24 pb-12">
        <Outlet />
      </main>
    </div>
  );
}

function AuthNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold">AI Smart Screener</h1>
              <p className="text-slate-400 text-xs">Stock Trading Intelligence</p>
            </div>
          </Link>

          {/* Auth links */}
          <div className="flex items-center gap-3">
            <Link to="/login">
              <GlassButton variant="ghost" size="sm">
                Sign In
              </GlassButton>
            </Link>
            <Link to="/signup">
              <GlassButton variant="primary" size="sm">
                Sign Up
              </GlassButton>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
