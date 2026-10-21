import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Sparkles,
  Zap,
  Brain,
  Code2,
  Image as ImageIcon,
  Share2,
  Menu,
  MessageSquarePlus,
  Flame,
  Columns2,
  Check,
  User,
  Settings,
  SquarePen,
  MoreVertical,
} from 'lucide-react';
import { AVAILABLE_MODELS } from '../data/models';
import { ModelConfig, UserProfile } from '../types';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  currentModelId: string;
  onSelectModel: (modelId: string) => void;
  isTemporaryChat: boolean;
  onToggleTemporaryChat: () => void;
  onNewChat: () => void;
  onOpenShare: () => void;
  canvasOpen: boolean;
  onToggleCanvas: () => void;
  hasMessages: boolean;
  isOffline: boolean;
  networkStatus?: 'online' | 'transitioning' | 'offline';
  onToggleOffline: () => void;
  isOfflineUnlocked: boolean;
  daysRemaining: number;
  onOpenInstall?: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenPremium: () => void;
  onOpenSettings?: () => void;
  isAppBuilderOpen?: boolean;
  onToggleAppBuilder?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  currentModelId,
  onSelectModel,
  isTemporaryChat,
  onToggleTemporaryChat,
  onNewChat,
  onOpenShare,
  canvasOpen,
  onToggleCanvas,
  hasMessages,
  user,
  onOpenAuth,
  onOpenProfile,
  onOpenPremium,
  onOpenSettings,
  isAppBuilderOpen = false,
  onToggleAppBuilder,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const currentModel =
    AVAILABLE_MODELS.find((m) => m.id === currentModelId) || AVAILABLE_MODELS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setModelDropdownOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getModelIcon = (id: string) => {
    switch (id) {
      case 'gpt-4o':
        return <Sparkles size={16} className="text-purple-400" />;
      case 'gpt-4o-mini':
        return <Zap size={16} className="text-emerald-400" />;
      case 'o1':
        return <Brain size={16} className="text-amber-400" />;
      case 'o3-mini':
        return <Code2 size={16} className="text-blue-400" />;
      case 'dalle-3':
        return <ImageIcon size={16} className="text-rose-400" />;
      default:
        return <Sparkles size={16} className="text-purple-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-14 px-3 sm:px-4 bg-black border-b border-white/5 select-none transition-colors">
      {/* Left controls: Circular Hamburger Button as in screenshot */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="w-10 h-10 rounded-full bg-[#212121] hover:bg-[#2c2c2c] flex items-center justify-center text-white transition-colors cursor-pointer active:scale-95"
          title={sidebarOpen ? 'Fermer le menu latéral' : 'Ouvrir le menu latéral'}
        >
          <Menu size={20} />
        </button>

        {isAppBuilderOpen && (
          <button
            onClick={onToggleAppBuilder}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs transition-all cursor-pointer"
          >
            <span>←</span>
            <span>Retour au Chat</span>
          </button>
        )}
      </div>

      {/* Center: Clean spacious area */}
      <div className="flex-1" />

      {/* Right controls: Pill Container with New Chat (SquarePen) and 3-dots Menu as in screenshot */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-[#212121] hover:bg-[#272727] rounded-full px-3 py-1.5 gap-3.5 text-white transition-colors relative" ref={moreMenuRef}>
          {/* New Chat icon */}
          <button
            onClick={onNewChat}
            className="p-1 text-gray-200 hover:text-white transition-colors cursor-pointer active:scale-90"
            title="Nouvelle discussion"
          >
            <SquarePen size={19} />
          </button>

          {/* More options 3-dots */}
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className="p-1 text-gray-200 hover:text-white transition-colors cursor-pointer active:scale-90"
            title="Options supplémentaires"
          >
            <MoreVertical size={19} />
          </button>

          {/* Options Dropdown Menu */}
          {moreMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#1e1f23] rounded-2xl shadow-2xl border border-[#2e3038] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Modèle actif : <span className="text-white font-medium">{currentModel.name}</span>
              </div>
              <div className="px-2 py-1 space-y-0.5 max-h-48 overflow-y-auto">
                {AVAILABLE_MODELS.map((model: ModelConfig) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onSelectModel(model.id);
                      setMoreMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      currentModelId === model.id ? 'bg-[#2b2d35] text-white font-semibold' : 'text-gray-300 hover:bg-[#26282e]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getModelIcon(model.id)}
                      <span>{model.name}</span>
                    </div>
                    {currentModelId === model.id && <Check size={14} className="text-blue-400" />}
                  </button>
                ))}
              </div>

              <div className="my-1.5 border-t border-[#2a2c33]" />

              {/* Forfaits */}
              <button
                onClick={() => {
                  onOpenPremium();
                  setMoreMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-cyan-400 hover:bg-[#26282e] transition-colors cursor-pointer font-medium"
              >
                <Sparkles size={15} />
                <span>Voir les forfaits & abonnements</span>
              </button>

              {/* Temporary chat */}
              <button
                onClick={() => {
                  onToggleTemporaryChat();
                  setMoreMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-300 hover:bg-[#26282e] transition-colors cursor-pointer"
              >
                <Flame size={15} className={isTemporaryChat ? 'text-amber-500' : 'text-gray-400'} />
                <span>{isTemporaryChat ? 'Désactiver discussion temporaire' : 'Discussion temporaire'}</span>
              </button>

              {/* Canvas */}
              <button
                onClick={() => {
                  onToggleCanvas();
                  setMoreMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-300 hover:bg-[#26282e] transition-colors cursor-pointer"
              >
                <Columns2 size={15} className="text-gray-400" />
                <span>{canvasOpen ? 'Fermer Canvas' : 'Ouvrir Canvas'}</span>
              </button>

              {/* Share */}
              {hasMessages && (
                <button
                  onClick={() => {
                    onOpenShare();
                    setMoreMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-300 hover:bg-[#26282e] transition-colors cursor-pointer"
                >
                  <Share2 size={15} className="text-gray-400" />
                  <span>Partager cette discussion</span>
                </button>
              )}

              {/* Settings */}
              {onOpenSettings && (
                <button
                  onClick={() => {
                    onOpenSettings();
                    setMoreMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-300 hover:bg-[#26282e] transition-colors cursor-pointer"
                >
                  <Settings size={15} className="text-gray-400" />
                  <span>Paramètres</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
