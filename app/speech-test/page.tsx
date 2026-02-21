'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SpeechTest from '@/components/tests/SpeechTest';
import { Button } from '@/components/ui/button';
import { addTestResult, getUser } from '@/lib/storage';
import { Mic, ArrowLeft, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

export default function SpeechTestPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  const handleComplete = (finalScore: number, metrics: any) => {
    setScore(finalScore);
    addTestResult({
      id: `speech-${Date.now()}`,
      testType: 'speech',
      score: finalScore,
      details: metrics,
      completedAt: new Date().toISOString(),
    });
    setIsComplete(true);

    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pb-12 page-transition">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Exit Test</span>
          </Link>
          <div className="flex items-center">
            <div className="h-8 w-auto flex items-center">
              <img src="/web_logo.png" alt="Logo" className="h-full w-auto object-contain" />
            </div>
            <span className="text-base font-bold text-white tracking-tight ml-1 mr-3">NeuroCare AI</span>
            <h1 className="text-lg font-bold text-white tracking-tight border-l border-white/10 pl-3 uppercase tracking-widest">Speech Analysis</h1>
          </div>
          <div className="w-24 flex justify-end">
            <div className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent uppercase tracking-widest">
              Acoustic Link
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-10">
        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 min-h-[500px] flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/5 to-transparent pointer-events-none" />
          
          {!isComplete ? (
            <div className="space-y-8 relative z-10">
              <div className="space-y-3 text-center md:text-left">
                <h2 className="text-4xl font-extrabold text-white tracking-tight">
                  Vocal <span className="text-gradient-accent">Stability Scan</span>
                </h2>
                <p className="text-white/50 text-lg leading-relaxed">
                  Read the provided text clearly. Our AI will analyze your acoustic patterns, pause frequency, and linguistic flow.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-2">
                <SpeechTest onComplete={handleComplete} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <InfoItem icon={<Shield className="w-4 h-4" />} text="Encrypted Audio Processing" />
                <InfoItem icon={<Sparkles className="w-4 h-4" />} text="AI Pattern Recognition" />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md mx-auto text-center space-y-10 relative z-10 py-10">
              <div className="w-24 h-24 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center mx-auto animate-pulse">
                <CheckCircle2 className="w-12 h-12 text-secondary" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-4xl font-bold text-white tracking-tight">Analysis Logged</h3>
                <p className="text-white/50 text-lg">Speech patterns have been successfully benchmarked.</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] inline-block mx-auto min-w-[200px]">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Acoustic Score</p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl font-black text-white">{score}</span>
                  <span className="text-sm font-bold text-white/20 mb-2">/100</span>
                </div>
              </div>

              <p className="text-sm font-medium text-white/30 animate-pulse">
                Syncing with neural profile...
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function InfoItem({ icon, text }: any) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-sm">
      <div className="text-accent">{icon}</div>
      {text}
    </div>
  );
}
