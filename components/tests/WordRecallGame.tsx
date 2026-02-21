'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2 } from 'lucide-react';

const WORDS = [
  'Apple', 'Mountain', 'Ocean', 'Garden', 'Piano',
  'River', 'Candle', 'Forest', 'Castle', 'Sunrise',
  'Guitar', 'Bridge', 'Cloud', 'Butterfly', 'Library',
];

interface WordRecallGameProps {
  onComplete: (accuracy: number, delay: number) => void;
}

export default function WordRecallGame({ onComplete }: WordRecallGameProps) {
  const [phase, setPhase] = useState<'showing' | 'waiting' | 'recalling'>('showing');
  const [displayWords, setDisplayWords] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [recalledWords, setRecalledWords] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [score, setScore] = useState(0);

  // Generate and show words
  useEffect(() => {
    const selected = WORDS.sort(() => Math.random() - 0.5).slice(0, 5);
    setDisplayWords(selected);
    setStartTime(Date.now());
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase('waiting');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRecallSubmit = () => {
    const trimmed = currentInput.trim();
    if (!trimmed) return;

    const delay = Date.now() - startTime;
    const isCorrect = displayWords.some(
      (word) => word.toLowerCase() === trimmed.toLowerCase()
    );

    if (isCorrect && !recalledWords.includes(trimmed)) {
      setRecalledWords([...recalledWords, trimmed]);
      setScore(score + 1);
    }

    setCurrentInput('');
  };

  const handleFinish = () => {
    const accuracy = (recalledWords.length / displayWords.length) * 100;
    const delay = Math.max(0, Date.now() - startTime - 10000);
    onComplete(accuracy, delay);
  };

  if (phase === 'showing') {
    return (
      <div className="w-full max-w-xl mx-auto space-y-8 animate-in fade-in duration-700">
        <div className="text-center space-y-2">
          <h3 className="text-3xl font-black text-white">Neural Imprinting</h3>
          <p className="text-white/40 text-sm">Commit these lexical patterns to memory.</p>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {displayWords.map((word, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 text-xl font-black text-white text-center shadow-xl backdrop-blur-sm animate-in zoom-in-95 duration-500"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {word}
              </div>
            ))}
          </div>

          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-[spin_10s_linear_infinite] relative">
              <span className="text-3xl font-black text-white absolute">{timeRemaining}</span>
            </div>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Capture Window</p>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'waiting') {
    return (
      <div className="w-full max-w-lg mx-auto text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto shadow-2xl animate-pulse">
          <span className="text-3xl">🧠</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-white">Capture Complete</h3>
          <p className="text-white/40 leading-relaxed px-10">Prepare to retrieve the imprinted word patterns from your working memory.</p>
        </div>
        <Button
          onClick={() => setPhase('recalling')}
          className="btn-elegant h-16 px-12 text-lg rounded-2xl"
        >
          Initialize Retrieval
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <h3 className="text-3xl font-black text-white">Pattern Retrieval</h3>
        <p className="text-white/40 text-sm">Input the words from the imprinting phase.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8">
        <div className="flex flex-wrap justify-center gap-2 min-h-[40px]">
          {recalledWords.map((word, idx) => (
            <div key={idx} className="bg-accent/20 text-accent border border-accent/30 px-4 py-2 rounded-xl font-bold text-sm">
              {word}
            </div>
          ))}
          {recalledWords.length === 0 && <p className="text-white/10 italic">Awaiting retrieval...</p>}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Manual Input</p>
            <p className="text-xs font-bold text-white/20">{score} / {displayWords.length}</p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleRecallSubmit();
              }}
              placeholder="Enter imprinted word..."
              className="flex-1 h-14 px-6 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 outline-none transition-all"
              autoFocus
            />
            <Button
              onClick={handleRecallSubmit}
              className="h-14 w-14 btn-elegant p-0 flex items-center justify-center rounded-xl"
            >
              <CheckCircle2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <Button
          onClick={handleFinish}
          className="w-full h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all font-bold"
        >
          Terminate retrieval
        </Button>
      </div>
    </div>
  );
}
