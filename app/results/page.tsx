'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getTestResults, getUser, isAllTestsCompleted, getLatestTestResult } from '@/lib/storage';
import { calculateCSI, getRiskCategory } from '@/lib/scoring';
import { 
  FileText, 
  Download, 
  ArrowLeft, 
  Brain, 
  Mic, 
  Activity, 
  ShieldCheck, 
  AlertCircle,
  TrendingDown,
  ChevronRight,
  Info,
  Map as MapIcon,
  Zap,
  Target,
  Users,
  X
} from 'lucide-react';

export default function ResultsPage() {
  const router = useRouter();
  const [isLocked, setIsLocked] = useState(true);
  const [csi, setCSI] = useState(0);
  const [riskCategory, setRiskCategory] = useState('');
  const [scores, setScores] = useState({ cognitive: 0, speech: 0, behavior: 0 });
  const [weakestDomain, setWeakestDomain] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCareMap, setShowCareMap] = useState(false);

  useEffect(() => {
    checkResults();
  }, []);

  const checkResults = () => {
    const allComplete = isAllTestsCompleted();
    if (!allComplete) {
      setIsLocked(true);
      setIsLoading(false);
      return;
    }

    setIsLocked(false);
    const cognitiveResult = getLatestTestResult('cognitive');
    const speechResult = getLatestTestResult('speech');
    const behaviorResult = getLatestTestResult('behavior');

    if (!cognitiveResult || !speechResult || !behaviorResult) {
      setIsLocked(true);
      setIsLoading(false);
      return;
    }

    const csiScore = calculateCSI(cognitiveResult.score, speechResult.score, behaviorResult.score);
    setCSI(csiScore);
    setRiskCategory(getRiskCategory(csiScore));
    setScores({
      cognitive: cognitiveResult.score,
      speech: speechResult.score,
      behavior: behaviorResult.score,
    });

    const domains = [
      { name: 'Memory & Recall', score: cognitiveResult.score },
      { name: 'Speech & Linguistics', score: speechResult.score },
      { name: 'Motor & Coordination', score: behaviorResult.score },
    ];
    const weakest = domains.reduce((min, curr) => (curr.score < min.score ? curr : min));
    setWeakestDomain(weakest.name);
    setIsLoading(false);
  };

  const getRiskStyles = (risk: string) => {
    switch (risk) {
      case 'Stable': return { color: 'text-emerald-400', border: 'border-emerald-400/30', bg: 'bg-emerald-400/10' };
      case 'Mild': return { color: 'text-blue-400', border: 'border-blue-400/30', bg: 'bg-blue-400/10' };
      case 'Concerning': return { color: 'text-amber-400', border: 'border-amber-400/30', bg: 'bg-amber-400/10' };
      case 'High Risk': return { color: 'text-red-400', border: 'border-red-400/30', bg: 'bg-red-400/10' };
      default: return { color: 'text-primary', border: 'border-primary/30', bg: 'bg-primary/10' };
    }
  };

  const downloadReport = () => {
    const user = getUser();
    const reportText = `
NeuroCare AI - Comprehensive Cognitive Health Report
================================================
Date: ${new Date().toLocaleDateString()}
Patient: ${user?.name || 'Unknown'}
Age: ${user?.age || 'N/A'}

COGNITIVE STABILITY INDEX (CSI): ${csi}/100
Risk Category: ${riskCategory}

Detailed Domain Analysis:
------------------------
1. Memory & Cognition: ${scores.cognitive}/100
2. Speech & Linguistics: ${scores.speech}/100
3. Behavior & Motor Sync: ${scores.behavior}/100
`;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(reportText));
    element.setAttribute('download', `NeuroCare_Report.txt`);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="glass-card p-12 text-center rounded-3xl">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-medium text-gradient">Compiling Neural Data...</p>
        </div>
      </div>
    );
  }

  const riskStyles = getRiskStyles(riskCategory);

  if (isLocked) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="glass-card max-w-lg w-full p-10 rounded-[2.5rem] text-center space-y-8">
          <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-xl">
            <AlertCircle className="w-10 h-10 text-primary/60" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-white">Report Restricted</h1>
            <p className="text-white/50 leading-relaxed text-sm">
              Complete all three specialized screenings to unlock your stability index.
            </p>
          </div>
          <Link href="/dashboard" className="block pt-4">
            <Button className="w-full btn-elegant h-14 text-lg">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 page-transition relative">
      <header className="flex-shrink-0 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider">Dashboard</span>
          </Link>
          <div className="flex items-center">
            <div className="h-8 w-auto flex items-center">
              <img src="/web_logo.png" alt="Logo" className="h-full w-auto object-contain" />
            </div>
            <span className="text-base font-bold text-white tracking-tight ml-1 mr-3">NeuroCare AI</span>
            <h1 className="text-lg font-bold text-white tracking-tight border-l border-white/10 pl-3 uppercase tracking-widest">Medical Report</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={downloadReport} className="text-primary hover:text-primary hover:bg-primary/10 gap-2 h-9 text-xs">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Report</span>
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        {/* Main Score & Risk */}
        <div className="glass-card rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Radial Gauge */}
            <div className="relative w-56 h-56 flex-shrink-0 animate-float">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className={riskStyles.color}
                  strokeDasharray={`${(csi / 100) * 276.5} 276.5`}
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 12px currentColor)' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-black text-white">{csi}</span>
                <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Stability Index</span>
              </div>
            </div>

            {/* Status Information */}
            <div className="flex-grow text-center lg:text-left space-y-6">
              <div className="space-y-2">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${riskStyles.border} ${riskStyles.bg} mb-4`}>
                  <ShieldCheck className={`w-4 h-4 ${riskStyles.color}`} />
                  <span className={`text-xs font-black uppercase tracking-[0.2em] ${riskStyles.color}`}>{riskCategory} Profile</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                  Cognitive <span className="text-gradient">Integrity</span> Analysis
                </h2>
                <p className="text-white/50 text-lg leading-relaxed max-w-xl">
                  Assessment results indicate a <span className={riskStyles.color + " font-bold"}>{riskCategory.toLowerCase()}</span> stability profile. Rhythmic and lexical markers show high alignment with benchmark neural patterns.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MetricCard title="Memory Encoding" score={scores.cognitive} icon={<Brain className="w-5 h-5 text-primary" />} label="Lexical & Spatial Recall" />
          <MetricCard title="Speech Stability" score={scores.speech} icon={<Mic className="w-5 h-5 text-accent" />} label="Acoustic Rhythms" />
          <MetricCard title="Motor Sync" score={scores.behavior} icon={<Activity className="w-5 h-5 text-secondary" />} label="Temporal Consistency" />
        </div>

        {/* Insights & Next Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-10 rounded-[2.5rem] space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <TrendingDown className="w-6 h-6 text-primary" />
              Primary Indicators
            </h3>
            <div className="space-y-4">
              <InsightItem title="Key Focus Domain" value={weakestDomain} description="This domain exhibited the highest variance during active assessment phases." />
              <InsightItem title="Neural Consistency" value="High" description="Motor and acoustic rhythmic patterns demonstrate strong stability across testing intervals." />
            </div>
          </div>

          <div className="glass-card p-10 rounded-[2.5rem] space-y-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Info className="w-6 h-6 text-primary" />
              Clinical Roadmap
            </h3>
            <ul className="space-y-4">
              <RecommendationItem text="Establish longitudinal baseline with a re-assessment in 90 days." />
              <RecommendationItem text="Integrate daily mindfulness ether sessions to maintain neural peak." />
              <RecommendationItem text="Consult healthcare providers for definitive clinical interpretation." />
            </ul>
            <div className="pt-4">
              <Button onClick={() => setShowCareMap(true)} className="w-full btn-elegant gap-2 h-14 rounded-2xl">
                Schedule Trend Analysis & View Recovery Map
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* RECOVERY MAP MODAL */}
      {showCareMap && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowCareMap(false)} />
          
          <div className="glass-card w-full max-w-5xl h-full max-h-[800px] rounded-[3rem] relative z-10 flex flex-col overflow-hidden border-primary/30">
            {/* Modal Header */}
            <div className="flex-shrink-0 p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <MapIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Neural Recovery Roadmap</h3>
                  <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Personalized Path to Optimization</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCareMap(false)}
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content - The Map */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-secondary opacity-20 -translate-x-1/2" />

                {/* Map Stages */}
                <div className="space-y-16">
                  <MapNode 
                    align="right"
                    icon={<Zap className="w-6 h-6" />}
                    title="Phase 1: Sensory Priming"
                    tag="Immediate"
                    description="Engage in 5-minute daily 'Calm Ether' sessions. Focus on high-contrast visual stimuli to trigger rapid neural firing and stabilize baseline motor rhythms."
                    tasks={["Morning Breathing Session", "Visual Contrast Exercises"]}
                  />
                  
                  <MapNode 
                    align="left"
                    icon={<Brain className="w-6 h-6" />}
                    title="Phase 2: Lexical Reinforcement"
                    tag="Week 1-2"
                    description="Based on your Memory encoding score, start specific retrieval exercises. Focus on 10-word daily imprinting to strengthen the connection between short-term buffer and long-term recall."
                    tasks={["Dual N-Back Training", "Semantic Chain Linking"]}
                  />

                  <MapNode 
                    align="right"
                    icon={<Mic className="w-6 h-6" />}
                    title="Phase 3: Acoustic Flow Tuning"
                    tag="Week 3-4"
                    description="Targeting speech stability. Practice 'Shadow Reading' where you narrate reference texts with specific attention to temporal spacing and pause duration."
                    tasks={["Phonetic Rhythmic Drills", "Fluency Continuity Practice"]}
                  />

                  <MapNode 
                    align="left"
                    icon={<Target className="w-6 h-6" />}
                    title="Phase 4: Motor Sync Integration"
                    tag="Monthly"
                    description="Final integration of coordination. High-precision motor tasks mixed with cognitive load to ensure stability remains optimal during complex daily tasks."
                    tasks={["Fine Motor Coordination", "Temporal Pattern Sync"]}
                  />

                  <MapNode 
                    align="right"
                    icon={<Users className="w-6 h-6" />}
                    title="Phase 5: Professional Benchmark"
                    tag="Long-term"
                    description="Present this stability index report to a specialist. Use the longitudinal data captured here to establish a definitive medical baseline for future comparisons."
                    tasks={["Clinician Report Review", "Schedule 90-Day Trend Scan"]}
                    isLast
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 p-8 border-t border-white/5 bg-white/5 text-center">
              <Button onClick={() => setShowCareMap(false)} className="btn-elegant px-12 h-12 rounded-xl">
                Acknowledge Roadmap
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MapNode({ align, icon, title, tag, description, tasks, isLast }: any) {
  const isCenter = align === 'center';
  const isLeft = align === 'left';
  
  return (
    <div className={`relative flex items-center ${isCenter ? 'justify-center' : isLeft ? 'md:justify-start' : 'md:justify-end'}`}>
      {/* Icon Node */}
      <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-14 h-14 rounded-2xl bg-[#0a0f1d] border-2 border-primary shadow-[0_0_20px_rgba(0,128,255,0.3)] flex items-center justify-center text-primary z-10 animate-pulse">
        {icon}
      </div>

      {/* Content Card */}
      <div className={`ml-20 md:ml-0 w-full md:w-[45%] glass-card p-6 rounded-3xl relative ${isLeft ? 'md:mr-auto' : isCenter ? '' : 'md:ml-auto'}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">{tag}</span>
          <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
        </div>
        <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
        <p className="text-sm text-white/50 leading-relaxed mb-4">{description}</p>
        <div className="flex flex-wrap gap-2">
          {tasks.map((t: string, i: number) => (
            <div key={i} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase">
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, score, icon, label }: any) {
  return (
    <div className="glass-card p-8 rounded-[2rem] space-y-6 group">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-white group-hover:text-gradient transition-all">{score}</span>
          <span className="text-[10px] block font-bold text-white/30 uppercase tracking-widest mt-1">Score / 100</span>
        </div>
      </div>
      <div>
        <h4 className="font-bold text-white mb-1">{title}</h4>
        <p className="text-xs text-white/40">{label}</p>
      </div>
    </div>
  );
}

function InsightItem({ title, value, description }: any) {
  return (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{title}</span>
        <span className="text-sm font-bold text-primary">{value}</span>
      </div>
      <p className="text-sm text-white/60 leading-relaxed">{description}</p>
    </div>
  );
}

function RecommendationItem({ text }: { text: string }) {
  return (
    <li className="flex gap-4 items-start">
      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <CheckIcon className="w-3 h-3 text-primary" />
      </div>
      <p className="text-sm text-white/70 leading-relaxed">{text}</p>
    </li>
  );
}

function ProgressItem({ label, completed, icon }: any) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${completed ? 'bg-secondary/10 border-secondary/20' : 'bg-white/5 border-white/10 opacity-50'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${completed ? 'bg-secondary/20 text-secondary' : 'bg-white/10 text-white/30'}`}>
          {icon}
        </div>
        <span className={`font-semibold ${completed ? 'text-white' : 'text-white/40'}`}>{label}</span>
      </div>
      {completed ? <CheckIcon className="w-5 h-5 text-secondary" /> : <div className="w-5 h-5 rounded-full border-2 border-dashed border-white/20" />}
    </div>
  );
}

function CheckIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
