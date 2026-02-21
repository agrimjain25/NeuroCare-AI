'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TapRhythmTestProps {
  onComplete: (score: number) => void;
}

export default function TapRhythmTest({ onComplete }: TapRhythmTestProps) {
  const [stage, setStage] = useState<'ready' | 'testing' | 'complete'>('ready');
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(20);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (stage === 'testing' && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (stage === 'testing' && timeRemaining === 0) {
      completeTest();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [stage, timeRemaining]);

  const startTest = () => {
    setStage('testing');
    setTapTimes([]);
    setTimeRemaining(20);
  };

  const handleTap = () => {
    if (stage === 'testing') {
      setTapTimes(prev => [...prev, Date.now()]);
    }
  };

  const completeTest = () => {
    setStage('complete');
    const calculatedScore = calculateScore(tapTimes);
    setScore(calculatedScore);
  };

  const calculateScore = (times: number[]): number => {
    if (times.length < 3) return 10;

    // Calculate intervals between taps
    const intervals: number[] = [];
    for (let i = 1; i < times.length; i++) {
      intervals.push(times[i] - times[i - 1]);
    }

    // Calculate standard deviation of intervals
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    // Ideal interval is around 250ms
    const idealInterval = 250;
    const intervalDeviation = Math.abs(mean - idealInterval) / idealInterval * 100;

    // Consistency score (lower stdDev is better)
    const consistency = Math.max(0, 100 - (stdDev / 100) * 50);

    // Tap frequency score
    const tapFrequencyScore = Math.min(100, (times.length / 20) * 100);

    // Combine scores
    const score = (consistency * 0.6 + tapFrequencyScore * 0.4);

    return Math.max(10, Math.round(score));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {stage === 'ready' && (
        <div className="glass-card p-10 space-y-8 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl" />
          <div className="relative z-10 space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Rhythmic Stability</h3>
              <p className="text-white/40 text-sm">Measure your motor-pattern consistency over time.</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              <p className="text-white/70 font-medium leading-relaxed">
                Maintain a steady tapping rhythm for 20 seconds. Focus on consistency rather than speed.
              </p>
            </div>

            <Button
              onClick={startTest}
              className="w-full btn-elegant h-16 text-lg rounded-2xl"
            >
              Start Rhythmic Scan
            </Button>
          </div>
        </div>
      )}

      {stage === 'testing' && (
        <div className="glass-card p-10 space-y-10 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
            <div className="h-full bg-secondary transition-all duration-1000 ease-linear" style={{ width: `${(timeRemaining / 20) * 100}%` }} />
          </div>
          
          <div className="text-center relative z-10">
            <p className="text-6xl font-black text-white mb-2 tracking-tighter">{timeRemaining}</p>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Capture Window Active</p>
          </div>

          <button
            onMouseDown={handleTap}
            className="w-full h-48 rounded-[2.5rem] bg-white/5 border border-white/10 text-4xl font-black text-white hover:bg-white/10 active:bg-secondary/20 active:border-secondary/40 active:scale-[0.98] transition-all shadow-2xl group flex flex-col items-center justify-center gap-4"
          >
            <span className="group-active:text-secondary transition-colors">TAP</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/10 group-active:bg-secondary animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </button>

          <div className="text-center">
            <span className="text-xs font-bold text-white/20 uppercase tracking-widest">Impulses Captured: {tapTimes.length}</span>
          </div>
        </div>
      )}

      {stage === 'complete' && (
        <div className="glass-card p-10 space-y-10 rounded-[2.5rem]">
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full border border-secondary/30 bg-secondary/10 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Motor Rhythm Benchmarked</span>
            </div>
            <div className="flex items-end justify-center gap-2">
              <span className="text-7xl font-black text-white">{score}</span>
              <span className="text-xl font-bold text-white/20 mb-3">/ 100</span>
            </div>
            <p className="text-white/40 text-sm font-medium">Composite stability across temporal intervals</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1 text-center">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Total Impulses</p>
              <p className="text-2xl font-black text-white">{tapTimes.length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1 text-center">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Avg Interval</p>
              <p className="text-2xl font-black text-white">
                {tapTimes.length > 1
                  ? Math.round((tapTimes[tapTimes.length - 1] - tapTimes[0]) / (tapTimes.length - 1))
                  : 0}
                <span className="text-xs ml-1 text-white/20 font-bold">ms</span>
              </p>
            </div>
          </div>

          <Button
            onClick={() => onComplete(score)}
            className="w-full btn-elegant h-16 text-xl rounded-2xl"
          >
            Continue Assessment
          </Button>
        </div>
      )}
    </div>
  );
}
