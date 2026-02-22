'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Activity, FileText, Clock, Shield, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';
import { useMicrophone } from '@/hooks/use-microphone';

interface SpeechTestProps {
  onComplete: (score: number, metrics: any) => void;
}

export default function SpeechTest({ onComplete }: SpeechTestProps) {
  const [stage, setStage] = useState<'loading' | 'ready' | 'recording' | 'processing' | 'complete'>('loading');
  const [readingText, setReadingText] = useState('');
  const [readWords, setReadWords] = useState<Set<number>>(new Set());
  const [isRecording, setIsRecording] = useState(false);
  const [speechScore, setSpeechScore] = useState(0);
  const [metrics, setMetrics] = useState<any>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState({ wpm: 0, wordCount: 0 });
  
  const { 
    status: micStatus, 
    error: micError, 
    requestPermission: getMicPermission, 
    stopStream: stopMicStream,
    clearError: clearMicError
  } = useMicrophone();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);

  // Load reading text on mount
  useEffect(() => {
    loadReadingText();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch(e) {}
      stopMicStream();
    };
  }, [stopMicStream]);

  const loadReadingText = async () => {
    try {
      const res = await fetch('/api/generate-reading-text');
      const data = await res.json();
      setReadingText(data.text);
      setStage('ready');
    } catch (error) {
      console.error('Failed to load reading text:', error);
      setStage('ready');
    }
  };

  const startRecording = async () => {
    // 1. Request microphone permission after user gesture
    const stream = await getMicPermission();
    if (!stream) return;

    try {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        try {
          await handleRecordingComplete();
        } catch (err) {
          console.error("Recording stop critical error:", err);
          setStage('complete');
          setSpeechScore(0);
          setMetrics({ wordsPerMinute: 0, pauseFrequency: 0, fillerWords: 0, fluencyStability: 0, wordCount: 0 });
        }
      };

      // Real-time speech recognition for word highlighting and metrics
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const wordsInText = readingText.toLowerCase().split(/\s+/).map(w => w.replace(/[^\w]/g, ''));
          const latestIndex = event.resultIndex;
          const transcriptChunk = event.results[latestIndex][0].transcript.toLowerCase();
          const transcriptWords = transcriptChunk.split(/\s+/).filter(w => w.length > 0);
          
          setReadWords(prev => {
            const next = new Set(prev);
            let currentPos = 0;
            if (prev.size > 0) {
              currentPos = Math.max(...Array.from(prev)) + 1;
            }

            transcriptWords.forEach(tw => {
              const searchWindow = 5;
              for (let i = currentPos; i < Math.min(currentPos + searchWindow, wordsInText.length); i++) {
                const targetWord = wordsInText[i];
                if (tw === targetWord || (targetWord.length > 3 && tw.includes(targetWord))) {
                  next.add(i);
                  currentPos = i + 1;
                  break;
                }
              }
            });
            
            const durationSec = (Date.now() - recordingStartTimeRef.current) / 1000;
            const currentWPM = durationSec > 0 ? Math.round((next.size / durationSec) * 60) : 0;
            setRealTimeMetrics({
              wpm: currentWPM,
              wordCount: next.size
            });

            return next;
          });
        };
        
        recognition.start();
        recognitionRef.current = recognition;
      }

      mediaRecorder.start();
      recordingStartTimeRef.current = Date.now();
      setIsRecording(true);
      setStage('recording');
      setReadWords(new Set());
      setRealTimeMetrics({ wpm: 0, wordCount: 0 });
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch(e) {}
      setIsRecording(false);
      setStage('processing');
      stopMicStream();
    }
  }, [isRecording, stopMicStream]);

  const handleRecordingComplete = async () => {
    try {
      const recordingDuration = (Date.now() - recordingStartTimeRef.current) / 1000;
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('readingText', readingText);
      formData.append('spokenWordCount', readWords.size.toString());
      formData.append('recordingDuration', recordingDuration.toString());

      const response = await fetch('/api/speech-analysis', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok || !result.metrics) {
        setStage('complete');
      } else {
        setSpeechScore(result.score);
        setMetrics(result.metrics);
        setStage('complete');
      }
    } catch (error) {
      console.error('Error in speech analysis process:', error);
      setStage('complete');
    }
  };

  const handleComplete = () => {
    if (metrics) onComplete(speechScore, metrics);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-1000">
      {stage === 'loading' && (
        <div className="glass-card p-12 text-center rounded-3xl">
          <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Acoustic Handshake...</p>
        </div>
      )}

      {(stage === 'ready' || stage === 'recording' || stage === 'processing') && (
        <div className="space-y-8">
          {/* MicroPhone Error Handling UI */}
          {micStatus === 'error' && (
            <div className="glass-card p-6 border-destructive/30 bg-destructive/10 rounded-2xl animate-in zoom-in-95 duration-200">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-white">Microphone Error</h4>
                  <p className="text-sm text-white/70 leading-relaxed">{micError}</p>
                  
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button 
                      onClick={startRecording}
                      variant="outline" 
                      className="border-white/10 hover:bg-white/5 h-10 px-4 rounded-xl text-xs gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Try Again
                    </Button>
                    
                    <a 
                      href="https://support.google.com/chrome/answer/2693767?hl=en&co=GENIE.Platform%3DAndroid"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      Mobile Instructions
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="glass-card p-10 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl pointer-events-none" />
            
            <div className="flex flex-wrap gap-x-2 gap-y-1 relative z-10 select-none">
              {readingText.split(/\s+/).map((word, idx) => (
                <span
                  key={idx}
                  className={`text-2xl md:text-3xl font-bold tracking-tight transition-all duration-300 ${
                    readWords.has(idx) 
                      ? 'text-accent drop-shadow-[0_0_8px_oklch(var(--accent)/0.5)] scale-110' 
                      : 'text-white/20'
                  }`}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            {stage === 'ready' && (
              <Button
                onClick={startRecording}
                disabled={micStatus === 'requesting'}
                className="btn-elegant h-20 px-12 text-xl rounded-2xl group relative"
              >
                {micStatus === 'requesting' ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Accessing Mic...</span>
                  </div>
                ) : (
                  <>
                    <Mic className="w-6 h-6 mr-3 group-hover:scale-125 transition-transform" />
                    Initialize Audio Capture
                  </>
                )}
              </Button>
            )}

            {stage === 'recording' && (
              <div className="w-full flex flex-col items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1 h-8 items-center">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="w-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s`, height: `${30 + Math.random() * 70}%` }} />
                    ))}
                  </div>
                  <span className="text-accent font-black uppercase tracking-[0.2em] text-xs">Capturing...</span>
                </div>
                
                <div className="flex justify-center gap-8 w-full">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{realTimeMetrics.wpm}</p>
                    <p className="text-[10px] uppercase text-white/40 font-bold tracking-wider">Current WPM</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{realTimeMetrics.wordCount}</p>
                    <p className="text-[10px] uppercase text-white/40 font-bold tracking-wider">Words Spoken</p>
                  </div>
                </div>

                <Button
                  onClick={stopRecording}
                  className="w-full h-16 bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive/20 rounded-2xl font-bold text-lg"
                >
                  Terminate & Analyze
                </Button>
              </div>
            )}

            {stage === 'processing' && (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative">
                  <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-2xl animate-spin" />
                  <Activity className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <p className="text-white/40 font-black uppercase tracking-[0.2em] text-[10px]">Processing Neural Signals</p>
              </div>
            )}
          </div>
        </div>
      )}

      {stage === 'complete' && metrics && (
        <div className="glass-card p-10 rounded-[2.5rem] space-y-10">
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full border border-secondary/30 bg-secondary/10 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Acoustic Baseline Confirmed</span>
            </div>
            <div className="flex items-end justify-center gap-2">
              <span className="text-7xl font-black text-white">{speechScore}</span>
              <span className="text-xl font-bold text-white/20 mb-3">/ 100</span>
            </div>
            <p className="text-white/40 text-sm font-medium">Composite stability score across all vocal metrics</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MiniMetric label="Tempo (WPM)" value={metrics.wordsPerMinute} icon={<Activity className="w-4 h-4" />} />
            <MiniMetric label="Word Count" value={metrics.wordCount} icon={<FileText className="w-4 h-4" />} />
            <MiniMetric label="Pause Frequency" value={`${(metrics.pauseFrequency * 100).toFixed(0)}%`} icon={<Clock className="w-4 h-4" />} />
            <MiniMetric label="Fluency Index" value={`${Math.round(metrics.fluencyStability)}%`} icon={<Shield className="w-4 h-4" />} />
          </div>

          <Button
            onClick={handleComplete}
            className="w-full btn-elegant h-16 text-xl rounded-2xl"
          >
            Commit to Health Profile
          </Button>
        </div>
      )}
    </div>
  );
}

function MiniMetric({ label, value, icon }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3 group hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between">
        <div className="text-white/30 group-hover:text-primary transition-colors">{icon}</div>
        <span className="text-xl font-black text-white">{value}</span>
      </div>
      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{label}</p>
    </div>
  );
}
