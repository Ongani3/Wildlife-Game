import React, { useState, useEffect } from 'react';
import { WifiOff, Cloud } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      id="offline-status-banner"
      role="status"
      aria-live="polite"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:w-auto z-40 flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-stone-900/95 text-amber-300 text-xs font-medium border border-amber-500/30 shadow-xl backdrop-blur-xs animate-in slide-in-from-bottom-2 duration-300"
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
        <WifiOff className="w-3.5 h-3.5 text-amber-400" />
        <span>Offline Bush Mode: Playing from local cached questions</span>
      </div>
      <div className="flex items-center gap-1 text-[11px] text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded-md">
        <Cloud className="w-3 h-3" />
        <span>Scores saved locally</span>
      </div>
    </div>
  );
};
