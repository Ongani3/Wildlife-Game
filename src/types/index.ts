export type RegionId = 'south-luangwa' | 'kafue' | 'lower-zambezi' | 'victoria-falls' | 'all-zambia';

export type QuestionType = 'multiple-choice' | 'true-false' | 'photo-id';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  region: RegionId;
  questionText: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  funFact: string;
  imageUrl?: string;
  difficulty: DifficultyLevel;
  category?: 'mammals' | 'birds' | 'conservation' | 'parks' | 'folklore';
}

export interface RegionInfo {
  id: RegionId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  highlightSpecies: string[];
  mapCoords: { x: number; y: number }; // percentage on stylized Zambia map
  color: string;
  areaKm2: string;
  established: string;
}

export interface SafariBadge {
  id: string;
  name: string;
  scientificName?: string;
  description: string;
  category: 'mammal' | 'bird' | 'park' | 'conservation' | 'master';
  unlockedAt?: string;
  iconName: string;
  unlockRequirement: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  score: number;
  accuracy: number;
  region: RegionId | string;
  date: string;
  isDaily?: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  isAnonymous: boolean;
  totalQuizzesPlayed: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  highestScore: number;
  highestStreak: number;
  unlockedRegions: RegionId[];
  unlockedBadges: string[];
  lastDailyCompletedDate?: string;
  completedPuzzles: string[];
}

export type PuzzleType = 'memory-match' | 'spot-difference';

export interface BasePuzzle {
  id: string;
  title: string;
  type: PuzzleType;
  difficulty: DifficultyLevel;
  parkRegion: RegionId;
  description: string;
  funFact: string;
  badgeRewardId?: string;
  bonusPoints: number;
}

export interface MemoryPair {
  id: string;
  animalName: string;
  scientificName?: string;
  imageUrl: string;
  funFactSnippet: string;
}

export interface MemoryMatchPuzzle extends BasePuzzle {
  type: 'memory-match';
  gridSize: '3x4' | '4x4';
  pairs: MemoryPair[];
}

export interface SpotDifferenceTarget {
  id: string;
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
  radiusPercent: number; // touch hit target radius
  hint: string;
  description: string;
}

export interface SpotDifferencePuzzle extends BasePuzzle {
  type: 'spot-difference';
  imageA: string; // Original image
  imageB: string; // Modified image with differences
  differences: SpotDifferenceTarget[];
}

export type Puzzle = MemoryMatchPuzzle | SpotDifferencePuzzle;

export interface QuizRoundState {
  questions: Question[];
  currentIndex: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  score: number;
  streak: number;
  maxStreak: number;
  timeRemaining: number;
  totalTimeTaken: number;
  questionStartTime: number;
  answersSummary: {
    questionId: string;
    isCorrect: boolean;
    timeSpentSeconds: number;
    pointsEarned: number;
  }[];
  isComplete: boolean;
  mode: 'standard' | 'daily';
  regionId: RegionId;
}
