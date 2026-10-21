import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  User,
  Mail,
  Phone,
  Shield,
  Sparkles,
  Calendar,
  Key,
  Copy,
  Check,
  LogOut,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Settings,
} from 'lucide-react';
import { UserProfile, SubscriptionStatus } from '../types';
import { AuthService } from '../utils/authService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onOpenPremium: () => void;
  onOpenAdmin?: () => void;
  onOpenSettings?: () => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenPremium,
  onOpenAdmin,
  onOpenSettings,
  onLogout,
}) => {
  const [copiedUid, setCopiedUid] = useState(false);

  if (!isOpen || !user) return null;

  const isPremium = true;
  const isAdmin = user.role === 'admin';

  const copyUid = () => {
    navigator.clipboard.writeText(user.uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  return (
    <div id="user-profile-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#333] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Top Header Card */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-md"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold border-2 border-white/20 shadow-md">
                {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
              </div>
            )}

            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{user.displayName || 'Utilisateur'}</span>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/30 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                    <Sparkles size={10} />
                    CRÉATEUR & ADMIN
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-300">{user.email || user.phoneNumber || 'Compte vérifié'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Subscription Status Card */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isAdmin
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
              : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
          }`}>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Statut d'abonnement</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isAdmin ? (
                  <>
                    <Sparkles size={16} className="text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                      Accès Créateur & Admin (Premium à Vie)
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      100% Gratuit & Illimité (Tous modes débloqués)
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => { onClose(); onOpenPremium(); }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs cursor-pointer bg-white dark:bg-[#333] border border-gray-200 dark:border-[#444] text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3d3d3d]"
            >
              Info / Détails
            </button>
          </div>

          {/* User Details Grid */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#252525] border border-gray-200/80 dark:border-[#383838] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Key size={14} />
                <span>Identifiant Unique (UID) :</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] text-gray-700 dark:text-gray-300">
                  {user.uid.slice(0, 12)}...
                </span>
                <button
                  type="button"
                  onClick={copyUid}
                  className="p-1 rounded-md text-gray-400 hover:text-blue-600 transition-colors"
                  title="Copier l'UID"
                >
                  {copiedUid ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            {user.email && (
              <div className="flex items-center justify-between border-t border-gray-200/60 dark:border-[#333] pt-2">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Mail size={14} />
                  <span>E-mail :</span>
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{user.email}</span>
              </div>
            )}

            {user.phoneNumber && (
              <div className="flex items-center justify-between border-t border-gray-200/60 dark:border-[#333] pt-2">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Phone size={14} />
                  <span>Téléphone :</span>
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{user.phoneNumber}</span>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-200/60 dark:border-[#333] pt-2">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Calendar size={14} />
                <span>Membre depuis :</span>
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : new Date().getFullYear().toString()}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200/60 dark:border-[#333] pt-2">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Shield size={14} />
                <span>Méthodes de connexion :</span>
              </span>
              <div className="flex gap-1">
                {user.authProviders?.map((p, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-gray-200 dark:bg-[#333] text-[10px] font-medium text-gray-700 dark:text-gray-300"
                  >
                    {p.replace('.com', '')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Admin Dashboard Quick Access Button if Admin */}
          {isAdmin && onOpenAdmin && (
            <button
              type="button"
              onClick={() => { onClose(); onOpenAdmin(); }}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Shield size={16} />
              <span>Ouvrir le Panneau d'Administration</span>
            </button>
          )}

          {/* Quick Settings Access */}
          {onOpenSettings && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-gray-200 dark:border-[#3a3a3a] hover:bg-gray-50 dark:hover:bg-[#282828] text-gray-700 dark:text-gray-200 font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Settings size={16} />
              <span>Ouvrir les Paramètres</span>
            </button>
          )}

          {/* Logout Button */}
          <button
            type="button"
            onClick={async () => {
              await AuthService.logout();
              onLogout();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-red-200 dark:border-red-800/60 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut size={16} />
            <span>Se déconnecter de ce compte</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
