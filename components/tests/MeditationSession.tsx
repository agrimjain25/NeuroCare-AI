'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface MeditationSessionProps {
  onComplete: () => void;
}

export default function MeditationSession({ onComplete }: MeditationSessionProps) {
  const [stage, setStage] = useState<'loading' | 'ready' | 'playing' | 'feedback' | 'complete'>('loading');
  const [storyTitle, setStoryTitle] = useState('');
  const [storyContent, setStoryContent] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCycle, setBreathingCycle] = useState(0);
  const [mood, setMood] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load meditation on mount
  useEffect(() => {
    loadMeditation();
  }, []);

  const loadMeditation = async () => {
    try {
      const res = await fetch('/api/generate-meditation');
      const data = await res.json();
      setStoryTitle(data.title);
      setStoryContent(data.content);
      setTimeRemaining(data.duration);
      setStage('ready');
    } catch (error) {
      console.error('Failed to load meditation:', error);
      setStage('ready');
    }
  };

  const startMeditation = () => {
    setStage('playing');
    setTimeRemaining(60); // 1 minute meditation for demo
    speakContent();
  };

  const speakContent = async () => {
    try {
      // Use Web Speech API for narration
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(storyContent);
        utterance.rate = 0.7; // Slower speech rate
        utterance.pitch = 0.9; // Slightly lower pitch
        utterance.volume = 0.8;
        
        window.speechSynthesis.speak(utterance);

        utterance.onend = () => {
          // After narration, show breathing animation
          setStage('playing');
        };
      }
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  };

  // Timer for meditation session
  useEffect(() => {
    if (stage === 'playing' && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (stage === 'playing' && timeRemaining === 0) {
      window.speechSynthesis.cancel();
      setStage('feedback');
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [stage, timeRemaining]);

  // Breathing animation cycle
  useEffect(() => {
    if (stage !== 'playing') return;

    const breathingTimer = setInterval(() => {
      setBreathingCycle(prev => (prev + 1) % 8);
      
      const cycle = breathingCycle % 8;
      if (cycle < 2) setBreathingPhase('inhale');
      else if (cycle < 4) setBreathingPhase('hold');
      else if (cycle < 6) setBreathingPhase('exhale');
      else setBreathingPhase('hold');
    }, 1000);

    return () => clearInterval(breathingTimer);
  }, [stage, breathingCycle]);

  const getBreathingSize = () => {
    switch (breathingPhase) {
      case 'inhale':
        return 'scale-100';
      case 'hold':
        return 'scale-110';
      case 'exhale':
        return 'scale-95';
      default:
        return 'scale-100';
    }
  };

  const handleMoodSelection = (selectedMood: string) => {
    setMood(selectedMood);
    setTimeout(() => {
      setStage('complete');
    }, 500);
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-1000">
      {stage === 'loading' && (
        <div className="glass-card p-12 text-center rounded-[2.5rem]">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
          <p className="text-xl font-medium text-gradient">Generating Mindfulness Ether...</p>
        </div>
      )}

      {stage === 'ready' && (
        <div className="glass-card p-10 space-y-8 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl" />
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-white mb-4">{storyTitle}</h3>
            <p className="text-lg leading-relaxed text-white/50 mb-8 italic">
              "{storyContent.substring(0, 150)}..."
            </p>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8">
              <p className="text-white/70 font-medium">
                Find a comfortable position. A calming narration will guide you through this session.
              </p>
            </div>
            <Button
              onClick={startMeditation}
              className="w-full btn-elegant h-16 text-xl rounded-2xl"
            >
              Begin Neural Calibration
            </Button>
          </div>
        </div>
      )}

      {stage === 'playing' && (
        <div className="glass-card p-10 space-y-10 rounded-[2.5rem] relative overflow-hidden">
          <div className="text-center relative z-10">
            <h3 className="text-2xl font-bold text-white mb-2">{storyTitle}</h3>
            <p className="text-white/40 uppercase tracking-[0.2em] text-[10px] font-black">Neural Stabilization in Progress</p>
          </div>

          <div className="flex justify-center relative h-48">
            {/* Breathing Circle */}
            <div className="relative z-10">
              <div
                className={`w-40 h-40 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 transition-transform duration-1000 ease-in-out border border-white/10 flex items-center justify-center ${getBreathingSize()}`}
              >
                <div className="absolute inset-0 rounded-full border border-secondary/20 animate-ping opacity-20" />
                <div className="text-center">
                  <span className="block text-[10px] font-black text-secondary uppercase tracking-widest mb-1">
                    {breathingPhase}
                  </span>
                  <span className="block text-4xl font-black text-white">{breathingCycle + 1}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-block px-6 py-2 rounded-full bg-white/5 border border-white/10">
              <span className="text-3xl font-black text-white">{timeRemaining}</span>
              <span className="text-white/20 ml-2 font-bold uppercase tracking-widest text-xs">Seconds</span>
            </div>
          </div>

          {/* Elegant audio visualization */}
          <div className="flex justify-center items-end gap-1.5 h-12">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-secondary/40 rounded-full"
                style={{
                  height: `${20 + Math.random() * 80}%`,
                  animation: `float ${1.5 + Math.random()}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {stage === 'feedback' && (
        <div className="glass-card p-10 space-y-8 rounded-[2.5rem]">
          <div className="text-center">
            <h3 className="text-2xl font-black text-white">State of Mind</h3>
            <p className="text-white/40 text-sm">How do you feel after this calibration?</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {['Calm', 'Peaceful', 'Refreshed', 'Relaxed'].map((m) => (
              <Button
                key={m}
                onClick={() => handleMoodSelection(m.toLowerCase())}
                variant="ghost"
                className={`h-24 rounded-2xl border border-white/5 transition-all text-lg font-bold ${
                  mood === m.toLowerCase()
                    ? 'bg-secondary/20 border-secondary/40 text-secondary'
                    : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                }`}
              >
                {m}
              </Button>
            ))}
          </div>
          
          {mood && (
            <Button
              onClick={handleComplete}
              className="w-full btn-elegant h-16 text-xl rounded-2xl"
            >
              Finish Session
            </Button>
          )}
        </div>
      )}

      {stage === 'complete' && (
        <div className="glass-card p-16 text-center space-y-8 rounded-[2.5rem]">
          <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-secondary" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-black text-white">Mindfulness Logged</p>
            <p className="text-white/50 text-lg">Your neural readiness is at peak levels.</p>
          </div>
          <Button
            onClick={handleComplete}
            className="w-full btn-elegant h-16 text-xl rounded-2xl"
          >
            Return to Assessment
          </Button>
        </div>
      )}

      <audio ref={audioRef} />
    </div>
  );
}
