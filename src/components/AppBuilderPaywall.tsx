import React, { useState } from 'react';
import { Crown, Sparkles, CheckCircle, ShieldCheck, ArrowRight, Zap, Code, Globe, Cpu, RefreshCw } from 'lucide-react';
import { UserProfile, PaymentCurrency } from '../types';
import { PRO_PRICE_USD, PRO_PRICE_HTG, PRO_PRICE_EUR } from '../utils/subscriptionService';

interface AppBuilderPaywallProps {
  currentUser?: UserProfile | null;
  onOpenUpgradeModal: () => void;
  onClose?: () => void;
}

export const AppBuilderPaywall: React.FC<AppBuilderPaywallProps> = ({
  currentUser,
  onOpenUpgradeModal,
  onClose,
}) => {
  const [currency, setCurrency] = useState<PaymentCurrency>('USD');

  const priceLabel = currency === 'HTG'
    ? `${PRO_PRICE_HTG} HTG`
    : currency === 'EUR'
    ? `${PRO_PRICE_EUR.toFixed(2)} €`
    : `${PRO_PRICE_USD.toFixed(2)} $`;

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gradient-to-b from-[#131317] via-[#0f0f12] to-[#0a0a0c] text-white p-6 md:p-12 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-[#18181f] border border-amber-500/30 rounded-3xl p-8 md:p-12 shadow-2xl shadow-amber-500/5 relative overflow-hidden text-center space-y-8">
        {/* Glow Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black uppercase tracking-wider">
          <Crown size={14} className="animate-pulse" />
          <span>Exclusivité Berry GPT PRO</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Berry App Builder Pro
          </h1>
          <p className="text-lg md:text-xl text-amber-200/90 font-medium">
            « Créez de véritables applications avec Berry GPT. »
          </p>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            Décrivez votre projet en langage naturel et laissez notre agent IA concevoir l'architecture, coder le frontend React, configurer le backend Node.js, tester et déployer avec une URL publique permanente.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="bg-[#1e1e28] border border-amber-500/40 rounded-2xl p-6 max-w-md mx-auto shadow-inner space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <span className="text-xs font-bold text-gray-400 uppercase">Tarif officiel Pro</span>
            <div className="flex gap-1 text-xs">
              {(['USD', 'HTG', 'EUR'] as PaymentCurrency[]).map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    currency === c ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl md:text-5xl font-black text-white">{priceLabel}</span>
            <span className="text-sm text-gray-400 font-semibold">/ mois</span>
          </div>

          <button
            onClick={onOpenUpgradeModal}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>Passer à BERRY PRO</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-4">
          {[
            { icon: <Code className="text-amber-400" size={18} />, title: 'Éditeur & Générateur de Code', desc: 'Code source React/TypeScript complet modifiable avec onglets et colorations.' },
            { icon: <Globe className="text-emerald-400" size={18} />, title: 'Déploiement & URL Publique Réelle', desc: 'Hébergement en 1 clic avec URL accessible publiquement.' },
            { icon: <Cpu className="text-cyan-400" size={18} />, title: 'Assistant Développeur & Debug IA', desc: 'Détection et correction autonome des erreurs de compilation en direct.' },
            { icon: <RefreshCw className="text-purple-400" size={18} />, title: 'Versions & Export ZIP', desc: 'Historique des versions et téléchargement direct du projet sans clé secrète.' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#14141a] border border-gray-800/80 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gray-800/60 shrink-0">{item.icon}</div>
              <div>
                <h4 className="text-xs font-bold text-white">{item.title}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Free vs Pro Comparison Footnote */}
        <div className="border-t border-gray-800/80 pt-6 text-xs text-gray-400 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Paiement sécurisé via Natcash, MonCash & International</span>
          </div>
          <p className="text-[11px] text-gray-500">
            Activation instantanée et vérifiée par l'Inspecteur IA.
          </p>
        </div>
      </div>
    </div>
  );
};
