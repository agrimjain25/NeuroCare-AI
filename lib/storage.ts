// Local Storage Management for NeuroCare AI

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  createdAt: string;
}

export interface TestResult {
  id: string;
  testType: 'cognitive' | 'speech' | 'behavior';
  score: number;
  details: Record<string, unknown>;
  completedAt: string;
}

export interface SessionData {
  user: UserProfile | null;
  testResults: TestResult[];
  csiHistory: Array<{ date: string; score: number }>;
  meditationSessions: number;
  testProgress: {
    cognitive: boolean;
    speech: boolean;
    behavior: boolean;
  };
}

const STORAGE_KEY = 'neurocare-session';

const defaultSession: SessionData = {
  user: null,
  testResults: [],
  csiHistory: [],
  meditationSessions: 0,
  testProgress: {
    cognitive: false,
    speech: false,
    behavior: false,
  },
};

export function getSession(): SessionData {
  if (typeof window === 'undefined') return defaultSession;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultSession;
  } catch (error) {
    console.error('Failed to load session:', error);
    return defaultSession;
  }
}

export function saveSession(session: SessionData): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

export function setUser(user: UserProfile): void {
  const session = getSession();
  session.user = user;
  saveSession(session);
}

export function getUser(): UserProfile | null {
  return getSession().user;
}

export function addTestResult(result: TestResult): void {
  const session = getSession();
  session.testResults.push(result);
  
  // Mark test as completed
  if (result.testType === 'cognitive') session.testProgress.cognitive = true;
  if (result.testType === 'speech') session.testProgress.speech = true;
  if (result.testType === 'behavior') session.testProgress.behavior = true;
  
  saveSession(session);
}

export function getTestResults(testType?: string): TestResult[] {
  const session = getSession();
  if (!testType) return session.testResults;
  return session.testResults.filter(r => r.testType === testType);
}

export function getLatestTestResult(testType: 'cognitive' | 'speech' | 'behavior'): TestResult | null {
  const results = getTestResults(testType);
  return results.length > 0 ? results[results.length - 1] : null;
}

export function isAllTestsCompleted(): boolean {
  const session = getSession();
  return (
    session.testProgress.cognitive &&
    session.testProgress.speech &&
    session.testProgress.behavior
  );
}

export function addCSIResult(score: number): void {
  const session = getSession();
  session.csiHistory.push({
    date: new Date().toISOString(),
    score,
  });
  saveSession(session);
}

export function getCSIHistory(): Array<{ date: string; score: number }> {
  return getSession().csiHistory;
}

export function incrementMeditationSessions(): void {
  const session = getSession();
  session.meditationSessions += 1;
  saveSession(session);
}

export function getMeditationSessionCount(): number {
  return getSession().meditationSessions;
}

export function resetTestProgress(): void {
  const session = getSession();
  session.testProgress = {
    cognitive: false,
    speech: false,
    behavior: false,
  };
  session.testResults = [];
  saveSession(session);
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
