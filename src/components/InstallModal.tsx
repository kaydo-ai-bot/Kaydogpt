import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Apple, X, Check, ArrowRight, Share2, PlusSquare } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#212121] border border-gray-200 dark:border-[#333333] rounded-3xl p-6 shadow-2xl overflow-hidden text-gray-900 dark:text-gray-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2e2e2e] transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header with App Logo */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-blue-600 via-cyan-400 to-purple-600 shadow-md shadow-blue-500/20 shrink-0">
            <img src="/icon.png" alt="Kaydo GPT" className="w-full h-full object-cover rounded-[14px]" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Installer Kaydo GPT</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Application mobile officielle (Android & iOS)</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-gray-100 dark:bg-[#181818] p-1 rounded-xl mb-5">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'android'
                ? 'bg-white dark:bg-[#2e2e2e] text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Smartphone size={15} />
            Android (APK / PWA)
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-[#2e2e2e] text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Apple size={15} />
            iPhone / iPad (iOS)
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'android' ? (
          <div className="space-y-4">
            {deferredPrompt ? (
              <button
                onClick={handleNativeInstall}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/25"
              >
                <Download size={16} />
                Installer directement l'application
              </button>
            ) : null}

            <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-4 border border-gray-100 dark:border-[#2a2a2a] text-xs space-y-3">
              <div className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-[11px]">1</span>
                Installation instantanée sur Android :
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Appuyez sur les <strong className="text-gray-800 dark:text-gray-200">3 points (⋮)</strong> en haut à droite de Chrome, puis cliquez sur <strong className="text-blue-500">« Installer l'application »</strong> ou <strong className="text-blue-500">« Ajouter à l'écran d'accueil »</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl p-4 border border-gray-100 dark:border-[#2a2a2a] text-xs space-y-3">
              <div className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-[11px]">1</span>
                Dans Safari sur votre iPhone :
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed flex items-center gap-1.5">
                Appuyez sur le bouton de partage <Share2 size={14} className="text-blue-500 inline shrink-0" /> (icône carrée avec flèche vers le haut).
              </p>

              <div className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 pt-1">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-[11px]">2</span>
                Ajouter à l'écran :
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed flex items-center gap-1.5">
                Faites défiler et sélectionnez <PlusSquare size={14} className="text-blue-500 inline shrink-0" /> <strong className="text-gray-800 dark:text-gray-200">« Sur l'écran d'accueil »</strong>, puis touchez <strong>« Ajouter »</strong>.
              </p>
            </div>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#2a2a2a] flex items-center justify-between text-xs text-gray-500">
          <span>Mode hors-ligne inclus</span>
          <span className="text-emerald-500 font-medium">✓ Prêt à l'emploi</span>
        </div>
      </div>
    </div>
  );
};
