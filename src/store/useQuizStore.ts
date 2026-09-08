import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Question,
  QuizRoundState,
  RegionId,
  UserProfile,
  LeaderboardEntry,
} from '../types';
import { STARTER_QUESTIONS } from '../data/questions';
import { BADGES } from '../data/badges';
import { soundEngine } from '../lib/audio';
import { submitScoreToFirestore } from '../lib/firebase';

interface QuizStore {
  // User profile & stats
  user: UserProfile;
  soundMuted: boolean;
  localLeaderboard: LeaderboardEntry[];
  newUnlockedBadgeId: string | null;

  // Active quiz session
  activeRound: QuizRoundState | null;

  // Store actions
  startRound: (regionId: RegionId, mode?: 'standard' | 'daily') => void;
  submitAnswer: (answer: string) => void;
  nextQuestion: () => void;
  quitRound: () => void;
  toggleSound: () => void;
  setDisplayName: (name: string) => void;
  clearNewBadge: () => void;
  resetProgress: () => void;
  addLocalScore: (entry: Omit<LeaderboardEntry, 'id'>) => void;
}

const INITIAL_PROFILE: UserProfile = {
  uid: 'player_' + Math.random().toString(36).substring(2, 9),
  displayName: 'Safari Explorer',
  isAnonymous: true,
  totalQuizzesPlayed: 0,
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  highestScore: 0,
  highestStreak: 0,
  unlockedRegions: ['south-luangwa', 'all-zambia'],
  unlockedBadges: [],
};

// Seeded pseudorandom shuffle for deterministic Daily Challenges
function getDailySeedNumber(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function pseudoRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      user: INITIAL_PROFILE,
      soundMuted: soundEngine.getMuted(),
      localLeaderboard: [
        {
          id: 'mock-1',
          userId: 'local-ranger',
          displayName: 'Banda the Ranger',
          score: 1850,
          accuracy: 100,
          region: 'south-luangwa',
          date: 'Yesterday',
        },
        {
          id: 'mock-2',
          userId: 'local-scout',
          displayName: 'Mfuwe Guide',
          score: 1620,
          accuracy: 90,
          region: 'all-zambia',
          date: '2 days ago',
        },
        {
          id: 'mock-3',
          userId: 'local-busanga',
          displayName: 'Busanga Tracker',
          score: 1480,
          accuracy: 85,
          region: 'kafue',
          date: '3 days ago',
        },
      ],
      newUnlockedBadgeId: null,
      activeRound: null,

      toggleSound: () => {
        const nextState = !get().soundMuted;
        soundEngine.setMuted(nextState);
        set({ soundMuted: nextState });
      },

      setDisplayName: (name: string) => {
        const trimmed = name.trim().slice(0, 30);
        if (!trimmed) return;
        set((state) => ({
          user: { ...state.user, displayName: trimmed },
        }));
      },

      clearNewBadge: () => set({ newUnlockedBadgeId: null }),

      startRound: (regionId: RegionId, mode = 'standard') => {
        let pool = [...STARTER_QUESTIONS];
        if (regionId !== 'all-zambia') {
          pool = pool.filter((q) => q.region === regionId);
          // If a specific region has fewer than 10, pad with national all-zambia questions
          if (pool.length < 10) {
            const nationalQuestions = STARTER_QUESTIONS.filter((q) => q.region === 'all-zambia');
            pool = [...pool, ...nationalQuestions];
          }
        }

        let selectedQuestions: Question[] = [];

        if (mode === 'daily') {
          // Deterministic selection for all players globally on this calendar day
          let seed = getDailySeedNumber();
          const shuffled = [...STARTER_QUESTIONS].sort(() => {
            const r = pseudoRandom(seed);
            seed++;
            return r - 0.5;
          });
          selectedQuestions = shuffled.slice(0, 10);
        } else {
          // Standard random round
          const shuffled = pool.sort(() => 0.5 - Math.random());
          selectedQuestions = shuffled.slice(0, 10);
        }

        set({
          activeRound: {
            questions: selectedQuestions,
            currentIndex: 0,
            selectedAnswer: null,
            isAnswered: false,
            isCorrect: null,
            score: 0,
            streak: 0,
            maxStreak: 0,
            timeRemaining: 15,
            totalTimeTaken: 0,
            questionStartTime: Date.now(),
            answersSummary: [],
            isComplete: false,
            mode,
            regionId,
          },
        });
      },

      submitAnswer: (answer: string) => {
        const { activeRound, user } = get();
        if (!activeRound || activeRound.isAnswered) return;

        const currentQ = activeRound.questions[activeRound.currentIndex];
        const isCorrect = answer === currentQ.correctAnswer;
        const timeSpent = Math.max(1, Math.round((Date.now() - activeRound.questionStartTime) / 1000));
        const timeRemaining = Math.max(0, 15 - timeSpent);

        // Sound effect
        if (isCorrect) {
          soundEngine.playCorrect();
        } else {
          soundEngine.playWrong();
        }

        // Scoring algorithm:
        // Base points: 100
        // Speed bonus: up to 100 (10 points per second remaining)
        // Streak multiplier: 1x, 1.1x, 1.2x... capped at 2.0x
        let pointsEarned = 0;
        let newStreak = isCorrect ? activeRound.streak + 1 : 0;
        const newMaxStreak = Math.max(activeRound.maxStreak, newStreak);

        if (isCorrect) {
          const streakMultiplier = 1 + Math.min(newStreak, 10) * 0.1;
          const speedBonus = timeRemaining * 8;
          pointsEarned = Math.round((100 + speedBonus) * streakMultiplier);

          if (newStreak >= 3) {
            setTimeout(() => soundEngine.playStreak(newStreak), 250);
          }
        }

        const updatedAnswers = [
          ...activeRound.answersSummary,
          {
            questionId: currentQ.id,
            isCorrect,
            timeSpentSeconds: timeSpent,
            pointsEarned,
          },
        ];

        // Check badge unlocks
        const currentBadges = new Set(user.unlockedBadges);
        let newlyUnlockedBadge: string | null = null;

        // Check streak badge
        if (newStreak >= 8 && !currentBadges.has('streak-master')) {
          currentBadges.add('streak-master');
          newlyUnlockedBadge = 'streak-master';
        }

        // Check fast answer badge
        const rapidCorrect = updatedAnswers.filter((a) => a.isCorrect && a.timeSpentSeconds <= 6).length;
        if (rapidCorrect >= 5 && !currentBadges.has('speed-tracker')) {
          currentBadges.add('speed-tracker');
          newlyUnlockedBadge = 'speed-tracker';
        }

        set({
          newUnlockedBadgeId: newlyUnlockedBadge || get().newUnlockedBadgeId,
          user: {
            ...user,
            totalQuestionsAnswered: user.totalQuestionsAnswered + 1,
            totalCorrect: user.totalCorrect + (isCorrect ? 1 : 0),
            highestStreak: Math.max(user.highestStreak, newStreak),
            unlockedBadges: Array.from(currentBadges),
          },
          activeRound: {
            ...activeRound,
            selectedAnswer: answer,
            isAnswered: true,
            isCorrect,
            score: activeRound.score + pointsEarned,
            streak: newStreak,
            maxStreak: newMaxStreak,
            totalTimeTaken: activeRound.totalTimeTaken + timeSpent,
            answersSummary: updatedAnswers,
          },
        });
      },

      nextQuestion: () => {
        const { activeRound, user, addLocalScore } = get();
        if (!activeRound) return;

        const nextIndex = activeRound.currentIndex + 1;

        if (nextIndex >= activeRound.questions.length) {
          // Quiz complete!
          soundEngine.playFanfare();
          const totalCorrect = activeRound.answersSummary.filter((a) => a.isCorrect).length;
          const accuracy = Math.round((totalCorrect / activeRound.questions.length) * 100);

          // Evaluate round completion badges
          const currentBadges = new Set(user.unlockedBadges);
          const unlockedRegions = new Set(user.unlockedRegions);

          // First safari
          if (!currentBadges.has('first-safari')) {
            currentBadges.add('first-safari');
          }

          // Daily scout
          if (activeRound.mode === 'daily' && !currentBadges.has('daily-scout')) {
            currentBadges.add('daily-scout');
          }

          // Region specific badges
          if (activeRound.regionId === 'south-luangwa' && accuracy >= 80) {
            currentBadges.add('thornicroft-giraffe');
          }
          if (activeRound.regionId === 'kafue') {
            currentBadges.add('busanga-lion');
          }
          if (activeRound.regionId === 'lower-zambezi' && activeRound.score >= 1000) {
            currentBadges.add('zambezi-nyami-nyami');
          }
          if (activeRound.regionId === 'all-zambia' && activeRound.score >= 2500) {
            currentBadges.add('luangwa-legend');
          }

          // Unlock next parks
          unlockedRegions.add('south-luangwa');
          unlockedRegions.add('kafue');
          unlockedRegions.add('lower-zambezi');
          unlockedRegions.add('victoria-falls');

          // Save score to local leaderboard
          addLocalScore({
            userId: user.uid,
            displayName: user.displayName,
            score: activeRound.score,
            accuracy,
            region: activeRound.regionId,
            date: 'Today',
            isDaily: activeRound.mode === 'daily',
          });

          // Submit to Firestore if online
          submitScoreToFirestore({
            userId: user.uid,
            displayName: user.displayName,
            score: activeRound.score,
            accuracy,
            region: activeRound.regionId,
            isDaily: activeRound.mode === 'daily',
          }).catch((e) => {
            console.warn('Silent local score fallback active:', e);
          });

          const todayDateStr = new Date().toISOString().split('T')[0];

          set({
            user: {
              ...user,
              totalQuizzesPlayed: user.totalQuizzesPlayed + 1,
              highestScore: Math.max(user.highestScore, activeRound.score),
              unlockedBadges: Array.from(currentBadges),
              unlockedRegions: Array.from(unlockedRegions),
              lastDailyCompletedDate:
                activeRound.mode === 'daily' ? todayDateStr : user.lastDailyCompletedDate,
            },
            activeRound: {
              ...activeRound,
              isComplete: true,
            },
          });
        } else {
          set({
            activeRound: {
              ...activeRound,
              currentIndex: nextIndex,
              selectedAnswer: null,
              isAnswered: false,
              isCorrect: null,
              timeRemaining: 15,
              questionStartTime: Date.now(),
            },
          });
        }
      },

      quitRound: () => {
        set({ activeRound: null });
      },

      addLocalScore: (entry) => {
        const newEntry: LeaderboardEntry = {
          ...entry,
          id: 'score_' + Date.now(),
        };
        set((state) => {
          const updated = [newEntry, ...state.localLeaderboard]
            .sort((a, b) => b.score - a.score)
            .slice(0, 30);
          return { localLeaderboard: updated };
        });
      },

      resetProgress: () => {
        localStorage.removeItem('luangwa_safari_store');
        set({
          user: {
            ...INITIAL_PROFILE,
            uid: 'player_' + Math.random().toString(36).substring(2, 9),
          },
          activeRound: null,
          newUnlockedBadgeId: null,
        });
      },
    }),
    {
      name: 'luangwa_safari_store',
      partialize: (state) => ({
        user: state.user,
        localLeaderboard: state.localLeaderboard,
        soundMuted: state.soundMuted,
      }),
    }
  )
);
