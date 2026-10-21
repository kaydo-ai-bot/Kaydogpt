import React, { useState } from 'react';
import {
  X,
  User,
  Volume2,
  Sliders,
  Shield,
  Trash2,
  Download,
  Sparkles,
  Check,
  Moon,
  Sun,
  Laptop,
  WifiOff,
  Wifi,
  Lock,
  Calendar,
  Heart,
  Cpu,
  Play,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { UserSettings, Conversation } from '../types';
import { exportConversation } from '../utils/export';
import { getDeviceOfflineCapabilities, DeviceCapabilities } from '../utils/offlineEngine';
import { aiRouter, OfflineDiagnosticReport } from '../utils/aiRouter';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  conversations: Conversation[];
  onClearAllChats: () => void;
  onOpenSupport?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  conversations,
  onClearAllChats,
  onOpenSupport,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'speech' | 'instructions' | 'offline' | 'data' | 'api'>('general');
  const [currentSettings, setCurrentSettings] = useState<UserSettings>(settings);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testReport, setTestReport] = useState<OfflineDiagnosticReport | null>(null);

  const deviceCaps = getDeviceOfflineCapabilities();

  // Calculate 7 days registration status
  const registrationDate = currentSettings.registrationDate || (Date.now() - 8 * 24 * 60 * 60 * 1000);
  const daysSinceRegistration = Math.max(0, Math.floor((Date.now() - registrationDate) / (1000 * 60 * 60 * 24)));
  const isOfflineUnlocked = daysSinceRegistration >= 7;
  const daysRemaining = Math.max(0, 7 - daysSinceRegistration);

  if (!isOpen) return null;

  const handleSave = (updated: Partial<UserSettings>) => {
    const next = { ...currentSettings, ...updated };
    setCurrentSettings(next);
    onSaveSettings(next);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleExportAll = () => {
    conversations.forEach((conv) => {
      exportConversation(conv, 'markdown');
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in zoom-in-95 duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-[#212121] border border-gray-200 dark:border-[#383838] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh]">
        {/* Left Navigation Sidebar */}
        <div className="w-full md:w-56 p-4 bg-gray-50 dark:bg-[#181818] border-r border-gray-200 dark:border-[#2f2f2f] flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4 px-2">
              Paramètres
            </h2>
            <nav className="space-y-1 text-xs font-medium">
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                  activeTab === 'general'
                    ? 'bg-gray-200 dark:bg-[#2c2c2c] text-gray-900 dark:text-white font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#242424]'
                }`}
              >
                <Sliders size={15} />
                <span>Général</span>
              </button>

              <button
                onClick={() => setActiveTab('speech')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                  activeTab === 'speech'
                    ? 'bg-gray-200 dark:bg-[#2c2c2c] text-gray-900 dark:text-white font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#242424]'
                }`}
              >
                <Volume2 size={15} />
                <span>Voix & Audio</span>
              </button>

              <button
                onClick={() => setActiveTab('instructions')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                  activeTab === 'instructions'
                    ? 'bg-gray-200 dark:bg-[#2c2c2c] text-gray-900 dark:text-white font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#242424]'
                }`}
              >
                <User size={15} />
                <span>Instructions personnalisées</span>
              </button>

              <button
                onClick={() => setActiveTab('offline')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                  activeTab === 'offline'
                    ? 'bg-gray-200 dark:bg-[#2c2c2c] text-gray-900 dark:text-white font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#242424]'
                }`}
              >
                <WifiOff size={15} className={isOfflineUnlocked ? 'text-emerald-500' : 'text-amber-500'} />
                <span>Mode Hors-Ligne</span>
              </button>

              <button
                onClick={() => setActiveTab('data')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                  activeTab === 'data'
                    ? 'bg-gray-200 dark:bg-[#2c2c2c] text-gray-900 dark:text-white font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#242424]'
                }`}
              >
                <Shield size={15} />
                <span>Contrôles des données</span>
              </button>

              <button
                onClick={() => setActiveTab('api')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                  activeTab === 'api'
                    ? 'bg-gray-200 dark:bg-[#2c2c2c] text-gray-900 dark:text-white font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#242424]'
                }`}
              >
                <Cpu size={15} />
                <span>Configuration API</span>
              </button>
            </nav>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-[#2f2f2f] px-2 flex flex-col gap-2">
            {onOpenSupport && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSupport();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/25 text-xs font-semibold transition-all"
              >
                <Heart size={14} className="fill-amber-500 text-amber-500" />
                <span>Soutenir & Pro</span>
              </button>
            )}
            <div>
              <div className="text-[11px] font-medium text-gray-700 dark:text-gray-300">Kaydo GPT</div>
              <div className="text-[10px] text-gray-500">Par Desir Asaph Berry</div>
            </div>
          </div>
        </div>

        {/* Right Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Top close */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-[#2e2e2e]">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 capitalize">
                {activeTab === 'general' && 'Général'}
                {activeTab === 'speech' && 'Voix & Audio'}
                {activeTab === 'instructions' && 'Instructions personnalisées'}
                {activeTab === 'offline' && 'Mode Hors-Ligne (7 jours)'}
                {activeTab === 'data' && 'Contrôles des données'}
                {activeTab === 'api' && 'Configuration API'}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2e2e2e]"
              >
                <X size={18} />
              </button>
            </div>

            {/* TAB: GENERAL */}
            {activeTab === 'general' && (
              <div className="space-y-5 text-sm">
                {/* Theme Switcher */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Thème</div>
                    <div className="text-xs text-gray-400">Choisissez l'apparence de l'interface</div>
                  </div>
                  <div className="flex items-center bg-gray-100 dark:bg-[#2e2e2e] p-1 rounded-xl gap-1">
                    <button
                      onClick={() => handleSave({ theme: 'light' })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        currentSettings.theme === 'light'
                          ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Sun size={13} /> Clair
                    </button>
                    <button
                      onClick={() => handleSave({ theme: 'dark' })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        currentSettings.theme === 'dark'
                          ? 'bg-[#1e1e1e] text-white shadow-2xs font-semibold'
                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Moon size={13} /> Sombre
                    </button>
                  </div>
                </div>

                {/* User Name */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#2e2e2e]">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Nom d'utilisateur</div>
                    <div className="text-xs text-gray-400">Nom affiché sur votre profil</div>
                  </div>
                  <input
                    type="text"
                    value={currentSettings.userName}
                    onChange={(e) => handleSave({ userName: e.target.value })}
                    className="px-3 py-1.5 text-xs rounded-xl bg-gray-100 dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#383838] text-gray-900 dark:text-gray-100 outline-none w-36"
                  />
                </div>

                {/* Plan Badge */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#2e2e2e]">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Formule actuelle</div>
                    <div className="text-xs text-gray-400">Accès complet aux modèles avancés</div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30">
                    Kaydo GPT Illimité
                  </span>
                </div>

                {/* Language Switcher */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#2e2e2e]">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Langue de l'interface</div>
                    <div className="text-xs text-gray-400">Langue par défaut affichée pour l'application</div>
                  </div>
                  <select
                    value={currentSettings.language || 'fr'}
                    onChange={(e) => handleSave({ language: e.target.value as any, languageConfigured: true })}
                    className="px-3 py-1.5 text-xs rounded-xl bg-gray-100 dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#383838] text-gray-900 dark:text-gray-100 outline-none"
                  >
                    <option value="fr">🇫🇷 Français</option>
                    <option value="ht">🇭🇹 Kreyòl Ayisyen</option>
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇩🇴 Español</option>
                    <option value="pt">🇧🇷 Português</option>
                  </select>
                </div>

                {/* 7h Auto-Refresh Conversation Info */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#2e2e2e]">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Cycle de rafraîchissement</div>
                    <div className="text-xs text-gray-400">Nouvelle discussion propre initialisée toutes les 7h</div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Automatique (7h)
                  </span>
                </div>
              </div>
            )}

            {/* TAB: SPEECH */}
            {activeTab === 'speech' && (
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Voix de synthèse</div>
                    <div className="text-xs text-gray-400">Voix utilisée pour la lecture à voix haute</div>
                  </div>
                  <select
                    value={currentSettings.speechVoice}
                    onChange={(e) => handleSave({ speechVoice: e.target.value as any })}
                    className="px-3 py-1.5 text-xs rounded-xl bg-gray-100 dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#383838] text-gray-900 dark:text-gray-100 outline-none"
                  >
                    <option value="Kore">Kore (Chaleureuse & Naturelle)</option>
                    <option value="Zephyr">Zephyr (Dynamique & Claire)</option>
                    <option value="Puck">Puck (Enjouée & Expressive)</option>
                    <option value="Fenrir">Fenrir (Grave & Posée)</option>
                    <option value="Charon">Charon (Calme & Réfléchie)</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB: CUSTOM INSTRUCTIONS */}
            {activeTab === 'instructions' && (
              <div className="space-y-4 text-xs">
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                  Personnalisez la façon dont Kaydo GPT répond à toutes vos futures requêtes.
                </p>

                <div>
                  <label className="block font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    Que souhaitez-vous que Kaydo GPT sache sur vous pour adapter ses réponses ?
                  </label>
                  <textarea
                    rows={3}
                    value={currentSettings.customInstructions.aboutMe}
                    onChange={(e) =>
                      handleSave({
                        customInstructions: {
                          ...currentSettings.customInstructions,
                          aboutMe: e.target.value,
                        },
                      })
                    }
                    placeholder="Ex: Je suis développeur Full-Stack, j'aime le code concis et TypeScript..."
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#383838] text-gray-900 dark:text-gray-100 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    Comment souhaitez-vous que Kaydo GPT réponde ?
                  </label>
                  <textarea
                    rows={3}
                    value={currentSettings.customInstructions.responsePreferences}
                    onChange={(e) =>
                      handleSave({
                        customInstructions: {
                          ...currentSettings.customInstructions,
                          responsePreferences: e.target.value,
                        },
                      })
                    }
                    placeholder="Ex: Sois direct, fournis des exemples de code commentés, évite le blabla..."
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#383838] text-gray-900 dark:text-gray-100 outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* TAB: OFFLINE MODE (7 DAYS UNLOCK & AI ROUTER) */}
            {activeTab === 'offline' && (
              <div className="space-y-4 text-xs">
                {/* Unlock Status Card */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    isOfflineUnlocked
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2 rounded-xl ${
                          isOfflineUnlocked ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                        }`}
                      >
                        {isOfflineUnlocked ? <Check size={18} /> : <Lock size={18} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                          {isOfflineUnlocked
                            ? 'Mode Hors-Ligne Débloqué ! 🎉'
                            : `Déblocage dans ${daysRemaining} jour(s)`}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 mt-0.5 text-xs">
                          Inscrit depuis : <strong>{daysSinceRegistration} jour(s)</strong> (7 jours requis)
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        isOfflineUnlocked
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {isOfflineUnlocked ? 'Actif' : 'Verrouillé'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] mb-1 text-gray-600 dark:text-gray-400">
                      <span>Progression d'ancienneté</span>
                      <span>{Math.min(100, Math.round((daysSinceRegistration / 7) * 100))}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-black/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isOfflineUnlocked ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (daysSinceRegistration / 7) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* AI Router Mode Configuration */}
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#282828] border border-gray-200 dark:border-[#383838] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 text-xs">
                        Routage Intelligent de l'IA (AI Router)
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Choisissez comment l'IA bascule entre le Cloud et le Moteur Local.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { id: 'auto', label: '🟢 Auto', sub: 'Bascule intelligente' },
                      { id: 'online', label: '☁️ Cloud seul', sub: 'Gemini uniquement' },
                      { id: 'offline', label: '🔵 Hors-Ligne', sub: 'Moteur local 100%' },
                    ].map((mode) => {
                      const selected = (currentSettings.aiRoutingMode || 'auto') === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => {
                            if (!isOfflineUnlocked && mode.id === 'offline') return;
                            handleSave({ aiRoutingMode: mode.id as any });
                          }}
                          disabled={!isOfflineUnlocked && mode.id === 'offline'}
                          className={`p-2 rounded-xl text-left border transition-all ${
                            selected
                              ? 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300 font-semibold'
                              : 'bg-white dark:bg-[#202020] border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-[#444]'
                          } ${!isOfflineUnlocked && mode.id === 'offline' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="text-xs font-bold">{mode.label}</div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400">{mode.sub}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Device Hardware Capabilities */}
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#282828] border border-gray-200 dark:border-[#383838] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu size={15} className="text-purple-500" />
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 text-xs">
                        Capacités Matérielles Détectées
                      </h4>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-purple-500/15 text-purple-600 dark:text-purple-300">
                      Tier : {deviceCaps.tier.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                    <div className="p-2 rounded-xl bg-white dark:bg-[#202020] border border-gray-200 dark:border-[#333]">
                      <span className="text-gray-400 block text-[10px]">Mémoire RAM</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">~{deviceCaps.ramGB} Go</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#202020] border border-gray-200 dark:border-[#333]">
                      <span className="text-gray-400 block text-[10px]">Cœurs CPU</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{deviceCaps.cpuCores} cœurs</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#202020] border border-gray-200 dark:border-[#333]">
                      <span className="text-gray-400 block text-[10px]">WebAssembly</span>
                      <span className="font-semibold text-emerald-500">Supporté ✅</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#202020] border border-gray-200 dark:border-[#333]">
                      <span className="text-gray-400 block text-[10px]">WebGPU</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {deviceCaps.webGPU ? 'Actif ⚡' : 'Émulation WASM'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400 pt-1">
                    {deviceCaps.statusMessage}
                  </p>
                </div>

                {/* Real-time Diagnostic Self-Test */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-[#1f2333] dark:to-[#1a1e2d] border border-indigo-200 dark:border-indigo-900/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity size={15} className="text-indigo-600 dark:text-indigo-400" />
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 text-xs">
                        Auto-Test Diagnostique Hors-Ligne
                      </h4>
                    </div>

                    <button
                      type="button"
                      disabled={isRunningTest}
                      onClick={async () => {
                        setIsRunningTest(true);
                        setTestReport(null);
                        try {
                          const report = await aiRouter.runOfflineDiagnosticTest();
                          setTestReport(report);
                        } catch (e) {
                          console.error(e);
                        } finally {
                          setIsRunningTest(false);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isRunningTest ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Test en cours...</span>
                        </>
                      ) : (
                        <>
                          <Play size={13} />
                          <span>Lancer le test hors-ligne</span>
                        </>
                      )}
                    </button>
                  </div>

                  {testReport && (
                    <div className="p-3 rounded-xl bg-white dark:bg-[#181a24] border border-indigo-100 dark:border-indigo-900/60 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check size={14} /> Test d'autonomie réussi en {testReport.latencyMs} ms
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">0 Appel réseau</span>
                      </div>

                      <div className="space-y-1 text-[11px] text-gray-600 dark:text-gray-300">
                        {testReport.details.map((d, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-indigo-500">•</span>
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Rules & Permissions description */}
                <div className="p-3 rounded-xl bg-gray-100/70 dark:bg-[#252525] border border-gray-200 dark:border-[#333] space-y-1.5">
                  <h5 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 text-xs">
                    <Sparkles size={14} className="text-emerald-500" />
                    Règles du Mode Hors-Ligne Kaydo GPT :
                  </h5>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-300 list-disc list-inside text-xs leading-relaxed">
                    <li>
                      <strong>Questions & Réponses directes</strong> : Calculs, conversions, biographies, histoire et programmation résolus 100% sur l'appareil.
                    </li>
                    <li>
                      <strong>Créateur</strong> : Développé par <strong>Desir Asaph Berry</strong>.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB: DATA CONTROLS */}
            {activeTab === 'data' && (
              <div className="space-y-5 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Exporter les données</div>
                    <div className="text-xs text-gray-400">Télécharger toutes les conversations au format Markdown</div>
                  </div>
                  <button
                    onClick={handleExportAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] text-gray-700 dark:text-gray-300 text-xs font-medium transition-colors"
                  >
                    <Download size={13} />
                    <span>Exporter</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-[#2e2e2e]">
                  <div>
                    <div className="font-medium text-rose-600 dark:text-rose-400">Supprimer toutes les discussions</div>
                    <div className="text-xs text-gray-400">Efface définitivement l'intégralité de l'historique</div>
                  </div>
                  {showClearConfirm ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-gray-300"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => {
                          onClearAllChats();
                          setShowClearConfirm(false);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700"
                      >
                        Confirmer
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-medium transition-colors"
                    >
                      <Trash2 size={13} />
                      <span>Tout effacer</span>
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* TAB: API CONFIG */}
            {activeTab === 'api' && (
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Football API Key</div>
                    <div className="text-xs text-gray-400">Clé API pour accéder aux données de football</div>
                  </div>
                  <input
                    type="password"
                    value={currentSettings.footballApiKey || ''}
                    onChange={(e) => handleSave({ footballApiKey: e.target.value })}
                    className="px-3 py-1.5 text-xs rounded-xl bg-gray-100 dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#383838] text-gray-900 dark:text-gray-100 outline-none w-48"
                    placeholder="Entrez votre clé API"
                  />
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#2e2e2e]">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Football API URL</div>
                    <div className="text-xs text-gray-400">URL de base de l'API de football</div>
                  </div>
                  <input
                    type="text"
                    value={currentSettings.footballApiUrl || ''}
                    onChange={(e) => handleSave({ footballApiUrl: e.target.value })}
                    className="px-3 py-1.5 text-xs rounded-xl bg-gray-100 dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#383838] text-gray-900 dark:text-gray-100 outline-none w-48"
                    placeholder="https://api.football.com"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom notification */}
          {savedToast && (
            <div className="mt-4 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2">
              <Check size={14} />
              <span>Paramètres enregistrés automatiquement</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
