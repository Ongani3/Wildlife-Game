import React, { useState } from 'react';
import { useQuizStore } from './store/useQuizStore';
import { ZambiaMap } from './components/ZambiaMap';
import { QuizQuestion } from './components/QuizQuestion';
import { ResultsView } from './components/ResultsView';
import { BadgeModal } from './components/BadgeModal';
import { LeaderboardView } from './components/LeaderboardView';
import { ProfileModal } from './components/ProfileModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { RegionId } from './types';
import {
  Volume2,
  VolumeX,
  Award,
  Trophy,
  User as UserIcon,
  Sun,
  Flame,
  CheckCircle,
  Sparkles,
  Compass,
  Trees,
  Home,
  AlertCircle,
} from 'lucide-react';

export default function App() {
  const {
    user,
    soundMuted,
    activeRound,
    localLeaderboard,
    newUnlockedBadgeId,
    startRound,
    submitAnswer,
    nextQuestion,
    quitRound,
    toggleSound,
    setDisplayName,
    resetProgress,
  } = useQuizStore();

  const [selectedRegion, setSelectedRegion] = useState<RegionId>('south-luangwa');
  const [showBadges, setShowBadges] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Return to home screen and close any open modals
  const handleGoHome = () => {
    quitRound();
    setShowBadges(false);
    setShowLeaderboard(false);
    setShowProfile(false);
  };

  // Daily Challenge check
  const todayDateStr = new Date().toISOString().split('T')[0];
  const isDailyCompletedToday = user.lastDailyCompletedDate === todayDateStr;

  const handleStartStandardQuiz = (regionId: RegionId) => {
    startRound(regionId, 'standard');
  };

  const handleStartDailyChallenge = () => {
    startRound('all-zambia', 'daily');
  };

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-stone-900 flex flex-col selection:bg-amber-300 selection:text-stone-950 font-sans">
      {/* Zambian Flag Inspired Heritage Strip */}
      <div className="w-full h-1 flex">
        <div className="flex-1 bg-[#198a3e]" title="Green: Flora & natural resources" />
        <div className="w-16 bg-[#de2010]" title="Red: Struggle for freedom" />
        <div className="w-16 bg-[#000000]" title="Black: The Zambian people" />
        <div className="w-16 bg-[#ef7d00]" title="Orange: Mineral wealth" />
      </div>

      {/* Main App Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#1b4d31] text-white border-b border-[#143622] shadow-md px-3 py-2.5 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Brand Logo & Name (Click to return to Home) */}
          <button
            id="brand-header"
            onClick={handleGoHome}
            aria-label="Luangwa Legends - Return to Home Screen"
            title="Return to Home Screen"
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none text-left bg-transparent border-0 p-1 -ml-1 rounded-xl hover:bg-white/10 active:scale-98 transition focus:outline-hidden focus:ring-2 focus:ring-amber-400 group shrink min-w-0"
          >
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 shadow-sm font-black transition group-hover:scale-105 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-lg font-black font-display tracking-tight text-amber-300 truncate">
                  Luangwa Legends
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-sm bg-amber-500/20 text-amber-300 border border-amber-400/30 hidden sm:inline-block shrink-0">
                  Zambia Safari
                </span>
              </div>
              <p className="text-[10px] text-stone-300 font-medium -mt-0.5 truncate">
                Wildlife & Conservation Quiz
              </p>
            </div>
          </button>

          {/* Action Icons / Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Dedicated Home Button */}
            <button
              id="header-home-btn"
              onClick={handleGoHome}
              aria-label="Return to Home Screen"
              title="Return to Home Screen"
              className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl transition flex items-center gap-1.5 font-bold text-xs ${
                activeRound
                  ? 'bg-amber-500 text-stone-950 shadow-md hover:bg-amber-400 active:scale-98 animate-pulse sm:animate-none'
                  : !showBadges && !showLeaderboard && !showProfile
                  ? 'bg-white/15 text-amber-300 border border-amber-400/30'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-xs">Home</span>
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Sound Toggle Button */}
            <button
              id="sound-toggle-btn"
              onClick={toggleSound}
              aria-label={soundMuted ? 'Unmute safari sounds' : 'Mute safari sounds'}
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition"
              title={soundMuted ? 'Sound Muted' : 'Sound Enabled'}
            >
              {soundMuted ? (
                <VolumeX className="w-4 h-4 text-stone-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-300" />
              )}
            </button>

            {/* Badges / Trophies Showcase Button */}
            <button
              id="open-badges-btn"
              onClick={() => setShowBadges(true)}
              aria-label="View Safari Trophies"
              className="relative p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition"
              title="Safari Badges"
            >
              <Award className="w-4 h-4 text-amber-300" />
              {user.unlockedBadges.length > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-950 font-extrabold text-[9px] shadow-xs">
                  {user.unlockedBadges.length}
                </span>
              )}
            </button>

            {/* Leaderboard Button */}
            <button
              id="open-leaderboard-btn"
              onClick={() => setShowLeaderboard(true)}
              aria-label="Open Leaderboard"
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition"
              title="Leaderboard"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
            </button>

            {/* User Profile Button */}
            <button
              id="open-profile-btn"
              onClick={() => setShowProfile(true)}
              aria-label="Open Explorer Profile"
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition"
              title="Explorer Profile"
            >
              <UserIcon className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-5 flex flex-col">
        {activeRound ? (
          activeRound.isComplete ? (
            /* Results Screen */
            <ResultsView
              round={activeRound}
              user={user}
              newBadgeId={newUnlockedBadgeId}
              onPlayAgain={() => startRound(activeRound.regionId, activeRound.mode)}
              onGoHome={() => quitRound()}
              onOpenLeaderboard={() => setShowLeaderboard(true)}
            />
          ) : (
            /* Active Question Screen */
            <QuizQuestion
              question={activeRound.questions[activeRound.currentIndex]}
              currentIndex={activeRound.currentIndex}
              totalQuestions={activeRound.questions.length}
              score={activeRound.score}
              streak={activeRound.streak}
              selectedAnswer={activeRound.selectedAnswer}
              isAnswered={activeRound.isAnswered}
              isCorrect={activeRound.isCorrect}
              timeRemaining={activeRound.timeRemaining}
              onSelectAnswer={submitAnswer}
              onNextQuestion={nextQuestion}
              onQuit={quitRound}
            />
          )
        ) : (
          /* Home Screen */
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Daily Dawn Patrol Challenge Hero Banner */}
            <div
              id="daily-challenge-card"
              className="w-full bg-linear-to-r from-amber-500 via-amber-600 to-orange-600 rounded-2xl p-4 text-stone-950 shadow-md border border-amber-400/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden"
            >
              <div className="z-10">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-stone-950/80">
                  <Sun className="w-4 h-4" />
                  <span>Dawn Patrol • Daily Safari Challenge</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black font-display text-stone-950 mt-0.5">
                  Today’s Zambian Bush Expedition
                </h2>
                <p className="text-xs text-stone-900/90 font-medium max-w-md mt-0.5">
                  10 synchronized questions testing wildlife knowledge across all Zambia. Same questions for every scout today!
                </p>
              </div>

              <div className="z-10 flex-shrink-0 w-full sm:w-auto">
                {isDailyCompletedToday ? (
                  <div className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-950/20 text-stone-950 font-bold text-xs border border-stone-950/20">
                    <CheckCircle className="w-4 h-4 text-stone-950" />
                    <span>Completed for Today!</span>
                  </div>
                ) : (
                  <button
                    id="start-daily-challenge-btn"
                    onClick={handleStartDailyChallenge}
                    className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-stone-950 hover:bg-stone-900 text-amber-300 font-bold text-xs shadow-md transition transform active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Play Today's Challenge</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Player Status Strip */}
            <div className="w-full flex items-center justify-between bg-white rounded-xl p-3 border border-stone-200/90 shadow-xs text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1b4d31] text-amber-300 flex items-center justify-center font-bold">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-stone-900">{user.displayName}</span>
                    <button
                      id="edit-name-quick-btn"
                      onClick={() => setShowProfile(true)}
                      className="text-[10px] text-amber-700 hover:underline font-semibold"
                    >
                      (Edit)
                    </button>
                  </div>
                  <span className="text-[11px] text-stone-500">
                    {user.totalQuizzesPlayed} Expeditions Completed
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    High Score
                  </span>
                  <span className="font-bold font-display text-sm text-amber-700">
                    {user.highestScore}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Badges
                  </span>
                  <span className="font-bold font-display text-sm text-[#1b4d31]">
                    {user.unlockedBadges.length}/9
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Zambia Map & Park Selection Section */}
            <ZambiaMap
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              onStartQuiz={handleStartStandardQuiz}
            />

            {/* Educational Zambian Wildlife & Conservation Notice */}
            <div className="w-full max-w-lg mx-auto p-4 rounded-2xl bg-[#e8f1eb]/70 border border-[#1b4d31]/15 text-stone-800 text-xs leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#1b4d31]">
                <Trees className="w-4 h-4 text-[#1b4d31]" />
                <span>Conserving the Luangwa Valley & Zambia's Wilderness</span>
              </div>
              <p className="text-stone-600">
                South Luangwa National Park is celebrated worldwide as the birth place of the walking safari. It boasts one of Africa’s highest densities of leopards, Thornicroft’s giraffes, and hippos.
              </p>
              <div className="pt-2 border-t border-[#1b4d31]/10 flex items-center justify-between text-[11px] text-stone-500">
                <span>Wildlife data curated from Zambian conservation scouts</span>
                <span className="font-semibold text-emerald-800">100% Offline Capable</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* App Footer */}
      <footer
        id="app-footer"
        className="mt-auto border-t border-stone-200/80 bg-stone-100/70 py-4 px-4 text-xs text-stone-600"
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <p className="font-semibold text-stone-700">
              Copyright © {new Date().getFullYear()} Ongani Clement Zulu and Milton Zachary Mizinga
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Luangwa Legends · Zambia Wildlife & Conservation Safari Quiz
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              id="report-problem-btn"
              href="mailto:zuluongani@gmail.com?subject=Luangwa%20Legends%20App%20-%20Problem%20Report&body=Hello%20Ongani%2C%0A%0AI%20would%20like%20to%20report%20a%20problem%20with%20the%20Luangwa%20Legends%20app%3A%0A%0A%5BPlease%20describe%20the%20issue%20here%5D"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-200/80 hover:bg-stone-300 active:scale-95 text-stone-700 hover:text-stone-900 font-semibold text-xs border border-stone-300 transition shadow-2xs"
              title="Report an issue to zuluongani@gmail.com"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
              <span>Report a Problem</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Persistent Offline Status Indicator */}
      <OfflineIndicator />

      {/* Modals */}
      {showBadges && (
        <BadgeModal
          unlockedBadgeIds={user.unlockedBadges}
          onClose={() => setShowBadges(false)}
        />
      )}

      {showLeaderboard && (
        <LeaderboardView
          localEntries={localLeaderboard}
          currentUserId={user.uid}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {showProfile && (
        <ProfileModal
          user={user}
          onUpdateName={setDisplayName}
          onResetProgress={resetProgress}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}
