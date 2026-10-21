import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Eye,
  Film,
  Users,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Layers,
  HelpCircle,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import { AdRevenueSummary, DailyAdMetric, AdPaymentStatus, UserProfile } from '../types';
import { AdRevenueService } from '../utils/adRevenueService';

interface AdRevenueDashboardProps {
  currentUser: UserProfile | null;
}

type DateFilterType = 'TODAY' | '7_DAYS' | '30_DAYS' | 'THIS_MONTH' | 'PREV_MONTH' | 'ALL_TIME';

export const AdRevenueDashboard: React.FC<AdRevenueDashboardProps> = ({ currentUser }) => {
  const [summary, setSummary] = useState<AdRevenueSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterType>('30_DAYS');

  const adminEmail = currentUser?.email || 'fivet5874@gmail.com';

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await AdRevenueService.fetchSummary(adminEmail);
      setSummary(data);
    } catch (err: any) {
      console.error('Failed to load ad revenue summary:', err);
      setSyncFeedback({
        type: 'error',
        message: err.message || 'Impossible de récupérer les statistiques publicitaires.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [adminEmail]);

  const handleSyncWithNetwork = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const result = await AdRevenueService.syncAdNetwork(adminEmail);
      setSummary(result.summary);
      if (result.synchronized) {
        setSyncFeedback({
          type: 'success',
          message: result.message || 'Synchronisation réussie avec le réseau publicitaire.',
        });
      } else {
        setSyncFeedback({
          type: 'info',
          message: result.message,
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: err.message || 'Échec de la synchronisation avec le réseau publicitaire.',
      });
    } finally {
      setSyncing(false);
    }
  };

  // Filter daily metrics according to date selection
  const getFilteredMetrics = (): DailyAdMetric[] => {
    if (!summary || !summary.dailyMetrics) return [];
    const list = summary.dailyMetrics;
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);

    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const thisMonthPrefix = `${currentYear}-${currentMonth}`;

    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthPrefix = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    switch (dateFilter) {
      case 'TODAY':
        return list.filter((m) => m.date === todayStr);
      case '7_DAYS':
        return list.filter((m) => m.date >= sevenDaysAgo);
      case '30_DAYS':
        return list.filter((m) => m.date >= thirtyDaysAgo);
      case 'THIS_MONTH':
        return list.filter((m) => m.date.startsWith(thisMonthPrefix));
      case 'PREV_MONTH':
        return list.filter((m) => m.date.startsWith(prevMonthPrefix));
      case 'ALL_TIME':
      default:
        return list;
    }
  };

  const filteredMetrics = getFilteredMetrics();

  // Helper for Payment Status Badge
  const renderPaymentBadge = (status: AdPaymentStatus, message: string) => {
    switch (status) {
      case 'PAID_AVAILABLE':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>🟢 Paiement disponible</span>
          </div>
        );
      case 'THRESHOLD_NOT_MET':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>🟡 Seuil non atteint</span>
          </div>
        );
      case 'PAYMENT_PENDING':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-spin" />
            <span>🔵 Paiement en cours</span>
          </div>
        );
      case 'NO_DATA':
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-500/10 border border-gray-500/30 text-gray-700 dark:text-gray-300 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            <span>⚪ Aucune donnée disponible</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 text-gray-800 dark:text-gray-200">
      {/* Header Banner & Provider Sync Controller */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 font-bold">
              💰
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>Revenus KAYDO AI</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Réseau Publicitaire Réel
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Fournisseur : <strong>{summary?.providerName || 'Google AdMob / Unity Ads'}</strong> • Données financières strictes
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {summary && renderPaymentBadge(summary.paymentStatus, summary.paymentStatusMessage)}

          <button
            onClick={handleSyncWithNetwork}
            disabled={syncing || loading}
            className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Synchronisation...' : 'Synchroniser API Réseau'}</span>
          </button>
        </div>
      </div>

      {/* Sync Status / Feedback Message */}
      {syncFeedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 transition-all ${
            syncFeedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : syncFeedback.type === 'error'
              ? 'bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200'
              : 'bg-blue-50 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200'
          }`}
        >
          {syncFeedback.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : syncFeedback.type === 'error' ? (
            <AlertTriangle size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-medium">{syncFeedback.message}</p>
          </div>
        </div>
      )}

      {/* Strict Truthfulness Policy Notice if no official API credentials */}
      {summary && !summary.hasProviderApiConfigured && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs">
          <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-amber-900 dark:text-amber-300 block font-bold">
              Transparence & Exactitude Financière
            </strong>
            <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
              Les revenus détaillés doivent être consultés dans le tableau de bord du fournisseur publicitaire (ex: Google AdMob / Unity Ads).
              Kaydo n'invente jamais de chiffres fictifs ni d'estimation artificielle. Toutes les impressions et publicités vues ci-dessous sont enregistrées en temps réel.
            </p>
          </div>
        </div>
      )}

      {/* Main 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated Today */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#303030] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Revenus estimés aujourd'hui</span>
            <DollarSign size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {summary?.estimatedRevenueToday !== null ? (
              `$${summary?.estimatedRevenueToday.toFixed(2)}`
            ) : (
              <span className="text-sm font-normal text-gray-400">En attente API</span>
            )}
          </div>
          <p className="text-[11px] text-gray-400">Donnée estimative du jour en cours</p>
        </div>

        {/* Estimated This Week */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#303030] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Revenus estimés cette semaine</span>
            <TrendingUp size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {summary?.estimatedRevenueThisWeek !== null ? (
              `$${summary?.estimatedRevenueThisWeek.toFixed(2)}`
            ) : (
              <span className="text-sm font-normal text-gray-400">En attente API</span>
            )}
          </div>
          <p className="text-[11px] text-gray-400">7 derniers jours glissants</p>
        </div>

        {/* Estimated This Month */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#303030] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Revenus estimés ce mois</span>
            <Calendar size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {summary?.estimatedRevenueThisMonth !== null ? (
              `$${summary?.estimatedRevenueThisMonth.toFixed(2)}`
            ) : (
              <span className="text-sm font-normal text-gray-400">En attente API</span>
            )}
          </div>
          <p className="text-[11px] text-gray-400">Mois calendaire en cours</p>
        </div>

        {/* Cumulative Revenues */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#303030] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Revenus cumulés</span>
            <CreditCard size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {summary?.cumulativeEstimatedRevenue !== null ? (
              `$${summary?.cumulativeEstimatedRevenue.toFixed(2)}`
            ) : (
              <span className="text-sm font-normal text-gray-400">En attente API</span>
            )}
          </div>
          <div className="text-[11px] text-gray-400 flex items-center justify-between">
            <span>Finalisé :</span>
            <strong className="text-emerald-600 dark:text-emerald-400">
              {summary?.cumulativeFinalizedRevenue !== null ? `$${summary?.cumulativeFinalizedRevenue.toFixed(2)}` : 'N/A'}
            </strong>
          </div>
        </div>
      </div>

      {/* Engagement & Impression Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rewarded Ads Watched */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#303030] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Publicités récompensées vues</span>
            <Film size={16} className="text-amber-500" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            🎬 {summary?.totalRewardedAds || 0}
          </div>
          <p className="text-[11px] text-gray-400">Visionnages complets validés</p>
        </div>

        {/* Total Impressions */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#303030] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Total Impressions</span>
            <Eye size={16} className="text-blue-500" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            👁️ {summary?.totalImpressions || 0}
          </div>
          <p className="text-[11px] text-gray-400">Affichages de bannières & vidéos</p>
        </div>

        {/* eCPM */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#303030] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>eCPM Réseau</span>
            <TrendingUp size={16} className="text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {summary?.averageEcpm !== null ? (
              `$${summary?.averageEcpm.toFixed(2)}`
            ) : (
              <span className="text-xs font-normal text-gray-400">Calculé à la sync API</span>
            )}
          </div>
          <p className="text-[11px] text-gray-400">Revenu moyen pour 1000 impressions</p>
        </div>

        {/* Unique Users */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#303030] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Utilisateurs uniques</span>
            <Users size={16} className="text-teal-500" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            👥 {summary?.totalUniqueUsers || 0}
          </div>
          <p className="text-[11px] text-gray-400">Ayant visionné une publicité</p>
        </div>
      </div>

      {/* Average Revenue Per Impression Card */}
      <div className="p-4 rounded-3xl bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <strong className="text-gray-900 dark:text-white block font-bold">
            Revenu moyen par impression
          </strong>
          <span className="text-gray-500 dark:text-gray-400">
            Calculé exclusivement d'après les données réelles du fournisseur (aucun tarif forfaitaire fictif).
          </span>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#353535] font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
          {summary?.averageRevenuePerImpression !== null
            ? `$${summary?.averageRevenuePerImpression.toFixed(4)} / impression`
            : 'Donnée fournie par le réseau'}
        </div>
      </div>

      {/* Historical Table & Date Filters */}
      <div className="bg-white dark:bg-[#1c1c1c] rounded-3xl border border-gray-200 dark:border-[#2e2e2e] overflow-hidden shadow-xs">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-[#2e2e2e] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>Historique Journalier des Performances</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400">
                {filteredMetrics.length} jour(s)
              </span>
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: 'TODAY', label: "Aujourd'hui" },
              { key: '7_DAYS', label: '7 derniers jours' },
              { key: '30_DAYS', label: '30 derniers jours' },
              { key: 'THIS_MONTH', label: 'Ce mois' },
              { key: 'PREV_MONTH', label: 'Mois précédent' },
              { key: 'ALL_TIME', label: 'Depuis le lancement' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setDateFilter(tab.key as DateFilterType)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  dateFilter === tab.key
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-[#262626] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#303030]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-[#171717] border-b border-gray-200 dark:border-[#2a2a2a] text-gray-500 dark:text-gray-400 font-semibold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Impressions</th>
                <th className="py-3 px-4">Rewarded Ads</th>
                <th className="py-3 px-4">eCPM</th>
                <th className="py-3 px-4">Revenus estimés</th>
                <th className="py-3 px-4">Revenus finalisés</th>
                <th className="py-3 px-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
              {filteredMetrics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    <p>Aucune statistique enregistrée pour cette période.</p>
                  </td>
                </tr>
              ) : (
                filteredMetrics.map((row) => (
                  <tr key={row.date} className="hover:bg-gray-50/50 dark:hover:bg-[#222222] transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-gray-900 dark:text-gray-100">
                      {row.date}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold">{row.impressions}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                        🎬 {row.rewardedAds}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600 dark:text-gray-300">
                      {row.ecpm !== null ? `$${row.ecpm.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-gray-900 dark:text-gray-100">
                      {row.estimatedRevenue !== null ? `$${row.estimatedRevenue.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {row.finalizedRevenue !== null ? `$${row.finalizedRevenue.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {row.isFinalized ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Finalisé
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20">
                          Estimé
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technical Integration & Sync Details */}
      <div className="p-4 rounded-3xl bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#2a2a2a] text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300">
            <Layers size={14} />
            <span>Architecture & Connexion Réseau</span>
          </div>
          <span className="text-[11px] text-gray-400">
            Dernière synchronisation :{' '}
            {summary?.lastSyncTimestamp
              ? new Date(summary.lastSyncTimestamp).toLocaleString('fr-FR')
              : 'Jamais'}
          </span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-[11px]">
          Ce module est prêt pour la synchronisation automatique en continu. Dès que les identifiants officiels (Google AdMob, Unity Ads ou AppLovin) sont configurés dans les variables secrètes du serveur, les revenus estimés et finalisés se mettront à jour à chaque requête sans redémarrage.
        </p>
      </div>
    </div>
  );
};
