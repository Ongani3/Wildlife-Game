import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Question,
  QuizRoundState,
  RegionId,
  UserProfile,
  Puzzle,
} from '../types';
import { STARTER_QUESTIONS } from '../data/questions';
import { soundEngine } from '../lib/audio';
import {
  submitScoreToFirestore,
  saveCompletedPuzzleToFirestore,
  syncUserProfileToFirestore,
} from '../lib/firebase';

interface QuizStore {
  // User profile & stats
  user: UserProfile;
  soundMuted: boolean;
  newUnlockedBadgeId: string | null;

  // Active quiz session
  activeRound: QuizRoundState | null;

  // Puzzle system state
  activePuzzle: Puzzle | null;
  roundsSinceLastPuzzle: number;
  bonusPuzzleEligible: boolean;

  // Store actions
  startRound: (regionId: RegionId, mode?: 'standard' | 'daily') => void;
  submitAnswer: (answer: string) => void;
  nextQuestion: () => void;
  quitRound: () => void;
  toggleSound: () => void;
  setDisplayName: (name: string) => void;
  clearNewBadge: () => void;
  resetProgress: () => void;

  // Puzzle actions
  startPuzzle: (puzzle: Puzzle) => void;
  exitPuzzle: () => void;
  completePuzzle: (puzzle: Puzzle, movesOrTaps: number, timeTakenSeconds: number) => { newBadgeId: string | null };
  dismissBonusPuzzlePrompt: () => void;
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
  completedPuzzles: [],
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

// Fisher-Yates array shuffler
function shuffleArray<T>(items: T[], rng: () => number = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      user: INITIAL_PROFILE,
      soundMuted: soundEngine.getMuted(),
      newUnlockedBadgeId: null,
      activeRound: null,
      activePuzzle: null,
      roundsSinceLastPuzzle: 0,
      bonusPuzzleEligible: false,

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
          const picked = shuffled.slice(0, 10);

          // Deterministically randomize option placement for each question
          selectedQuestions = picked.map((q) => {
            if (q.type === 'true-false') {
              return { ...q, options: ['True', 'False'] };
            }
            const dailyRng = () => {
              const r = pseudoRandom(seed);
              seed++;
              return r;
            };
            return {
              ...q,
              options: shuffleArray(q.options, dailyRng),
            };
          });
        } else {
          // Standard random round
          const shuffled = pool.sort(() => 0.5 - Math.random());
          const picked = shuffled.slice(0, 10);

          // Randomize option placements so the correct answer distributes evenly across A, B, C, D
          selectedQuestions = picked.map((q) => {
            if (q.type === 'true-false') {
              return { ...q, options: ['True', 'False'] };
            }
            return {
              ...q,
              options: shuffleArray(q.options, Math.random),
            };
          });
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
            timeRemaining: 25,
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
        const timeRemaining = Math.max(0, 25 - timeSpent);

        // Sound effect
        if (isCorrect) {
          soundEngine.playCorrect();
        } else {
          soundEngine.playWrong();
        }

        // Scoring algorithm:
        // Base points: 100
        // Speed bonus: up to 125 (5 points per second remaining over 25s)
        // Streak multiplier: 1x, 1.1x, 1.2x... capped at 2.0x
        let pointsEarned = 0;
        let newStreak = isCorrect ? activeRound.streak + 1 : 0;
        const newMaxStreak = Math.max(activeRound.maxStreak, newStreak);

        if (isCorrect) {
          const streakMultiplier = 1 + Math.min(newStreak, 10) * 0.1;
          const speedBonus = timeRemaining * 5;
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
        const { activeRound, user } = get();
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

          // Submit directly to Firestore for the online global leaderboard
          submitScoreToFirestore({
            userId: user.uid,
            displayName: user.displayName,
            score: activeRound.score,
            accuracy,
            region: activeRound.regionId,
            isDaily: activeRound.mode === 'daily',
          }).catch((e) => {
            console.warn('Firestore score submission notice:', e);
          });

          const todayDateStr = new Date().toISOString().split('T')[0];
          const newRoundsCount = get().roundsSinceLastPuzzle + 1;
          const isEligibleForBonus = newRoundsCount >= 2;

          const updatedUser: UserProfile = {
            ...user,
            totalQuizzesPlayed: user.totalQuizzesPlayed + 1,
            highestScore: Math.max(user.highestScore, activeRound.score),
            unlockedBadges: Array.from(currentBadges),
            unlockedRegions: Array.from(unlockedRegions),
            lastDailyCompletedDate:
              activeRound.mode === 'daily' ? todayDateStr : user.lastDailyCompletedDate,
          };

          // Sync user stats to Firestore
          syncUserProfileToFirestore(updatedUser).catch((e) => {
            console.warn('Firestore profile sync notice:', e);
          });

          set({
            user: updatedUser,
            roundsSinceLastPuzzle: newRoundsCount,
            bonusPuzzleEligible: isEligibleForBonus,
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
              timeRemaining: 25,
              questionStartTime: Date.now(),
            },
          });
        }
      },

      quitRound: () => {
        set({ activeRound: null });
      },

      startPuzzle: (puzzle: Puzzle) => {
        set({ activePuzzle: puzzle });
      },

      exitPuzzle: () => {
        set({ activePuzzle: null });
      },

      dismissBonusPuzzlePrompt: () => {
        set({ bonusPuzzleEligible: false });
      },

      completePuzzle: (puzzle: Puzzle, movesOrTaps: number, timeTakenSeconds: number) => {
        const { user } = get();
        soundEngine.playFanfare();

        const completedSet = new Set(user.completedPuzzles || []);
        const badgesSet = new Set(user.unlockedBadges || []);
        let newBadgeId: string | null = null;

        completedSet.add(puzzle.id);

        // Check specific puzzle badge rewards
        if (puzzle.type === 'spot-difference' && !badgesSet.has('sharp-eyes')) {
          badgesSet.add('sharp-eyes');
          newBadgeId = 'sharp-eyes';
        } else if (puzzle.type === 'memory-match' && !badgesSet.has('memory-master')) {
          badgesSet.add('memory-master');
          newBadgeId = 'memory-master';
        }

        // Check 3 puzzles milestone badge
        if (completedSet.size >= 3 && !badgesSet.has('luangwa-pathfinder')) {
          badgesSet.add('luangwa-pathfinder');
          if (!newBadgeId) newBadgeId = 'luangwa-pathfinder';
        }

        // Calculate puzzle score bonus
        const baseBonus = puzzle.bonusPoints || 200;
        const speedBonus = Math.max(0, 100 - Math.floor(timeTakenSeconds * 2));
        const efficiencyBonus = Math.max(0, 50 - movesOrTaps * 2);
        const totalEarned = baseBonus + speedBonus + efficiencyBonus;

        const updatedUser: UserProfile = {
          ...user,
          highestScore: user.highestScore + totalEarned,
          unlockedBadges: Array.from(badgesSet),
          completedPuzzles: Array.from(completedSet),
        };

        // Submit to online Firestore
        saveCompletedPuzzleToFirestore(user.uid, puzzle.id);
        syncUserProfileToFirestore(updatedUser);
        submitScoreToFirestore({
          userId: user.uid,
          displayName: user.displayName,
          score: totalEarned,
          accuracy: 100,
          region: puzzle.parkRegion,
          isDaily: false,
        }).catch((e) => console.warn('Puzzle score sync warning:', e));

        set({
          user: updatedUser,
          newUnlockedBadgeId: newBadgeId || get().newUnlockedBadgeId,
          roundsSinceLastPuzzle: 0,
          bonusPuzzleEligible: false,
        });

        return { newBadgeId };
      },

      resetProgress: () => {
        localStorage.removeItem('luangwa_safari_store');
        set({
          user: {
            ...INITIAL_PROFILE,
            uid: 'player_' + Math.random().toString(36).substring(2, 9),
          },
          activeRound: null,
          activePuzzle: null,
          newUnlockedBadgeId: null,
          roundsSinceLastPuzzle: 0,
          bonusPuzzleEligible: false,
        });
      },
    }),
    {
      name: 'luangwa_safari_store',
      partialize: (state) => ({
        user: state.user,
        soundMuted: state.soundMuted,
      }),
    }
  )
);
