'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface PatternRecallGameProps {
  onComplete: (accuracy: number, time: number) => void;
}

export default function PatternRecallGame({ onComplete }: PatternRecallGameProps) {
  const [phase, setPhase] = useState<'showing' | 'playing'>('showing');
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [round, setRound] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);

  const tiles = Array.from({ length: 16 }, (_, i) => i);
  const colors = ['bg-blue-400', 'bg-blue-500', 'bg-cyan-400', 'bg-cyan-500'];

  // Generate initial pattern
  useEffect(() => {
    const initialPattern = Array.from({ length: 4 }, () => Math.floor(Math.random() * 16));
    setPattern(initialPattern);
  }, []);

  // Show pattern animation
  const playPattern = async () => {
    setPhase('showing');
    setGameStarted(true);
    
    for (let i = 0; i < pattern.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const tile = pattern[i];
      setActiveTile(tile);
      await new Promise(resolve => setTimeout(resolve, 400));
      setActiveTile(null);
    }
    
    setPhase('playing');
    setStartTime(Date.now());
  };

  // Handle tile click
  const handleTileClick = (tileIndex: number) => {
    if (phase !== 'playing' || activeTile !== null) return;

    setActiveTile(tileIndex);
    setTimeout(() => setActiveTile(null), 300);

    const newUserPattern = [...userPattern, tileIndex];
    setUserPattern(newUserPattern);

    // Check if user is correct
    if (newUserPattern[newUserPattern.length - 1] !== pattern[newUserPattern.length - 1]) {
      // Wrong tile - game over
      const time = Date.now() - startTime;
      const accuracy = (userPattern.length / pattern.length) * 100;
      onComplete(Math.max(0, accuracy), time);
      return;
    }

    // Check if pattern is complete
    if (newUserPattern.length === pattern.length) {
      // Advance to next round
      setTimeout(() => {
        setUserPattern([]);
        setPattern([...pattern, Math.floor(Math.random() * 16)]);
        setRound(round + 1);
        setPhase('showing');
        playPattern();
      }, 1000);
    }
  };

  if (!gameStarted) {
    return (
      <div className="w-full max-w-xl mx-auto space-y-8 animate-in fade-in duration-700">
        <div className="text-center space-y-2">
          <h3 className="text-3xl font-black text-white">Spatial Encoding</h3>
          <p className="text-white/40 text-sm">Observe and replicate the neural-spatial patterns.</p>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl" />
          <p className="text-lg text-white/70 mb-8 leading-relaxed px-10">
            A sequence of tiles will illuminate. You must repeat the exact sequence after the scan completes.
          </p>
          
          <Button
            onClick={playPattern}
            className="btn-elegant h-16 px-12 text-lg rounded-2xl"
          >
            Start Spatial Scan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <h3 className="text-3xl font-black text-white">Pattern Replication</h3>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-black">
          Round {round} — {phase === 'showing' ? 'Encoding Stage' : 'Retrieval Stage'}
        </p>
      </div>

      {/* 4x4 Grid with Glass Tiles */}
      <div className="grid grid-cols-4 gap-4 p-6 rounded-[2rem] bg-white/5 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        {tiles.map((index) => {
          const isActive = activeTile === index;

          return (
            <button
              key={index}
              onClick={() => handleTileClick(index)}
              disabled={phase !== 'playing' || activeTile !== null}
              className={`aspect-square rounded-2xl transition-all duration-300 transform relative overflow-hidden ${
                isActive 
                  ? 'bg-secondary shadow-[0_0_25px_oklch(var(--secondary-lch))] scale-95 border-secondary' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              } ${phase === 'playing' ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            >
              {isActive && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
            </button>
          );
        })}
      </div>

      <div className="pt-4">
        {phase === 'playing' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-end px-1">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Retrieval Progress</p>
              <p className="text-xs font-bold text-secondary">{userPattern.length} / {pattern.length}</p>
            </div>
            <div className="w-full bg-white/5 border border-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-secondary h-full transition-all duration-500 shadow-[0_0_10px_oklch(var(--secondary-lch))]"
                style={{ width: `${(userPattern.length / pattern.length) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-bold text-white/20 animate-pulse uppercase tracking-[0.3em]">Watch Sequence...</p>
          </div>
        )}
      </div>
    </div>
  );
}
