import { Conversation, UserSettings, CanvasArtifact } from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'kaydo_gpt_v2_conversations',
  ACTIVE_CHAT_ID: 'kaydo_gpt_v2_active_chat_id',
  SETTINGS: 'kaydo_gpt_v2_settings',
  CANVAS_ARTIFACTS: 'kaydo_gpt_v2_canvas_artifacts',
  PINNED_CHATS: 'kaydo_gpt_v2_pinned_chats',
  LAST_SESSION_TIME: 'kaydo_gpt_v2_last_session_time',
};

export const SEVEN_HOURS_MS = 7 * 60 * 60 * 1000; // 7 hours in milliseconds

export function loadLastSessionTime(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_SESSION_TIME);
    if (!raw) return Date.now();
    const val = parseInt(raw, 10);
    return isNaN(val) ? Date.now() : val;
  } catch {
    return Date.now();
  }
}

export function saveLastSessionTime(timestamp: number = Date.now()): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SESSION_TIME, timestamp.toString());
  } catch (e) {
    console.error('Failed to save last session time', e);
  }
}

export function shouldAutoRefreshAfter7Hours(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_SESSION_TIME);
    if (!raw) {
      saveLastSessionTime(Date.now());
      return false;
    }
    const lastTime = parseInt(raw, 10);
    if (isNaN(lastTime)) return false;
    const elapsed = Date.now() - lastTime;
    return elapsed >= SEVEN_HOURS_MS;
  } catch {
    return false;
  }
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  speechVoice: 'Kore',
  customInstructions: {
    aboutMe: '',
    responsePreferences: 'Soyez concis, structuré, précis et chaleureux. Fournissez du code bien formaté avec coloration syntaxique.',
    enabled: true,
  },
  language: 'fr',
  languageConfigured: false,
  soundEffects: true,
  sendOnEnter: true,
  userName: 'Utilisateur',
  userEmail: 'user@kaydogpt.ai',
  plan: 'FREE',
  registrationDate: Date.now() - 8 * 24 * 60 * 60 * 1000, // Default to 8 days so users can test and enjoy offline mode
  forceOfflineMode: false,
};

export function createNewConversation(customGptId?: string, title: string = 'Nouveau chat'): Conversation {
  return {
    id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    model: 'gpt-4o',
    messages: [],
    customGptId,
  };
}

export function loadConversations(): Conversation[] {
  try {
    const initialFreshChat = createNewConversation();
    const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (!raw) {
      return [initialFreshChat];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Retain all past conversations that have messages
      const pastWithMessages = parsed.filter(
        (c: Conversation) => c && Array.isArray(c.messages) && c.messages.length > 0
      );
      return [initialFreshChat, ...pastWithMessages];
    }
    return [initialFreshChat];
  } catch (e) {
    console.error('Failed to load conversations', e);
    return [createNewConversation()];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    // Keep all non-temporary conversations that have messages so history is always securely saved
    const toSave = conversations.filter(
      (c) => !c.isTemporary && c.messages && c.messages.length > 0
    );
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(toSave));
  } catch (e) {
    console.error('Failed to save conversations', e);
  }
}

export function loadActiveChatId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CHAT_ID);
  } catch {
    return null;
  }
}

export function saveActiveChatId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHAT_ID);
    }
  } catch (e) {
    console.error('Failed to save active chat ID', e);
  }
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function loadCanvasArtifacts(): CanvasArtifact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CANVAS_ARTIFACTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCanvasArtifacts(artifacts: CanvasArtifact[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CANVAS_ARTIFACTS, JSON.stringify(artifacts));
  } catch (e) {
    console.error('Failed to save canvas artifacts', e);
  }
}
