import React, { useState } from 'react';
import {
  X,
  Heart,
  Copy,
  Check,
  Smartphone,
  Globe2,
  Sparkles,
  MessageCircle,
  Phone,
  ShieldCheck,
  ArrowRight,
  Coffee,
  Code2,
  AlertCircle,
} from 'lucide-react';
import { SupportedLanguage, translations } from '../utils/i18n';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: SupportedLanguage;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  language = 'fr',
}) => {
  const [copiedNatcash, setCopiedNatcash] = useState(false);
  const [activeTab, setActiveTab] = useState<'natcash' | 'international' | 'pro'>('natcash');

  if (!isOpen) return null;

  const t = translations[language] || translations.fr;
  const natcashNumber = '509 35 97 58 63';
  const natcashAccountName = '7866179';
  const developerName = 'Desir Asaph Berry';

  const handleCopyNatcash = async () => {
    try {
      await navigator.clipboard.writeText(natcashNumber);
      setCopiedNatcash(true);
      setTimeout(() => setCopiedNatcash(false), 2500);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const whatsappDonationUrl = `https://wa.me/50935975863?text=${encodeURIComponent(
    "Bonjour, j'utilise Kaydo GPT et je souhaite soutenir votre projet !"
  )}`;

  const whatsappProUrl = `https://wa.me/50935975863?text=${encodeURIComponent(
    "Bonjour, j'aimerais commander une IA ou une application sur-mesure pour mon projet/entreprise."
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in zoom-in-95 duration-150">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#383838] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-5 pb-4 border-b border-gray-100 dark:border-[#2e2e2e] bg-linear-to-b from-amber-500/10 via-transparent to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-500">
                <Heart size={20} className="fill-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  {t.supportModalTitle}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.supportModalSubtitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2c2c2c] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 mt-4 p-1 bg-gray-100 dark:bg-[#141414] rounded-2xl">
            <button
              onClick={() => setActiveTab('natcash')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'natcash'
                  ? 'bg-white dark:bg-[#2c2c2c] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Smartphone size={14} />
              <span>{t.natcashTab}</span>
            </button>

            <button
              onClick={() => setActiveTab('international')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'international'
                  ? 'bg-white dark:bg-[#2c2c2c] text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Globe2 size={14} />
              <span>{t.internationalTab}</span>
            </button>

            <button
              onClick={() => setActiveTab('pro')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'pro'
                  ? 'bg-white dark:bg-[#2c2c2c] text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Code2 size={14} />
              <span>{t.proTab}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: NATCASH */}
          {activeTab === 'natcash' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <Smartphone size={16} />
                    <span>{t.natcashDirectTitle}</span>
                  </div>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    {t.instant}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                  {t.natcashDesc}
                </p>

                {/* Number Copy Box */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#151515] border border-emerald-500/30 shadow-xs">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">{t.accountNumber}</div>
                    <div className="text-lg font-mono font-bold text-gray-900 dark:text-white tracking-wider">
                      {natcashNumber}
                    </div>
                    <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                      <span>{t.accountHolder} :</span>
                      <span className="font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold">
                        {natcashAccountName}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyNatcash}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs transition-all shadow-xs"
                  >
                    {copiedNatcash ? (
                      <>
                        <Check size={14} />
                        <span>{t.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>{t.copy}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Account Name Note Box */}
                <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-500" />
                  <p className="leading-snug">
                    <strong>Précision importante :</strong> Lors de votre envoi Natcash, le nom du compte affiché est <strong>« {natcashAccountName} »</strong> (développé par <strong>{developerName}</strong>).
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#2e2e2e] space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-emerald-500" />
                  <span>{t.howToSendNatcash}</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>{t.step1Natcash}</li>
                  <li>{t.step2Natcash}</li>
                  <li>{t.step3Natcash}</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: INTERNATIONAL / DIASPORA */}
          {activeTab === 'international' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                    <Globe2 size={16} />
                    <span>{t.intlTitle}</span>
                  </div>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300">
                    Direct Natcash
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                  {t.intlDesc}
                </p>

                {/* Popular apps grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#333] text-xs">
                    <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Taptap Send
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Sélectionnez Haïti ➔ Portefeuille Natcash ➔ <strong>+509 35975863</strong> (Nom: <strong>{natcashAccountName}</strong>)
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#333] text-xs">
                    <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Boss Revolution
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Envoi d'argent direct vers mobile Natcash Haïti (35975863)
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#333] text-xs">
                    <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      Sendwave / Remitly
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Transfert direct vers portefeuille mobile
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#333] text-xs">
                    <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Transfert d'agence
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Western Union / CAM / Unitransfer
                    </p>
                  </div>
                </div>

                {/* Recipient Details */}
                <div className="p-3 rounded-xl bg-white dark:bg-[#151515] border border-blue-500/30 text-xs">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Coordonnées du destinataire</div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                    Nom du compte : <span className="text-blue-500 font-mono font-bold">{natcashAccountName}</span> <span className="text-gray-400 font-normal">({developerName})</span>
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    Numéro mobile : <span className="font-mono text-blue-500 font-bold">+509 35 97 58 63</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRO SERVICES */}
          {activeTab === 'pro' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/25">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
                    <Sparkles size={16} />
                    <span>{t.proTitle}</span>
                  </div>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300">
                    Projets Pro
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                  {t.proDesc}
                </p>

                <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300 mb-4">
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-purple-500 shrink-0 mt-0.5" />
                    <span>{t.proFeature1}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-purple-500 shrink-0 mt-0.5" />
                    <span>{t.proFeature2}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-purple-500 shrink-0 mt-0.5" />
                    <span>{t.proFeature3}</span>
                  </div>
                </div>

                <a
                  href={whatsappProUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md transition-colors"
                >
                  <MessageCircle size={16} />
                  <span>{t.orderOnWhatsapp}</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer Contact Bar */}
        <div className="p-4 border-t border-gray-100 dark:border-[#2b2b2b] bg-gray-50/70 dark:bg-[#171717] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
            <span className="font-semibold text-gray-800 dark:text-gray-200">{developerName}</span>
            <span className="mx-1.5">•</span>
            <span>Développeur & Créateur</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={whatsappDonationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <MessageCircle size={14} />
              <span>{t.contactDeveloper}</span>
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-[#2b2b2b] hover:bg-gray-300 dark:hover:bg-[#383838] text-gray-800 dark:text-gray-200 font-semibold text-xs transition-colors"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
