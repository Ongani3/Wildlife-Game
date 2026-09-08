import React, { useState, useEffect } from 'react';
import { Download, Share, X, CheckCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  useEffect(() => {
    // Detect if already installed / running in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setJustInstalled(true);
      setDeferredPrompt(null);
      setTimeout(() => setJustInstalled(false), 4000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSGuide(true);
      }
      return;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (isInstalled && !justInstalled) {
    return null;
  }

  if (justInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-800/90 text-white text-xs font-semibold shadow">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
        <span>Installed for Offline Safari</span>
      </div>
    );
  }

  return (
    <>
      <button
        id="pwa-install-btn"
        onClick={handleInstallClick}
        aria-label="Install Luangwa Legends Safari App for offline play"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold shadow-md transition transform active:scale-95"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install PWA</span>
      </button>

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div
          id="ios-install-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/75 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-sm rounded-2xl bg-[#fbf9f4] border border-[#1b4d31]/20 p-6 shadow-2xl text-stone-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#1b4d31] text-amber-400">
                  <Share className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold font-display text-[#1b4d31]">
                  Install on iPhone / iPad
                </h3>
              </div>
              <button
                id="close-ios-guide-btn"
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-stone-700 leading-relaxed">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <p>
                  Tap the Safari <strong className="text-stone-900">Share button</strong> (the square with an arrow pointing up at the bottom of your screen).
                </p>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <p>
                  Scroll down the share sheet and tap <strong className="text-stone-900">"Add to Home Screen"</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs">
                  3
                </span>
                <p>
                  Tap <strong className="text-stone-900">Add</strong> in the top right. Play completely offline with full audio in the bush!
                </p>
              </div>
            </div>

            <button
              id="dismiss-ios-guide-btn"
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#1b4d31] text-amber-300 hover:bg-[#143622] font-semibold text-xs shadow transition"
            >
              Got It, Ready for Safari!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
