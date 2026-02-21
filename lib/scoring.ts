// Scoring algorithms for NeuroCare AI

export interface CognitiveTestDetails {
  wordRecallAccuracy: number;
  wordRecallDelay: number;
  patternAccuracy: number;
  patternTime: number; // in ms
  reactionTime: number; // in ms
  reactionVariability: number; // in ms
  finalRecallAccuracy: number;
}

export interface SpeechTestDetails {
  transcript: string;
  wpm: number;
  pauseFrequency: number;
  silenceDetected: boolean;
  fillerWords: number;
  fluencyScore: number;
  wordMatchAccuracy?: number;
}

export interface BehaviorTestDetails {
  tapScore: number;
  targetScore: number;
  typingScore: number;
}

/**
 * Calculate cognitive score from game results (0-100)
 * Medically focused on memory recall and processing speed
 */
export function calculateCognitiveScore(details: CognitiveTestDetails): number {
  // 1. Memory Score (Weight: 50%)
  // Combines initial and delayed recall
  const memoryScore = (details.wordRecallAccuracy * 0.4) + (details.finalRecallAccuracy * 0.6);

  // 2. Pattern/Spatial Score (Weight: 25%)
  // Penalty for time taken (assuming avg 2s per tile is normal = 8s for 4 tiles)
  // details.patternTime is total time for all rounds.
  // Let's normalize: accuracy is already a good indicator.
  const patternScore = details.patternAccuracy;

  // 3. Processing Speed Score (Weight: 25%)
  // Normal reaction time: 200ms - 400ms
  // Over 1000ms is a heavy penalty
  const reactionScore = Math.max(0, 100 - ((details.reactionTime - 250) / 10));
  
  // Consistency penalty (Variability)
  const variabilityPenalty = Math.min(20, details.reactionVariability / 5);

  const finalScore = (memoryScore * 0.5) + (patternScore * 0.25) + ((reactionScore - variabilityPenalty) * 0.25);
  
  return Math.round(Math.min(100, Math.max(10, finalScore)));
}

/**
 * Calculate speech stability score (0-100)
 */
export function calculateSpeechScore(details: SpeechTestDetails): number {
  // If the API provided a stability score directly (from Gemini), we use it
  if (details.fluencyScore > 0) {
    return Math.round(details.fluencyScore);
  }

  let score = 80; // Base score

  if (details.silenceDetected) return 15;

  // WPM: Normal is 120-160
  const wpm = details.wpm;
  if (wpm < 90) score -= 20;
  else if (wpm < 110) score -= 10;
  else if (wpm > 200) score -= 15;

  // Filler words
  score -= Math.min(25, details.fillerWords * 3);

  // Pause frequency
  score -= Math.min(20, details.pauseFrequency * 40);

  return Math.round(Math.min(100, Math.max(10, score)));
}

/**
 * Calculate behavior stability score (0-100)
 */
export function calculateBehaviorScore(details: BehaviorTestDetails): number {
  // Balanced average of motor control components
  const score = (details.tapScore * 0.35) + (details.targetScore * 0.35) + (details.typingScore * 0.3);
  return Math.round(Math.min(100, Math.max(10, score)));
}

/**
 * Calculate Cognitive Stability Index from three test scores
 */
export function calculateCSI(
  cognitiveScore: number,
  speechScore: number,
  behaviorScore: number
): number {
  // Weights based on clinical relevance for early detection
  // Cognitive (Memory) is the strongest indicator (50%)
  // Speech (Fluency/Acoustics) is a very early secondary indicator (30%)
  // Behavior (Motor control) is a supporting indicator (20%)
  
  const csi = (cognitiveScore * 0.5) + (speechScore * 0.3) + (behaviorScore * 0.2);
  return Math.round(Math.min(100, Math.max(10, csi)));
}

/**
 * Get risk category based on CSI
 */
export function getRiskCategory(csi: number): 'Stable' | 'Mild' | 'Concerning' | 'High Risk' {
  if (csi >= 85) return 'Stable';
  if (csi >= 70) return 'Mild';
  if (csi >= 50) return 'Concerning';
  return 'High Risk';
}

/**
 * Get risk color for visualization
 */
export function getRiskColor(category: string): string {
  switch (category) {
    case 'Stable':
      return '#10b981'; // emerald-500
    case 'Mild':
      return '#3b82f6'; // blue-500
    case 'Concerning':
      return '#f59e0b'; // amber-500
    case 'High Risk':
      return '#ef4444'; // red-500
    default:
      return '#6b7280'; // gray-500
  }
}

/**
 * Find the weakest domain
 */
export function getWeakestDomain(
  cognitiveScore: number,
  speechScore: number,
  behaviorScore: number
): { domain: string; score: number } {
  const scores = [
    { domain: 'Memory & Recall', score: cognitiveScore },
    { domain: 'Speech & Linguistics', score: speechScore },
    { domain: 'Motor & Coordination', score: behaviorScore },
  ];

  return scores.reduce((weakest, current) => 
    current.score < weakest.score ? current : weakest
  );
}
