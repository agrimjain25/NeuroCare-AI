'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getUser, getLatestTestResult, logout } from '@/lib/storage';
import { 
  Brain, 
  Mic, 
  Activity, 
  Sparkles, 
  ArrowRight, 
  TrendingUp,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState({
    cognitive: { score: 0, completed: false },
    speech: { score: 0, completed: false },
    behavior: { score: 0, completed: false },
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // Get latest test results
    const cognitive = getLatestTestResult('cognitive');
    const speech = getLatestTestResult('speech');
    const behavior = getLatestTestResult('behavior');

    setTestResults({
      cognitive: { score: cognitive?.score || 0, completed: !!cognitive },
      speech: { score: speech?.score || 0, completed: !!speech },
      behavior: { score: behavior?.score || 0, completed: !!behavior },
    });

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-12 text-center rounded-3xl">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <Brain className="w-10 h-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-xl font-medium text-gradient">Initializing Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const allTestsComplete = testResults.cognitive.completed && 
                           testResults.speech.completed && 
                           testResults.behavior.completed;

  return (
    <div className="min-h-screen page-transition">
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* Welcome Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                  Welcome, {user?.name?.split(' ')[0] || 'Explorer'}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Your <span className="text-gradient-accent">Cognitive Journey</span> Starts Here.
              </h2>
              <p className="text-xl text-white/50 max-w-2xl leading-relaxed">
                Advanced AI-driven insights for proactive mental health monitoring and early detection.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="glass-card px-6 py-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-white/40 font-medium">System Status</p>
                  <p className="text-sm font-bold text-white uppercase tracking-wider">Optimal</p>
                </div>
              </div>
              <div className="glass-card px-6 py-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-white/40 font-medium">Last Assessed</p>
                  <p className="text-sm font-bold text-white uppercase tracking-wider">Today</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[60px]" />
            <div className="relative z-10 space-y-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-2 animate-float">
                <Sparkles className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-lg font-bold text-white">Daily Meditation</h3>
              <p className="text-sm text-white/50 px-4">Calm your mind before starting the assessment tests.</p>
              <Link href="/relax" className="block pt-2">
                <Button className="w-full btn-elegant gap-2">
                  Practice Mindfulness
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Assessment Grid */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <Brain className="w-6 h-6 text-primary" />
              Comprehensive Assessment
            </h3>
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-widest">
              AI Powered Analysis
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestCard 
              href="/cognitive-test"
              title="Cognitive Games"
              description="Memory, pattern recognition, and focus assessment."
              icon={<Brain className="w-6 h-6" />}
              status={testResults.cognitive}
              color="primary"
            />
            <TestCard 
              href="/speech-test"
              title="Speech Patterns"
              description="Acoustic and linguistic stability analysis."
              icon={<Mic className="w-6 h-6" />}
              status={testResults.speech}
              color="accent"
            />
            <TestCard 
              href="/behavior-analysis"
              title="Behavior Stability"
              description="Fine motor skills and behavioral consistency."
              icon={<TrendingUp className="w-6 h-6" />}
              status={testResults.behavior}
              color="secondary"
            />
          </div>
        </section>

        {/* Results Unlocked Section */}
        <section className="relative">
          <div className={`glass-card p-8 md:p-12 rounded-[2.5rem] overflow-hidden ${allTestsComplete ? 'border-secondary/30' : 'border-white/5'}`}>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16">
              <div className="flex-shrink-0 w-32 h-32 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center relative">
                {allTestsComplete ? (
                  <>
                    <ShieldCheck className="w-16 h-16 text-secondary animate-pulse" />
                    <div className="absolute inset-0 bg-secondary/10 blur-2xl animate-pulse" />
                  </>
                ) : (
                  <Activity className="w-16 h-16 text-white/20" />
                )}
              </div>

              <div className="flex-grow text-center md:text-left space-y-4">
                <h4 className="text-2xl md:text-3xl font-bold text-white">
                  {allTestsComplete ? 'Comprehensive Stability Index' : 'Complete All Assessments'}
                </h4>
                <p className="text-white/50 text-lg max-w-xl">
                  {allTestsComplete 
                    ? 'Your full cognitive report and AI-generated health trajectory are now available for review.'
                    : 'The comprehensive stability report will unlock once you complete all three specialized assessments.'}
                </p>
                <div className="pt-4">
                  {allTestsComplete ? (
                    <Link href="/results">
                      <Button className="btn-elegant px-10 h-14 text-lg">
                        View Detailed Results
                      </Button>
                    </Link>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-full max-w-sm mx-auto md:mx-0 bg-white/5 rounded-full h-3 overflow-hidden border border-white/10">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
                          style={{ width: `${(Object.values(testResults).filter(t => t.completed).length / 3) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        Assessment Progress: {Object.values(testResults).filter(t => t.completed).length}/3 Complete
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function TestCard({ href, title, description, icon, status, color }: any) {
  const colors: any = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    accent: 'text-accent bg-accent/10 border-accent/20',
    secondary: 'text-secondary bg-secondary/10 border-secondary/20',
  };

  return (
    <Link href={href} className="group">
      <div className={`glass-card p-8 h-full rounded-3xl relative overflow-hidden transition-all duration-300 group-hover:scale-[1.02] ${status.completed ? 'border-' + color + '/30' : ''}`}>
        <div className="relative z-10 space-y-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${colors[color]}`}>
            {icon}
          </div>
          
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-white group-hover:text-gradient transition-all">{title}</h4>
            <p className="text-white/40 text-sm leading-relaxed">{description}</p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            {status.completed ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">Score: {status.score}</span>
              </div>
            ) : (
              <span className="text-xs font-bold text-white/20 uppercase tracking-wider">Pending Test</span>
            )}
            <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white group-hover:translate-x-2 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  );
}
