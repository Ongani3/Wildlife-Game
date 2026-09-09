import React, { useState } from 'react';
import {
  Puzzle as PuzzleIcon,
  X,
  Brain,
  Eye,
  Award,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { Puzzle, PuzzleType } from '../../types';
import { STARTER_PUZZLES } from '../../data/puzzles';
import { useQuizStore } from '../../store/useQuizStore';

interface PuzzleHubModalProps {
  onSelectPuzzle: (puzzle: Puzzle) => void;
  onClose: () => void;
}

export const PuzzleHubModal: React.FC<PuzzleHubModalProps> = ({
  onSelectPuzzle,
  onClose,
}) => {
  const [filterType, setFilterType] = useState<PuzzleType | 'all'>('all');
  const user = useQuizStore((state) => state.user);
  const completedIds = new Set(user.completedPuzzles || []);

  const filteredPuzzles = STARTER_PUZZLES.filter((p) => {
    if (filterType === 'all') return true;
    return p.type === filterType;
  });

  // Daily puzzle (deterministic based on day of month)
  const dayIndex = new Date().getDate() % STARTER_PUZZLES.length;
  const dailyPuzzle = STARTER_PUZZLES[dayIndex];
  const isDailyCompleted = completedIds.has(dailyPuzzle.id);

  return (
    <div
      id="puzzle-hub-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xl max-h-[88vh] bg-[#fbf9f4] rounded-3xl border border-[#1b4d31]/20 shadow-2xl flex flex-col overflow-hidden text-stone-900">
        {/* Header */}
        <div className="p-4 bg-linear-to-r from-[#143622] via-[#1b4d31] to-[#235d3d] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-stone-950 shadow">
              <PuzzleIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-display text-base text-amber-300">
                Safari Wildlife Bush Puzzles
              </h3>
              <p className="text-xs text-stone-300">
                Sharpen your ranger instincts & earn trophy badges
              </p>
            </div>
          </div>

          <button
            id="close-puzzle-hub-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Daily Puzzle Highlight Banner */}
        <div className="p-3.5 bg-linear-to-r from-amber-100 to-amber-50 border-b border-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-400 text-stone-950 shadow-sm shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                  Today's Bush Puzzle
                </span>
                {isDailyCompleted && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-600 text-white font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Solved
                  </span>
                )}
              </div>
              <h4 className="font-bold font-display text-sm text-stone-900">
                {dailyPuzzle.title}
              </h4>
              <p className="text-[11px] text-stone-600 line-clamp-1">
                {dailyPuzzle.description}
              </p>
            </div>
          </div>

          <button
            id="play-daily-puzzle-btn"
            onClick={() => onSelectPuzzle(dailyPuzzle)}
            className="px-3.5 py-2 rounded-xl bg-[#1b4d31] hover:bg-[#143622] text-amber-300 font-bold text-xs shadow transition shrink-0 flex items-center gap-1"
          >
            <span>Play</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex border-b border-stone-200 bg-stone-100 p-1.5 gap-1">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              filterType === 'all'
                ? 'bg-white text-[#1b4d31] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All ({STARTER_PUZZLES.length})</span>
          </button>

          <button
            onClick={() => setFilterType('memory-match')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              filterType === 'memory-match'
                ? 'bg-white text-[#1b4d31] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Memory Match</span>
          </button>

          <button
            onClick={() => setFilterType('spot-difference')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              filterType === 'spot-difference'
                ? 'bg-white text-[#1b4d31] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Spot Difference</span>
          </button>
        </div>

        {/* Puzzle cards list */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {filteredPuzzles.map((puzzle) => {
            const isCompleted = completedIds.has(puzzle.id);
            const isMemory = puzzle.type === 'memory-match';

            return (
              <div
                key={puzzle.id}
                onClick={() => onSelectPuzzle(puzzle)}
                className="p-3.5 rounded-2xl border border-stone-200 bg-white hover:border-amber-400 hover:shadow-md transition cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                      isMemory
                        ? 'bg-linear-to-br from-emerald-600 to-teal-800'
                        : 'bg-linear-to-br from-amber-500 to-orange-700'
                    }`}
                  >
                    {isMemory ? (
                      <Brain className="w-5 h-5 text-amber-200" />
                    ) : (
                      <Eye className="w-5 h-5 text-amber-200" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold font-display text-sm text-stone-900 group-hover:text-[#1b4d31] transition">
                        {puzzle.title}
                      </h4>
                      {isCompleted && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Mastered
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                      {puzzle.description}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-1">
                      <span className="capitalize font-semibold text-stone-600">
                        {puzzle.parkRegion.replace('-', ' ')}
                      </span>
                      <span>•</span>
                      <span className="capitalize font-medium text-amber-800">
                        {puzzle.difficulty}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        +{puzzle.bonusPoints} pts
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-stone-50 group-hover:bg-[#1b4d31] group-hover:text-amber-300 text-stone-400 transition shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600 px-4">
          <span>
            Puzzles Mastered:{' '}
            <strong className="text-stone-900">
              {completedIds.size} of {STARTER_PUZZLES.length}
            </strong>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1b4d31] text-amber-300 hover:bg-[#143622] font-bold text-xs shadow transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
