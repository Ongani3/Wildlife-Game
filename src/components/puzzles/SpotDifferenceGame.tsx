import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  RotateCcw,
  Sparkles,
  Award,
  Clock,
  Eye,
  CheckCircle2,
  ChevronRight,
  Info,
  Lightbulb,
  Search,
  Maximize2,
} from 'lucide-react';
import { SpotDifferencePuzzle, SpotDifferenceTarget } from '../../types';
import { useQuizStore } from '../../store/useQuizStore';
import { soundEngine } from '../../lib/audio';

interface SpotDifferenceGameProps {
  puzzle: SpotDifferencePuzzle;
  onClose: () => void;
  onNextPuzzle?: () => void;
}

export const SpotDifferenceGame: React.FC<SpotDifferenceGameProps> = ({
  puzzle,
  onClose,
  onNextPuzzle,
}) => {
  const completePuzzle = useQuizStore((state) => state.completePuzzle);

  const [foundDiffIds, setFoundDiffIds] = useState<string[]>([]);
  const [tapsCount, setTapsCount] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [lastFoundDiff, setLastFoundDiff] = useState<SpotDifferenceTarget | null>(null);
  const [hintActiveId, setHintActiveId] = useState<string | null>(null);
  const [activeTabMobile, setActiveTabMobile] = useState<'compare' | 'photoA' | 'photoB'>('compare');
  const [missedTapPos, setMissedTapPos] = useState<{ x: number; y: number } | null>(null);
  const [unlockedBadge, setUnlockedBadge] = useState<string | null>(null);
  const [earnedBonusPoints, setEarnedBonusPoints] = useState(puzzle.bonusPoints || 250);

  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    if (isGameComplete) return;
    const timer = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameComplete]);

  // Reset
  const handleReset = () => {
    setFoundDiffIds([]);
    setTapsCount(0);
    setSecondsElapsed(0);
    setIsGameComplete(false);
    setLastFoundDiff(null);
    setHintActiveId(null);
    setMissedTapPos(null);
    setUnlockedBadge(null);
  };

  // Provide hint for a remaining difference
  const handleRequestHint = () => {
    const remaining = puzzle.differences.filter((d) => !foundDiffIds.includes(d.id));
    if (remaining.length === 0) return;
    const target = remaining[0];
    setHintActiveId(target.id);
    setTimeout(() => {
      setHintActiveId(null);
    }, 3500);
  };

  // Tap handler
  const handleTapOnImage = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGameComplete) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setTapsCount((c) => c + 1);

    // Check against all unfound differences
    const hitTarget = puzzle.differences.find((diff) => {
      if (foundDiffIds.includes(diff.id)) return false;
      const dist = Math.hypot(xPercent - diff.xPercent, yPercent - diff.yPercent);
      return dist <= (diff.radiusPercent || 13);
    });

    if (hitTarget) {
      soundEngine.playCorrect();
      const nextFound = [...foundDiffIds, hitTarget.id];
      setFoundDiffIds(nextFound);
      setLastFoundDiff(hitTarget);
      setHintActiveId(null);
      setMissedTapPos(null);

      // Check for puzzle completion
      if (nextFound.length === puzzle.differences.length) {
        setIsGameComplete(true);
        const totalPoints =
          (puzzle.bonusPoints || 250) +
          Math.max(0, 100 - secondsElapsed * 2) +
          Math.max(0, 50 - tapsCount * 2);
        setEarnedBonusPoints(totalPoints);
        const result = completePuzzle(puzzle, tapsCount + 1, secondsElapsed);
        if (result.newBadgeId) {
          setUnlockedBadge(result.newBadgeId);
        }
      }
    } else {
      // Missed tap ripple feedback
      soundEngine.playIncorrect();
      setMissedTapPos({ x: xPercent, y: yPercent });
      setTimeout(() => setMissedTapPos(null), 700);
    }
  };

  return (
    <div
      id="spot-difference-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="w-full max-w-2xl bg-[#fbf9f4] rounded-3xl border border-[#1b4d31]/25 shadow-2xl flex flex-col overflow-hidden text-stone-900 my-auto">
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-linear-to-r from-[#143622] via-[#1b4d31] to-[#235d3d] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-stone-950 shadow-md">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold font-display text-sm sm:text-base text-amber-300">
                  {puzzle.title}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 border border-emerald-500/30">
                  Spot the Difference
                </span>
              </div>
              <p className="text-[11px] text-stone-300 hidden sm:block">
                Tap the subtle wildlife & bush anomalies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="reset-spot-game-btn"
              onClick={handleReset}
              title="Restart Puzzle"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              id="close-spot-game-btn"
              onClick={onClose}
              title="Close puzzle"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Counter strip & Binoculars Hint */}
        <div className="px-4 py-2.5 bg-amber-50/80 border-b border-amber-200/60 flex items-center justify-between text-xs text-stone-700">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <Search className="w-3.5 h-3.5 text-[#1b4d31]" />
              Found:{' '}
              <strong className="text-emerald-800 font-bold">
                {foundDiffIds.length} / {puzzle.differences.length}
              </strong>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#1b4d31]" />
              Time: <strong className="text-stone-900">{secondsElapsed}s</strong>
            </span>
          </div>

          <button
            id="spot-hint-btn"
            onClick={handleRequestHint}
            disabled={foundDiffIds.length === puzzle.differences.length}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-bold text-xs shadow-xs transition disabled:opacity-40"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-800" />
            <span>Ranger Hint</span>
          </button>
        </div>

        {/* Mobile View Toggle (Side-by-Side vs Toggle) */}
        <div className="sm:hidden flex border-b border-stone-200 bg-stone-100 p-1">
          <button
            onClick={() => setActiveTabMobile('compare')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTabMobile === 'compare'
                ? 'bg-white text-[#1b4d31] shadow-xs'
                : 'text-stone-500'
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setActiveTabMobile('photoA')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTabMobile === 'photoA'
                ? 'bg-white text-[#1b4d31] shadow-xs'
                : 'text-stone-500'
            }`}
          >
            Photo A (Original)
          </button>
          <button
            onClick={() => setActiveTabMobile('photoB')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTabMobile === 'photoB'
                ? 'bg-white text-[#1b4d31] shadow-xs'
                : 'text-stone-500'
            }`}
          >
            Photo B (Puzzle)
          </button>
        </div>

        {/* Puzzle Canvas Comparison Area */}
        <div className="p-3 sm:p-4 flex-1 overflow-y-auto">
          <div
            className={`grid gap-3 ${
              activeTabMobile === 'compare'
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-1'
            }`}
          >
            {/* PHOTO A: Reference Photo */}
            {(activeTabMobile === 'compare' || activeTabMobile === 'photoA') && (
              <div className="relative rounded-2xl overflow-hidden border-2 border-stone-300 shadow-sm bg-stone-900">
                <div className="absolute top-2 left-2 z-10 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold text-stone-200 uppercase tracking-wider">
                  Original Safari View
                </div>
                <img
                  src={puzzle.imageA}
                  alt="Original safari wildlife"
                  referrerPolicy="no-referrer"
                  className="w-full aspect-4/3 object-cover select-none pointer-events-none"
                />
              </div>
            )}

            {/* PHOTO B: Interactive Canvas where user taps differences */}
            {(activeTabMobile === 'compare' || activeTabMobile === 'photoB') && (
              <div
                ref={imageContainerRef}
                onClick={handleTapOnImage}
                className="relative rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-md bg-stone-900 cursor-crosshair select-none group"
              >
                <div className="absolute top-2 left-2 z-10 px-2.5 py-0.5 rounded-full bg-amber-600/90 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider shadow">
                  Tap Differences Here
                </div>

                <img
                  src={puzzle.imageB}
                  alt="Spot differences here"
                  referrerPolicy="no-referrer"
                  className="w-full aspect-4/3 object-cover select-none"
                />

                {/* Render subtle difference elements visually on Photo B */}
                {puzzle.differences.map((diff) => {
                  const isFound = foundDiffIds.includes(diff.id);
                  const isHinted = hintActiveId === diff.id;

                  return (
                    <React.Fragment key={diff.id}>
                      {/* Visual subtle alteration marker on the photo */}
                      <div
                        className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                        style={{
                          left: `${diff.xPercent}%`,
                          top: `${diff.yPercent}%`,
                        }}
                      >
                        {/* If not found yet, show subtle natural variations / markings */}
                        {!isFound && (
                          <div
                            className={`w-6 h-6 rounded-full border border-amber-300/40 bg-amber-400/10 transition-all ${
                              isHinted
                                ? 'scale-150 ring-4 ring-amber-400 animate-ping bg-amber-300/40'
                                : 'opacity-75'
                            }`}
                          />
                        )}

                        {/* If found, display golden-emerald success badge */}
                        {isFound && (
                          <div className="flex flex-col items-center animate-in zoom-in-50 duration-300">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white shadow-lg border-2 border-amber-300 flex items-center justify-center ring-4 ring-emerald-300/50">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}

                {/* Tap Feedback Ripple on Miss */}
                {missedTapPos && (
                  <div
                    className="absolute w-8 h-8 rounded-full border-2 border-rose-500 bg-rose-500/20 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-ping"
                    style={{
                      left: `${missedTapPos.x}%`,
                      top: `${missedTapPos.y}%`,
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Educational Feedback on Found Difference */}
          {lastFoundDiff && !isGameComplete && (
            <div className="mt-3 p-3 rounded-2xl bg-emerald-50/90 border border-emerald-300/60 text-xs flex items-start gap-2.5 max-w-lg mx-auto animate-in fade-in duration-300">
              <div className="p-1.5 rounded-lg bg-emerald-200 text-emerald-900 shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-800" />
              </div>
              <div>
                <p className="font-bold text-emerald-950">
                  Difference Spotted! ({foundDiffIds.length} of {puzzle.differences.length})
                </p>
                <p className="text-emerald-900 mt-0.5 leading-relaxed">
                  {lastFoundDiff.description}
                </p>
              </div>
            </div>
          )}

          {/* Prompt / Instructions */}
          {!lastFoundDiff && !isGameComplete && (
            <p className="text-center text-xs text-stone-500 mt-2.5">
              Inspect both photos side-by-side. Tap directly on any differences you discover in the right photo!
            </p>
          )}
        </div>

        {/* Completion Modal Overlay */}
        {isGameComplete && (
          <div className="p-5 bg-linear-to-b from-emerald-50 via-white to-amber-50/50 border-t border-emerald-200 text-center animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center mx-auto mb-2 shadow-lg ring-4 ring-amber-200">
              <Eye className="w-7 h-7" />
            </div>

            <h4 className="text-lg font-extrabold font-display text-[#143622]">
              Sharp Eyes Safari Scout!
            </h4>
            <p className="text-xs text-stone-600 mt-0.5">
              You uncovered all {puzzle.differences.length} hidden differences in {secondsElapsed}s!
            </p>

            {/* Earned Points */}
            <div className="inline-flex items-center gap-2 mt-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>+{earnedBonusPoints} Safari Ranger Points Earned!</span>
            </div>

            {/* Badge Unlocked Notification */}
            {unlockedBadge && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center justify-center gap-2 max-w-sm mx-auto">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>New Trophy Unlocked: Sharp Eyes!</span>
              </div>
            )}

            {/* Educational Field Note */}
            <div className="mt-3 p-3 rounded-2xl bg-stone-100/90 border border-stone-200 text-left text-xs max-w-md mx-auto">
              <p className="font-bold text-[#1b4d31] flex items-center gap-1.5 mb-1">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                Wilderness Field Note:
              </p>
              <p className="text-stone-700 leading-relaxed">{puzzle.funFact}</p>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-sm mx-auto">
              <button
                id="spot-play-again-btn"
                onClick={handleReset}
                className="w-full sm:w-1/2 py-2.5 rounded-xl border border-[#1b4d31] text-[#1b4d31] hover:bg-emerald-50 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Play Again</span>
              </button>

              {onNextPuzzle ? (
                <button
                  id="spot-next-puzzle-btn"
                  onClick={onNextPuzzle}
                  className="w-full sm:w-1/2 py-2.5 rounded-xl bg-[#1b4d31] text-amber-300 hover:bg-[#143622] text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>Next Puzzle</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  id="spot-finish-btn"
                  onClick={onClose}
                  className="w-full sm:w-1/2 py-2.5 rounded-xl bg-[#1b4d31] text-amber-300 hover:bg-[#143622] text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>Return to Safari</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
