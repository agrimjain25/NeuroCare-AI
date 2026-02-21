'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAllTestsCompleted, getSession } from '@/lib/storage';
import { logout } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Brain, Mic, TrendingUp, Sparkles, FileText, Lock, LogOut } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLocked, setIsLocked] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showResultsLock, setShowResultsLock] = useState(false);

  useEffect(() => {
    const session = getSession();
    setUser(session.user);
    setIsLocked(!isAllTestsCompleted());
  }, [pathname]);

  const handleResultsClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      setShowResultsLock(true);
      setTimeout(() => setShowResultsLock(false), 3000);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/cognitive-test', label: 'Cognitive', icon: <Brain className="w-4 h-4" /> },
    { href: '/speech-test', label: 'Speech', icon: <Mic className="w-4 h-4" /> },
    { href: '/behavior-analysis', label: 'Behavior', icon: <TrendingUp className="w-4 h-4" /> },
    { href: '/relax', label: 'Relax', icon: <Sparkles className="w-4 h-4" /> },
    { 
      href: '/results', 
      label: 'Results', 
      icon: isLocked ? <Lock className="w-4 h-4" /> : <FileText className="w-4 h-4" />,
      locked: isLocked,
    },
  ];

  if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Unified Logo & Branding */}
        <Link href="/dashboard" className="flex items-center group">
          <div className="h-12 w-auto flex items-center transition-transform duration-300 group-hover:scale-105">
            <img src="/web_logo.png" alt="NeuroCare Logo" className="h-full w-auto object-contain" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight ml-1">
            NeuroCare <span className="text-gradient-accent">AI</span>
          </h1>
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isDisabled = item.locked && item.href === '/results';
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={item.href === '/results' ? handleResultsClick : undefined}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                } ${isDisabled ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* User Section & Logout */}
        <div className="flex items-center gap-6">
          {user && (
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-white tracking-tight leading-none mb-1">
                {user.name}
              </p>
              <div className="flex items-center justify-end gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                  ID: #{user.id.toUpperCase()}
                </p>
              </div>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="group text-white/40 hover:text-destructive hover:bg-destructive/10 gap-2 h-10 px-4 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Logout</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden border-t border-white/5 bg-background/40 overflow-x-auto px-4 py-3 flex gap-2 no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isDisabled = item.locked && item.href === '/results';
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={item.href === '/results' ? handleResultsClick : undefined}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-white/40 bg-white/5'
              } ${isDisabled ? 'opacity-40 grayscale' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Results Lock Alert */}
      {showResultsLock && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="glass-card px-6 py-4 rounded-2xl border-primary/30 flex items-center gap-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Assessments Incomplete</p>
              <p className="text-xs text-white/40">Finish all tests to generate your report.</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
