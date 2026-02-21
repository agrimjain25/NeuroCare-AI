'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TypingRhythmTestProps {
  onComplete: (score: number) => void;
}

const TEST_SENTENCE = 'The quick brown fox jumps over the lazy dog';

export default function TypingRhythmTest({ onComplete }: TypingRhythmTestProps) {
  const [stage, setStage] = useState<'ready' | 'testing' | 'complete'>('ready');
  const [typed, setTyped] = useState('');
  const [keystrokeTimes, setKeystrokeTimes] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const startTest = () => {
    setStage('testing');
    setTyped('');
    setKeystrokeTimes([]);
    startTimeRef.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (stage !== 'testing') return;

    const currentText = (e.target as HTMLInputElement).value;
    setTyped(currentText);

    if (keystrokeTimes.length === 0) {
      setKeystrokeTimes([Date.now()]);
    } else {
      setKeystrokeTimes(prev => [...prev, Date.now()]);
    }

    // Check if test is complete
    if (currentText.length === TEST_SENTENCE.length) {
      completeTest();
    }
  };

  const completeTest = () => {
    setStage('complete');
    const calculatedScore = calculateScore(keystrokeTimes, typed);
    setScore(calculatedScore);
  };

  const calculateScore = (times: number[], userInput: string): number => {
    if (times.length < 3) return 10;

    // Calculate intervals between keystrokes
    const intervals: number[] = [];
    for (let i = 1; i < times.length; i++) {
      intervals.push(times[i] - times[i - 1]);
    }

    // Calculate standard deviation
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    // Consistency score
    const consistency = Math.max(0, 100 - (stdDev / 150) * 50);

    // Accuracy score
    let correctChars = 0;
    for (let i = 0; i < Math.min(userInput.length, TEST_SENTENCE.length); i++) {
      if (userInput[i] === TEST_SENTENCE[i]) correctChars++;
    }
    const accuracy = (correctChars / TEST_SENTENCE.length) * 100;

    // Speed score (words per minute)
    const totalTime = times[times.length - 1] - times[0];
    const wordsTyped = TEST_SENTENCE.split(' ').length;
    const wpm = (wordsTyped / (totalTime / 60000)) * 100; // Normalize for scale
    const speedScore = Math.min(100, Math.max(0, wpm / 5));

    // Combine scores
    const finalScore = (consistency * 0.4 + accuracy * 0.4 + speedScore * 0.2);

    return Math.max(10, Math.round(finalScore));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {stage === 'ready' && (
        <div className="glass-card p-10 space-y-8 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl" />
          <div className="relative z-10 space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Typing Tempo</h3>
              <p className="text-white/40 text-sm">Measure your cognitive-motor rhythmic consistency.</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-3">Reference String</p>
              <p className="text-xl font-bold text-white tracking-tight leading-relaxed">{TEST_SENTENCE}</p>
            </div>

            <Button
              onClick={startTest}
              className="w-full btn-elegant h-16 text-lg rounded-2xl"
            >
              Start Tempo Test
            </Button>
          </div>
        </div>
      )}

      {stage === 'testing' && (
        <div className="glass-card p-10 space-y-8 rounded-[2.5rem]">
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 h-1 bg-secondary transition-all duration-300" style={{ width: `${(typed.length / TEST_SENTENCE.length) * 100}%` }} />
              <p className="text-xl font-bold text-white/30 tracking-tight leading-relaxed select-none">
                {TEST_SENTENCE.split('').map((char, i) => (
                  <span key={i} className={i < typed.length ? (typed[i] === char ? 'text-secondary' : 'text-destructive') : ''}>
                    {char}
                  </span>
                ))}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end px-1">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Input Stream</p>
                <p className="text-xs font-bold text-white/20">{typed.length} / {TEST_SENTENCE.length}</p>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={typed}
                onChange={(e) => handleKeyPress(e as any)}
                className="w-full h-16 px-6 text-xl font-bold bg-white/5 border border-white/10 rounded-2xl text-white focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 outline-none transition-all"
                autoFocus
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      )}

      {stage === 'complete' && (
        <div className="glass-card p-10 space-y-10 rounded-[2.5rem]">
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full border border-secondary/30 bg-secondary/10 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Rhythmic Pattern Captured</span>
            </div>
            <div className="flex items-end justify-center gap-2">
              <span className="text-7xl font-black text-white">{score}</span>
              <span className="text-xl font-bold text-white/20 mb-3">/ 100</span>
            </div>
            <p className="text-white/40 text-sm font-medium">Composite tempo stability and accuracy</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Accuracy</p>
              <p className="text-2xl font-black text-white">
                {Math.round((typed.split('').filter((c, i) => c === TEST_SENTENCE[i]).length / TEST_SENTENCE.length) * 100)}%
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Consistency</p>
              <p className="text-2xl font-black text-white">High</p>
            </div>
          </div>

          <Button
            onClick={() => onComplete(score)}
            className="w-full btn-elegant h-16 text-xl rounded-2xl"
          >
            Finalize Behavior Profile
          </Button>
        </div>
      )}
    </div>
  );
}
