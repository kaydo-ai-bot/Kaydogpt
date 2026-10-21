import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { ChatInput } from './components/ChatInput';
import { CanvasView } from './components/CanvasView';
import { VoiceModeModal } from './components/VoiceModeModal';
import { SettingsModal } from './components/SettingsModal';
import { ShareModal } from './components/ShareModal';
import { ExploreGptsModal } from './components/ExploreGptsModal';
import { InstallModal } from './components/InstallModal';
import { SupportModal } from './components/SupportModal';
import { LanguageOnboardingModal } from './components/LanguageOnboardingModal';
import { AuthModal } from './components/AuthModal';
import { PremiumModal } from './components/PremiumModal';
import { AdminModal } from './components/AdminModal';
import { UserProfileModal } from './components/UserProfileModal';
import { FolderManagerModal } from './components/FolderManagerModal';
import { OfflineModelPackModal } from './components/OfflineModelPackModal';
import { AppBuilderInterface } from './components/AppBuilderInterface';
import { AppBuilderPaywall } from './components/AppBuilderPaywall';
import {
  Conversation,
  Message,
  ImageAttachment,
  UserSettings,
  CanvasArtifact,
  CustomGPT,
  UserProfile,
  ConversationFolder,
} from './types';
import {
  loadConversations,
  saveConversations,
  loadActiveChatId,
  saveActiveChatId,
  loadSettings,
  saveSettings,
  loadLastSessionTime,
  saveLastSessionTime,
  shouldAutoRefreshAfter7Hours,
} from './utils/storage';
import { CUSTOM_GPTS } from './data/customGpts';
import { generateOfflineAnswer } from './utils/offlineEngine';
import { aiRouter, NetworkAIStatus } from './utils/aiRouter';
import { SupportedLanguage } from './utils/i18n';
import { AuthService, ADMIN_EMAILS } from './utils/authService';
import { SubscriptionService } from './utils/subscriptionService';
import { testFirestoreConnection } from './lib/firebase';

export default function App() {
  // Test connection on mount
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Application State
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    const loaded = loadConversations();
    return loaded.length > 0 ? loaded[0].id : null;
  });
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [currentModelId, setCurrentModelId] = useState<string>('gpt-4o');
  const [isTemporaryChat, setIsTemporaryChat] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [activeGpt, setActiveGpt] = useState<CustomGPT | null>(null);

  // Authentication & User Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('kaydo_creator_session') === 'true') {
        return AuthService.createCreatorProfile();
      }
    } catch (e) {}
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState<boolean>(false);
  const [isFoldersModalOpen, setIsFoldersModalOpen] = useState<boolean>(false);
  const [isOfflinePackModalOpen, setIsOfflinePackModalOpen] = useState<boolean>(false);
  const [isAppBuilderOpen, setIsAppBuilderOpen] = useState<boolean>(false);

  // Folders State
  const [folders, setFolders] = useState<ConversationFolder[]>(() => {
    try {
      const saved = localStorage.getItem('kaydo_folders_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Offline Pack Downloaded State
  const [isOfflinePackDownloaded, setIsOfflinePackDownloaded] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kaydo_offline_pack_downloaded') === 'true';
    } catch {
      return false;
    }
  });

  // First-time Language Onboarding Modal
  const [isLanguageOnboardingOpen, setIsLanguageOnboardingOpen] = useState<boolean>(() => {
    return !settings.languageConfigured;
  });

  // Modals & Panels State
  const [canvasOpen, setCanvasOpen] = useState<boolean>(false);
  const [activeArtifact, setActiveArtifact] = useState<CanvasArtifact | null>(null);
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isExploreGptsOpen, setIsExploreGptsOpen] = useState<boolean>(false);
  const [isInstallOpen, setIsInstallOpen] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [shareChatId, setShareChatId] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const accumulatedTextRef = useRef('');

  // Firebase Auth State Listener & Subscription Verification
  useEffect(() => {
    const unsubscribe = AuthService.onAuthChange(async (user) => {
      if (user) {
        // If email is in admin emails, force role and plan
        const isAdmin = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
        const effectiveUser: UserProfile = {
          ...user,
          role: isAdmin ? 'admin' : user.role,
          plan: isAdmin ? 'PREMIUM_ACTIVE' : user.plan,
        };

        setCurrentUser(effectiveUser);
        // Sync & update user settings
        handleUpdateSettings({
          userName: effectiveUser.displayName || 'Utilisateur',
          userEmail: effectiveUser.email || effectiveUser.phoneNumber || '',
          plan: effectiveUser.plan || 'FREE',
        });

        // Verify active subscription expiry
        try {
          const updatedPlan = await SubscriptionService.checkAndUpdateSubscription(effectiveUser);
          if (updatedPlan && updatedPlan !== effectiveUser.plan) {
            setCurrentUser((prev) => (prev ? { ...prev, plan: updatedPlan } : null));
            handleUpdateSettings({ plan: updatedPlan });
          }
        } catch (e) {
          console.error('Subscription sync check error:', e);
        }
      } else {
        // If creator session is active locally, keep creator
        try {
          if (typeof window !== 'undefined' && localStorage.getItem('kaydo_creator_session') === 'true') {
            const creator = AuthService.createCreatorProfile();
            setCurrentUser(creator);
            handleUpdateSettings({
              userName: creator.displayName,
              userEmail: creator.email,
              plan: 'PREMIUM_ACTIVE',
            });
            return;
          }
        } catch (e) {}
        setCurrentUser(null);
      }
    });

    // Custom Creator Auth Listener for immediate 1-click test access
    const handleCreatorAuth = (e: any) => {
      if (e.detail) {
        setCurrentUser(e.detail);
        handleUpdateSettings({
          userName: e.detail.displayName,
          userEmail: e.detail.email,
          plan: 'PREMIUM_ACTIVE',
        });
      }
    };
    window.addEventListener('kaydo_creator_auth', handleCreatorAuth);

    return () => {
      unsubscribe();
      window.removeEventListener('kaydo_creator_auth', handleCreatorAuth);
    };
  }, []);

  // Save folders
  useEffect(() => {
    try {
      localStorage.setItem('kaydo_folders_v2', JSON.stringify(folders));
    } catch (e) {}
  }, [folders]);

  // Network Online / Offline / Transitioning Detection with AIRouter
  const [networkAIStatus, setNetworkAIStatus] = useState<NetworkAIStatus>(() => aiRouter.getStatus());
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const unsubscribeRouter = aiRouter.subscribe((status) => {
      setNetworkAIStatus(status);
      setIsBrowserOnline(status === 'online');
    });

    return () => {
      unsubscribeRouter();
    };
  }, []);

  // Offline Engine & 100% Free Unlimited Access for all users
  const isCreatorOrAdmin =
    currentUser?.role === 'admin' ||
    (currentUser?.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase())) ||
    currentUser?.uid?.startsWith('creator_');
  const isPremiumUser = true; // Tout est 100% gratuit et illimité pour tous les utilisateurs
  const isOfflineActive =
    networkAIStatus === 'offline' ||
    settings.forceOfflineMode ||
    settings.aiRoutingMode === 'offline' ||
    !isBrowserOnline;

  // Sync dark/light theme class on root
  useEffect(() => {
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Persist conversations
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  // Persist active chat ID
  useEffect(() => {
    saveActiveChatId(activeChatId);
  }, [activeChatId]);

  // Persist settings
  const handleUpdateSettings = (updated: Partial<UserSettings>) => {
    const next = { ...settings, ...updated };
    setSettings(next);
    saveSettings(next);
  };

  // Get active conversation or create fallback
  const activeConversation = conversations.find((c) => c.id === activeChatId) || null;
  const activeMessages = activeConversation ? activeConversation.messages : [];

  // Create a new conversation
  const handleNewChat = (customGpt?: CustomGPT) => {
    saveLastSessionTime(Date.now());
    const newId = `chat-${Date.now()}`;
    const newTitle = customGpt ? customGpt.name : 'Nouveau chat';
    const newConv: Conversation = {
      id: newId,
      title: newTitle,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      model: currentModelId,
      isTemporary: isTemporaryChat,
      customGptId: customGpt?.id,
      folderId: selectedFolderId || undefined,
    };

    if (customGpt) {
      setActiveGpt(customGpt);
    } else {
      setActiveGpt(null);
    }

    setConversations((prev) => [newConv, ...prev]);
    setActiveChatId(newId);
  };

  // 7-Hour Auto-Refresh Conversation Cycle
  useEffect(() => {
    if (shouldAutoRefreshAfter7Hours()) {
      saveLastSessionTime(Date.now());
      handleNewChat();
    }

    const timer = setInterval(() => {
      if (shouldAutoRefreshAfter7Hours()) {
        saveLastSessionTime(Date.now());
        handleNewChat();
      }
    }, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && shouldAutoRefreshAfter7Hours()) {
        saveLastSessionTime(Date.now());
        handleNewChat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Select conversation
  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    const conv = conversations.find((c) => c.id === id);
    if (conv?.customGptId) {
      const gpt = CUSTOM_GPTS.find((g) => g.id === conv.customGptId) || null;
      setActiveGpt(gpt);
    } else {
      setActiveGpt(null);
    }
  };

  // Delete conversation
  const handleDeleteChat = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveChatId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Rename conversation
  const handleRenameChat = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  // Pin/Unpin conversation
  const handleTogglePinChat = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  // Clear all conversations
  const handleClearAllChats = () => {
    setConversations([]);
    setActiveChatId(null);
  };

  // Folder Management Handlers
  const handleAddFolder = (name: string, color: string) => {
    const newFolder: ConversationFolder = {
      id: `folder-${Date.now()}`,
      name,
      color,
      createdAt: Date.now(),
    };
    setFolders((prev) => [...prev, newFolder]);
  };

  const handleDeleteFolder = (id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
    if (selectedFolderId === id) setSelectedFolderId(null);
  };

  // Stop active streaming
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);

    if (activeChatId) {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeChatId) return c;
          const updatedMessages = c.messages.map((m, idx) =>
            idx === c.messages.length - 1 ? { ...m, isStreaming: false } : m
          );
          return { ...c, messages: updatedMessages };
        })
      );
    }
  };

  // Main Send Message handler with Gemini Streaming & DALL-E image generation
  const handleSendMessage = async (
    content: string,
    images: ImageAttachment[] = [],
    options: { webSearch: boolean; reasoning: boolean } = { webSearch: false, reasoning: false }
  ) => {
    let currentConvId = activeChatId;
    let targetConv = conversations.find((c) => c.id === currentConvId);

    // If no active chat exists, create one immediately
    if (!targetConv || !currentConvId) {
      const newId = `chat-${Date.now()}`;
      const title = content.slice(0, 32) || 'Nouveau chat';
      targetConv = {
        id: newId,
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        model: currentModelId,
        isTemporary: isTemporaryChat,
        folderId: selectedFolderId || undefined,
      };
      setConversations((prev) => [targetConv!, ...prev]);
      setActiveChatId(newId);
      currentConvId = newId;
    }

    const userMessageId = `msg-user-${Date.now()}`;
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content,
      timestamp: Date.now(),
      images: images.length > 0 ? images : undefined,
      status: 'sending',
    };

    const assistantMessageId = `msg-assistant-${Date.now() + 1}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      model: currentModelId,
      isStreaming: true,
      reasoning: options.reasoning || currentModelId === 'o1' || currentModelId === 'o3-mini',
      webSearch: options.webSearch,
    };

    const isFirstMessage = targetConv.messages.length === 0;
    const computedTitle = isFirstMessage ? content.slice(0, 32) : targetConv.title;
    const newMessages = [...targetConv.messages, userMessage, assistantMessage];

    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConvId
          ? {
              ...c,
              title: computedTitle,
              updatedAt: Date.now(),
              messages: newMessages,
            }
          : c
      )
    );

    setIsStreaming(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Special DALL-E 3 Mode / Direct Image Generation
    if (
      currentModelId === 'dalle-3' ||
      content.toLowerCase().startsWith('/image') ||
      content.toLowerCase().startsWith('génère une image')
    ) {
      try {
        const imgPrompt = content.replace(/^\/image/i, '').trim();
        const res = await fetch('/api/image/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: imgPrompt || content }),
          signal: controller.signal,
        });
        const imgData = await res.json();

        let finalMarkdown = '';
        if (imgData.success && imgData.imageUrl) {
          finalMarkdown = `Voici l'image générée par **Kaydo GPT Studio Créatif** pour : *"${imgPrompt || content}"*\n\n![Generated Image](${imgData.imageUrl})`;
        } else {
          finalMarkdown = `Désolé, impossible de générer l'image pour le moment.`;
        }

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== currentConvId) return c;
            const updated = c.messages.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: finalMarkdown, isStreaming: false }
                : m
            );
            return { ...c, messages: updated };
          })
        );
        setIsStreaming(false);
        return;
      } catch (err) {
        console.error('Image gen error', err);
      }
    }

    // Build system prompt from active GPT or custom instructions
    let systemInstruction = '';
    if (activeGpt) {
      systemInstruction = activeGpt.systemPrompt;
    } else if (settings.customInstructions.enabled) {
      const { aboutMe, responsePreferences } = settings.customInstructions;
      systemInstruction = `User context: ${aboutMe}\nResponse instructions: ${responsePreferences}`;
    }

    const historyToSend = [...targetConv.messages, userMessage];
    const routingMode = isOfflineActive ? 'offline' : (settings.aiRoutingMode || 'auto');

    try {
      await aiRouter.routeMessage({
        messages: historyToSend,
        systemInstruction,
        model: currentModelId,
        webSearch: options.webSearch,
        reasoning: options.reasoning || currentModelId === 'o1' || currentModelId === 'o3-mini',
        routingMode,
        signal: controller.signal,
        userId: currentUser?.uid || 'anon',
        userEmail: currentUser?.email || '',
        plan: currentUser?.plan || 'FREE',
        onChunk: (accumulated) => {
          accumulatedTextRef.current = accumulated;
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== currentConvId) return c;
              const updated = c.messages.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, content: accumulated, isStreaming: true }
                  : m
              );
              return { ...c, messages: updated };
            })
          );
        },
        onSearchStatus: (status) => {
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== currentConvId) return c;
              const updated = c.messages.map((m) =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      isSearchingWeb: status.isSearching,
                      webSearchPerformed: status.searchPerformed ?? (status.isSearching ? true : m.webSearchPerformed),
                      webSearchQueries: status.queries ?? m.webSearchQueries,
                    }
                  : m
              );
              return { ...c, messages: updated };
            })
          );
        },
        onSources: (sources) => {
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== currentConvId) return c;
              const updated = c.messages.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, sources, webSearchPerformed: true, isSearchingWeb: false }
                  : m
              );
              return { ...c, messages: updated };
            })
          );
        },
        onThought: (thought) => {
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== currentConvId) return c;
              const updated = c.messages.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, thought }
                  : m
              );
              return { ...c, messages: updated };
            })
          );
        },
        onDone: (finalText) => {
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== currentConvId) return c;
              const updated = c.messages.map((m) => {
                if (m.id === userMessageId) {
                  return { ...m, status: 'sent' as const };
                }
                if (m.id === assistantMessageId) {
                  return { ...m, content: finalText || 'Prêt pour votre prochaine question.', isStreaming: false, isSearchingWeb: false };
                }
                return m;
              });
              return { ...c, messages: updated };
            })
          );
        },
        onError: (err) => {
          console.warn('AI Router error handled:', err);
          const fallback = accumulatedTextRef.current || generateOfflineAnswer(content);
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== currentConvId) return c;
              const updated = c.messages.map((m) => {
                if (m.id === userMessageId) {
                  return { ...m, status: 'sent' as const };
                }
                if (m.id === assistantMessageId) {
                  return { ...m, content: fallback, isStreaming: false };
                }
                return m;
              });
              return { ...c, messages: updated };
            })
          );
        },
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const fallback = accumulatedTextRef.current || generateOfflineAnswer(content);
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== currentConvId) return c;
            const updated = c.messages.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: fallback, isStreaming: false }
                : m
            );
            return { ...c, messages: updated };
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate last response
  const handleRegenerate = () => {
    if (!activeConversation || activeConversation.messages.length === 0) return;
    const msgs = activeConversation.messages;
    const lastUserIndex = [...msgs].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIndex === -1) return;

    const realUserIndex = msgs.length - 1 - lastUserIndex;
    const lastUserMsg = msgs[realUserIndex];

    const trimmed = msgs.slice(0, realUserIndex);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id ? { ...c, messages: trimmed } : c
      )
    );

    handleSendMessage(lastUserMsg.content, lastUserMsg.images || [], {
      webSearch: false,
      reasoning: currentModelId === 'o1' || currentModelId === 'o3-mini',
    });
  };

  // Edit user message and fork/regenerate
  const handleEditMessage = (messageIndex: number, newContent: string) => {
    if (!activeConversation) return;
    const trimmed = activeConversation.messages.slice(0, messageIndex);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id ? { ...c, messages: trimmed } : c
      )
    );
    handleSendMessage(newContent, [], {
      webSearch: false,
      reasoning: currentModelId === 'o1' || currentModelId === 'o3-mini',
    });
  };

  // Open Code in Canvas Split Pane
  const handleOpenCanvas = (code: string, language: string, title: string) => {
    const artifact: CanvasArtifact = {
      id: `art-${Date.now()}`,
      title,
      type: 'code',
      content: code,
      language,
      version: 1,
      updatedAt: Date.now(),
    };
    setActiveArtifact(artifact);
    setCanvasOpen(true);
  };

  // AI Edit in Canvas Workspace
  const handleAskAiToEditCanvas = async (instruction: string, currentContent: string) => {
    if (!activeArtifact) return;

    const prompt = `${instruction}\n\nHere is the current code:\n\`\`\`${activeArtifact.language || 'text'}\n${currentContent}\n\`\`\`\nProvide only the updated clean code without additional text.`;

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemInstruction:
            'You are a code editor AI. Output ONLY the raw code directly. Do not wrap in markdown or backticks.',
          model: 'gpt-4o',
        }),
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let newCode = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            try {
              const d = JSON.parse(line.slice(6));
              if (d.type === 'chunk' && d.text) {
                newCode += d.text;
                setActiveArtifact((prev) =>
                  prev
                    ? {
                        ...prev,
                        content: newCode.replace(/^```[a-z]*\n/i, '').replace(/\n```$/, ''),
                        updatedAt: Date.now(),
                      }
                    : null
                );
              }
            } catch {}
          }
        }
      }
    } catch (e) {
      console.error('Canvas edit error', e);
    }
  };

  // Send voice message
  const handleSendVoiceMessage = async (voiceText: string): Promise<string> => {
    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: voiceText }],
          systemInstruction:
            'You are Kaydo GPT speaking via voice. Be natural, concise, and friendly. Limit response to 1-3 clear sentences.',
          model: 'gpt-4o',
        }),
      });

      if (!res.body) return "Je vous écoute !";

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let textResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            try {
              const d = JSON.parse(line.slice(6));
              if (d.type === 'chunk' && d.text) {
                textResponse += d.text;
              }
            } catch {}
          }
        }
      }
      return textResponse || 'Je vous écoute !';
    } catch (e) {
      return "Une erreur s'est produite.";
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-[#ececec] font-sans select-none antialiased">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={() => handleNewChat()}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onTogglePinChat={handleTogglePinChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExploreGpts={() => setIsExploreGptsOpen(true)}
        onOpenShare={(id) => setShareChatId(id)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenInstall={() => setIsInstallOpen(true)}
        onOpenSupport={() => setIsSupportModalOpen(true)}
        user={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsUserProfileModalOpen(true)}
        onOpenPremium={() => setIsPremiumModalOpen(true)}
        onOpenFolders={() => setIsFoldersModalOpen(true)}
        onOpenOfflinePack={() => setIsOfflinePackModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenAppBuilder={() => setIsAppBuilderOpen(true)}
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={(id) => setSelectedFolderId(id)}
      />

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative bg-black">
        {/* Top Header */}
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          currentModelId={currentModelId}
          onSelectModel={(m) => setCurrentModelId(m)}
          isTemporaryChat={isTemporaryChat}
          onToggleTemporaryChat={() => setIsTemporaryChat(!isTemporaryChat)}
          onNewChat={() => handleNewChat()}
          onOpenShare={() => setShareChatId(activeChatId)}
          canvasOpen={canvasOpen}
          onToggleCanvas={() => setCanvasOpen(!canvasOpen)}
          hasMessages={activeMessages.length > 0}
          isOffline={isOfflineActive}
          networkStatus={networkAIStatus}
          onToggleOffline={() => {
            handleUpdateSettings({ forceOfflineMode: !settings.forceOfflineMode });
          }}
          isOfflineUnlocked={true}
          daysRemaining={0}
          onOpenInstall={() => setIsInstallOpen(true)}
          user={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenProfile={() => setIsUserProfileModalOpen(true)}
          onOpenPremium={() => setIsPremiumModalOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isAppBuilderOpen={isAppBuilderOpen}
          onToggleAppBuilder={() => setIsAppBuilderOpen(!isAppBuilderOpen)}
        />

        {/* Temporary Chat Notice Banner */}
        {isTemporaryChat && (
          <div className="bg-amber-500/10 dark:bg-amber-500/20 border-b border-amber-500/30 px-4 py-1.5 text-center text-xs text-amber-700 dark:text-amber-300 font-medium">
            🔥 Discussion temporaire activée — Cette conversation ne sera pas enregistrée dans votre historique.
          </div>
        )}

        {/* Active Custom GPT Banner */}
        {activeGpt && (
          <div className="bg-purple-500/10 border-b border-purple-500/20 px-4 py-1.5 flex items-center justify-between text-xs text-purple-700 dark:text-purple-300">
            <span className="font-semibold">GPT personnalisé actif : {activeGpt.name}</span>
            <button
              onClick={() => setActiveGpt(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-[11px] underline cursor-pointer"
            >
              Désactiver
            </button>
          </div>
        )}

        {/* Content Area: App Builder PRO or Standard Chat + Split Canvas */}
        {isAppBuilderOpen ? (
          <div className="flex-1 flex overflow-hidden relative">
            {isPremiumUser ? (
              <AppBuilderInterface
                currentUser={currentUser || { uid: 'guest', email: '', displayName: 'Utilisateur PRO', plan: 'PRO_ACTIVE', role: 'user', authProviders: ['email'], createdAt: Date.now(), updatedAt: Date.now() }}
                onOpenUpgradeModal={() => setIsPremiumModalOpen(true)}
                onClose={() => setIsAppBuilderOpen(false)}
              />
            ) : (
              <AppBuilderPaywall
                currentUser={currentUser}
                onOpenUpgradeModal={() => setIsPremiumModalOpen(true)}
                onClose={() => setIsAppBuilderOpen(false)}
              />
            )}
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden relative">
            <div className="flex-1 flex flex-col h-full min-w-0">
              <ChatView
                messages={activeMessages}
                isStreaming={isStreaming}
                onSendMessage={handleSendMessage}
                onRegenerate={handleRegenerate}
                onOpenCanvas={handleOpenCanvas}
                speechVoice={settings.speechVoice}
                onEditMessage={handleEditMessage}
                language={settings.language || 'fr'}
                onOpenSupport={() => setIsSupportModalOpen(true)}
              />

              {/* Input Prompt Box */}
              <ChatInput
                onSendMessage={handleSendMessage}
                onStopStreaming={handleStopStreaming}
                isStreaming={isStreaming}
                onOpenVoiceMode={() => setIsVoiceModeOpen(true)}
                defaultReasoning={currentModelId === 'o1' || currentModelId === 'o3-mini'}
                isOffline={isOfflineActive}
                isOfflineUnlocked={true}
                language={settings.language || 'fr'}
                onOpenSupport={() => setIsSupportModalOpen(true)}
              />
            </div>

            {/* Canvas Split Screen */}
            {canvasOpen && (
              <CanvasView
                artifact={activeArtifact}
                onClose={() => setCanvasOpen(false)}
                onUpdateArtifact={(art) => setActiveArtifact(art)}
                onAskAiToEdit={handleAskAiToEditCanvas}
              />
            )}
          </div>
        )}
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
        }}
      />

      {/* Premium Subscription & Payment Modal */}
      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        user={currentUser}
        onOpenAuth={() => {
          setIsPremiumModalOpen(false);
          setIsAuthModalOpen(true);
        }}
        onSubscriptionUpdated={(status) => {
          setCurrentUser((prev) => (prev ? { ...prev, plan: status } : null));
          handleUpdateSettings({ plan: status });
        }}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        user={currentUser}
        onOpenPremium={() => {
          setIsUserProfileModalOpen(false);
          setIsPremiumModalOpen(true);
        }}
        onOpenAdmin={() => {
          setIsUserProfileModalOpen(false);
          setIsAdminModalOpen(true);
        }}
        onOpenSettings={() => {
          setIsUserProfileModalOpen(false);
          setIsSettingsOpen(true);
        }}
        onLogout={() => {
          setCurrentUser(null);
          handleUpdateSettings({
            userName: 'Utilisateur',
            userEmail: '',
            plan: 'FREE',
          });
        }}
      />

      {/* Admin Panel Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Folder Manager Modal */}
      <FolderManagerModal
        isOpen={isFoldersModalOpen}
        onClose={() => setIsFoldersModalOpen(false)}
        folders={folders}
        onAddFolder={handleAddFolder}
        onDeleteFolder={handleDeleteFolder}
        user={currentUser}
        onOpenPremium={() => {
          setIsFoldersModalOpen(false);
          setIsPremiumModalOpen(true);
        }}
      />

      {/* Offline Model Pack Modal */}
      <OfflineModelPackModal
        isOpen={isOfflinePackModalOpen}
        onClose={() => setIsOfflinePackModalOpen(false)}
        user={currentUser}
        onOpenPremium={() => {
          setIsOfflinePackModalOpen(false);
          setIsPremiumModalOpen(true);
        }}
        isDownloaded={isOfflinePackDownloaded}
        onSetDownloaded={(val) => setIsOfflinePackDownloaded(val)}
      />

      {/* Advanced Voice Mode Modal */}
      <VoiceModeModal
        isOpen={isVoiceModeOpen}
        onClose={() => setIsVoiceModeOpen(false)}
        onSendVoiceMessage={handleSendVoiceMessage}
        speechVoice={settings.speechVoice}
        onSelectVoice={(v) => handleUpdateSettings({ speechVoice: v })}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(s) => setSettings(s)}
        conversations={conversations}
        onClearAllChats={handleClearAllChats}
        onOpenSupport={() => setIsSupportModalOpen(true)}
      />

      {/* Share Conversation Modal */}
      <ShareModal
        isOpen={!!shareChatId}
        onClose={() => setShareChatId(null)}
        conversation={conversations.find((c) => c.id === shareChatId) || null}
      />

      {/* Explore GPTs Modal */}
      <ExploreGptsModal
        isOpen={isExploreGptsOpen}
        onClose={() => setIsExploreGptsOpen(false)}
        onSelectGpt={(gpt) => handleNewChat(gpt)}
      />

      {/* Install / Download Mobile App Modal */}
      <InstallModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />

      {/* Support / Natcash & Pro Services Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        language={settings.language || 'fr'}
      />

      {/* Language Onboarding Modal on First Visit */}
      <LanguageOnboardingModal
        isOpen={isLanguageOnboardingOpen}
        onSelectLanguage={(lang: SupportedLanguage) => {
          handleUpdateSettings({ language: lang, languageConfigured: true });
          setIsLanguageOnboardingOpen(false);
        }}
      />
    </div>
  );
}
