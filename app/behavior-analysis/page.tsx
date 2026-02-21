'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TapRhythmTest from '@/components/tests/TapRhythmTest';
import TargetPrecisionTest from '@/components/tests/TargetPrecisionTest';
import TypingRhythmTest from '@/components/tests/TypingRhythmTest';
import { Button } from '@/components/ui/button';
import { addTestResult, getUser } from '@/lib/storage';
import { calculateBehaviorScore } from '@/lib/scoring';
import { TrendingUp, ArrowLeft, Shield, Sparkles, CheckCircle2, Activity } from 'lucide-react';

type TestStage = 'tap' | 'target' | 'typing' | 'complete';

export default function BehaviorAnalysisPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentStage, setCurrentStage] = useState<TestStage>('tap');
  const [scores, setScores] = useState({ tap: 0, target: 0, typing: 0 });
  const [finalAvgScore, setFinalAvgScore] = useState(0);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  const handleTapComplete = (score: number) => {
    setScores(prev => ({ ...prev, tap: score }));
    setCurrentStage('target');
  };

  const handleTargetComplete = (score: number) => {
    setScores(prev => ({ ...prev, target: score }));
    setCurrentStage('typing');
  };

  const handleTypingComplete = (score: number) => {
    const behaviorScore = calculateBehaviorScore({
      tapScore: scores.tap,
      targetScore: scores.target,
      typingScore: score,
    });
    
    setFinalAvgScore(behaviorScore);
    
    addTestResult({
      id: `behavior-${Date.now()}`,
      testType: 'behavior',
      score: behaviorScore,
      details: {
        tap: scores.tap,
        target: scores.target,
        typing: score,
      },
      completedAt: new Date().toISOString(),
    });
    
    setCurrentStage('complete');
    
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  };

  const getStageTitle = () => {
    switch (currentStage) {
      case 'tap': return 'Tap Rhythm Stability';
      case 'target': return 'Target Precision';
      case 'typing': return 'Typing Rhythm';
      default: return 'Assessment Complete';
    }
  };

  const progressPercentage = {
    tap: 33,
    target: 66,
    typing: 99,
    complete: 100,
  }[currentStage];

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
            <h1 className="text-lg font-bold text-white tracking-tight border-l border-white/10 pl-3 uppercase tracking-widest">Behavior Analysis</h1>
          </div>
          <div className="w-24 flex justify-end">
            <div className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-[10px] font-bold text-secondary uppercase tracking-widest">
              Motor Sync
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-10">
        {/* Progress System */}
        {currentStage !== 'complete' && (
          <div className="mb-10 space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">Motor Assessment</p>
                <h2 className="text-xl font-bold text-white">{getStageTitle()}</h2>
              </div>
              <p className="text-sm font-bold text-secondary">{progressPercentage}%</p>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-secondary to-accent transition-all duration-700 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 min-h-[500px] flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/5 to-transparent pointer-events-none" />
          
          {currentStage === 'tap' && (
            <div className="space-y-6 relative z-10">
              <div className="space-y-3">
                <h3 className="text-3xl font-extrabold text-white">Rhythmic <span className="text-gradient">Stability</span></h3>
                <p className="text-white/50 text-lg leading-relaxed">Tap the screen rhythmically to measure your motor pattern consistency.</p>
              </div>
              <TapRhythmTest onComplete={handleTapComplete} />
            </div>
          )}

          {currentStage === 'target' && (
            <div className="space-y-6 relative z-10">
              <div className="space-y-3">
                <h3 className="text-3xl font-extrabold text-white">Target <span className="text-gradient">Precision</span></h3>
                <p className="text-white/50 text-lg leading-relaxed">Follow and click targets to measure spatial-motor coordination.</p>
              </div>
              <TargetPrecisionTest onComplete={handleTargetComplete} />
            </div>
          )}

          {currentStage === 'typing' && (
            <div className="space-y-6 relative z-10">
              <div className="space-y-3">
                <h3 className="text-3xl font-extrabold text-white">Typing <span className="text-gradient">Tempo</span></h3>
                <p className="text-white/50 text-lg leading-relaxed">Type the phrase to analyze your key-stroke timing and rhythmic flow.</p>
              </div>
              <TypingRhythmTest onComplete={handleTypingComplete} />
            </div>
          )}

          {currentStage === 'complete' && (
            <div className="w-full max-w-md mx-auto text-center space-y-10 relative z-10 py-10">
              <div className="w-24 h-24 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center mx-auto animate-pulse">
                <CheckCircle2 className="w-12 h-12 text-secondary" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-4xl font-bold text-white tracking-tight">Motor Sync Complete</h3>
                <p className="text-white/50 text-lg">Your behavioral stability profile has been encrypted and saved.</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] inline-block mx-auto min-w-[200px]">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Motor Score</p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl font-black text-white">{finalAvgScore}</span>
                  <span className="text-sm font-bold text-white/20 mb-2">/100</span>
                </div>
              </div>

              <p className="text-sm font-medium text-white/30 animate-pulse">
                Analyzing rhythmic consistency...
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
