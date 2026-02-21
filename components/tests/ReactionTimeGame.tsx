'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ReactionTimeGameProps {
  onComplete: (reactionTime: number, variability: number) => void;
}

const COLORS = ['bg-red-400', 'bg-green-400', 'bg-blue-400', 'bg-yellow-400'];
const COLOR_NAMES = ['Red', 'Green', 'Blue', 'Yellow'];

export default function ReactionTimeGame({ onComplete }: ReactionTimeGameProps) {
  const [phase, setPhase] = useState<'ready' | 'waiting' | 'active'>('ready');
  const [currentColor, setCurrentColor] = useState(0);
  const [colorChangeTime, setColorChangeTime] = useState(0);
  const [reactions, setReactions] = useState<number[]>([]);
  const [round, setRound] = useState(1);

  const changeColor = () => {
    if (reactions.length >= 5) {
      // Game complete
      const avgReaction = reactions.reduce((a, b) => a + b, 0) / reactions.length;
      const variance = reactions.reduce((sum, rt) => sum + Math.pow(rt - avgReaction, 2), 0) / reactions.length;
      const variability = Math.sqrt(variance);
      onComplete(avgReaction, variability);
      return;
    }

    setPhase('waiting');
    const randomDelay = 2000 + Math.random() * 3000;
    
    const timeout = setTimeout(() => {
      const newColor = Math.floor(Math.random() * COLORS.length);
      setCurrentColor(newColor);
      setColorChangeTime(Date.now());
      setPhase('active');
    }, randomDelay);

    return timeout;
  };

  const startRound = () => {
    setPhase('waiting');
    setRound(1);
    setReactions([]);
    changeColor();
  };

  const handleTap = () => {
    if (phase !== 'active') return;

    const reactionTime = Date.now() - colorChangeTime;
    setReactions([...reactions, reactionTime]);
    setRound(round + 1);
    
    if (reactions.length >= 4) {
      // One more round
      const avgReaction = [...reactions, reactionTime].reduce((a, b) => a + b, 0) / (reactions.length + 1);
      const allReactions = [...reactions, reactionTime];
      const variance = allReactions.reduce((sum, rt) => sum + Math.pow(rt - avgReaction, 2), 0) / allReactions.length;
      const variability = Math.sqrt(variance);
      onComplete(avgReaction, variability);
    } else {
      changeColor();
    }
  };

  if (phase === 'ready') {
    return (
      <div className="w-full max-w-xl mx-auto space-y-8 animate-in fade-in duration-700">
        <div className="text-center space-y-2">
          <h3 className="text-3xl font-black text-white">Neuro-Motor Latency</h3>
          <p className="text-white/40 text-sm">Measure your rapid neural-reflex response time.</p>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl" />
          <p className="text-lg text-white/70 mb-8 leading-relaxed px-10">
            A central node will initiate a state change. Trigger the sensor as rapidly as possible upon illumination.
          </p>
          
          <Button
            onClick={startRound}
            className="btn-elegant h-16 px-12 text-lg rounded-2xl"
          >
            Initiate Latency Test
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <h3 className="text-3xl font-black text-white">Reflex Capture</h3>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-black">
          Sequence {round} / 5 — {phase === 'waiting' ? 'Monitoring Baseline' : 'Trigger Active'}
        </p>
      </div>

      {/* Modern Reaction Node */}
      <div className="flex justify-center relative">
        <div className={`w-48 h-48 rounded-[3rem] transition-all duration-500 flex items-center justify-center border-4 ${
          phase === 'active' 
            ? 'bg-secondary border-secondary shadow-[0_0_50px_oklch(var(--secondary-lch))] scale-110' 
            : 'bg-white/5 border-white/10 opacity-20'
        }`}>
          {phase === 'active' && <div className="absolute inset-0 bg-white/20 animate-ping rounded-[3rem]" />}
          <span className={`text-[10px] font-black uppercase tracking-widest ${phase === 'active' ? 'text-white' : 'text-white/20'}`}>
            {phase === 'active' ? 'Trigger' : 'Awaiting'}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <Button
          onClick={handleTap}
          disabled={phase !== 'active'}
          className={`w-full h-24 text-2xl font-black rounded-[2rem] transition-all duration-300 ${
            phase === 'active'
              ? 'btn-elegant scale-105 shadow-2xl'
              : 'bg-white/5 border border-white/10 text-white/10 cursor-not-allowed'
          }`}
        >
          {phase === 'active' ? 'CAPTURE NOW' : 'Standby...'}
        </Button>

        {/* Real-time Results Stream */}
        {reactions.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 px-2">Latency Log (ms)</p>
            <div className="grid grid-cols-5 gap-3">
              {reactions.map((rt, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 py-3 rounded-xl text-center">
                  <p className="text-lg font-black text-primary">{rt}</p>
                </div>
              ))}
              {[...Array(5 - reactions.length)].map((_, i) => (
                <div key={i} className="bg-white/5 border border-white/5 py-3 rounded-xl text-center opacity-20">
                  <p className="text-lg font-black text-white">—</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
