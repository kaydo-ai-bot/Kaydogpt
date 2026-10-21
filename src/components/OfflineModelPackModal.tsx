import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  WifiOff,
  Download,
  CheckCircle2,
  Cpu,
  HardDrive,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  Check,
  AlertCircle,
  HelpCircle,
  FileCode,
  Globe,
  Calculator,
} from 'lucide-react';
import { UserProfile } from '../types';
import { generateOfflineAnswer, OFFLINE_KNOWLEDGE_BASE } from '../utils/offlineEngine';

interface OfflineModelPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onOpenPremium: () => void;
  isDownloaded: boolean;
  onSetDownloaded: (val: boolean) => void;
}

export const OfflineModelPackModal: React.FC<OfflineModelPackModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenPremium,
  isDownloaded,
  onSetDownloaded,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(isDownloaded ? 100 : 0);
  const [testPrompt, setTestPrompt] = useState('2x + 6 = 18');
  const [testOutput, setTestOutput] = useState<string | null>(null);

  useEffect(() => {
    if (isDownloaded) setProgress(100);
  }, [isDownloaded]);

  if (!isOpen) return null;

  const isPremium = true;

  const handleStartDownload = () => {
    setDownloading(true);
    setProgress(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 15;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setDownloading(false);
        onSetDownloaded(true);
        try {
          localStorage.setItem('kaydo_offline_pack_downloaded', 'true');
        } catch (e) {}
      }
      setProgress(current);
    }, 180);
  };

  const handleRunOfflineTest = () => {
    if (!testPrompt.trim()) return;
    const res = generateOfflineAnswer(testPrompt);
    setTestOutput(res);
  };

  return (
    <div id="offline-model-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#333] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <WifiOff size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Moteur IA Hors-Ligne Gratuit</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-wider">
                  100% Inclus
                </span>
              </div>
              <p className="text-xs text-amber-100">
                Exécutez des calculs, du code et des réponses générales sans connexion Internet
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
            <>
              {/* Storage & Engine Status */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#252525] border border-gray-200/80 dark:border-[#383838] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <HardDrive size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                      Pack IA Universel Kaydo v2
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Taille : ~2.4 Mo • Base de connaissances + Moteur logique embarqué
                    </p>
                  </div>
                </div>

                {isDownloaded ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    <CheckCircle2 size={14} />
                    <span>Installé</span>
                  </span>
                ) : (
                  <button
                    onClick={handleStartDownload}
                    disabled={downloading}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    <Download size={14} />
                    <span>{downloading ? 'Téléchargement...' : 'Télécharger'}</span>
                  </button>
                )}
              </div>

              {/* Progress bar */}
              {downloading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Mise en cache du modèle local...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-amber-500 transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Capabilities notice */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-[#1a2332] border border-blue-100 dark:border-[#2a3a50] space-y-2 text-xs">
                <h4 className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <HelpCircle size={14} />
                  <span>Capacités du Mode Hors-Ligne local :</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <Check size={12} className="text-emerald-500" />
                    <span>Calculs mathématiques & équations</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check size={12} className="text-emerald-500" />
                    <span>Génération de code TypeScript/Python</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check size={12} className="text-emerald-500" />
                    <span>Connaissances encyclopédiques clés</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check size={12} className="text-emerald-500" />
                    <span>Rédaction de courriels & lettres</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-400 italic pt-1">
                  * Note : La recherche web Google 2026 en direct et la génération d'images nécessitent un accès Internet.
                </p>
              </div>

              {/* Interactive offline test bench */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#383838] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                    Tester le moteur local instantanément :
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTestPrompt('3x + 12 = 30')}
                      className="px-2 py-1 text-[10px] rounded-lg bg-gray-200 dark:bg-[#333] hover:bg-gray-300 text-gray-700 dark:text-gray-300"
                    >
                      Équation
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestPrompt('Théorème de Pythagore')}
                      className="px-2 py-1 text-[10px] rounded-lg bg-gray-200 dark:bg-[#333] hover:bg-gray-300 text-gray-700 dark:text-gray-300"
                    >
                      Pythagore
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestPrompt('Composant React useState')}
                      className="px-2 py-1 text-[10px] rounded-lg bg-gray-200 dark:bg-[#333] hover:bg-gray-300 text-gray-700 dark:text-gray-300"
                    >
                      React
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    placeholder="Saisissez une question..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#383838] text-gray-900 dark:text-gray-100 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleRunOfflineTest}
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Play size={12} />
                    <span>Tester</span>
                  </button>
                </div>

                {testOutput && (
                  <div className="p-3 rounded-xl bg-white dark:bg-[#1c1c1c] border border-gray-200/80 dark:border-[#333] text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap max-h-48 overflow-y-auto font-sans leading-relaxed">
                    {testOutput}
                  </div>
                )}
              </div>
            </>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-[#181818] border-t border-gray-200 dark:border-[#2a2a2a] text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-[#333] text-gray-800 dark:text-gray-200 text-xs font-semibold hover:bg-gray-300 dark:hover:bg-[#404040] cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
};
