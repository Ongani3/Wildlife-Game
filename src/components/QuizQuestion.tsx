import React, { useEffect, useState } from 'react';
import { Question } from '../types';
import {
  Clock,
  Flame,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Info,
  ZoomIn,
  Trees,
  Home,
} from 'lucide-react';

interface QuizQuestionProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  score: number;
  streak: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  timeRemaining: number;
  onSelectAnswer: (answer: string) => void;
  onNextQuestion: () => void;
  onQuit: () => void;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  currentIndex,
  totalQuestions,
  score,
  streak,
  selectedAnswer,
  isAnswered,
  isCorrect,
  timeRemaining: initialTime,
  onSelectAnswer,
  onNextQuestion,
  onQuit,
}) => {
  const [timeLeft, setTimeLeft] = useState(25);
  const [isPhotoExpanded, setIsPhotoExpanded] = useState(false);

  // Timer countdown
  useEffect(() => {
    setTimeLeft(25);
  }, [question.id]);

  useEffect(() => {
    if (isAnswered) return;
    if (timeLeft <= 0) {
      // Auto submit time-out
      onSelectAnswer('');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, onSelectAnswer]);

  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;
  const timerPercent = (timeLeft / 25) * 100;

  return (
    <div
      id="quiz-question-container"
      className="w-full max-w-lg mx-auto flex flex-col items-center animate-in fade-in duration-200"
    >
      {/* Top Session Status Bar */}
      <div className="w-full flex items-center justify-between py-2 px-1 text-xs">
        <button
          id="quit-quiz-btn"
          onClick={onQuit}
          title="Return to Home / Zambia Map"
          className="flex items-center gap-1 text-stone-600 hover:text-stone-900 font-semibold px-2 py-1 rounded-lg hover:bg-stone-200/60 transition"
        >
          <Home className="w-3.5 h-3.5 text-stone-500" />
          <span>Exit to Home</span>
        </button>

        {/* Question Counter */}
        <div className="flex items-center gap-1 font-bold text-stone-700">
          <span className="text-[#1b4d31]">Question {currentIndex + 1}</span>
          <span className="text-stone-400">/ {totalQuestions}</span>
        </div>

        {/* Score & Streak Chips */}
        <div className="flex items-center gap-2">
          {streak >= 2 && (
            <div
              id="streak-indicator"
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-extrabold text-[11px] shadow-xs animate-bounce"
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{streak}x Streak</span>
            </div>
          )}
          <div className="px-2.5 py-0.5 rounded-full bg-[#1b4d31] text-amber-300 font-bold text-xs shadow-xs">
            {score} pts
          </div>
        </div>
      </div>

      {/* Round Progress Bar */}
      <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-linear-to-r from-amber-500 to-[#1b4d31] transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="w-full bg-white rounded-2xl border border-stone-200/90 shadow-md p-4 sm:p-5 flex flex-col relative overflow-hidden">
        {/* Top Chitenge decorative accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 chitenge-border-top" />

        {/* Speed Timer Bar (visible when answering) */}
        {!isAnswered && (
          <div className="w-full flex items-center justify-between text-[11px] text-stone-500 mb-2 font-medium">
            <div className="flex items-center gap-1 text-amber-700 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>Time Bonus: {timeLeft}s</span>
            </div>
            <span className="text-stone-400">Answer fast for 1.5x score</span>
          </div>
        )}

        {!isAnswered && (
          <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full transition-all duration-1000 linear ${
                timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 10 ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        )}

        {/* Category & Region Pill */}
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
            <Trees className="w-3 h-3 text-[#1b4d31]" />
            {question.category || 'Zambian Wildlife'}
          </span>
          <span className="text-[10px] uppercase font-semibold text-stone-400">
            {question.difficulty}
          </span>
        </div>

        {/* Question Prompt */}
        <h2 className="text-base sm:text-lg font-bold font-display text-stone-900 leading-snug">
          {question.questionText}
        </h2>

        {/* Photo Identification Image */}
        {question.imageUrl && (
          <div className="relative mt-3 w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-100 max-h-56">
            <img
              src={question.imageUrl}
              alt="Zambian Wildlife specimen to identify"
              loading="lazy"
              referrerPolicy="no-referrer"
              className={`w-full object-cover transition-transform duration-300 ${
                isPhotoExpanded ? 'max-h-96 scale-105' : 'h-44 sm:h-48'
              }`}
            />
            <button
              id="expand-wildlife-photo-btn"
              onClick={() => setIsPhotoExpanded(!isPhotoExpanded)}
              aria-label="Toggle photo zoom"
              className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-stone-900/70 text-white hover:bg-stone-900 transition flex items-center gap-1 text-[10px] font-medium"
            >
              <ZoomIn className="w-3 h-3" />
              <span>{isPhotoExpanded ? 'Shrink' : 'Zoom'}</span>
            </button>
          </div>
        )}

        {/* Options List */}
        <div className="mt-4 space-y-2.5">
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === question.correctAnswer;

            let optionStyle =
              'bg-stone-50 hover:bg-stone-100 border-stone-200/90 text-stone-800';

            if (isAnswered) {
              if (isCorrectOption) {
                optionStyle =
                  'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/30';
              } else if (isSelected && !isCorrectOption) {
                optionStyle =
                  'bg-red-50 border-red-400 text-red-950 font-semibold ring-1 ring-red-400/40 opacity-80';
              } else {
                optionStyle = 'bg-stone-50 border-stone-200 text-stone-400 opacity-60';
              }
            } else if (isSelected) {
              optionStyle = 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-400';
            }

            return (
              <button
                key={option}
                id={`quiz-option-${idx}`}
                disabled={isAnswered}
                onClick={() => onSelectAnswer(option)}
                className={`w-full min-h-[50px] p-3 rounded-xl border text-left text-xs sm:text-sm transition-all duration-150 flex items-center justify-between gap-2 cursor-pointer active:scale-99 ${optionStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isAnswered && isCorrectOption
                        ? 'bg-emerald-600 text-white'
                        : isAnswered && isSelected && !isCorrectOption
                        ? 'bg-red-500 text-white'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{option}</span>
                </div>

                {isAnswered && (
                  <div className="flex-shrink-0">
                    {isCorrectOption && (
                      <Check className="w-5 h-5 text-emerald-600 animate-in zoom-in duration-200" />
                    )}
                    {isSelected && !isCorrectOption && (
                      <X className="w-5 h-5 text-red-500 animate-in zoom-in duration-200" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Post-Answer Educational Fun Fact & Celebration */}
        {isAnswered && (
          <div
            id="safari-fact-card"
            className={`mt-4 p-3.5 rounded-xl border animate-in fade-in slide-in-from-bottom-2 duration-300 ${
              isCorrect
                ? 'bg-emerald-500/10 border-emerald-600/30 text-emerald-950'
                : 'bg-amber-500/10 border-amber-600/30 text-stone-900'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
              {isCorrect ? (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Excellent Tracker! Spot on!</span>
                </>
              ) : (
                <>
                  <Info className="w-4 h-4 text-amber-700" />
                  <span className="text-amber-800">
                    Ranger Note — Correct: {question.correctAnswer}
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              <strong className="text-stone-900">Bush Fact: </strong>
              {question.funFact}
            </p>
          </div>
        )}

        {/* Next Question Navigation Button */}
        {isAnswered && (
          <button
            id="next-question-btn"
            onClick={onNextQuestion}
            className="mt-4 w-full py-3.5 px-4 rounded-xl bg-linear-to-r from-[#1b4d31] to-[#24643f] hover:from-[#143622] hover:to-[#1b4d31] text-amber-300 font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition transform active:scale-98 animate-in zoom-in-95 duration-200"
          >
            <span>
              {currentIndex + 1 === totalQuestions ? 'View Safari Results' : 'Next Question'}
            </span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        )}
      </div>
    </div>
  );
};
