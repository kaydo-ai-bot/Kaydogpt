import { UserQuotaInfo, AdSessionResponse, AdClaimResponse, SubscriptionStatus } from '../types';

export class QuotaService {
  private static listeners: Set<(quota: UserQuotaInfo) => void> = new Set();
  private static currentQuota: UserQuotaInfo | null = null;

  public static subscribe(listener: (quota: UserQuotaInfo) => void): () => void {
    this.listeners.add(listener);
    if (this.currentQuota) {
      listener(this.currentQuota);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notify(quota: UserQuotaInfo) {
    this.currentQuota = quota;
    this.listeners.forEach((l) => l(quota));
  }

  // Get current quota from server
  public static async fetchQuota(params: {
    userId: string;
    email?: string | null;
    plan?: SubscriptionStatus;
  }): Promise<UserQuotaInfo> {
    const { userId, email, plan = 'FREE' } = params;
    try {
      const url = new URL('/api/user/quota', window.location.origin);
      url.searchParams.set('userId', userId || 'anon');
      if (email) url.searchParams.set('email', email);
      if (plan) url.searchParams.set('plan', plan);

      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error(`Failed to fetch quota: ${res.status}`);
      }
      const data: UserQuotaInfo = await res.json();
      this.notify(data);
      return data;
    } catch (err) {
      console.warn('Quota fetch fallback:', err);
      const isUnlimited = plan === 'PREMIUM_ACTIVE' || (email && ['fivet5874@gmail.com', 'admin@kaydogpt.com'].includes(email.toLowerCase())) || userId?.startsWith('creator_');
      const fallbackQuota: UserQuotaInfo = {
        userId: userId || 'anon',
        dateKey: new Date().toISOString().split('T')[0],
        dailyFreeLimit: 25,
        messagesUsedToday: 0,
        bonusMessagesFromAds: 0,
        adsWatchedToday: 0,
        maxAdsPerDay: 10,
        remainingMessages: isUnlimited ? 999999 : 25,
        isUnlimited: !!isUnlimited,
        plan: plan || 'FREE',
      };
      this.notify(fallbackQuota);
      return fallbackQuota;
    }
  }

  // Start rewarded ad session
  public static async startAdSession(userId: string): Promise<AdSessionResponse> {
    const res = await fetch('/api/ads/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Impossible de démarrer la session publicitaire.');
    }

    return await res.json();
  }

  // Claim rewarded ad (+5 messages)
  public static async claimAdReward(params: {
    sessionId: string;
    nonce: string;
    userId: string;
    watchedDurationSeconds: number;
  }): Promise<AdClaimResponse> {
    const res = await fetch('/api/ads/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Impossible de valider la récompense publicitaire.');
    }

    const result: AdClaimResponse = await res.json();
    if (result.quota) {
      this.notify(result.quota);
    }
    return result;
  }
}
