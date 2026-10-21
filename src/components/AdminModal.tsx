import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Shield,
  Users,
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  DollarSign,
  AlertTriangle,
  FileText,
  Sparkles,
  Terminal,
  Send,
  Eye,
  Check,
  AlertCircle,
  Cpu,
  Key,
  Globe,
  Zap,
} from 'lucide-react';
import { UserProfile, SubscriptionRecord, PaymentTransaction, SubscriptionStatus, PaymentLog, ApiProviderConfig } from '../types';
import { SubscriptionService } from '../utils/subscriptionService';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'users' | 'subs' | 'tx' | 'ai_providers' | 'external_apis'>('logs');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [subs, setSubs] = useState<SubscriptionRecord[]>([]);
  const [txs, setTxs] = useState<PaymentTransaction[]>([]);
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [aiProviders, setAiProviders] = useState<ApiProviderConfig[]>([]);
  const [externalApis, setExternalApis] = useState<Record<string, any>>({});
  const [testAllResults, setTestAllResults] = useState<any | null>(null);
  const [testingAll, setTestingAll] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [aiStats, setAiStats] = useState<{ totalRequests: number; totalCostUsd: number; activeDeploymentsCount: number }>({
    totalRequests: 0,
    totalCostUsd: 0,
    activeDeploymentsCount: 0,
  });
  const [logFilter, setLogFilter] = useState<'ALL' | 'CONFIRMED' | 'REJECTED' | 'TEST'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Test Verification State
  const [testSms, setTestSms] = useState('Natcash: Ou resevwa 650 HTG soti nan 50935975863 (7866179). Ref: NAT7866179. Tranzaksyon reyisi.');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allUsers, allSubs, allTxs] = await Promise.all([
        SubscriptionService.adminGetAllUsers(),
        SubscriptionService.adminGetAllSubscriptions(),
        SubscriptionService.adminGetAllTransactions(),
      ]);
      setUsers(allUsers);
      setSubs(allSubs);
      setTxs(allTxs);

      // Fetch payment logs from server
      const adminEmail = currentUser?.email || 'fivet5874@gmail.com';
      const logRes = await fetch(`/api/admin/payment-logs?adminEmail=${encodeURIComponent(adminEmail)}`);
      if (logRes.ok) {
        const data = await logRes.json();
        if (data.logs) {
          setLogs(data.logs);
        }
      }

      // Fetch AI Providers & Costs
      const aiRes = await fetch(`/api/admin/ai-providers-usage?adminEmail=${encodeURIComponent(adminEmail)}`);
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        if (aiData.providers) {
          setAiProviders(aiData.providers);
        }
        if (aiData.stats) {
          setAiStats(aiData.stats);
        }
      }

      // Fetch External APIs
      const extRes = await fetch(`/api/admin/external-apis?adminEmail=${encodeURIComponent(adminEmail)}`);
      if (extRes.ok) {
        const extData = await extRes.json();
        if (extData.apis) {
          setExternalApis(extData.apis);
        }
      }
    } catch (e) {
      console.error('Admin data load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleRunPaymentTest = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/test-payment-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulatedSms: testSms,
          amount: 400,
          currency: 'HTG',
        }),
      });
      const data = await res.json();
      setTestResult(data);
      // Reload logs to show new test item
      await loadData();
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTestLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleUpdatePlan = async (userId: string, newPlan: SubscriptionStatus, days = 30) => {
    try {
      setActionLoading(userId);
      await SubscriptionService.adminUpdateUserPlan(userId, newPlan, days);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phoneNumber && u.phoneNumber.includes(q)) ||
      u.uid.includes(q)
    );
  });

  const filteredLogs = logs.filter((l) => {
    if (logFilter === 'CONFIRMED' && l.status !== 'CONFIRMED') return false;
    if (logFilter === 'REJECTED' && l.status !== 'REJECTED') return false;
    if (logFilter === 'TEST' && l.type !== 'test') return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.referenceCode?.toLowerCase().includes(q) ||
      l.senderPhone?.includes(q) ||
      l.userEmail?.toLowerCase().includes(q) ||
      l.userName?.toLowerCase().includes(q) ||
      l.aiExplanation?.toLowerCase().includes(q)
    );
  });

  const totalActiveSubs = users.filter((u) => u.plan === 'PREMIUM_ACTIVE').length;
  const estimatedRevenue = totalActiveSubs * 3;

  return (
    <div id="admin-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl bg-white dark:bg-[#181818] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#2e2e2e] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Shield size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">Panneau d'Administration Kaydo GPT</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Créateur / Debug
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Supervision des paiements Natcash, quotas IA et grand livre de vérification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
              title="Rafraîchir les données"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Top Metric Bar */}
        <div className="grid grid-cols-4 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#141414] px-6 py-3 text-xs">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-500" />
            <div>
              <span className="text-gray-500 block text-[10px]">Utilisateurs</span>
              <strong className="text-gray-900 dark:text-gray-100">{users.length}</strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <div>
              <span className="text-gray-500 block text-[10px]">Abonnés Premium</span>
              <strong className="text-emerald-600 dark:text-emerald-400">{totalActiveSubs}</strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-purple-500" />
            <div>
              <span className="text-gray-500 block text-[10px]">Logs Paiements</span>
              <strong className="text-purple-600 dark:text-purple-400">{logs.length}</strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-amber-500" />
            <div>
              <span className="text-gray-500 block text-[10px]">Revenus estimés</span>
              <strong className="text-amber-600 dark:text-amber-400">${estimatedRevenue}.00 USD</strong>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-[#2a2a2a] px-6 bg-white dark:bg-[#1a1a1a] overflow-x-auto">
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'logs'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <FileText size={14} />
            <span>Logs de Paiement & Diagnostic ({logs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Users size={14} />
            <span>Utilisateurs ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('subs')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'subs'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <CreditCard size={14} />
            <span>Abonnements ({subs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('tx')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'tx'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <DollarSign size={14} />
            <span>Transactions ({txs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ai_providers')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ai_providers'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Cpu size={14} />
            <span>Fournisseurs IA & Coûts App Builder</span>
          </button>
          <button
            onClick={() => setActiveTab('external_apis')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'external_apis'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Globe size={14} />
            <span>⚙️ API & Sources</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: PAYMENT LOGS & DIAGNOSTIC */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              {/* Diagnostic Test Runner Card */}
              <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Terminal size={16} className="text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                      Outil de Test pour le Créateur : Vérification en Direct
                    </h3>
                  </div>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                    Test sécurisé sans impacter les comptes clients
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={testSms}
                    onChange={(e) => setTestSms(e.target.value)}
                    placeholder="Texte SMS Natcash ou code de référence à tester..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#202020] border border-blue-200 dark:border-blue-800 text-gray-900 dark:text-gray-100 outline-none"
                  />
                  <button
                    onClick={handleRunPaymentTest}
                    disabled={testLoading || !testSms.trim()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                  >
                    <Send size={12} />
                    <span>{testLoading ? 'Analyse...' : 'Tester Vérification'}</span>
                  </button>
                </div>

                {testResult && (
                  <div className={`mt-3 p-3 rounded-xl text-xs border ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300'
                  }`}>
                    <div className="font-bold mb-0.5">{testResult.message || (testResult.success ? 'Test Réussi' : 'Erreur')}</div>
                    {testResult.aiInspectionOutput && (
                      <p className="text-[11px] opacity-90 font-mono mt-1 bg-black/10 dark:bg-black/30 p-2 rounded-lg">
                        {testResult.aiInspectionOutput}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Logs Search and Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="relative flex-1 w-full">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrer les logs par référence, téléphone, email..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-[#202020] border border-gray-200 dark:border-[#333] text-gray-900 dark:text-gray-100 outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#202020] p-1 rounded-xl text-[11px]">
                  <button
                    onClick={() => setLogFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                      logFilter === 'ALL' ? 'bg-white dark:bg-[#303030] text-gray-900 dark:text-white shadow-xs' : 'text-gray-500'
                    }`}
                  >
                    Tous ({logs.length})
                  </button>
                  <button
                    onClick={() => setLogFilter('CONFIRMED')}
                    className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                      logFilter === 'CONFIRMED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-500'
                    }`}
                  >
                    Confirmés
                  </button>
                  <button
                    onClick={() => setLogFilter('REJECTED')}
                    className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                      logFilter === 'REJECTED' ? 'bg-red-600 text-white shadow-xs' : 'text-gray-500'
                    }`}
                  >
                    Rejetés
                  </button>
                </div>
              </div>

              {/* Logs Stream List */}
              <div className="space-y-2.5">
                {filteredLogs.length === 0 ? (
                  <div className="p-10 text-center text-xs text-gray-400 bg-gray-50 dark:bg-[#1e1e1e] rounded-2xl border border-dashed border-gray-200 dark:border-[#333]">
                    Aucune tentative de paiement enregistrée pour le moment.
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-3.5 rounded-2xl border text-xs transition-all ${
                        log.status === 'CONFIRMED'
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-900/40'
                          : 'bg-red-50/40 dark:bg-red-950/15 border-red-200 dark:border-red-900/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.status === 'CONFIRMED'
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30'
                            }`}>
                              {log.status === 'CONFIRMED' ? <Check size={10} /> : <XCircle size={10} />}
                              {log.status}
                            </span>

                            <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
                              Réf: {log.referenceCode || 'N/A'}
                            </span>

                            <span className="text-[10px] text-gray-400">
                              • {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>

                          <div className="text-[11px] text-gray-600 dark:text-gray-300">
                            <strong>Utilisateur:</strong> {log.userName || log.userEmail || log.userId} 
                            {log.senderPhone && <span className="ml-2">| <strong>Téléphone:</strong> {log.senderPhone}</span>}
                            <span className="ml-2 font-semibold text-blue-600 dark:text-blue-400">
                              [{log.amount} {log.currency}]
                            </span>
                          </div>

                          {log.aiExplanation && (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 bg-black/5 dark:bg-black/20 p-2 rounded-xl mt-1">
                              <strong>Diagnostic IA :</strong> {log.aiExplanation}
                            </p>
                          )}

                          {log.smsSnippet && (
                            <p className="text-[10px] font-mono text-gray-400 italic">
                              "{log.smsSnippet}..."
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-800 text-[10px] text-gray-600 dark:text-gray-400 uppercase font-semibold">
                            {log.type === 'ai_receipt' ? 'Scan Reçu IA' : log.type === 'test' ? 'Test Créateur' : 'Manuel'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: USERS */}
          {activeTab === 'users' && (
            <div className="space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">Aucun utilisateur trouvé</div>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u.uid}
                    className="p-3 rounded-2xl bg-gray-50 dark:bg-[#222] border border-gray-200/70 dark:border-[#333] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-gray-100">{u.displayName}</span>
                        {u.role === 'admin' && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                            ADMIN
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.plan === 'PREMIUM_ACTIVE'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {u.plan || 'FREE'}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 space-x-2">
                        {u.email && <span>{u.email}</span>}
                        {u.phoneNumber && <span>• {u.phoneNumber}</span>}
                        <span className="font-mono text-[10px] text-gray-400">• UID: {u.uid.slice(0, 8)}...</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {u.plan === 'PREMIUM_ACTIVE' ? (
                        <button
                          type="button"
                          onClick={() => handleUpdatePlan(u.uid, 'FREE')}
                          disabled={actionLoading === u.uid}
                          className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-red-600 dark:text-red-400 text-[11px] font-medium cursor-pointer"
                        >
                          Rétrograder à Free
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUpdatePlan(u.uid, 'PREMIUM_ACTIVE', 30)}
                          disabled={actionLoading === u.uid}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <PlusCircle size={12} />
                          <span>Activer 30j Premium</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: SUBSCRIPTIONS */}
          {activeTab === 'subs' && (
            <div className="space-y-2">
              {subs.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">Aucun abonnement enregistré</div>
              ) : (
                subs.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="p-3 rounded-2xl bg-gray-50 dark:bg-[#222] border border-gray-200/70 dark:border-[#333] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {s.userName || s.userEmail || s.userId}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Méthode: {s.paymentMethod} • Réf: {s.referenceCode || s.transactionId}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'PREMIUM_ACTIVE'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {s.status}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        Expire: {new Date(s.expiresAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: TRANSACTIONS */}
          {activeTab === 'tx' && (
            <div className="space-y-2">
              {txs.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">Aucune transaction enregistrée</div>
              ) : (
                txs.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-2xl bg-gray-50 dark:bg-[#222] border border-gray-200/70 dark:border-[#333] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-gray-900 dark:text-gray-100">
                        Réf: {t.referenceCode}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Émetteur: {t.senderPhone} • {t.userName || t.userEmail}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">
                        ${t.amount || 3.0} USD
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(t.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: AI PROVIDERS & APP BUILDER COSTS */}
          {activeTab === 'ai_providers' && (
            <div className="space-y-6">
              {/* Cost & Requests Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                  <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 font-semibold">
                    <span>Requêtes IA Totales</span>
                    <Cpu size={16} />
                  </div>
                  <div className="text-2xl font-black text-amber-900 dark:text-amber-100 mt-2">
                    {aiStats.totalRequests}
                  </div>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">Génération App Builder & Vision</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                  <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                    <span>Coût API Estimé</span>
                    <DollarSign size={16} />
                  </div>
                  <div className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-2">
                    ${aiStats.totalCostUsd.toFixed(4)} USD
                  </div>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Optimisé via Gemini 2.5 Flash</p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
                  <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 font-semibold">
                    <span>Applications Déployées</span>
                    <Globe size={16} />
                  </div>
                  <div className="text-2xl font-black text-blue-900 dark:text-blue-100 mt-2">
                    {aiStats.activeDeploymentsCount}
                  </div>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Hébergées sur URLs publiques</p>
                </div>
              </div>

              {/* Providers Status & Masked API Keys */}
              <div className="bg-gray-50 dark:bg-[#222] border border-gray-200/70 dark:border-[#333] rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Key size={14} className="text-amber-500" />
                    <span>Fournisseurs d'Intelligence Artificielle & Clés d'API</span>
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 font-bold">
                    Sécurisé côté Serveur
                  </span>
                </div>

                <div className="space-y-3">
                  {aiProviders.map(prov => (
                    <div
                      key={prov.id}
                      className="p-3.5 rounded-xl bg-white dark:bg-[#18181f] border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-gray-100">{prov.name}</span>
                          {prov.isDefault && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-bold">
                              Par Défaut
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 font-mono">Modèle : {prov.model}</p>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1 font-mono">
                          <span>Clé Masquée :</span>
                          <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{prov.maskedApiKey}</span>
                        </p>
                      </div>

                      <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          prov.status === 'ACTIVE'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}>
                          {prov.status === 'ACTIVE' ? '✓ Connecté & Actif' : 'Clé manquante'}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">
                          {prov.totalRequests || 0} requêtes • ~${(prov.costEstimateUsd || 0).toFixed(4)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: API & SOURCES */}
          {activeTab === 'external_apis' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Globe size={18} className="text-emerald-600" />
                    <span>⚙️ API & SOURCES : Gestion Centralisée</span>
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Ajoutez, modifiez, testez, activez ou désactivez les API utilisées par KAYDO AI (Recherche Web, Actualités, Météo, Date & Heure, Wikipedia, Recherche Supplémentaire, Fournisseur IA).
                  </p>
                </div>
                <button
                  onClick={async () => {
                    setTestingAll(true);
                    setTestAllResults(null);
                    try {
                      const adminEmail = currentUser?.email || 'fivet5874@gmail.com';
                      const res = await fetch('/api/admin/external-apis/test-all', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ adminEmail }),
                      });
                      const data = await res.json();
                      setTestAllResults(data.results);
                      await loadData();
                    } catch (e: any) {
                      setTestAllResults({ error: e.message });
                    } finally {
                      setTestingAll(false);
                    }
                  }}
                  disabled={testingAll}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-2 shrink-0"
                >
                  <RefreshCw size={14} className={testingAll ? 'animate-spin' : ''} />
                  <span>🧪 Tester Toutes les API</span>
                </button>
              </div>

              {testAllResults && (
                <div className="p-4 rounded-2xl bg-gray-900 text-white space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between font-bold text-emerald-400 border-b border-gray-800 pb-2">
                    <span>Résultats du Test Global des API & Sources</span>
                    <button onClick={() => setTestAllResults(null)} className="text-gray-400 hover:text-white cursor-pointer text-[10px]">Fermer</button>
                  </div>
                  <pre className="whitespace-pre-wrap text-[11px] text-gray-200">{JSON.stringify(testAllResults, null, 2)}</pre>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(externalApis).map(([id, cfg]: [string, any]) => {
                  const labels: Record<string, { title: string; icon: string; desc: string }> = {
                    web_search: { title: '1. 🌐 RECHERCHE WEB', icon: '🌐', desc: 'WEB_SEARCH_API_KEY & WEB_SEARCH_API_URL' },
                    news: { title: '2. 📰 ACTUALITÉS', icon: '📰', desc: 'NEWS_API_KEY & NEWS_API_URL' },
                    weather: { title: '3. 🌦️ MÉTÉO', icon: '🌦️', desc: 'WEATHER_API_KEY & WEATHER_API_URL' },
                    time: { title: '4. 🕐 DATE & HEURE', icon: '🕐', desc: 'TIME_API_KEY, TIME_API_URL & TIMEZONE' },
                    wikipedia: { title: '5. 📚 WIKIPEDIA', icon: '📚', desc: 'WIKIPEDIA_API_URL' },
                    additional_search: { title: '6. 🔎 RECHERCHE SUPPLÉMENTAIRE', icon: '🔎', desc: 'SEARCH_API_KEY & SEARCH_API_URL' },
                    ai_provider: { title: '7. 🤖 FOURNISSEUR IA', icon: '🤖', desc: 'AI_API_KEY, AI_API_BASE_URL & AI_MODEL' },
                  };

                  const meta = labels[id] || { title: id.toUpperCase(), icon: '⚙️', desc: 'Configuration API' };
                  const isKeyVisible = showKeys[id] || false;

                  return (
                    <div key={id} className="p-4 rounded-2xl bg-white dark:bg-[#1f1f26] border border-gray-200 dark:border-[#2e2e38] space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{meta.icon}</span>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">{meta.title}</h4>
                            <p className="text-[10px] text-gray-500">{meta.desc}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          cfg.status?.includes('Fonctionne') || cfg.status === '🟢 Fonctionne'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : cfg.status?.includes('Erreur')
                            ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {cfg.status || '⚪ Non configuré'}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        {id !== 'wikipedia' && (
                          <div>
                            <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Clé API (Password)
                            </label>
                            <div className="relative flex items-center">
                              <input
                                type={isKeyVisible ? 'text' : 'password'}
                                value={cfg.apiKey || ''}
                                onChange={(e) => {
                                  setExternalApis({
                                    ...externalApis,
                                    [id]: { ...cfg, apiKey: e.target.value }
                                  });
                                }}
                                placeholder="Coller la clé API secrète..."
                                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#15151b] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 pr-9 font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowKeys({ ...showKeys, [id]: !isKeyVisible })}
                                className="absolute right-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                              >
                                <Eye size={14} />
                              </button>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                            URL / Endpoint API
                          </label>
                          <input
                            type="text"
                            value={cfg.url || ''}
                            onChange={(e) => {
                              setExternalApis({
                                ...externalApis,
                                [id]: { ...cfg, url: e.target.value }
                              });
                            }}
                            placeholder="https://..."
                            className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#15151b] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>

                        {id === 'time' && (
                          <div>
                            <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                              TIMEZONE (Fuseau horaire)
                            </label>
                            <input
                              type="text"
                              value={cfg.timezone || 'America/Port-au-Prince'}
                              onChange={(e) => {
                                setExternalApis({
                                  ...externalApis,
                                  [id]: { ...cfg, timezone: e.target.value }
                                });
                              }}
                              placeholder="America/Port-au-Prince"
                              className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#15151b] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                        )}

                        {id === 'ai_provider' && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">Base URL</label>
                              <input
                                type="text"
                                value={cfg.baseUrl || ''}
                                onChange={(e) => {
                                  setExternalApis({
                                    ...externalApis,
                                    [id]: { ...cfg, baseUrl: e.target.value }
                                  });
                                }}
                                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#15151b] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">Modèle (AI_MODEL)</label>
                              <input
                                type="text"
                                value={cfg.model || ''}
                                onChange={(e) => {
                                  setExternalApis({
                                    ...externalApis,
                                    [id]: { ...cfg, model: e.target.value }
                                  });
                                }}
                                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#15151b] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cfg.enabled ?? true}
                              onChange={(e) => {
                                setExternalApis({
                                  ...externalApis,
                                  [id]: { ...cfg, enabled: e.target.checked }
                                });
                              }}
                              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                            />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              {cfg.enabled ? '🟢 ON' : '⚪ OFF'}
                            </span>
                          </label>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const adminEmail = currentUser?.email || 'fivet5874@gmail.com';
                                  const res = await fetch('/api/admin/external-apis/test-one', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ adminEmail, apiId: id }),
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    alert(`Test réussi (${id}) : ${data.message}`);
                                    await loadData();
                                  } else {
                                    alert(`Erreur test (${id}) : ${data.error}`);
                                  }
                                } catch (e: any) {
                                  alert(`Erreur : ${e.message}`);
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold cursor-pointer transition-colors"
                            >
                              Tester
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const adminEmail = currentUser?.email || 'fivet5874@gmail.com';
                                  const res = await fetch('/api/admin/external-apis/save', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      adminEmail,
                                      apiId: id,
                                      apiKey: cfg.apiKey,
                                      url: cfg.url,
                                      enabled: cfg.enabled,
                                      timezone: cfg.timezone,
                                      model: cfg.model,
                                      baseUrl: cfg.baseUrl,
                                    }),
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    alert(`API ${id} enregistrée avec succès !`);
                                    await loadData();
                                  } else {
                                    alert(`Erreur : ${data.error}`);
                                  }
                                } catch (e: any) {
                                  alert(`Erreur : ${e.message}`);
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                            >
                              Enregistrer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-[#141414] border-t border-gray-200 dark:border-[#2a2a2a] flex items-center justify-between text-xs">
          <span className="text-gray-400">
            Kaydo AI Monetization & Verification Engine v2.0
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-200 dark:bg-[#2e2e2e] text-gray-800 dark:text-gray-200 text-xs font-semibold hover:bg-gray-300 dark:hover:bg-[#383838] cursor-pointer transition-colors"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

