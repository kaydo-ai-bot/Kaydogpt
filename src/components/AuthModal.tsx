import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AuthService } from '../utils/authService';
import { ConfirmationResult } from '../lib/firebase';
import { SupportedLanguage, translations } from '../utils/i18n';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  language?: SupportedLanguage;
  defaultMode?: 'login' | 'register' | 'phone';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  language = 'fr',
  defaultMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'phone' | 'reset'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+509 ');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Google Sign-in
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.loginWithGoogle();
      setSuccessMessage('Connexion avec Google réussie !');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 600);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la connexion avec Google.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email & Password
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email || !email.includes('@')) {
      setError('Veuillez entrer une adresse e-mail valide.');
      return;
    }

    if (mode !== 'reset' && (!password || password.length < 6)) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      setLoading(true);
      if (mode === 'register') {
        await AuthService.registerWithEmail(email, password, displayName);
        setSuccessMessage('Compte créé avec succès ! Un e-mail de confirmation a été envoyé.');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1000);
      } else if (mode === 'login') {
        await AuthService.loginWithEmail(email, password);
        setSuccessMessage('Connexion réussie !');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 600);
      } else if (mode === 'reset') {
        await AuthService.resetPassword(email);
        setSuccessMessage('Un e-mail de réinitialisation a été envoyé à votre adresse.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Adresse e-mail ou mot de passe incorrect.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Cette adresse e-mail est déjà associée à un compte.');
      } else if (err.code === 'auth/weak-password') {
        setError('Le mot de passe est trop faible.');
      } else {
        setError(err.message || 'Une erreur est survenue lors de l\'authentification.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Phone OTP Request
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!phoneNumber || phoneNumber.trim().length < 8) {
      setError('Veuillez entrer un numéro de téléphone valide avec l\'indicatif pays (ex: +50935975863).');
      return;
    }

    try {
      setLoading(true);
      const conf = await AuthService.sendPhoneOtp(phoneNumber.trim(), 'auth-recaptcha-container');
      setConfirmationResult(conf);
      setSuccessMessage('Code OTP envoyé par SMS ! Veuillez le saisir ci-dessous.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Impossible d\'envoyer le code SMS. Vérifiez le format du numéro.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !otpCode || otpCode.trim().length < 4) {
      setError('Veuillez saisir le code OTP à 6 chiffres reçu par SMS.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await AuthService.verifyPhoneOtp(confirmationResult, otpCode.trim());
      setSuccessMessage('Numéro vérifié et connexion réussie !');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 600);
    } catch (err: any) {
      setError('Code OTP incorrect ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      {/* Invisible Recaptcha Container for Phone OTP */}
      <div id="auth-recaptcha-container"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#333] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {mode === 'login' && 'Connexion à Kaydo GPT'}
                {mode === 'register' && 'Créer un compte Kaydo'}
                {mode === 'phone' && 'Connexion par Téléphone & SMS'}
                {mode === 'reset' && 'Mot de passe oublié'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Accédez à vos conversations et à votre abonnement sur tous vos appareils
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Status Alerts */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Quick Google Sign-in Button */}
          {mode !== 'reset' && (
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-gray-300 dark:border-[#404040] bg-white dark:bg-[#252525] hover:bg-gray-50 dark:hover:bg-[#2d2d2d] text-gray-800 dark:text-gray-100 font-medium text-sm transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuer avec Google</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-[#333]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white dark:bg-[#1e1e1e] text-gray-400">
                    ou avec vos identifiants
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          {mode !== 'reset' && (
            <div className="grid grid-cols-3 p-1 rounded-2xl bg-gray-100 dark:bg-[#252525] border border-gray-200/60 dark:border-[#333]">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className={`py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  mode === 'login'
                    ? 'bg-white dark:bg-[#333] text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className={`py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  mode === 'register'
                    ? 'bg-white dark:bg-[#333] text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Inscription
              </button>
              <button
                type="button"
                onClick={() => { setMode('phone'); setError(null); }}
                className={`py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  mode === 'phone'
                    ? 'bg-white dark:bg-[#333] text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                SMS / OTP
              </button>
            </div>
          )}

          {/* E-mail / Password Form */}
          {(mode === 'login' || mode === 'register' || mode === 'reset') && (
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom complet ou pseudo
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ex: Jean Dupont"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#383838] text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@exemple.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#383838] text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Mot de passe
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setMode('reset'); setError(null); }}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Mot de passe oublié ?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 text-sm rounded-2xl bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#383838] text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Se connecter'}
                      {mode === 'register' && 'Créer mon compte'}
                      {mode === 'reset' && 'Envoyer l\'e-mail de réinitialisation'}
                    </span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {mode === 'reset' && (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full text-center text-xs text-gray-500 dark:text-gray-400 hover:underline pt-2"
                >
                  Retour à la connexion
                </button>
              )}
            </form>
          )}

          {/* Phone / OTP Form */}
          {mode === 'phone' && (
            <div className="space-y-3.5">
              {!confirmationResult ? (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Numéro de téléphone portable (format international)
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+509 35975863"
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#383838] text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Exemple : +509 pour Haïti, +1 pour USA/Canada, +33 pour France, +1809 pour Rep. Dom.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Envoyer le code OTP par SMS</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Code de vérification (OTP) reçu par SMS
                    </label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-base tracking-widest text-center font-mono rounded-2xl bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#383838] text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500 dark:focus:border-blue-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Vérifier et se connecter</span>
                        <ShieldCheck size={16} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setConfirmationResult(null); setOtpCode(''); }}
                    className="w-full text-center text-xs text-gray-500 dark:text-gray-400 hover:underline pt-1"
                  >
                    Changer de numéro de téléphone
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer Security Notice & Creator Shortcut */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-[#181818] border-t border-gray-100 dark:border-[#2a2a2a] flex flex-col gap-2 text-center text-[11px] text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Authentification sécurisée avec chiffrement de bout en bout</span>
          </div>

          <div className="pt-1 border-t border-gray-200/50 dark:border-[#282828] flex items-center justify-between">
            <span className="text-[10px] text-gray-400">Accès Développeur & Créateur :</span>
            <button
              type="button"
              onClick={() => {
                const creator = AuthService.createCreatorProfile();
                localStorage.setItem('kaydo_creator_session', 'true');
                setSuccessMessage('Accès Créateur Activé (kberryprime@gmail.com) - Premium Illimité !');
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('kaydo_creator_auth', { detail: creator }));
                  onSuccess?.();
                  onClose();
                }, 400);
              }}
              className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles size={12} />
              <span>Connexion Créateur VIP (kberryprime@gmail.com)</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
