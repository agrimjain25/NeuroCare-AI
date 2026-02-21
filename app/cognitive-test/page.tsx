'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import WordRecallGame from '@/components/tests/WordRecallGame';
import PatternRecallGame from '@/components/tests/PatternRecallGame';
import ReactionTimeGame from '@/components/tests/ReactionTimeGame';
import { Button } from '@/components/ui/button';
import { addTestResult, getUser } from '@/lib/storage';
import { calculateCognitiveScore } from '@/lib/scoring';
import { CognitiveTestDetails } from '@/lib/scoring';
import { Brain, ArrowLeft, Shield, Sparkles, CheckCircle2, Trophy } from 'lucide-react';

export default function CognitiveTestPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [gamePhase, setGamePhase] = useState<'intro' | 'word-recall' | 'pattern-recall' | 'reaction-time' | 'final-recall' | 'results'>('intro');
  const [testData, setTestData] = useState<Partial<CognitiveTestDetails>>({
    wordRecallAccuracy: 0,
    wordRecallDelay: 0,
    patternAccuracy: 0,
    patternTime: 0,
    reactionTime: 0,
    reactionVariability: 0,
    finalRecallAccuracy: 0,
  });
  const [finalRecallWords, setFinalRecallWords] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [score, setScore] = useState(0);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  // Progress bar
  const phases = ['word-recall', 'pattern-recall', 'reaction-time', 'final-recall'];
  const currentPhaseIndex = phases.indexOf(gamePhase as any);
  const progress = gamePhase === 'intro' ? 0 : ((currentPhaseIndex + 1) / phases.length) * 100;

  const handleWordRecallComplete = (accuracy: number, delay: number) => {
    setTestData((prev) => ({
      ...prev,
      wordRecallAccuracy: accuracy,
      wordRecallDelay: delay,
    }));
    setGamePhase('pattern-recall');
  };

  const handlePatternRecallComplete = (accuracy: number, time: number) => {
    setTestData((prev) => ({
      ...prev,
      patternAccuracy: accuracy,
      patternTime: time,
    }));
    setGamePhase('reaction-time');
  };

  const handleReactionTimeComplete = (avgTime: number, variability: number) => {
    setTestData((prev) => ({
      ...prev,
      reactionTime: avgTime,
      reactionVariability: variability,
    }));
    setGamePhase('final-recall');
  };

  const handleFinalRecallSubmit = () => {
    const trimmed = currentInput.trim();
    if (!trimmed) return;
    setFinalRecallWords([...finalRecallWords, trimmed]);
    setScore(score + 1);
    setCurrentInput('');
  };

  const handleFinalRecallComplete = () => {
    const finalAccuracy = (finalRecallWords.length / 5) * 100; // 5 original words
    const completeTestData: CognitiveTestDetails = {
      wordRecallAccuracy: testData.wordRecallAccuracy || 0,
      wordRecallDelay: testData.wordRecallDelay || 0,
      patternAccuracy: testData.patternAccuracy || 0,
      patternTime: testData.patternTime || 0,
      reactionTime: testData.reactionTime || 0,
      reactionVariability: testData.reactionVariability || 0,
      finalRecallAccuracy: finalAccuracy,
    };

    const cognitiveScore = calculateCognitiveScore(completeTestData);

    addTestResult({
      id: Date.now().toString(),
      testType: 'cognitive',
      score: cognitiveScore,
      details: completeTestData,
      completedAt: new Date().toISOString(),
    });

    setTestData(completeTestData);
    setGamePhase('results');
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
            <h1 className="text-lg font-bold text-white tracking-tight border-l border-white/10 pl-3 uppercase tracking-widest">Cognitive Assessment</h1>
          </div>
          <div className="w-24 flex justify-end">
            <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
              Live Session
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-10">
        {/* Progress System */}
        {gamePhase !== 'intro' && gamePhase !== 'results' && (
          <div className="mb-10 space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">Current Progress</p>
                <h2 className="text-xl font-bold text-white">
                  {gamePhase.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </h2>
              </div>
              <p className="text-sm font-bold text-primary">{Math.round(progress)}%</p>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 min-h-[500px] flex flex-col justify-center relative overflow-hidden group">
          {/* Enhanced Background Effects */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent opacity-50" />
            <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-accent/5 to-transparent opacity-30" />
            
            {/* Animated Scanning Grid Line */}
            {gamePhase === 'intro' && (
              <div className="absolute inset-0 overflow-hidden opacity-20">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-primary shadow-[0_0_15px_oklch(var(--primary))] animate-[scanning-sweep_3s_infinite]" />
                <div className="absolute inset-0" style={{ 
                  backgroundImage: 'radial-gradient(circle at 2px 2px, oklch(var(--primary) / 0.1) 1px, transparent 0)',
                  backgroundSize: '32px 32px' 
                }} />
              </div>
            )}
          </div>
          
          {gamePhase === 'intro' && (
            <div className="text-center space-y-8 relative z-10">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-2xl animate-float relative z-10">
                  <Brain className="w-12 h-12 text-primary" />
                </div>
                {/* Decorative pulses */}
                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl animate-pulse -z-10" />
                <div className="absolute -inset-4 bg-primary/5 rounded-[2.5rem] animate-[ping_3s_linear_infinite] -z-20 opacity-30" />
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-extrabold text-white tracking-tight">
                  Neural <span className="text-gradient">Memory Scan</span>
                </h2>
                <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
                  This 3-stage assessment measures your working memory, visual-spatial patterns, and neuro-motor reaction speed.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto pt-4">
                <IntroStep number="1" title="Recall" desc="Remember words" />
                <IntroStep number="2" title="Pattern" desc="Visual recall" />
                <IntroStep number="3" title="Reaction" desc="Speed & Focus" />
              </div>

              <div className="pt-6">
                <Button
                  onClick={() => setGamePhase('word-recall')}
                  className="btn-elegant h-16 px-12 text-lg rounded-2xl"
                >
                  Initiate Scan
                </Button>
              </div>
            </div>
          )}

          {gamePhase === 'word-recall' && (
            <div className="relative z-10">
              <WordRecallGame onComplete={handleWordRecallComplete} />
            </div>
          )}

          {gamePhase === 'pattern-recall' && (
            <div className="relative z-10">
              <PatternRecallGame onComplete={handlePatternRecallComplete} />
            </div>
          )}

          {gamePhase === 'reaction-time' && (
            <div className="relative z-10">
              <ReactionTimeGame onComplete={handleReactionTimeComplete} />
            </div>
          )}

          {gamePhase === 'final-recall' && (
            <div className="w-full max-w-lg mx-auto space-y-8 relative z-10 text-center">
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-white">Final Neural Recall</h3>
                <p className="text-white/50">List all the words you remember from the first stage.</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
                <div className="flex flex-wrap justify-center gap-2 min-h-[50px]">
                  {finalRecallWords.map((word, idx) => (
                    <div key={idx} className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3" />
                      {word}
                    </div>
                  ))}
                  {finalRecallWords.length === 0 && <p className="text-white/20 italic">No words added yet...</p>}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleFinalRecallSubmit();
                    }}
                    placeholder="Enter word..."
                    className="flex-1 h-14 px-6 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                    autoFocus
                  />
                  <Button
                    onClick={handleFinalRecallSubmit}
                    className="h-14 w-14 btn-elegant p-0 flex items-center justify-center rounded-xl"
                  >
                    <Trophy className="w-5 h-5" />
                  </Button>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleFinalRecallComplete}
                    className="w-full h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all font-bold"
                  >
                    Finish Assessment
                  </Button>
                </div>
              </div>
            </div>
          )}

          {gamePhase === 'results' && (
            <div className="w-full max-w-lg mx-auto text-center space-y-10 relative z-10">
              <div className="w-24 h-24 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center mx-auto animate-pulse">
                <Shield className="w-12 h-12 text-secondary" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-4xl font-bold text-white tracking-tight">Assessment Logged</h3>
                <p className="text-white/50 text-lg">Your cognitive stability data has been encrypted and saved.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ResultMiniCard label="Neural Score" value={Math.round(calculateCognitiveScore(testData as CognitiveTestDetails))} suffix="/100" />
                <ResultMiniCard label="Reaction" value={Math.round(testData.reactionTime || 0)} suffix="ms" />
              </div>

              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full btn-elegant h-16 text-lg rounded-2xl"
              >
                Return to Command Center
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function IntroStep({ number, title, desc }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1 group hover:bg-white/10 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-black text-xs mb-2">
        {number}
      </div>
      <p className="font-bold text-white text-sm">{title}</p>
      <p className="text-white/40 text-xs">{desc}</p>
    </div>
  );
}

function ResultMiniCard({ label, value, suffix }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] text-center">
      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">{label}</p>
      <div className="flex items-end justify-center gap-1">
        <span className="text-3xl font-black text-white">{value}</span>
        <span className="text-xs font-bold text-white/20 mb-1.5">{suffix}</span>
      </div>
    </div>
  );
}
