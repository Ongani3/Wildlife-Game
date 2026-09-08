import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  X,
  User as UserIcon,
  Trophy,
  Flame,
  CheckCircle2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface ProfileModalProps {
  user: UserProfile;
  onUpdateName: (name: string) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  onUpdateName,
  onResetProgress,
  onClose,
}) => {
  const [nameInput, setNameInput] = useState(user.displayName);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdateName(nameInput.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const accuracy =
    user.totalQuestionsAnswered > 0
      ? Math.round((user.totalCorrect / user.totalQuestionsAnswered) * 100)
      : 0;

  return (
    <div
      id="profile-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-[#fbf9f4] rounded-2xl border border-[#1b4d31]/20 shadow-2xl flex flex-col overflow-hidden text-stone-900">
        {/* Header */}
        <div className="p-4 bg-linear-to-r from-[#143622] to-[#1b4d31] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500 text-stone-950 shadow">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-display text-base text-amber-300">
                Explorer Profile
              </h3>
              <p className="text-xs text-stone-300">Personal safari statistics</p>
            </div>
          </div>

          <button
            id="close-profile-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Edit Display Name Form */}
          <form onSubmit={handleSave} className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
              Ranger Call-Sign / Name
            </label>
            <div className="flex gap-2">
              <input
                id="player-name-input"
                type="text"
                maxLength={25}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1b4d31]"
                placeholder="Enter ranger name..."
              />
              <button
                id="save-player-name-btn"
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#1b4d31] text-amber-300 hover:bg-[#143622] font-bold text-xs shadow-sm transition"
              >
                Save
              </button>
            </div>
            {saved && (
              <span className="text-[11px] text-emerald-600 font-semibold block animate-in fade-in">
                Name updated for certificates and leaderboard!
              </span>
            )}
          </form>

          {/* Stats Overview */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
              Lifetime Safari Record
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-white border border-stone-200">
                <span className="text-[10px] uppercase font-bold text-stone-400">
                  Expeditions
                </span>
                <p className="text-lg font-bold font-display text-stone-900 mt-0.5">
                  {user.totalQuizzesPlayed}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-stone-200">
                <span className="text-[10px] uppercase font-bold text-stone-400">
                  Highest Score
                </span>
                <div className="flex items-center gap-1 text-amber-700 font-bold font-display text-lg mt-0.5">
                  <Trophy className="w-4 h-4" />
                  <span>{user.highestScore}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-stone-200">
                <span className="text-[10px] uppercase font-bold text-stone-400">
                  Best Streak
                </span>
                <div className="flex items-center gap-1 text-orange-600 font-bold font-display text-lg mt-0.5">
                  <Flame className="w-4 h-4 fill-current" />
                  <span>{user.highestStreak}x</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-stone-200">
                <span className="text-[10px] uppercase font-bold text-stone-400">
                  Total Accuracy
                </span>
                <div className="flex items-center gap-1 text-emerald-700 font-bold font-display text-lg mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{accuracy}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conservation Info */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-600/20 text-stone-800 text-xs leading-relaxed">
            <div className="flex items-center gap-1 font-bold text-[#1b4d31] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zambian Conservation Focus</span>
            </div>
            <p>
              Zambia is home to 20 National Parks and 36 Game Management Areas spanning over 30% of the country. Every quiz you take helps raise awareness for frontline conservation initiatives!
            </p>
          </div>

          {/* Danger zone: reset progress */}
          <div className="pt-2 border-t border-stone-200">
            {confirmReset ? (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 space-y-2 text-xs">
                <p className="font-bold text-red-900">
                  Are you sure you want to reset all quiz stats and unlocked badges?
                </p>
                <div className="flex gap-2">
                  <button
                    id="confirm-reset-stats-btn"
                    onClick={() => {
                      onResetProgress();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition"
                  >
                    Yes, Reset
                  </button>
                  <button
                    id="cancel-reset-stats-btn"
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 py-1.5 rounded-lg bg-stone-200 text-stone-800 font-semibold hover:bg-stone-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="prompt-reset-progress-btn"
                onClick={() => setConfirmReset(true)}
                className="w-full py-2 text-stone-400 hover:text-red-600 text-xs font-semibold flex items-center justify-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Local Progress</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            id="dismiss-profile-btn"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#1b4d31] text-amber-300 hover:bg-[#143622] font-bold text-xs shadow transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
