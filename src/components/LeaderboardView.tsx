import React, { useState, useEffect } from 'react';
import {
  Trophy,
  X,
  Globe,
  MapPin,
  Flame,
  CheckCircle,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { LeaderboardEntry } from '../types';
import {
  fetchGlobalLeaderboard,
  signInWithGoogle,
  signOutUser,
  subscribeToAuth,
  isFirebaseConfigured,
} from '../lib/firebase';
import type { User } from 'firebase/auth';

interface LeaderboardViewProps {
  localEntries: LeaderboardEntry[];
  currentUserId: string;
  onClose: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  localEntries,
  currentUserId,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'local' | 'global'>('local');
  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntry[]>([]);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const loadGlobal = async () => {
    setActiveTab('global');
    if (globalEntries.length === 0) {
      setLoadingGlobal(true);
      try {
        const scores = await fetchGlobalLeaderboard(25);
        setGlobalEntries(scores);
      } catch (e) {
        console.warn('Could not fetch global leaderboard:', e);
      } finally {
        setLoadingGlobal(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.warn('Login error:', e);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
  };

  const currentList = activeTab === 'local' ? localEntries : globalEntries;

  return (
    <div
      id="leaderboard-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md max-h-[85vh] bg-[#fbf9f4] rounded-2xl border border-[#1b4d31]/20 shadow-2xl flex flex-col overflow-hidden text-stone-900">
        {/* Header */}
        <div className="p-4 bg-linear-to-r from-[#143622] to-[#1b4d31] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500 text-stone-950 shadow">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-display text-base text-amber-300">
                Safari Ranger Leaderboard
              </h3>
              <p className="text-xs text-stone-300">Top wildlife trackers across Zambia</p>
            </div>
          </div>

          <button
            id="close-leaderboard-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Local vs Global */}
        <div className="flex border-b border-stone-200 bg-stone-100 p-1">
          <button
            id="tab-local-leaderboard"
            onClick={() => setActiveTab('local')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'local'
                ? 'bg-white text-[#1b4d31] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Local Scores ({localEntries.length})</span>
          </button>

          <button
            id="tab-global-leaderboard"
            onClick={loadGlobal}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'global'
                ? 'bg-white text-[#1b4d31] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Global Rangers (Cloud)</span>
          </button>
        </div>

        {/* Account banner (Google Auth) */}
        <div className="p-2.5 px-4 bg-amber-50 border-b border-amber-200/80 flex items-center justify-between text-xs">
          {currentUser ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-[#1b4d31]" />
                <span className="font-medium text-stone-800">
                  Signed in as <strong>{currentUser.displayName || currentUser.email || 'Explorer'}</strong>
                </span>
              </div>
              <button
                id="sign-out-btn"
                onClick={handleSignOut}
                className="text-stone-500 hover:text-stone-900 font-semibold flex items-center gap-1 text-[11px]"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-stone-600 text-[11px]">
                {isFirebaseConfigured ? 'Sign in to sync rank across devices' : 'Playing in offline-ready local mode'}
              </span>
              {isFirebaseConfigured ? (
                <button
                  id="google-signin-btn"
                  onClick={handleGoogleSignIn}
                  className="px-2.5 py-1 rounded-lg bg-[#1b4d31] text-amber-300 hover:bg-[#143622] font-bold text-[11px] flex items-center gap-1 shadow-xs"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Google Sign In</span>
                </button>
              ) : null}
            </div>
          )}
        </div>

        {/* Score list */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {loadingGlobal ? (
            <div className="py-12 flex flex-col items-center justify-center text-stone-500 text-xs">
              <div className="w-6 h-6 border-2 border-[#1b4d31] border-t-transparent rounded-full animate-spin mb-2" />
              <span>Contacting Luangwa Ranger Outpost...</span>
            </div>
          ) : currentList.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-stone-500 text-xs px-4">
              <Trophy className="w-8 h-8 text-stone-300 mb-2" />
              <p className="font-bold text-stone-700">No expeditions recorded yet</p>
              <p className="mt-1">Play a safari quiz to secure your name on the hall of fame!</p>
            </div>
          ) : (
            currentList.map((entry, idx) => {
              const isCurrentUser = entry.userId === currentUserId;
              const isTop3 = idx < 3;

              return (
                <div
                  key={entry.id || idx}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition ${
                    isCurrentUser
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-xs'
                      : isTop3
                      ? 'bg-white border-amber-300 shadow-xs'
                      : 'bg-white border-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                        idx === 0
                          ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-300'
                          : idx === 1
                          ? 'bg-stone-300 text-stone-800'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold font-display text-sm text-stone-900">
                          {entry.displayName}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#1b4d31] text-amber-300 font-extrabold">
                            YOU
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                        <span className="capitalize">{entry.region.replace('-', ' ')}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-emerald-700 font-semibold">
                          <CheckCircle className="w-2.5 h-2.5" />
                          {entry.accuracy}% Acc
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black font-display text-base text-amber-700">
                      {entry.score}
                    </span>
                    <span className="text-[10px] block text-stone-400 font-medium">points</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            id="dismiss-leaderboard-btn"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#1b4d31] text-amber-300 hover:bg-[#143622] font-bold text-xs shadow transition"
          >
            Close Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};
