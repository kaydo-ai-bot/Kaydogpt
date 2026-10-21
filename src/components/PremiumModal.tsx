import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Check,
  Zap,
  Brain,
  WifiOff,
  FolderKanban,
  Download,
  Clock,
  ShieldCheck,
  ArrowRight,
  Phone,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  Coins,
  Bot,
  FileText,
  Upload,
  Image as ImageIcon,
  Copy,
  Info,
  Globe2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, SubscriptionRecord, SubscriptionStatus, PaymentCurrency } from '../types';
import {
  SubscriptionService,
  PREMIUM_PRICE_USD,
  PREMIUM_PRICE_HTG,
  PREMIUM_PRICE_EUR,
} from '../utils/subscriptionService';
import { SupportedLanguage, translations } from '../utils/i18n';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onSubscriptionUpdated: (status: SubscriptionStatus) => void;
  language?: SupportedLanguage;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenAuth,
  onSubscriptionUpdated,
  language = 'fr',
}) => {
  const [activeTab, setActiveTab] = useState<'benefits' | 'pay' | 'status'>('benefits');
  const [currency, setCurrency] = useState<PaymentCurrency>('HTG'); // Default to Gourdes (GDS)
  
  // Verification mode: 'ai' (recommended) or 'manual'
  const [verificationMode, setVerificationMode] = useState<'ai' | 'manual'>('ai');
  
  // AI Verification State
  const [smsText, setSmsText] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptImageName, setReceiptImageName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Verification State
  const [senderPhone, setSenderPhone] = useState('');
  const [referenceCode, setReferenceCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [activeSub, setActiveSub] = useState<SubscriptionRecord | null>(null);

  const NATCASH_NUMBER = '509 35 97 58 63';
  const NATCASH_NUMBER_RAW = '50935975863';
  const NATCASH_ACCOUNT_NAME = '7866179';

  // Price formatting helper
  const getPriceLabel = (c: PaymentCurrency) => {
    switch (c) {
      case 'HTG':
        return { amount: `${PREMIUM_PRICE_HTG} GDS`, full: `${PREMIUM_PRICE_HTG} GDS (Gourdes)`, symbol: 'GDS' };
      case 'EUR':
        return { amount: `${PREMIUM_PRICE_EUR.toFixed(2)} €`, full: `${PREMIUM_PRICE_EUR.toFixed(2)} EUR (€)`, symbol: '€' };
      case 'USD':
      default:
        return { amount: `${PREMIUM_PRICE_USD.toFixed(2)} USD`, full: `${PREMIUM_PRICE_USD.toFixed(2)} USD ($)`, symbol: '$' };
    }
  };

  const currentPrice = getPriceLabel(currency);

  // Fetch current subscription details if user is logged in
  useEffect(() => {
    if (isOpen && user?.uid) {
      SubscriptionService.getActiveSubscription(user.uid).then((sub) => {
        setActiveSub(sub);
        if (user.plan === 'PREMIUM_ACTIVE') {
          setActiveTab('status');
        }
      });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const isCreator = user?.role === 'admin' || (user?.email && ['fivet5874@gmail.com', 'admin@kaydogpt.com'].includes(user.email.toLowerCase())) || user?.uid?.startsWith('creator_');
  const isPremium = true; // Tous les modes Premium & Pro sont 100% gratuits pour tous
  const daysRemaining = 9999;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(NATCASH_NUMBER);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image du reçu ne doit pas dépasser 5 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptImage(reader.result as string);
      setReceiptImageName(file.name);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // AI Verification Handler
  const handleAIVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    setError(null);
    setSuccess(null);

    if (!smsText.trim() && !receiptImage) {
      setError('Veuillez coller le texte du SMS Natcash reçu ou importer une capture d\'écran du reçu.');
      return;
    }

    try {
      setLoading(true);
      const res = await SubscriptionService.submitAIVerification({
        userId: user.uid,
        userEmail: user.email || undefined,
        userName: user.displayName || undefined,
        smsText: smsText.trim() || undefined,
        receiptImage: receiptImage || undefined,
        currency,
      });

      if (res.success) {
        setSuccess(res.message);
        triggerConfetti();
        onSubscriptionUpdated('PREMIUM_ACTIVE');
        const sub = await SubscriptionService.getActiveSubscription(user.uid);
        setActiveSub(sub);
        setActiveTab('status');
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l\'analyse IA du reçu de transfert.');
    } finally {
      setLoading(false);
    }
  };

  // Manual Verification Handler
  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    setError(null);
    setSuccess(null);

    if (!senderPhone || senderPhone.trim().length < 8) {
      setError('Veuillez indiquer le numéro de téléphone utilisé pour le transfert Natcash.');
      return;
    }

    if (!referenceCode || referenceCode.trim().length < 4) {
      setError('Veuillez indiquer le code de référence / transaction reçu par SMS.');
      return;
    }

    try {
      setLoading(true);
      const res = await SubscriptionService.submitPayment({
        userId: user.uid,
        userEmail: user.email || undefined,
        userName: user.displayName || undefined,
        senderPhone: senderPhone.trim(),
        referenceCode: referenceCode.trim(),
        paymentMethod: 'natcash',
        currency,
        amount: currency === 'HTG' ? PREMIUM_PRICE_HTG : currency === 'EUR' ? PREMIUM_PRICE_EUR : PREMIUM_PRICE_USD,
      });

      if (res.success) {
        setSuccess(res.message);
        triggerConfetti();
        onSubscriptionUpdated('PREMIUM_ACTIVE');
        const sub = await SubscriptionService.getActiveSubscription(user.uid);
        setActiveSub(sub);
        setActiveTab('status');
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la validation du transfert.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: 'Réponses Ultra-Rapides & Directes',
      desc: 'Accès prioritaire à pleine vitesse sans temps d\'attente, réponses concises et directes sans fioritures.',
      icon: <Zap className="text-yellow-500" size={18} />,
    },
    {
      title: 'Conversations & Contextes Étendus',
      desc: 'Mémoire contextuelle jusqu\'à 100 000 tokens pour des échanges longs et des analyses approfondies.',
      icon: <Brain className="text-purple-500" size={18} />,
    },
    {
      title: 'Mode Hors-Ligne Pro',
      desc: 'Moteur IA de connaissances universelles téléchargeable pour répondre sans connexion Internet.',
      icon: <WifiOff className="text-amber-500" size={18} />,
    },
    {
      title: 'Dossiers & Organisation',
      desc: 'Classez vos conversations par projets, travail, études ou thématiques personnalisées.',
      icon: <FolderKanban className="text-blue-500" size={18} />,
    },
    {
      title: 'Génération & Export Avancé',
      desc: 'Exportez vos messages en PDF, Markdown, Word, Code et générez des documents structurés.',
      icon: <Download className="text-emerald-500" size={18} />,
    },
    {
      title: 'Synthèse Vocale HD & Thèmes',
      desc: 'Accédez aux thèmes Midnight, Emerald, Amber et Amethyst avec voix de synthèse vocale HD.',
      icon: <Layers className="text-rose-500" size={18} />,
    },
  ];

  return (
    <div id="premium-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#333] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header with Premium Gradient */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Sparkles size={24} className="text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Kaydo GPT Premium</h2>
                {isPremium ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-gray-950 uppercase tracking-wider shadow-xs">
                    Actif
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white uppercase tracking-wider backdrop-blur-xs">
                    {currentPrice.amount} / mois
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Paiement exclusif par <strong>Natcash</strong> • Vérification intelligente par IA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Currency & Country Selector Bar */}
        <div className="px-6 py-2.5 bg-gray-100/80 dark:bg-[#181818] border-b border-gray-200 dark:border-[#2a2a2a] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 font-medium">
            <Coins size={15} className="text-amber-500" />
            <span>Devise & Montant :</span>
          </div>

          <div className="inline-flex rounded-xl bg-white dark:bg-[#252525] p-1 border border-gray-200 dark:border-[#383838] shadow-2xs">
            <button
              type="button"
              onClick={() => setCurrency('HTG')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currency === 'HTG'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              🇭🇹 400 GDS (Haïti)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currency === 'USD'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              🇺🇸 3.00 USD (USA / Amériques)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('EUR')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currency === 'EUR'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              🇪🇺 2.80 EUR (Europe)
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 dark:border-[#2a2a2a] px-6 bg-gray-50/50 dark:bg-[#1a1a1a]">
          <button
            onClick={() => setActiveTab('benefits')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'benefits'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Avantages & Guide d'envoi
          </button>
          <button
            onClick={() => setActiveTab('pay')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'pay'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {isPremium ? 'Renouveler / Valider' : `Payer par Natcash & Vérifier (${currentPrice.amount})`}
          </button>
          {isPremium && (
            <button
              onClick={() => setActiveTab('status')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'status'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Statut de l'abonnement
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Alerts */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* TAB 1: BENEFITS & COUNTRY GUIDE */}
          {activeTab === 'benefits' && (
            <div className="space-y-6">
              {/* Account Hero Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-[#252525] dark:to-[#1e1e1e] border border-blue-100 dark:border-[#383838] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Compte Natcash Officiel Unique
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-mono">
                      {NATCASH_NUMBER}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyNumber}
                      className="p-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg cursor-pointer"
                      title="Copier le numéro"
                    >
                      {copiedNumber ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                    Nom du compte Natcash : <strong className="font-mono text-gray-900 dark:text-white">{NATCASH_ACCOUNT_NAME}</strong>
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Tarif mensuel : <strong className="text-gray-900 dark:text-gray-100">{currentPrice.full}</strong>
                  </p>
                </div>

                {!isPremium ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        onOpenAuth();
                      } else {
                        setActiveTab('pay');
                      }
                    }}
                    className="py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <span>Payer & Vérifier ({currentPrice.amount})</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                    <CheckCircle2 size={16} />
                    <span>Abonnement Actif</span>
                  </div>
                )}
              </div>

              {/* DETAILED COUNTRY-SPECIFIC SENDING GUIDE */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                  <Globe2 size={16} className="text-blue-600 dark:text-blue-400" />
                  <span>Guide d'envoi selon votre pays de résidence :</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* HAITI */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    currency === 'HTG'
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700 shadow-xs'
                      : 'bg-gray-50 dark:bg-[#252525] border-gray-200 dark:border-[#383838]'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-blue-600 dark:text-blue-400">🇭🇹 En Haïti</span>
                      <span className="font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[10px]">
                        400 GDS
                      </span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-gray-600 dark:text-gray-300 text-[11px] leading-relaxed">
                      <li>Ouvrez l'application <strong>Natcash</strong> ou tapez <strong>*202#</strong>.</li>
                      <li>Sélectionnez <strong>"Transférer de l'argent"</strong>.</li>
                      <li>Numéro : <strong className="font-mono text-gray-900 dark:text-white">{NATCASH_NUMBER}</strong></li>
                      <li>Nom vérifié : <strong className="font-mono text-gray-900 dark:text-white">{NATCASH_ACCOUNT_NAME}</strong></li>
                      <li>Montant : <strong>400 GDS</strong>.</li>
                      <li>Conservez le <strong>SMS de confirmation</strong> reçu.</li>
                    </ol>
                  </div>

                  {/* USA / CANADA / AMERICAS */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    currency === 'USD'
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700 shadow-xs'
                      : 'bg-gray-50 dark:bg-[#252525] border-gray-200 dark:border-[#383838]'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-purple-600 dark:text-purple-400">🇺🇸 🇨🇦 Diaspora USA / Amériques</span>
                      <span className="font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-[10px]">
                        3.00 USD
                      </span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-gray-600 dark:text-gray-300 text-[11px] leading-relaxed">
                      <li>Utilisez <strong>Taptap Send, Remitly, Boss Revolution, Ding ou Sendwave</strong>.</li>
                      <li>Destination : <strong>Haïti</strong>.</li>
                      <li>Mode : <strong>Natcash (Mobile Wallet)</strong>.</li>
                      <li>Numéro : <strong className="font-mono text-gray-900 dark:text-white">{NATCASH_NUMBER}</strong></li>
                      <li>Nom du compte : <strong className="font-mono text-gray-900 dark:text-white">{NATCASH_ACCOUNT_NAME}</strong></li>
                      <li>Montant : <strong>3.00 USD</strong>.</li>
                      <li>Copiez le code ou faites une capture d'écran du reçu.</li>
                    </ol>
                  </div>

                  {/* EUROPE & INTERNATIONAL */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    currency === 'EUR'
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700 shadow-xs'
                      : 'bg-gray-50 dark:bg-[#252525] border-gray-200 dark:border-[#383838]'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">🇫🇷 🇪🇺 France & Europe</span>
                      <span className="font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[10px]">
                        2.80 EUR
                      </span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-gray-600 dark:text-gray-300 text-[11px] leading-relaxed">
                      <li>Ouvrez <strong>Taptap Send</strong> ou <strong>Remitly</strong> (application ou site web).</li>
                      <li>Sélectionnez <strong>Haïti</strong> → <strong>Natcash</strong>.</li>
                      <li>Destinataire : <strong className="font-mono text-gray-900 dark:text-white">{NATCASH_NUMBER}</strong></li>
                      <li>Nom : <strong className="font-mono text-gray-900 dark:text-white">{NATCASH_ACCOUNT_NAME}</strong></li>
                      <li>Montant : <strong>2.80 €</strong>.</li>
                      <li>Validez le transfert et gardez le reçu.</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Grid of features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#252525] border border-gray-200/70 dark:border-[#333] flex items-start gap-3"
                  >
                    <div className="p-2 rounded-xl bg-white dark:bg-[#2e2e2e] shadow-2xs shrink-0 mt-0.5">
                      {feat.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">{feat.title}</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PAYMENT & AI VERIFICATION */}
          {activeTab === 'pay' && (
            <div className="space-y-6">
              {/* Payment Summary Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 dark:from-[#252525] dark:to-[#1e1e1e] border border-blue-200 dark:border-[#383838] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Phone className="text-blue-600 dark:text-blue-400" size={16} />
                    <span>Compte Natcash Destinataire : <strong className="font-mono text-blue-600 dark:text-blue-400 text-sm select-all">{NATCASH_NUMBER}</strong></span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-[11px] mt-0.5">
                    Nom du titulaire : <strong className="font-mono text-gray-900 dark:text-white">{NATCASH_ACCOUNT_NAME}</strong> • Montant : <strong className="text-emerald-600 dark:text-emerald-400">{currentPrice.full}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#333] border border-gray-200 dark:border-[#444] text-[11px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#383838] flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                >
                  {copiedNumber ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copiedNumber ? 'Numéro copié !' : 'Copier numéro'}</span>
                </button>
              </div>

              {/* Verification Mode Selector: AI Inspector (Recommended) vs Manual */}
              <div className="flex rounded-2xl bg-gray-100 dark:bg-[#252525] p-1 border border-gray-200 dark:border-[#383838]">
                <button
                  type="button"
                  onClick={() => setVerificationMode('ai')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    verificationMode === 'ai'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Bot size={16} />
                  <span>🤖 Vérification par IA (Rapide & Directe)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationMode('manual')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    verificationMode === 'manual'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FileText size={16} />
                  <span>✍️ Saisie Manuelle de Référence</span>
                </button>
              </div>

              {!user ? (
                <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center space-y-3">
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Veuillez vous connecter à votre compte afin d'associer votre abonnement Premium à votre profil.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="py-2.5 px-5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-700 cursor-pointer"
                  >
                    Se connecter / Créer un compte
                  </button>
                </div>
              ) : verificationMode === 'ai' ? (
                /* AI INSPECTOR FORM */
                <form onSubmit={handleAIVerify} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs text-gray-700 dark:text-gray-300 space-y-1">
                    <p className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                      <Bot size={15} />
                      <span>Inspecteur IA de Transaction Natcash :</span>
                    </p>
                    <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-300">
                      Collez le texte du SMS Natcash reçu ou importez une capture d'écran de votre reçu de transfert. L'IA analysera et validera votre transfert instantanément !
                    </p>
                  </div>

                  {/* SMS Text Input */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                      <span>1. Collez le SMS Natcash ou le message de confirmation reçu :</span>
                      <span className="text-[10px] text-gray-400">Optionnel si image fournie</span>
                    </label>
                    <textarea
                      value={smsText}
                      onChange={(e) => setSmsText(e.target.value)}
                      rows={3}
                      placeholder="Ex: Ou transfere 400 GDS bay 50835975863 (7866179) avek sikse. Nimewo tranzaksyon se: NAT983728..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#383838] text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 font-mono resize-none"
                    />
                  </div>

                  {/* Image / Screenshot Upload */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                      <span>2. OU Importez la capture d'écran / reçu de transfert :</span>
                      <span className="text-[10px] text-gray-400">Format PNG, JPG, WebP (Max 5Mo)</span>
                    </label>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {receiptImage ? (
                      <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={receiptImage}
                            alt="Reçu"
                            className="w-10 h-10 object-cover rounded-lg border border-emerald-300 dark:border-emerald-700"
                          />
                          <div className="text-xs">
                            <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                              {receiptImageName || 'Capture du reçu chargée'}
                            </p>
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Prêt pour l'inspection IA</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setReceiptImage(null);
                            setReceiptImageName(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-gray-300 dark:border-[#3a3a3a] hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-[#252525] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-gray-500 dark:text-gray-400 text-xs"
                      >
                        <Upload size={20} className="text-blue-500" />
                        <span className="font-medium">Cliquez pour importer la photo ou capture d'écran du reçu</span>
                      </button>
                    )}
                  </div>

                  {/* AI Verification Button */}
                  <button
                    type="submit"
                    disabled={loading || (!smsText.trim() && !receiptImage)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-semibold shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {loading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Inspection IA en cours... Analyse du transfert</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} className="text-amber-300" />
                        <span>Vérifier avec l'IA et Activer Premium ({currentPrice.amount})</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* MANUAL VERIFICATION FORM */
                <form onSubmit={handleManualVerify} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Numéro de téléphone émetteur (votre numéro Natcash)
                      </label>
                      <input
                        type="text"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="Ex: 50935975863 ou 508..."
                        required
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#383838] text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Code de référence / ID Transaction SMS
                      </label>
                      <input
                        type="text"
                        value={referenceCode}
                        onChange={(e) => setReferenceCode(e.target.value)}
                        placeholder="Ex: NAT-839218 ou ID"
                        required
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#383838] text-gray-900 dark:text-gray-100 font-mono outline-none focus:border-blue-500 uppercase"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        <span>Confirmer le transfert Natcash ({currentPrice.amount})</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Abonnement Premium Actif
                    </h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Connecté sur le compte de {user?.displayName || user?.email || 'Utilisateur'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                    {isCreator ? 'Illimité 👑' : `${daysRemaining} jours`}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    {isCreator ? 'Accès Créateur à Vie' : 'restants'}
                  </div>
                </div>
              </div>

              {activeSub && (
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-[#383838] space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-200/60 dark:border-[#333]">
                    <span className="text-gray-500">Plan :</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      Premium Mensuel ({activeSub.price ? `${activeSub.price} ${activeSub.currency || 'USD'}` : '400 GDS'})
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200/60 dark:border-[#333]">
                    <span className="text-gray-500">Moyen de paiement :</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Natcash</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200/60 dark:border-[#333]">
                    <span className="text-gray-500">Date d'activation :</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {new Date(activeSub.startedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200/60 dark:border-[#333]">
                    <span className="text-gray-500">Date d'expiration :</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {new Date(activeSub.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">ID de Transaction :</span>
                    <span className="font-mono text-[11px] text-gray-600 dark:text-gray-300">
                      {activeSub.transactionId}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('pay')}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-300 dark:border-[#404040] hover:bg-gray-50 dark:hover:bg-[#252525] text-xs font-semibold text-gray-700 dark:text-gray-200 cursor-pointer"
              >
                Prolonger / Renouveler mon abonnement
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-[#181818] border-t border-gray-100 dark:border-[#2a2a2a] flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
          <span>Garantie d'accès multi-plateforme (Mobile & PC)</span>
          <span className="font-medium">Assistance Natcash : {NATCASH_NUMBER}</span>
        </div>
      </motion.div>
    </div>
  );
};
