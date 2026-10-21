import React from 'react';
import { Globe, Check, Sparkles, ArrowRight } from 'lucide-react';
import { SupportedLanguage, translations } from '../utils/i18n';

interface LanguageOnboardingModalProps {
  isOpen: boolean;
  onSelectLanguage: (lang: SupportedLanguage) => void;
}

export const LanguageOnboardingModal: React.FC<LanguageOnboardingModalProps> = ({
  isOpen,
  onSelectLanguage,
}) => {
  const [selected, setSelected] = React.useState<SupportedLanguage>('fr');

  if (!isOpen) return null;

  const languagesList: {
    code: SupportedLanguage;
    name: string;
    nativeName: string;
    flag: string;
    desc: string;
  }[] = [
    {
      code: 'fr',
      name: 'Français',
      nativeName: 'Français',
      flag: '🇫🇷',
      desc: 'Langue par défaut (France, Haïti, Afrique, Canada)',
    },
    {
      code: 'ht',
      name: 'Kreyòl Ayisyen',
      nativeName: 'Kreyòl',
      flag: '🇭🇹',
      desc: 'Lang manman nou an (Ayiti & Dyaspora)',
    },
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      desc: 'Global language (USA, Canada, Worldwide)',
    },
    {
      code: 'es',
      name: 'Español',
      nativeName: 'Español',
      flag: '🇩🇴',
      desc: 'Español (República Dominicana, Latinoamérica)',
    },
    {
      code: 'pt',
      name: 'Português',
      nativeName: 'Português',
      flag: '🇧🇷',
      desc: 'Português (Brasil, Portugal, Angola)',
    },
  ];

  const t = translations[selected];

  const handleConfirm = () => {
    onSelectLanguage(selected);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#383838] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 text-center border-b border-gray-100 dark:border-[#2b2b2b] bg-linear-to-b from-blue-500/10 via-transparent to-transparent">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-500 mb-3 shadow-xs">
            <Globe size={24} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {t.selectLanguageTitle}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-md mx-auto leading-relaxed">
            {t.selectLanguageSubtitle}
          </p>
        </div>

        {/* Language Options List */}
        <div className="p-4 sm:p-5 space-y-2.5 max-h-[50vh] overflow-y-auto">
          {languagesList.map((item) => {
            const isChosen = selected === item.code;
            return (
              <button
                key={item.code}
                onClick={() => setSelected(item.code)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                  isChosen
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-100 shadow-xs scale-[1.01]'
                    : 'bg-gray-50/70 dark:bg-[#232323] border-gray-200 dark:border-[#333] hover:bg-gray-100 dark:hover:bg-[#2c2c2c] text-gray-800 dark:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">{item.flag}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{item.nativeName}</span>
                      <span className="text-xs text-gray-400">({item.name})</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    isChosen
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 bg-transparent'
                  }`}
                >
                  {isChosen && <Check size={14} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Action */}
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-[#2b2b2b] bg-gray-50/80 dark:bg-[#181818] flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Sparkles size={14} className="text-amber-500" />
            <span>Kaydo GPT</span>
          </div>

          <button
            onClick={handleConfirm}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-md transition-all"
          >
            <span>{t.continueBtn}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
