export interface ImageAttachment {
  data: string; // base64 or url
  mimeType: string;
  name: string;
  size?: number;
}

export interface GroundingSource {
  title: string;
  uri: string;
  siteName?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  images?: ImageAttachment[];
  model?: string;
  webSearch?: boolean;
  webSearchPerformed?: boolean;
  webSearchQueries?: string[];
  isSearchingWeb?: boolean;
  reasoning?: boolean;
  thought?: string;
  thoughtDuration?: number;
  sources?: GroundingSource[];
  isStreaming?: boolean;
  status?: 'sending' | 'sent' | 'error';
  error?: string;
  feedback?: 'like' | 'dislike' | null;
}

export interface CustomGPT {
  id: string;
  name: string;
  description: string;
  avatarIcon: string;
  avatarBg: string;
  systemPrompt: string;
  author: string;
  samplePrompts: string[];
  category: 'Featured' | 'Writing' | 'Coding' | 'Education' | 'Productivity' | 'Lifestyle';
}

export type LanguageCode = 'fr' | 'ht' | 'en' | 'es' | 'pt';

export type SubscriptionStatus = 'FREE' | 'PREMIUM_ACTIVE' | 'PREMIUM_EXPIRED' | 'PAYMENT_PENDING' | 'PRO_ACTIVE' | 'PRO_EXPIRED';

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  authProviders: string[]; // e.g. ['google.com', 'password', 'phone']
  role: 'user' | 'admin';
  plan: SubscriptionStatus;
  isPro?: boolean;
  createdAt: number;
  updatedAt: number;
  preferences?: Partial<UserSettings>;
}

export type PaymentCurrency = 'USD' | 'HTG' | 'EUR';

export interface SubscriptionRecord {
  id?: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  status: SubscriptionStatus;
  plan: 'FREE' | 'PREMIUM_MONTHLY' | 'PRO_MONTHLY';
  price: number; // 5.00 USD / 650 HTG / 4.70 EUR (PRO) ou 3.00 USD (PREMIUM)
  currency: PaymentCurrency;
  transactionId: string;
  paymentMethod: 'natcash' | 'card' | 'moncash' | 'international' | 'system';
  senderPhone?: string;
  referenceCode?: string;
  startedAt: number;
  expiresAt: number;
  createdAt: number;
  updatedAt: number;
  autoRenew?: boolean;
  notes?: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  amount: number;
  currency: PaymentCurrency;
  status: 'CONFIRMED' | 'PENDING' | 'REJECTED';
  paymentMethod: string;
  referenceCode: string;
  senderPhone: string;
  timestamp: number;
  verifiedAt?: number;
  used: boolean;
  notes?: string;
}

export interface ConversationFolder {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  createdAt: number;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  model: string;
  isPinned?: boolean;
  isTemporary?: boolean;
  customGptId?: string;
  folderId?: string;
  userId?: string;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system' | 'midnight' | 'emerald' | 'amber' | 'amethyst';
  speechVoice: 'Kore' | 'Fenrir' | 'Puck' | 'Zephyr' | 'Charon';
  customInstructions: {
    aboutMe: string;
    responsePreferences: string;
    enabled: boolean;
  };
  language: LanguageCode;
  languageConfigured?: boolean;
  soundEffects: boolean;
  sendOnEnter: boolean;
  userName: string;
  userEmail: string;
  plan: SubscriptionStatus;
  registrationDate?: number;
  forceOfflineMode?: boolean;
  aiRoutingMode?: 'auto' | 'online' | 'offline';
  offlineModelDownloaded?: boolean;
  footballApiKey?: string;
  footballApiUrl?: string;
}

export interface CanvasArtifact {
  id: string;
  title: string;
  type: 'code' | 'document' | 'markdown' | 'html';
  content: string;
  language?: string;
  version: number;
  updatedAt: number;
}

export interface ModelConfig {
  id: string;
  name: string;
  shortName: string;
  badge?: string;
  description: string;
  tagline: string;
  icon: string;
  isReasoning?: boolean;
  supportsVision?: boolean;
  supportsWeb?: boolean;
  supportsImageGen?: boolean;
}

export interface PaymentLog {
  id: string;
  timestamp: number;
  userId: string;
  userEmail?: string;
  userName?: string;
  amount: number;
  currency: PaymentCurrency;
  paymentMethod: string;
  referenceCode: string;
  senderPhone: string;
  status: 'CONFIRMED' | 'REJECTED' | 'PENDING';
  aiExplanation?: string;
  errorReason?: string;
  hasReceiptImage?: boolean;
  smsSnippet?: string;
  type: 'ai_receipt' | 'manual_reference' | 'admin_action' | 'test';
}

export interface UserQuotaInfo {
  userId: string;
  dateKey: string;
  dailyFreeLimit: number; // 25
  messagesUsedToday: number;
  bonusMessagesFromAds: number;
  adsWatchedToday: number;
  maxAdsPerDay: number; // 10
  remainingMessages: number;
  isUnlimited: boolean;
  plan: SubscriptionStatus;
}

export interface AdSessionResponse {
  sessionId: string;
  nonce: string;
  durationSeconds: number;
  adProvider: string;
  campaignTitle: string;
  rewardMessages: number;
}

export interface AdClaimResponse {
  success: boolean;
  message: string;
  bonusGranted: number;
  quota: UserQuotaInfo;
}

export type AdPaymentStatus = 'PAID_AVAILABLE' | 'THRESHOLD_NOT_MET' | 'PAYMENT_PENDING' | 'NO_DATA';

export interface DailyAdMetric {
  date: string; // YYYY-MM-DD
  impressions: number;
  rewardedAds: number;
  uniqueUsers: number;
  ecpm: number | null; // null if revenue not yet reported by ad network
  estimatedRevenue: number | null; // null if not reported by network API
  finalizedRevenue: number | null; // null if not reported by network API
  averageRevenuePerImpression: number | null;
  currency: string;
  isFinalized: boolean;
  provider: string;
}

export interface AdRevenueSummary {
  hasProviderApiConfigured: boolean;
  providerName: string;
  lastSyncTimestamp: number | null;
  lastSyncStatus: 'SUCCESS' | 'FAILED' | 'NEVER' | 'NO_CREDENTIALS';
  syncErrorMessage?: string;

  // Actual Metrics
  totalImpressions: number;
  totalRewardedAds: number;
  totalUniqueUsers: number;

  // Real Financials (from Ad Network API)
  estimatedRevenueToday: number | null;
  estimatedRevenueThisWeek: number | null;
  estimatedRevenueThisMonth: number | null;
  cumulativeEstimatedRevenue: number | null;
  cumulativeFinalizedRevenue: number | null;
  averageEcpm: number | null;
  averageRevenuePerImpression: number | null;
  currency: string;

  // Payment Status
  paymentStatus: AdPaymentStatus;
  paymentBalance: number | null;
  paymentThreshold: number;
  nextPaymentDate?: string;
  paymentStatusMessage: string;

  // Daily records
  dailyMetrics: DailyAdMetric[];
}

// ==========================================
// 🚀 KAYDO / BERRY APP BUILDER PRO INTERFACES
// ==========================================

export type AppBuilderTechStack = 'react_typescript' | 'html_css_js' | 'node_express' | 'fullstack_spa';

export interface ProjectFile {
  path: string; // e.g. "src/App.tsx", "index.html", "package.json"
  content: string;
  isFolder?: boolean;
  language?: string;
}

export interface ProjectVersion {
  id: string;
  versionNumber: number;
  name: string;
  description?: string;
  timestamp: number;
  files: ProjectFile[];
}

export interface ProjectDeployment {
  id: string;
  projectId: string;
  versionId?: string;
  publicUrl: string;
  deployedAt: number;
  status: 'QUEUED' | 'BUILDING' | 'DEPLOYED' | 'FAILED';
  buildLogs: string[];
  environmentVars?: Record<string, string>;
}

export interface AppBuilderProject {
  id: string;
  userId: string;
  userEmail?: string;
  name: string;
  slug: string;
  description: string;
  techStack: AppBuilderTechStack;
  category: 'SaaS' | 'Dashboard' | 'E-commerce' | 'Blog' | 'Portfolio' | 'CRM' | 'School' | 'Tasks' | 'Social' | 'Booking' | 'AI App' | 'Custom';
  status: 'DRAFT' | 'READY' | 'DEPLOYED' | 'BUILDING';
  files: ProjectFile[];
  activeFilePath?: string;
  versions: ProjectVersion[];
  deployments: ProjectDeployment[];
  latestDeploymentUrl?: string;
  createdAt: number;
  updatedAt: number;
  isPublic?: boolean;
  envConfig?: Record<string, string>;
}

export interface AppBuilderTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  tags: string[];
  files: ProjectFile[];
  recommendedPrompt: string;
}

export interface ApiProviderConfig {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'anthropic' | 'groq' | 'custom';
  endpoint?: string;
  apiKeyMasked?: string;
  maskedApiKey?: string;
  model: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TESTING' | 'MISSING_KEY';
  isDefault?: boolean;
  totalRequests?: number;
  costEstimateUsd?: number;
  variables?: Record<string, string>;
  maxMonthlyLimit?: number;
  notes?: string;
  createdAt?: number;
  updatedAt?: number;
}


