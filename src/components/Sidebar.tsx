import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  Compass,
  MessageSquare,
  Pin,
  MoreHorizontal,
  Trash2,
  Edit2,
  Share2,
  Sparkles,
  Settings,
  Sun,
  Moon,
  PanelLeftClose,
  Check,
  X,
  Flame,
  Download,
  Heart,
  FolderKanban,
  WifiOff,
  Shield,
  Star,
  User,
} from 'lucide-react';
import { Conversation, UserSettings, UserProfile, ConversationFolder } from '../types';
import { OpenAILogo } from './OpenAILogo';
import { ADMIN_EMAILS } from '../utils/authService';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onTogglePinChat: (id: string) => void;
  onOpenSettings: () => void;
  onOpenExploreGpts: () => void;
  onOpenShare: (chatId: string) => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onOpenInstall?: () => void;
  onOpenSupport?: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenPremium: () => void;
  onOpenFolders: () => void;
  onOpenOfflinePack: () => void;
  onOpenAdmin?: () => void;
  onOpenAppBuilder?: () => void;
  folders?: ConversationFolder[];
  selectedFolderId?: string | null;
  onSelectFolder?: (folderId: string | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onTogglePinChat,
  onOpenSettings,
  onOpenExploreGpts,
  onOpenShare,
  settings,
  onUpdateSettings,
  onOpenInstall,
  onOpenSupport,
  user,
  onOpenAuth,
  onOpenProfile,
  onOpenPremium,
  onOpenFolders,
  onOpenOfflinePack,
  onOpenAdmin,
  onOpenAppBuilder,
  folders = [],
  selectedFolderId = null,
  onSelectFolder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const isPremium =
    user?.plan === 'PREMIUM_ACTIVE' ||
    user?.role === 'admin' ||
    (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) ||
    user?.uid?.startsWith('creator_');
  const isAdmin =
    user?.role === 'admin' ||
    (user?.email && ['fivet5874@gmail.com', 'admin@kaydogpt.com'].includes(user.email.toLowerCase())) ||
    user?.uid?.startsWith('creator_');

  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingChatId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (selectedFolderId) {
      list = list.filter((c) => c.folderId === selectedFolderId);
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery, selectedFolderId]);

  // Group conversations by time
  const { pinnedChats, todayChats, yesterdayChats, past7DaysChats, past30DaysChats, olderChats } =
    useMemo(() => {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const todayStart = new Date().setHours(0, 0, 0, 0);
      const yesterdayStart = todayStart - oneDay;
      const sevenDaysStart = todayStart - 7 * oneDay;
      const thirtyDaysStart = todayStart - 30 * oneDay;

      const pinned: Conversation[] = [];
      const today: Conversation[] = [];
      const yesterday: Conversation[] = [];
      const past7: Conversation[] = [];
      const past30: Conversation[] = [];
      const older: Conversation[] = [];

      filteredConversations.forEach((conv) => {
        if (conv.isPinned) {
          pinned.push(conv);
          return;
        }

        const date = conv.updatedAt || conv.createdAt;
        if (date >= todayStart) {
          today.push(conv);
        } else if (date >= yesterdayStart) {
          yesterday.push(conv);
        } else if (date >= sevenDaysStart) {
          past7.push(conv);
        } else if (date >= thirtyDaysStart) {
          past30.push(conv);
        } else {
          older.push(conv);
        }
      });

      return {
        pinnedChats: pinned,
        todayChats: today,
        yesterdayChats: yesterday,
        past7DaysChats: past7,
        past30DaysChats: past30,
        olderChats: older,
      };
    }, [filteredConversations]);

  const handleStartRename = (conv: Conversation) => {
    setEditingChatId(conv.id);
    setEditTitle(conv.title);
    setActiveMenuId(null);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameChat(id, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings({ theme: nextTheme });
  };

  const renderSection = (title: string, list: Conversation[]) => {
    if (list.length === 0) return null;

    return (
      <div className="mb-4">
        <h3 className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 tracking-wider">
          {title}
        </h3>
        <div className="space-y-0.5">
          {list.map((conv) => {
            const isActive = activeChatId === conv.id;
            const isEditing = editingChatId === conv.id;

            return (
              <div
                key={conv.id}
                className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-gray-200/90 dark:bg-[#282828] text-gray-900 dark:text-gray-100 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-[#202020]'
                }`}
                onClick={() => {
                  if (!isEditing) onSelectChat(conv.id);
                }}
              >
                {isEditing ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(conv.id);
                        if (e.key === 'Escape') setEditingChatId(null);
                      }}
                      className="flex-1 px-2 py-0.5 text-xs bg-white dark:bg-[#333] border border-blue-500 rounded-md text-gray-900 dark:text-gray-100 outline-none"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveRename(conv.id);
                      }}
                      className="p-1 text-emerald-500 hover:text-emerald-600"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingChatId(null);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 truncate flex-1 min-w-0 pr-2">
                      {conv.isPinned ? (
                        <Pin size={13} className="text-amber-500 shrink-0 fill-amber-500/20" />
                      ) : (
                        <MessageSquare size={13} className="text-gray-400 shrink-0" />
                      )}
                      <span className="truncate">{conv.title}</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === conv.id ? null : conv.id);
                        }}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-300/50 dark:hover:bg-[#333]"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </div>

                    {/* Chat Context Menu */}
                    {activeMenuId === conv.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-2 top-8 z-30 w-44 bg-white dark:bg-[#2a2a2a] rounded-xl shadow-lg border border-gray-200 dark:border-[#383838] py-1 text-xs"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePinChat(conv.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#333] text-gray-700 dark:text-gray-200 text-left"
                        >
                          <Pin size={13} />
                          <span>{conv.isPinned ? 'Détacher' : 'Épingler'}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartRename(conv);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#333] text-gray-700 dark:text-gray-200 text-left"
                        >
                          <Edit2 size={13} />
                          <span>Renommer</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenShare(conv.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#333] text-gray-700 dark:text-gray-200 text-left"
                        >
                          <Share2 size={13} />
                          <span>Partager</span>
                        </button>
                        <div className="my-1 border-t border-gray-100 dark:border-[#333]" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(conv.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 text-left"
                        >
                          <Trash2 size={13} />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col w-72 bg-[#0d0d0d] border-r border-white/10 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-72'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200/60 dark:border-[#262626]">
          <div className="flex items-center gap-2.5 px-1">
            <OpenAILogo className="w-6 h-6 text-gray-900 dark:text-white" />
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-white flex items-center gap-1">
                <span>Kaydo GPT</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-blue-600 text-white">
                  v2
                </span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 md:hidden"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="p-3 space-y-2 border-b border-gray-200/60 dark:border-[#262626]">
          {/* New Chat */}
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Plus size={16} />
              <span>Nouveau chat</span>
            </span>
            <span className="text-[10px] opacity-75">⌘K</span>
          </button>

          {/* Secondary Actions: Folders & Settings */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={onOpenFolders}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-gray-200/70 dark:bg-[#252525] hover:bg-gray-200 dark:hover:bg-[#2e2e2e] text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
              title="Gérer les dossiers"
            >
              <FolderKanban size={14} className="text-blue-500" />
              <span>Dossiers</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-gray-200/70 dark:bg-[#252525] hover:bg-gray-200 dark:hover:bg-[#2e2e2e] text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
              title="Paramètres de l'application"
            >
              <Settings size={14} className="text-indigo-500" />
              <span>Options</span>
            </button>
          </div>

          {/* Admin Panel Access Button if Admin */}
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-all"
            >
              <Shield size={14} className="text-purple-500" />
              <span>Panneau d'Administration</span>
            </button>
          )}

          {/* Search Trigger */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-gray-200/60 dark:bg-[#212121] border border-transparent focus:border-blue-500/50 rounded-xl text-gray-900 dark:text-gray-200 placeholder-gray-400 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#2f2f2f]">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              {searchQuery ? 'Aucune conversation trouvée' : 'Historique vide'}
            </div>
          ) : (
            <>
              {renderSection('Épinglés', pinnedChats)}
              {renderSection("Aujourd'hui", todayChats)}
              {renderSection('Hier', yesterdayChats)}
              {renderSection('7 derniers jours', past7DaysChats)}
              {renderSection('30 derniers jours', past30DaysChats)}
              {renderSection('Plus ancien', olderChats)}
            </>
          )}
        </div>

        {/* Bottom User Bar */}
        <div className="p-2 border-t border-gray-200 dark:border-[#262626] bg-[#f3f3f3] dark:bg-[#141414]">
          {user ? (
            <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-gray-200 dark:hover:bg-[#212121] transition-colors">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-700 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-gray-900 dark:text-gray-100 truncate">
                      {user.displayName || 'Utilisateur'}
                    </span>
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md flex items-center gap-0.5 ${
                      isAdmin
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {isAdmin ? '👑 CRÉATEUR' : '✨ GRATUIT & ILLIMITÉ'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate leading-tight">
                    {user.email || user.phoneNumber || user.uid.slice(0, 10)}
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-0.5">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-[#2e2e2e] transition-colors"
                  title={settings.theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                >
                  {settings.theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                </button>

                <button
                  onClick={onOpenSettings}
                  className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-[#2e2e2e] transition-colors"
                  title="Paramètres"
                >
                  <Settings size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-1.5">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex-1 mr-2 cursor-pointer"
              >
                <User size={14} />
                <span>Se connecter</span>
              </button>

              <div className="flex items-center gap-0.5">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-[#2e2e2e] transition-colors"
                >
                  {settings.theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                </button>

                <button
                  onClick={onOpenSettings}
                  className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-[#2e2e2e] transition-colors"
                >
                  <Settings size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
