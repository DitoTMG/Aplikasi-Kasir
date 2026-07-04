import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, CheckCircle2 } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md bg-slate-900/95 backdrop-blur-md text-white border border-indigo-500/30 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between space-x-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30">
          <Smartphone className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 space-y-1">
          <h4 className="font-extrabold text-sm flex items-center space-x-1.5">
            <span>Install QasirToko PWA</span>
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
              HP & Tablet
            </span>
          </h4>
          <p className="text-xs text-slate-300">
            Install sebagai aplikasi mandiri di HP atau Tablet Anda tanpa buka browser lagi!
          </p>

          <div className="pt-2 flex items-center space-x-2">
            <button
              onClick={handleInstallClick}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Sekarang</span>
            </button>

            <button
              onClick={() => setShowPrompt(false)}
              className="text-xs font-bold text-slate-400 hover:text-white px-3 py-2 rounded-xl transition cursor-pointer"
            >
              Nanti Saja
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowPrompt(false)}
          className="text-slate-400 hover:text-white transition cursor-pointer p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
