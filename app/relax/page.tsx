'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MeditationSession from '@/components/tests/MeditationSession';
import { Button } from '@/components/ui/button';
import { incrementMeditationSessions, getUser } from '@/lib/storage';
import { Sparkles, ArrowLeft, Shield, CheckCircle2, Wind, Eye, Mic, Clock, Lock } from 'lucide-react';

export default function RelaxPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  // Implement the "Soft Lock" logic
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSessionActive) {
        e.preventDefault();
        e.returnValue = ''; // Standard browser refresh warning
      }
    };

    const handleVisibilityChange = () => {
      if (isSessionActive && document.hidden) {
        alert("⚠️ NEURAL SYNC INTERRUPTED: Please do not switch tabs during the 1-minute stabilization period. Your focus is required for accurate assessment.");
      }
    };

    if (isSessionActive) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // History lock to intercept Back button
      window.history.pushState(null, '', window.location.pathname);
      const handlePopState = () => {
        if (isSessionActive) {
          window.history.pushState(null, '', window.location.pathname);
          alert("🔒 NAVIGATION LOCKED: Please complete your 60-second mindfulness session before returning to the dashboard.");
        }
      };
      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isSessionActive]);

  const handleSessionComplete = () => {
    incrementMeditationSessions();
    setIsSessionActive(false);
    setIsComplete(true);

    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  };

  if (!user) return null;

  return (
    <div className={`min-h-screen pb-12 page-transition ${isSessionActive ? 'bg-[#0a0f1d]' : ''}`}>
      {/* Premium Header - Hidden during active session to lock navigation */}
      {!isSessionActive && (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <div className="flex items-center">
              <div className="h-8 w-auto flex items-center">
                <img src="/web_logo.png" alt="Logo" className="h-full w-auto object-contain" />
              </div>
              <span className="text-base font-bold text-white tracking-tight ml-1 mr-3">NeuroCare AI</span>
              <h1 className="text-lg font-bold text-white tracking-tight border-l border-white/10 pl-3 uppercase tracking-widest">Mindfulness Session</h1>
            </div>
            <div className="w-24 flex justify-end">
              <div className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-[10px] font-bold text-secondary uppercase tracking-widest">
                Calm Ether
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={`max-w-3xl mx-auto px-6 ${isSessionActive ? 'pt-24' : 'pt-10'}`}>
        <div className={`glass-card rounded-[2.5rem] p-8 md:p-12 min-h-[500px] flex flex-col justify-center relative overflow-hidden ${isSessionActive ? 'border-secondary/30 shadow-[0_0_50px_oklch(var(--secondary-lch)/0.1)]' : ''}`}>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/5 to-transparent pointer-events-none" />
          
          {!isSessionActive && !isComplete && (
            <div className="space-y-10 relative z-10 py-6">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-2xl animate-float">
                  <Wind className="w-10 h-10 text-secondary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-4xl font-extrabold text-white tracking-tight">
                    Relax & <span className="text-gradient-accent">Rebalance</span>
                  </h2>
                  <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
                    Prepare your mind for the cognitive assessments with a brief mindfulness exercise.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MeditationFeature icon={<Wind className="w-5 h-5" />} title="Guided Breathing" desc="Sync with the ether" />
                <MeditationFeature icon={<Eye className="w-5 h-5" />} title="Visual Focus" desc="Calming neural colors" />
                <MeditationFeature icon={<Mic className="w-5 h-5" />} title="Audio Narration" desc="AI voice guidance" />
                <MeditationFeature icon={<Lock className="w-5 h-5" />} title="Focus Lock" desc="Active for 60 seconds" />
              </div>

              <div className="pt-6">
                <Button
                  onClick={() => setIsSessionActive(true)}
                  className="w-full btn-elegant h-16 text-xl rounded-2xl"
                >
                  Begin Focused Stabilization
                </Button>
              </div>
            </div>
          )}

          {isSessionActive && (
            <div className="relative z-10">
              <div className="mb-8 text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary animate-pulse">
                  <Lock className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Neural Stability Lock Active</span>
                </div>
                <h2 className="text-3xl font-bold text-white">Focus & Breathe</h2>
                <p className="text-white/40 max-w-md mx-auto">Navigation is disabled. Please remain on this tab until the countdown completes.</p>
              </div>
              <MeditationSession onComplete={handleSessionComplete} />
            </div>
          )}
          {isComplete && (
            <div className="w-full max-w-md mx-auto text-center space-y-10 relative z-10 py-10">
              <div className="w-24 h-24 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center mx-auto animate-pulse">
                <CheckCircle2 className="w-12 h-12 text-secondary" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-4xl font-bold text-white tracking-tight">Mindfulness Complete</h3>
                <p className="text-white/50 text-lg leading-relaxed">
                  Your neural pathways are now primed for optimal assessment accuracy.
                </p>
              </div>

              <p className="text-sm font-medium text-white/30 animate-pulse">
                Unlocking navigation...
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function MeditationFeature({ icon, title, desc }: any) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
        {icon}
      </div>
      <div>
        <p className="font-bold text-white text-sm">{title}</p>
        <p className="text-white/40 text-[10px] uppercase tracking-wider">{desc}</p>
      </div>
    </div>
  );
}
