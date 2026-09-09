import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  RotateCcw,
  Sparkles,
  Award,
  Clock,
  CheckCircle2,
  Brain,
  ChevronRight,
  Info,
  Footprints,
} from 'lucide-react';
import { MemoryMatchPuzzle, MemoryPair } from '../../types';
import { useQuizStore } from '../../store/useQuizStore';
import { soundEngine } from '../../lib/audio';

interface MemoryCardItem {
  uid: string;
  pairId: string;
  animalName: string;
  scientificName?: string;
  imageUrl: string;
  funFactSnippet: string;
}

interface MemoryMatchGameProps {
  puzzle: MemoryMatchPuzzle;
  onClose: () => void;
  onNextPuzzle?: () => void;
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  puzzle,
  onClose,
  onNextPuzzle,
}) => {
  const completePuzzle = useQuizStore((state) => state.completePuzzle);

  // Prepare shuffled deck of pairs (2 cards per pair)
  const initialDeck = useMemo(() => {
    const cards: MemoryCardItem[] = [];
    puzzle.pairs.forEach((pair) => {
      cards.push({
        uid: `${pair.id}-card-1`,
        pairId: pair.id,
        animalName: pair.animalName,
        scientificName: pair.scientificName,
        imageUrl: pair.imageUrl,
        funFactSnippet: pair.funFactSnippet,
      });
      cards.push({
        uid: `${pair.id}-card-2`,
        pairId: pair.id,
        animalName: pair.animalName,
        scientificName: pair.scientificName,
        imageUrl: pair.imageUrl,
        funFactSnippet: pair.funFactSnippet,
      });
    });
    // Shuffle cards
    return cards.sort(() => Math.random() - 0.5);
  }, [puzzle]);

  const [deck, setDeck] = useState<MemoryCardItem[]>(initialDeck);
  const [flippedCardUids, setFlippedCardUids] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [lastMatchedCard, setLastMatchedCard] = useState<MemoryPair | null>(null);
  const [unlockedBadge, setUnlockedBadge] = useState<string | null>(null);
  const [earnedBonusPoints, setEarnedBonusPoints] = useState(puzzle.bonusPoints || 200);

  // Timer
  useEffect(() => {
    if (isGameComplete) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameComplete]);

  // Restart puzzle
  const handleReset = () => {
    setDeck([...initialDeck].sort(() => Math.random() - 0.5));
    setFlippedCardUids([]);
    setMatchedPairIds([]);
    setMoves(0);
    setSecondsElapsed(0);
    setIsGameComplete(false);
    setLastMatchedCard(null);
    setUnlockedBadge(null);
  };

  // Card click handler
  const handleCardClick = (card: MemoryCardItem) => {
    // Prevent clicking if already matched, already flipped, or two cards currently waiting to turn back
    if (
      matchedPairIds.includes(card.pairId) ||
      flippedCardUids.includes(card.uid) ||
      flippedCardUids.length >= 2 ||
      isGameComplete
    ) {
      return;
    }

    const nextFlipped = [...flippedCardUids, card.uid];
    setFlippedCardUids(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const firstCard = deck.find((c) => c.uid === nextFlipped[0])!;
      const secondCard = card;

      if (firstCard.pairId === secondCard.pairId) {
        // Matched!
        soundEngine.playCorrect();
        const nextMatched = [...matchedPairIds, card.pairId];
        setMatchedPairIds(nextMatched);
        setLastMatchedCard({
          id: card.pairId,
          animalName: card.animalName,
          scientificName: card.scientificName,
          imageUrl: card.imageUrl,
          funFactSnippet: card.funFactSnippet,
        });
        setFlippedCardUids([]);

        // Check if all pairs matched
        if (nextMatched.length === puzzle.pairs.length) {
          setIsGameComplete(true);
          const totalPoints =
            (puzzle.bonusPoints || 200) +
            Math.max(0, 100 - secondsElapsed * 2) +
            Math.max(0, 50 - moves * 2);
          setEarnedBonusPoints(totalPoints);
          const result = completePuzzle(puzzle, moves + 1, secondsElapsed);
          if (result.newBadgeId) {
            setUnlockedBadge(result.newBadgeId);
          }
        }
      } else {
        // Not a match
        soundEngine.playIncorrect();
        setTimeout(() => {
          setFlippedCardUids([]);
        }, 900);
      }
    }
  };

  const gridColsClass =
    puzzle.gridSize === '4x4'
      ? 'grid-cols-4'
      : 'grid-cols-3 sm:grid-cols-4';

  return (
    <div
      id="memory-match-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xl bg-[#fbf9f4] rounded-3xl border border-[#1b4d31]/25 shadow-2xl flex flex-col overflow-hidden text-stone-900 my-auto">
        {/* Top bar */}
        <div className="p-3.5 sm:p-4 bg-linear-to-r from-[#143622] via-[#1b4d31] to-[#235d3d] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-stone-950 shadow-md">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold font-display text-sm sm:text-base text-amber-300">
                  {puzzle.title}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 border border-emerald-500/30">
                  Memory Match
                </span>
              </div>
              <p className="text-[11px] text-stone-300 hidden sm:block">
                Pair all {puzzle.pairs.length} Zambian wildlife cards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="reset-memory-game-btn"
              onClick={handleReset}
              title="Reshuffle & Restart"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              id="close-memory-game-btn"
              onClick={onClose}
              title="Close puzzle"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats counter strip */}
        <div className="px-4 py-2.5 bg-amber-50/80 border-b border-amber-200/60 flex items-center justify-between text-xs text-stone-700">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <Footprints className="w-3.5 h-3.5 text-[#1b4d31]" />
              Moves: <strong className="text-stone-900">{moves}</strong>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#1b4d31]" />
              Time: <strong className="text-stone-900">{secondsElapsed}s</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-600">
              Matched:{' '}
              <strong className="text-emerald-800">
                {matchedPairIds.length} / {puzzle.pairs.length}
              </strong>
            </span>
            <div className="w-16 h-2 rounded-full bg-stone-200 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-amber-500 to-emerald-600 transition-all duration-300"
                style={{
                  width: `${(matchedPairIds.length / puzzle.pairs.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Main Card Grid Area */}
        <div className="p-3 sm:p-5 flex-1 overflow-y-auto">
          <div className={`grid ${gridColsClass} gap-2 sm:gap-3 max-w-md mx-auto`}>
            {deck.map((card) => {
              const isFlipped =
                flippedCardUids.includes(card.uid) ||
                matchedPairIds.includes(card.pairId);
              const isMatched = matchedPairIds.includes(card.pairId);

              return (
                <div
                  key={card.uid}
                  onClick={() => handleCardClick(card)}
                  className="aspect-square perspective-1000 cursor-pointer select-none"
                >
                  <div
                    className={`w-full h-full relative transition-transform duration-500 transform-style-3d rounded-2xl shadow-sm ${
                      isFlipped ? 'rotate-y-180' : 'hover:scale-[1.03]'
                    }`}
                  >
                    {/* Card Back (Unflipped - Chitenge / Safari Theme) */}
                    <div className="absolute inset-0 backface-hidden rounded-2xl bg-linear-to-br from-[#1b4d31] to-[#0e2719] border-2 border-amber-400/40 flex flex-col items-center justify-center p-2 text-center text-amber-300 shadow-md">
                      <div className="w-8 h-8 rounded-full border border-amber-400/50 flex items-center justify-center bg-emerald-900/60 mb-1">
                        <Footprints className="w-4 h-4 text-amber-400" />
                      </div>
                      <span className="text-[10px] font-bold tracking-wider text-amber-200 uppercase">
                        Luangwa
                      </span>
                    </div>

                    {/* Card Front (Flipped - Animal Photo & Name) */}
                    <div
                      className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl overflow-hidden border-2 flex flex-col justify-end p-2 bg-stone-900 ${
                        isMatched
                          ? 'border-emerald-500 ring-2 ring-emerald-400/60'
                          : 'border-amber-400'
                      }`}
                    >
                      <img
                        src={card.imageUrl}
                        alt={card.animalName}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-stone-950/95 via-stone-950/40 to-transparent" />

                      <div className="relative z-10 text-left">
                        <p className="text-[11px] sm:text-xs font-bold text-white leading-tight drop-shadow-md">
                          {card.animalName}
                        </p>
                        {isMatched && (
                          <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-semibold mt-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Matched</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Educational Quick Fact for Last Matched Animal */}
          {lastMatchedCard && !isGameComplete && (
            <div className="mt-4 p-3 rounded-2xl bg-amber-50/90 border border-amber-300/60 text-xs flex items-start gap-2.5 max-w-md mx-auto animate-in fade-in duration-300">
              <div className="p-1.5 rounded-lg bg-amber-200 text-amber-900 shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-stone-900">
                  {lastMatchedCard.animalName}
                  {lastMatchedCard.scientificName && (
                    <span className="italic font-normal text-stone-600 ml-1">
                      ({lastMatchedCard.scientificName})
                    </span>
                  )}
                </p>
                <p className="text-stone-700 mt-0.5 leading-relaxed">
                  {lastMatchedCard.funFactSnippet}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Completion Modal Overlay */}
        {isGameComplete && (
          <div className="p-5 bg-linear-to-b from-emerald-50 via-white to-amber-50/50 border-t border-emerald-200 text-center animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center mx-auto mb-2 shadow-lg ring-4 ring-amber-200">
              <Award className="w-7 h-7" />
            </div>

            <h4 className="text-lg font-extrabold font-display text-[#143622]">
              Safari Memory Master!
            </h4>
            <p className="text-xs text-stone-600 mt-0.5">
              You paired all wildlife cards in {moves} moves and {secondsElapsed} seconds.
            </p>

            {/* Earned points banner */}
            <div className="inline-flex items-center gap-2 mt-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>+{earnedBonusPoints} Safari Ranger Points Earned!</span>
            </div>

            {/* Badge Unlocked Notification */}
            {unlockedBadge && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center justify-center gap-2 max-w-sm mx-auto">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>New Trophy Unlocked: Memory Master!</span>
              </div>
            )}

            {/* Educational Park Fun Fact */}
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
                id="memory-play-again-btn"
                onClick={handleReset}
                className="w-full sm:w-1/2 py-2.5 rounded-xl border border-[#1b4d31] text-[#1b4d31] hover:bg-emerald-50 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Play Again</span>
              </button>

              {onNextPuzzle ? (
                <button
                  id="memory-next-puzzle-btn"
                  onClick={onNextPuzzle}
                  className="w-full sm:w-1/2 py-2.5 rounded-xl bg-[#1b4d31] text-amber-300 hover:bg-[#143622] text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>Next Puzzle</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  id="memory-finish-btn"
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
