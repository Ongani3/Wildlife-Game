import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Share2,
  Download,
  Award,
  Flame,
  CheckCircle2,
  MapPin,
  Sparkles,
  Home,
} from 'lucide-react';
import { QuizRoundState, UserProfile } from '../types';
import { BADGES } from '../data/badges';
import { REGIONS } from '../data/regions';

interface ResultsViewProps {
  round: QuizRoundState;
  user: UserProfile;
  newBadgeId: string | null;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onOpenLeaderboard: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  round,
  user,
  newBadgeId,
  onPlayAgain,
  onGoHome,
  onOpenLeaderboard,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cardGenerated, setCardGenerated] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const totalQuestions = round.questions.length;
  const correctCount = round.answersSummary.filter((a) => a.isCorrect).length;
  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  // Safari Rank calculation
  const getRankTitle = (acc: number, sc: number) => {
    if (acc >= 90 && sc >= 1500) return 'Master Luangwa Ranger';
    if (acc >= 80) return 'Senior Bush Guide';
    if (acc >= 65) return 'Savannah Tracker';
    if (acc >= 50) return 'Junior Scout';
    return 'Bush Apprentice';
  };

  const rankTitle = getRankTitle(accuracy, round.score);
  const regionData = REGIONS.find((r) => r.id === round.regionId) || REGIONS[0];
  const unlockedBadge = newBadgeId ? BADGES.find((b) => b.id === newBadgeId) : null;

  // Trigger celebratory confetti if score >= 1000 or accuracy >= 70%
  useEffect(() => {
    if (accuracy >= 65) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D97706', '#1B4D31', '#F59E0B', '#24643F'],
        });
      } catch (e) {
        console.warn('Confetti unavailable:', e);
      }
    }
  }, [accuracy]);

  // Generate shareable canvas certificate
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions for high-res social card (1080x1350 vertical aspect or 800x600)
    canvas.width = 800;
    canvas.height = 640;

    // 1. Deep forest green gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 640);
    bgGrad.addColorStop(0, '#143622');
    bgGrad.addColorStop(0.5, '#1b4d31');
    bgGrad.addColorStop(1, '#0e2417');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 640);

    // 2. Decorative borders (Zambian sunset gold)
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 6;
    ctx.strokeRect(24, 24, 752, 592);

    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(32, 32, 736, 576);

    // 3. Top Banner
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 22px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LUANGWA LEGENDS', 400, 75);

    ctx.fillStyle = '#E5E7EB';
    ctx.font = '14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('OFFICIAL ZAMBIAN WILDLIFE SAFARI CERTIFICATE', 400, 105);

    // 4. Gold separator line
    ctx.beginPath();
    ctx.moveTo(250, 120);
    ctx.lineTo(550, 120);
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5. Explorer Name & Expedition Region
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Outfit", sans-serif';
    ctx.fillText(user.displayName, 400, 175);

    ctx.fillStyle = '#FDE68A';
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Expedition: ${regionData.name}`, 400, 208);

    // 6. Center Medal / Rank Badge Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(150, 235, 500, 130);
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 1;
    ctx.strokeRect(150, 235, 500, 130);

    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SAFARI RANK ATTAINED', 400, 270);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px "Outfit", sans-serif';
    ctx.fillText(rankTitle, 400, 315);

    ctx.fillStyle = '#A7F3D0';
    ctx.font = '14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Accuracy: ${accuracy}% (${correctCount}/${totalQuestions} Spotted)`, 400, 345);

    // 7. Stat Metrics Row
    // Score Box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(150, 390, 240, 95);
    ctx.fillStyle = '#D97706';
    ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('EXPEDITION SCORE', 270, 422);
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 34px "Outfit", sans-serif';
    ctx.fillText(`${round.score}`, 270, 465);

    // Streak Box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(410, 390, 240, 95);
    ctx.fillStyle = '#D97706';
    ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('MAX TRACKING STREAK', 530, 422);
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 34px "Outfit", sans-serif';
    ctx.fillText(`${round.maxStreak}x`, 530, 465);

    // 8. Footer Motto
    ctx.fillStyle = '#9CA3AF';
    ctx.font = 'italic 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('“Conserving Zambia’s Wild Heritage for Generations to Come”', 400, 545);

    ctx.fillStyle = '#D97706';
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('LUANGWA LEGENDS PWA • OFFLINE SAFARI QUIZ', 400, 575);

    setCardGenerated(true);
  }, [round, user, rankTitle, accuracy, regionData, correctCount, totalQuestions]);

  const handleDownloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Luangwa_Legends_${user.displayName.replace(/\s+/g, '_')}_Result.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShareCard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (navigator.share) {
      try {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], 'luangwa_safari_score.png', { type: 'image/png' });
          await navigator.share({
            title: 'Luangwa Legends – Zambian Safari Quiz',
            text: `I scored ${round.score} pts (${accuracy}%) in ${regionData.name} on Luangwa Legends! Can you beat my safari rank of ${rankTitle}?`,
            files: [file],
          });
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 3000);
        });
      } catch (err) {
        console.warn('Native share canceled or failed:', err);
      }
    } else {
      // Fallback: download card
      handleDownloadCard();
    }
  };

  return (
    <div
      id="quiz-results-container"
      className="w-full max-w-lg mx-auto flex flex-col items-center animate-in zoom-in-95 duration-200"
    >
      {/* Newly Unlocked Badge Banner */}
      {unlockedBadge && (
        <div
          id="new-badge-alert"
          className="w-full mb-3 p-3.5 rounded-2xl bg-linear-to-r from-amber-500 to-amber-600 text-stone-950 shadow-lg border border-amber-300 flex items-center gap-3 animate-bounce"
        >
          <div className="p-2.5 rounded-xl bg-stone-950 text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1 font-extrabold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Safari Badge Unlocked!</span>
            </div>
            <h4 className="font-bold font-display text-sm">{unlockedBadge.name}</h4>
            <p className="text-xs opacity-90">{unlockedBadge.description}</p>
          </div>
        </div>
      )}

      {/* Main Results Summary Card */}
      <div className="w-full bg-white rounded-2xl border border-stone-200/90 shadow-lg p-5 flex flex-col items-center text-center relative overflow-hidden">
        {/* Top Chitenge decorative accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 chitenge-border-top" />

        {/* Safari Badge Icon */}
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#1b4d31] to-[#24643f] flex items-center justify-center text-amber-400 shadow-md my-2">
          <Trophy className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 mt-1">
          Safari Expedition Complete
        </span>

        <h2 className="text-2xl font-black font-display text-stone-900 mt-1">
          {rankTitle}
        </h2>

        <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
          <MapPin className="w-3.5 h-3.5 text-[#1b4d31]" />
          <span>{regionData.name}</span>
        </div>

        {/* Primary Stat Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 w-full mt-5">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-stone-500">Score</span>
            <span className="text-xl font-black text-amber-700 font-display mt-0.5">
              {round.score}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-stone-500">Accuracy</span>
            <div className="flex items-center gap-1 text-emerald-700 font-black text-xl font-display mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{accuracy}%</span>
            </div>
            <span className="text-[10px] text-stone-400">
              {correctCount}/{totalQuestions}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-stone-500">Max Streak</span>
            <div className="flex items-center gap-1 text-orange-600 font-black text-xl font-display mt-0.5">
              <Flame className="w-4 h-4 fill-current" />
              <span>{round.maxStreak}x</span>
            </div>
          </div>
        </div>

        {/* Hidden Canvas for Card Generation */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Shareable Certificate Preview & Action Buttons */}
        <div className="w-full mt-5 pt-4 border-t border-stone-200 flex flex-col gap-2.5">
          <div className="flex items-center justify-center gap-2">
            <button
              id="share-result-btn"
              onClick={handleShareCard}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#1b4d31] hover:bg-[#143622] text-amber-300 font-bold text-xs shadow flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Share Safari Card</span>
            </button>

            <button
              id="download-result-btn"
              onClick={handleDownloadCard}
              className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs border border-stone-300 flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save PNG</span>
            </button>
          </div>

          {shareSuccess && (
            <span className="text-xs font-semibold text-emerald-600 animate-in fade-in">
              Safari certificate shared successfully!
            </span>
          )}
        </div>

        {/* Navigation Actions */}
        <div className="w-full flex flex-col gap-2 mt-4">
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              id="play-again-btn"
              onClick={onPlayAgain}
              className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>

            <button
              id="results-view-leaderboard-btn"
              onClick={onOpenLeaderboard}
              className="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Leaderboard</span>
            </button>
          </div>

          <button
            id="back-to-park-map-btn"
            onClick={onGoHome}
            aria-label="Return to Home / Zambia Map"
            className="w-full py-3 px-4 rounded-xl bg-[#1b4d31] hover:bg-[#143622] text-amber-300 font-bold text-xs shadow flex items-center justify-center gap-2 transition active:scale-98 border border-amber-400/25"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home / Zambia Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};
