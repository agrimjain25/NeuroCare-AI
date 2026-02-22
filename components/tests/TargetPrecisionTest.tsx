'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TargetPrecisionTestProps {
  onComplete: (score: number) => void;
}

interface Target {
  x: number;
  y: number;
}

export default function TargetPrecisionTest({ onComplete }: TargetPrecisionTestProps) {
  const [stage, setStage] = useState<'ready' | 'testing' | 'complete'>('ready');
  const [target, setTarget] = useState<Target>({ x: 50, y: 50 });
  const [clicks, setClicks] = useState<{ distance: number; successful: boolean; timeTaken: number }[]>([]);
  const [targetCount, setTargetCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [lastTargetTime, setLastTargetTime] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);

  const TOTAL_TARGETS = 10;

  const startTest = () => {
    setStage('testing');
    setClicks([]);
    setTargetCount(0);
    const now = Date.now();
    setStartTime(now);
    setLastTargetTime(now);
    generateNewTarget();
  };

  const generateNewTarget = () => {
    const newX = Math.random() * 80 + 10; // 10-90%
    const newY = Math.random() * 60 + 20; // 20-80%
    setTarget({ x: newX, y: newY });
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (stage !== 'testing' || !containerRef.current || targetCount >= TOTAL_TARGETS) return;

    const now = Date.now();
    const timeForThisTarget = now - lastTargetTime;
    setLastTargetTime(now);

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Calculate distance from target center
    const distance = Math.sqrt(Math.pow(clickX - target.x, 2) + Math.pow(clickY - target.y, 2));

    // 5% radius is considered a hit
    const isSuccessful = distance < 5;

    const newClicks = [...clicks, { distance, successful: isSuccessful, timeTaken: timeForThisTarget }];
    setClicks(newClicks);
    
    const newCount = targetCount + 1;
    setTargetCount(newCount);

    if (newCount >= TOTAL_TARGETS) {
      completeTest(newClicks);
    } else {
      generateNewTarget();
    }
  };

  const completeTest = (finalClicks: any[]) => {
    setStage('complete');
    const calculatedScore = calculateScore(finalClicks);
    setScore(calculatedScore);
  };

  const calculateScore = (clickData: any[]): number => {
    if (clickData.length === 0) return 0;

    const successCount = clickData.filter(c => c.successful).length;
    const successRate = (successCount / clickData.length); // 0 to 1

    // Average distance from target (lower is better)
    // Distance is 0-100. A perfect hit is 0-5.
    const avgDistance = clickData.reduce((sum, c) => sum + c.distance, 0) / clickData.length;
    const distanceScore = Math.max(0, 1 - (avgDistance / 20)); // Normalized distance score

    // Speed score (assume 1 second per target is excellent)
    const avgTime = clickData.reduce((sum, c) => sum + c.timeTaken, 0) / clickData.length;
    const speedScore = Math.max(0, 1 - (avgTime / 3000)); // 0 to 1, perfect if < 1s, 0 if > 3s

    // Combine accuracy (50%), distance (30%), and speed (20%)
    const finalScore = (successRate * 50) + (distanceScore * 30) + (speedScore * 20);

    return Math.max(10, Math.min(100, Math.round(finalScore)));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {stage === 'ready' && (
        <div className="glass-card p-10 space-y-8 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl" />
          <div className="relative z-10 space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Target Precision</h3>
              <p className="text-white/40 text-sm">Measure your spatial coordination and click accuracy.</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              <p className="text-white/70 font-medium leading-relaxed">
                Click the 10 neural nodes as they appear. Both speed and accuracy are evaluated.
              </p>
            </div>

            <Button
              onClick={startTest}
              className="w-full btn-elegant h-16 text-lg rounded-2xl"
            >
              Start Precision Scan
            </Button>
          </div>
        </div>
      )}

      {stage === 'testing' && (
        <div className="glass-card p-10 space-y-8 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
            <div className="h-full bg-secondary transition-all duration-300 ease-out" style={{ width: `${(targetCount / TOTAL_TARGETS) * 100}%` }} />
          </div>

          <div className="flex justify-between items-end relative z-10">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Neural Nodes</p>
              <p className="text-4xl font-black text-white tracking-tighter">{targetCount + 1} <span className="text-lg text-white/20">/ {TOTAL_TARGETS}</span></p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Accuracy</p>
              <p className="text-xl font-bold text-secondary">
                {targetCount > 0 ? Math.round((clicks.filter(c => c.successful).length / targetCount) * 100) : 100}%
              </p>
            </div>
          </div>

          <div
            ref={containerRef}
            onClick={handleContainerClick}
            className="relative w-full aspect-video bg-white/5 border border-white/10 rounded-[2rem] cursor-crosshair overflow-hidden shadow-inner"
          >
            {/* Ambient grid */}
            <div className="absolute inset-0 opacity-10" style={{ 
              backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />

            {/* Target node */}
            <div
              className="absolute w-14 h-14 transition-all duration-200 transform -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
              }}
            >
              <div className="absolute inset-0 bg-secondary/20 rounded-full animate-ping" />
              <div className="absolute inset-0 bg-secondary border-2 border-white/50 rounded-full shadow-[0_0_20px_oklch(var(--secondary-lch))] flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>
      )}

      {stage === 'complete' && (
        <div className="glass-card p-10 space-y-10 rounded-[2.5rem]">
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full border border-secondary/30 bg-secondary/10 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Coordination Benchmarked</span>
            </div>
            <div className="flex items-end justify-center gap-2">
              <span className="text-7xl font-black text-white">{score}</span>
              <span className="text-xl font-bold text-white/20 mb-3">/ 100</span>
            </div>
            <p className="text-white/40 text-sm font-medium">Composite spatial precision and latency</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1 text-center">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Accuracy</p>
              <p className="text-2xl font-black text-white">
                {clicks.length > 0
                  ? Math.round((clicks.filter(c => c.successful).length / clicks.length) * 100)
                  : 0}%
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1 text-center">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Impulses</p>
              <p className="text-2xl font-black text-white">{clicks.length}</p>
            </div>
          </div>

          <Button
            onClick={() => onComplete(score)}
            className="w-full btn-elegant h-16 text-xl rounded-2xl"
          >
            Finalize Coordination Profile
          </Button>
        </div>
      )}
    </div>
  );
}
