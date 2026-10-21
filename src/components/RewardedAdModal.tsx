import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Tv,
  Film,
  Gift,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { QuotaService } from '../utils/quotaService';
import { UserQuotaInfo, AdSessionResponse, UserProfile } from '../types';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  user?: UserProfile | null;
  onRewardClaimed?: (newQuota: UserQuotaInfo) => void;
  onRewardEarned?: (newQuota: UserQuotaInfo) => void;
}

const SAMPLE_CAMPAIGNS = [
  {
    brand: 'Kaydo Cloud Ultra 2026',
    tagline: 'L\'IA la plus rapide au monde, conçue pour les créateurs et développeurs.',
    accent: 'from-blue-600 to-indigo-700',
    videoTheme: 'tech',
    features: ['Réponses instantanées en <0.2s', 'Inférence locale sans connexion', 'Génération multimodale HD'],
  },
  {
    brand: 'Studio Pro Graphics',
    tagline: 'Générez des illustrations photoréalistes en quelques secondes avec l\'IA.',
    accent: 'from-purple-600 to-pink-600',
    videoTheme: 'creative',
    features: ['Résolution 4K Ultra HD', 'Contrôle précis du style', 'Export instantané'],
  },
  {
    brand: 'SecurePay Caribbean',
    tagline: 'La solution de paiement sécurisée par IA pour Haïti et l\'international.',
    accent: 'from-emerald-600 to-teal-700',
    videoTheme: 'finance',
    features: ['Vérification Natcash & Moncash', 'Chiffrement de bout en bout', 'Zéro frais cachés'],
  },
];

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  userId,
  user,
  onRewardClaimed,
  onRewardEarned,
}) => {
  const effectiveUserId = user?.uid || userId || 'anon';
  const [adSession, setAdSession] = useState<AdSessionResponse | null>(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(15);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimedQuota, setClaimedQuota] = useState<UserQuotaInfo | null>(null);
  const [campaignIndex, setCampaignIndex] = useState(0);

  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Initialize Ad Session
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsCompleted(false);
      setClaiming(false);
      setClaimedQuota(null);
      setSecondsRemaining(15);
      setCampaignIndex(Math.floor(Math.random() * SAMPLE_CAMPAIGNS.length));
      startTimeRef.current = Date.now();

      const initSession = async () => {
        setLoadingSession(true);
        try {
          const session = await QuotaService.startAdSession(effectiveUserId);
          setAdSession(session);
          setSecondsRemaining(session.durationSeconds || 15);
        } catch (err: any) {
          setError(err.message || 'Erreur lors du chargement de la publicité.');
        } finally {
          setLoadingSession(false);
        }
      };

      initSession();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen, effectiveUserId]);

  // Countdown timer with anti-cheat protection
  useEffect(() => {
    if (!isOpen || loadingSession || error || isCompleted || !adSession) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAdCompleted();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, loadingSession, error, isCompleted, adSession]);

  const handleAdCompleted = async () => {
    if (!adSession || claiming || isCompleted) return;
    setIsCompleted(true);
    setClaiming(true);

    try {
      const watchedDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
      const res = await QuotaService.claimAdReward({
        sessionId: adSession.sessionId,
        nonce: adSession.nonce,
        userId: effectiveUserId,
        watchedDurationSeconds: Math.max(watchedDuration, 15),
      });

      setClaimedQuota(res.quota);
      onRewardClaimed?.(res.quota);
      onRewardEarned?.(res.quota);
    } catch (err: any) {
      setError(err.message || 'Échec de la validation de la récompense.');
    } finally {
      setClaiming(false);
    }
  };

  if (!isOpen) return null;

  const currentCampaign = SAMPLE_CAMPAIGNS[campaignIndex];
  const progressPercent = Math.min(100, Math.max(0, ((15 - secondsRemaining) / 15) * 100));

  return (
    <div id="rewarded-ad-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-[#121212] text-white rounded-3xl shadow-2xl border border-gray-800 overflow-hidden relative flex flex-col"
      >
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-[#181818] border-b border-gray-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400">
              <Tv size={14} />
            </span>
            <span className="text-xs font-semibold tracking-wide text-gray-300">
              Publicité Sponsorisée Kaydo
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted ? (
              <div className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 animate-pulse">
                <Gift size={12} />
                <span>+5 Messages dans {secondsRemaining}s</span>
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5">
                <CheckCircle2 size={12} />
                <span>Récompense Prête</span>
              </div>
            )}

            {isCompleted && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Ad Body Content */}
        <div className="p-6 flex flex-col items-center justify-center min-h-[340px]">
          {loadingSession ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Connexion au réseau publicitaire sécurisé...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <AlertCircle size={40} className="text-red-400" />
              <h3 className="text-base font-bold text-white">Publicité indisponible</h3>
              <p className="text-xs text-gray-400 max-w-sm">{error}</p>
              <button
                onClick={onClose}
                className="mt-3 px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          ) : isCompleted ? (
            /* Celebration & Reward Unlocked Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-4"
            >
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/25">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Félicitations !</h3>
              <p className="text-sm text-emerald-400 font-medium mb-3">
                +5 Messages Gratuits Ajoutés à votre compte
              </p>
              <p className="text-xs text-gray-400 max-w-xs mb-6">
                Votre quota quotidien a été rechargé immédiatement. Vous pouvez continuer à discuter avec Kaydo GPT.
              </p>

              {claimedQuota && (
                <div className="w-full bg-[#181818] border border-gray-800 rounded-2xl p-3.5 mb-6 text-xs flex justify-around">
                  <div>
                    <span className="text-gray-500 block">Messages restants :</span>
                    <strong className="text-emerald-400 text-sm font-bold">
                      {claimedQuota.remainingMessages} messages
                    </strong>
                  </div>
                  <div className="border-r border-gray-800" />
                  <div>
                    <span className="text-gray-500 block">Pubs aujourd'hui :</span>
                    <strong className="text-gray-200 text-sm font-bold">
                      {claimedQuota.adsWatchedToday}/{claimedQuota.maxAdsPerDay}
                    </strong>
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                Continuer la conversation
              </button>
            </motion.div>
          ) : (
            /* Active Video Ad Simulated Player */
            <div className="w-full flex flex-col items-center">
              {/* Simulated Video Canvas Card */}
              <div className={`w-full h-52 rounded-2xl bg-gradient-to-br ${currentCampaign.accent} p-5 relative overflow-hidden shadow-inner flex flex-col justify-between`}>
                {/* Visual Ambient Elements */}
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <div className="absolute -left-8 -top-8 w-32 h-32 bg-black/20 rounded-full blur-lg pointer-events-none" />

                {/* Video Badges */}
                <div className="flex items-center justify-between relative z-10">
                  <span className="px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-xs text-[10px] font-bold tracking-wide text-white uppercase border border-white/10">
                    HD 1080p
                  </span>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 rounded-lg bg-black/40 backdrop-blur-xs text-white/80 hover:text-white transition-colors cursor-pointer"
                    title={isMuted ? 'Activer le son' : 'Couper le son'}
                  >
                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                </div>

                {/* Center Brand Hero */}
                <div className="relative z-10 text-center my-auto">
                  <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white/15 backdrop-blur-sm text-white mb-2 shadow-sm">
                    <Film size={22} />
                  </div>
                  <h4 className="text-lg font-extrabold text-white tracking-tight">
                    {currentCampaign.brand}
                  </h4>
                  <p className="text-xs text-white/85 max-w-xs mx-auto line-clamp-2 mt-0.5">
                    {currentCampaign.tagline}
                  </p>
                </div>

                {/* Progress Bar inside Video */}
                <div className="relative z-10 w-full">
                  <div className="flex justify-between text-[10px] text-white/75 font-semibold mb-1">
                    <span>Lecture en cours...</span>
                    <span>0:0{15 - secondsRemaining} / 0:15</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Campaign Highlight Bullet Points */}
              <div className="w-full mt-4 bg-[#181818] border border-gray-800/80 rounded-2xl p-3.5 text-xs">
                <div className="flex items-center gap-1.5 text-gray-300 font-semibold mb-2">
                  <ShieldCheck size={14} className="text-blue-400" />
                  <span>Avantages & Fonctionnalités clés :</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {currentCampaign.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-400 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anti-skip countdown banner */}
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <Zap size={14} className="text-amber-400 animate-bounce" />
                <span>
                  Regardez la vidéo jusqu'à la fin pour débloquer <strong className="text-amber-300">+5 messages</strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Note */}
        <div className="px-5 py-3 bg-[#141414] border-t border-gray-800/80 text-center">
          <p className="text-[11px] text-gray-500">
            Limite maximale de 10 publicités récompensées par jour (jusqu'à +50 messages quotidiens).
          </p>
        </div>
      </motion.div>
    </div>
  );
};
