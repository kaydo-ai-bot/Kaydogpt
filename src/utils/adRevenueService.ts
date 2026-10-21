import { AdRevenueSummary } from '../types';

export class AdRevenueService {
  /**
   * Fetches the consolidated ad revenue and metrics summary for authorized admin.
   */
  public static async fetchSummary(adminEmail: string): Promise<AdRevenueSummary> {
    const url = new URL('/api/admin/ad-revenue', window.location.origin);
    url.searchParams.set('adminEmail', adminEmail);

    const res = await fetch(url.toString(), {
      headers: {
        'x-admin-email': adminEmail,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erreur d'accès aux revenus (${res.status})`);
    }

    const data = await res.json();
    return data.summary;
  }

  /**
   * Triggers an official API synchronization with the ad network.
   */
  public static async syncAdNetwork(adminEmail: string): Promise<{
    success: boolean;
    synchronized: boolean;
    message: string;
    summary: AdRevenueSummary;
  }> {
    const res = await fetch('/api/admin/ad-revenue/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': adminEmail,
      },
      body: JSON.stringify({ adminEmail }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok && !data.summary) {
      throw new Error(data.error || `Échec de synchronisation (${res.status})`);
    }

    return {
      success: data.success ?? res.ok,
      synchronized: !!data.synchronized,
      message: data.message || data.error || 'Opération de synchronisation terminée.',
      summary: data.summary,
    };
  }
}
