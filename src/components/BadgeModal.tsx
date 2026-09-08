import React from 'react';
import { BADGES } from '../data/badges';
import {
  X,
  Award,
  Lock,
  Compass,
  Feather,
  Crown,
  Shield,
  Waves,
  HeartHandshake,
  Zap,
  Flame,
  Sun,
  Trophy,
} from 'lucide-react';

interface BadgeModalProps {
  unlockedBadgeIds: string[];
  onClose: () => void;
}

const BADGE_ICONS: Record<string, React.ElementType> = {
  Compass,
  Feather,
  Crown,
  Shield,
  Waves,
  HeartHandshake,
  Zap,
  Flame,
  Sun,
  Trophy,
};

export const BadgeModal: React.FC<BadgeModalProps> = ({ unlockedBadgeIds, onClose }) => {
  const unlockedSet = new Set(unlockedBadgeIds);
  const totalBadges = BADGES.length;
  const unlockedCount = unlockedSet.size;
  const progressPercent = Math.round((unlockedCount / totalBadges) * 100);

  return (
    <div
      id="badge-showcase-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md max-h-[85vh] bg-[#fbf9f4] rounded-2xl border border-[#1b4d31]/20 shadow-2xl flex flex-col overflow-hidden text-stone-900">
        {/* Header */}
        <div className="p-4 bg-linear-to-r from-[#143622] to-[#1b4d31] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500 text-stone-950 shadow">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-display text-base text-amber-300">
                Safari Trophy Collection
              </h3>
              <p className="text-xs text-stone-300">
                {unlockedCount} of {totalBadges} Badges Unlocked ({progressPercent}%)
              </p>
            </div>
          </div>

          <button
            id="close-badge-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-stone-200">
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Badges Grid */}
        <div className="p-4 overflow-y-auto space-y-3">
          {BADGES.map((badge) => {
            const isUnlocked = unlockedSet.has(badge.id);
            const IconComponent = BADGE_ICONS[badge.iconName] || Award;

            return (
              <div
                key={badge.id}
                id={`badge-item-${badge.id}`}
                className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                  isUnlocked
                    ? 'bg-white border-amber-400/60 shadow-xs'
                    : 'bg-stone-100/70 border-stone-200/80 opacity-60'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                    isUnlocked
                      ? 'bg-linear-to-br from-[#1b4d31] to-[#24643f] text-amber-300'
                      : 'bg-stone-300 text-stone-500'
                  }`}
                >
                  {isUnlocked ? (
                    <IconComponent className="w-5 h-5" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold font-display text-sm text-stone-900">
                      {badge.name}
                    </h4>
                    {isUnlocked ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        Spotted
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200 text-stone-600 font-medium">
                        Locked
                      </span>
                    )}
                  </div>

                  {badge.scientificName && (
                    <span className="text-[10px] italic text-stone-500 block">
                      {badge.scientificName}
                    </span>
                  )}

                  <p className="text-xs text-stone-600 mt-1 leading-snug">
                    {badge.description}
                  </p>

                  <div className="mt-2 text-[10px] font-semibold text-amber-800 bg-amber-500/10 px-2 py-0.5 rounded-md inline-block">
                    Requirement: {badge.unlockRequirement}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            id="dismiss-badges-btn"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#1b4d31] text-amber-300 hover:bg-[#143622] font-bold text-xs shadow transition"
          >
            Close Trophy Room
          </button>
        </div>
      </div>
    </div>
  );
};
