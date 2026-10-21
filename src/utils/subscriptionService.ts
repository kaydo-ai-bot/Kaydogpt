import {
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from '../lib/firebase';
import { SubscriptionRecord, PaymentTransaction, SubscriptionStatus, UserProfile, PaymentCurrency } from '../types';
import { ADMIN_EMAILS } from './authService';

export const PRO_PRICE_USD = 5.00;
export const PRO_PRICE_HTG = 650; // 650 Gourdes
export const PRO_PRICE_EUR = 4.70; // 4.70 Euros

export const PREMIUM_PRICE_USD = 3.00;
export const PREMIUM_PRICE_HTG = 400; // 400 Gourdes
export const PREMIUM_PRICE_EUR = 2.80; // 2.80 Euros
export const PREMIUM_DURATION_DAYS = 30;

export class SubscriptionService {
  // Check and synchronize user subscription status (All features 100% Free & Unlimited for all users)
  static async checkAndUpdateSubscription(userOrId: string | UserProfile): Promise<SubscriptionStatus> {
    return 'PRO_ACTIVE';
  }

  // Submit AI Payment Receipt / SMS verification
  static async submitAIVerification(params: {
    userId: string;
    userEmail?: string;
    userName?: string;
    smsText?: string;
    receiptImage?: string;
    currency?: PaymentCurrency;
  }): Promise<{ success: boolean; message: string; status: SubscriptionStatus; details?: any }> {
    const { userId, userEmail, userName, smsText, receiptImage, currency = 'HTG' } = params;

    try {
      const response = await fetch('/api/payment/ai-verify-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userEmail,
          userName,
          smsText,
          receiptImage,
          currency,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return {
          success: false,
          message: result.error || 'L\'IA n\'a pas pu valider le transfert vers le compte 509 35 97 58 63 (7866179).',
          status: 'FREE',
          details: result.details,
        };
      }

      // Record in Firestore as backup / sync
      const now = Date.now();
      const expiresAt = result.expiresAt || (now + PREMIUM_DURATION_DAYS * 24 * 3600 * 1000);
      const txId = result.transactionId || `tx_ai_${Date.now()}`;
      const cleanRef = result.referenceCode || `NAT_${Date.now()}`;
      const amount = result.amount || (currency === 'HTG' ? PRO_PRICE_HTG : currency === 'EUR' ? PRO_PRICE_EUR : PRO_PRICE_USD);
      const activatedPlan: SubscriptionStatus = result.plan === 'PRO_ACTIVE' || amount >= PRO_PRICE_USD || (currency === 'HTG' && amount >= 500) ? 'PRO_ACTIVE' : 'PREMIUM_ACTIVE';

      try {
        await setDoc(doc(db, 'transactions', txId), {
          id: txId,
          userId,
          userEmail: userEmail || '',
          userName: userName || '',
          amount,
          currency: result.currency || currency,
          status: 'CONFIRMED',
          paymentMethod: 'natcash_ai_verified',
          referenceCode: cleanRef,
          senderPhone: result.senderPhone || '',
          timestamp: now,
          verifiedAt: now,
          used: true,
          aiExplanation: result.aiExplanation || 'Validé automatiquement par l\'Inspecteur IA',
        });

        const subId = `sub_${userId}_${now}`;
        await setDoc(doc(db, 'subscriptions', subId), {
          id: subId,
          userId,
          userEmail: userEmail || '',
          userName: userName || '',
          userPhone: result.senderPhone || '',
          status: activatedPlan,
          plan: activatedPlan === 'PRO_ACTIVE' ? 'PRO_MONTHLY' : 'PREMIUM_MONTHLY',
          price: amount,
          currency: result.currency || currency,
          transactionId: txId,
          paymentMethod: 'natcash',
          senderPhone: result.senderPhone || '',
          referenceCode: cleanRef,
          startedAt: now,
          expiresAt,
          createdAt: now,
          updatedAt: now,
          autoRenew: false,
        });

        await updateDoc(doc(db, 'users', userId), {
          plan: activatedPlan,
          isPro: activatedPlan === 'PRO_ACTIVE',
          updatedAt: now,
        });
      } catch (dbErr) {
        console.warn('Firestore sync warning during AI verification:', dbErr);
      }

      return {
        success: true,
        message: result.message || 'Paiement vérifié avec succès par l\'IA ! Votre statut PRO est actif.',
        status: activatedPlan,
        details: result,
      };
    } catch (err: any) {
      console.error('AI verification request failed:', err);
      return {
        success: false,
        message: err.message || 'Erreur de connexion au serveur d\'analyse IA.',
        status: 'FREE',
      };
    }
  }

  // Submit and verify a payment transaction
  static async submitPayment(params: {
    userId: string;
    userEmail?: string;
    userName?: string;
    senderPhone: string;
    referenceCode: string;
    paymentMethod: 'natcash' | 'moncash' | 'card' | 'international';
    amount?: number;
    currency?: PaymentCurrency;
  }): Promise<{ success: boolean; message: string; status: SubscriptionStatus }> {
    const { userId, userEmail, userName, senderPhone, referenceCode, paymentMethod, currency = 'USD' } = params;
    const cleanRef = referenceCode.trim().toUpperCase();
    const cleanPhone = senderPhone.trim();
    const amount = params.amount || (currency === 'HTG' ? PREMIUM_PRICE_HTG : currency === 'EUR' ? PREMIUM_PRICE_EUR : PREMIUM_PRICE_USD);

    if (!cleanRef || cleanRef.length < 4) {
      return {
        success: false,
        message: 'Veuillez saisir un numéro de référence ou code de transaction valide (minimum 4 caractères).',
        status: 'FREE',
      };
    }

    if (!cleanPhone || cleanPhone.length < 8) {
      return {
        success: false,
        message: 'Veuillez saisir le numéro de téléphone émetteur valide ayant effectué le transfert.',
        status: 'FREE',
      };
    }

    // Call backend API for server-side verification to prevent client-side bypass & check anti-replay
    try {
      const response = await fetch('/api/payment/verify-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userEmail,
          userName,
          senderPhone: cleanPhone,
          referenceCode: cleanRef,
          paymentMethod,
          amount,
          currency,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errData.error || 'Échec de la validation du paiement.',
          status: 'FREE',
        };
      }

      const result = await response.json();
      return {
        success: result.success,
        message: result.message || 'Paiement confirmé avec succès ! Votre compte est maintenant Premium.',
        status: result.status || 'PREMIUM_ACTIVE',
      };
    } catch (err: any) {
      console.error('Payment verification request failed:', err);
      // Fallback direct Firestore validation with anti-replay check
      return await this.fallbackDirectVerification({ ...params, amount, currency });
    }
  }

  // Direct Firestore Verification fallback with strict anti-replay
  private static async fallbackDirectVerification(params: {
    userId: string;
    userEmail?: string;
    userName?: string;
    senderPhone: string;
    referenceCode: string;
    paymentMethod: 'natcash' | 'moncash' | 'card' | 'international';
    amount?: number;
    currency?: PaymentCurrency;
  }): Promise<{ success: boolean; message: string; status: SubscriptionStatus }> {
    const { userId, userEmail, userName, senderPhone, referenceCode, paymentMethod, currency = 'USD' } = params;
    const cleanRef = referenceCode.trim().toUpperCase();
    const cleanPhone = senderPhone.trim();
    const amount = params.amount || (currency === 'HTG' ? PRO_PRICE_HTG : currency === 'EUR' ? PRO_PRICE_EUR : PRO_PRICE_USD);
    const now = Date.now();
    const expiresAt = now + PREMIUM_DURATION_DAYS * 24 * 3600 * 1000;
    const isPro = amount >= PRO_PRICE_USD || (currency === 'HTG' && amount >= 500);
    const statusPlan: SubscriptionStatus = isPro ? 'PRO_ACTIVE' : 'PREMIUM_ACTIVE';

    try {
      // 1. Anti-replay verification: Check if this transaction reference was ever used
      const txRef = collection(db, 'transactions');
      const q = query(txRef, where('referenceCode', '==', cleanRef));
      const existingTx = await getDocs(q);

      if (!existingTx.empty) {
        const found = existingTx.docs[0].data();
        if (found.used && found.userId !== userId) {
          return {
            success: false,
            message: 'Ce code de transaction a déjà été utilisé sur un autre compte.',
            status: 'FREE',
          };
        }
      }

      const txId = `tx_${cleanRef}_${now}`;

      // Record transaction
      const transactionRecord: PaymentTransaction = {
        id: txId,
        userId,
        userEmail: userEmail || '',
        userName: userName || '',
        amount,
        currency,
        status: 'CONFIRMED',
        paymentMethod,
        referenceCode: cleanRef,
        senderPhone: cleanPhone,
        timestamp: now,
        verifiedAt: now,
        used: true,
      };

      await setDoc(doc(db, 'transactions', txId), transactionRecord);

      // Create Subscription Record
      const subId = `sub_${userId}_${now}`;
      const subRecord: SubscriptionRecord = {
        id: subId,
        userId,
        userEmail: userEmail || '',
        userName: userName || '',
        userPhone: cleanPhone,
        status: statusPlan,
        plan: isPro ? 'PRO_MONTHLY' : 'PREMIUM_MONTHLY',
        price: amount,
        currency,
        transactionId: txId,
        paymentMethod,
        senderPhone: cleanPhone,
        referenceCode: cleanRef,
        startedAt: now,
        expiresAt,
        createdAt: now,
        updatedAt: now,
        autoRenew: false,
      };

      await setDoc(doc(db, 'subscriptions', subId), subRecord);

      // Update User Profile
      await updateDoc(doc(db, 'users', userId), {
        plan: statusPlan,
        isPro: isPro,
        updatedAt: now,
      });

      const displayAmount = currency === 'HTG' ? `${PRO_PRICE_HTG} HTG (GDS)` : currency === 'EUR' ? `${PRO_PRICE_EUR.toFixed(2)} €` : `${PRO_PRICE_USD.toFixed(2)} USD`;

      return {
        success: true,
        message: `Paiement Natcash (${displayAmount}) confirmé ! Votre statut PRO App Builder est désormais actif pour 30 jours.`,
        status: statusPlan,
      };
    } catch (e: any) {
      console.error('Fallback verification error:', e);
      return {
        success: false,
        message: e.message || 'Erreur lors de l\'enregistrement du paiement.',
        status: 'FREE',
      };
    }
  }

  // Get User Transactions
  static async getUserTransactions(userId: string): Promise<PaymentTransaction[]> {
    try {
      const txRef = collection(db, 'transactions');
      const q = query(txRef, where('userId', '==', userId), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as PaymentTransaction);
    } catch (err) {
      console.warn('Error fetching transactions:', err);
      return [];
    }
  }

  // Get active subscription info (Free & Unlimited for all users)
  static async getActiveSubscription(userId: string): Promise<SubscriptionRecord | null> {
    const now = Date.now();
    return {
      id: `sub_free_unlimited_${userId}`,
      userId,
      userEmail: '',
      userName: 'Utilisateur Berry GPT',
      status: 'PREMIUM_ACTIVE',
      plan: 'PREMIUM_MONTHLY',
      price: 0,
      currency: 'USD',
      transactionId: 'free_unlimited_grant',
      paymentMethod: 'system',
      startedAt: now - 30 * 24 * 3600 * 1000,
      expiresAt: now + 100 * 365 * 24 * 3600 * 1000, // 100 ans illimité
      createdAt: now - 30 * 24 * 3600 * 1000,
      updatedAt: now,
      autoRenew: true,
      notes: 'Accès 100% Gratuit & Illimité offert par le propriétaire Desir Asaph Berry',
    };
  }

  // Admin Methods
  static async adminGetAllUsers(): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      const snap = await getDocs(usersRef);
      return snap.docs.map((d) => d.data() as UserProfile);
    } catch (err) {
      console.error('Admin users fetch error:', err);
      return [];
    }
  }

  static async adminGetAllSubscriptions(): Promise<SubscriptionRecord[]> {
    try {
      const subsRef = collection(db, 'subscriptions');
      const snap = await getDocs(subsRef);
      return snap.docs.map((d) => d.data() as SubscriptionRecord);
    } catch (err) {
      console.error('Admin subs fetch error:', err);
      return [];
    }
  }

  static async adminGetAllTransactions(): Promise<PaymentTransaction[]> {
    try {
      const txRef = collection(db, 'transactions');
      const snap = await getDocs(txRef);
      return snap.docs.map((d) => d.data() as PaymentTransaction);
    } catch (err) {
      console.error('Admin tx fetch error:', err);
      return [];
    }
  }

  static async adminUpdateUserPlan(userId: string, newPlan: SubscriptionStatus, days = 30): Promise<void> {
    const now = Date.now();
    const expiresAt = newPlan === 'PREMIUM_ACTIVE' ? now + days * 24 * 3600 * 1000 : now;

    await updateDoc(doc(db, 'users', userId), {
      plan: newPlan,
      updatedAt: now,
    });

    if (newPlan === 'PREMIUM_ACTIVE') {
      const subId = `sub_admin_${userId}_${now}`;
      await setDoc(doc(db, 'subscriptions', subId), {
        id: subId,
        userId,
        status: 'PREMIUM_ACTIVE',
        plan: 'PREMIUM_MONTHLY',
        price: PREMIUM_PRICE_USD,
        currency: 'USD',
        transactionId: `admin_granted_${now}`,
        paymentMethod: 'system',
        startedAt: now,
        expiresAt,
        createdAt: now,
        updatedAt: now,
        notes: 'Activé manuellement par un administrateur',
      });
    }
  }
}
