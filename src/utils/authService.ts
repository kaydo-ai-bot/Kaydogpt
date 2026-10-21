import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  fbSignOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  ConfirmationResult,
} from '../lib/firebase';
import { UserProfile, SubscriptionStatus } from '../types';

export const ADMIN_EMAILS = ['kberryprime@gmail.com', 'fivet5874@gmail.com', 'admin@kaydogpt.com'];

export class AuthService {
  private static recaptchaVerifier: RecaptchaVerifier | null = null;

  // Initialize or get User Profile from Firestore
  static async syncUserProfile(firebaseUser: any): Promise<UserProfile> {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(userRef);

    const now = Date.now();
    const providers = firebaseUser.providerData
      ? firebaseUser.providerData.map((p: any) => p.providerId)
      : [];

    const isAdmin = (firebaseUser.email && ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase())) || false;

    if (!snap.exists()) {
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Utilisateur'),
        email: firebaseUser.email || null,
        phoneNumber: firebaseUser.phoneNumber || null,
        photoURL: firebaseUser.photoURL || null,
        authProviders: providers.length > 0 ? providers : ['password'],
        role: isAdmin ? 'admin' : 'user',
        plan: isAdmin ? 'PREMIUM_ACTIVE' : 'FREE',
        createdAt: now,
        updatedAt: now,
        preferences: {},
      };

      try {
        await setDoc(userRef, newProfile);
      } catch (err) {
        console.warn('Could not save user profile to Firestore:', err);
      }

      return newProfile;
    } else {
      const data = snap.data() as UserProfile;
      
      // Auto-promote if email is admin
      let role = data.role || 'user';
      if (isAdmin && role !== 'admin') {
        role = 'admin';
      }

      // Check for subscription expiration - Admins/Creators get permanent Premium
      let currentPlan = isAdmin ? 'PREMIUM_ACTIVE' : (data.plan || 'FREE');

      const updatedProfile: UserProfile = {
        ...data,
        displayName: firebaseUser.displayName || data.displayName || 'Utilisateur',
        email: firebaseUser.email || data.email,
        phoneNumber: firebaseUser.phoneNumber || data.phoneNumber,
        photoURL: firebaseUser.photoURL || data.photoURL,
        authProviders: Array.from(new Set([...(data.authProviders || []), ...providers])),
        role,
        plan: currentPlan,
        updatedAt: now,
      };

      try {
        await updateDoc(userRef, {
          displayName: updatedProfile.displayName,
          email: updatedProfile.email || null,
          phoneNumber: updatedProfile.phoneNumber || null,
          photoURL: updatedProfile.photoURL || null,
          authProviders: updatedProfile.authProviders,
          role: updatedProfile.role,
          plan: updatedProfile.plan,
          updatedAt: now,
        });
      } catch (err) {
        console.warn('Could not update profile to Firestore:', err);
      }

      return updatedProfile;
    }
  }

  // Subscribe to auth state changes
  static onAuthChange(callback: (user: UserProfile | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await this.syncUserProfile(firebaseUser);
          callback(profile);
        } catch (e) {
          console.error('Error syncing profile:', e);
          callback({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Utilisateur',
            email: firebaseUser.email,
            phoneNumber: firebaseUser.phoneNumber,
            photoURL: firebaseUser.photoURL,
            authProviders: ['google.com'],
            role: (firebaseUser.email && ADMIN_EMAILS.includes(firebaseUser.email)) ? 'admin' : 'user',
            plan: 'FREE',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      } else {
        callback(null);
      }
    });
  }

  // Google Login
  static async loginWithGoogle(): Promise<UserProfile> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return await this.syncUserProfile(result.user);
    } catch (err: any) {
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/cancelled-popup-request') {
        await signInWithRedirect(auth, googleProvider);
        throw new Error('Redirection vers Google en cours...');
      }
      throw err;
    }
  }

  // Handle redirect result if popup failed
  static async handleRedirectResult(): Promise<UserProfile | null> {
    try {
      const result = await getRedirectResult(auth);
      if (result && result.user) {
        return await this.syncUserProfile(result.user);
      }
    } catch (err) {
      console.warn('Redirect auth result error:', err);
    }
    return null;
  }

  // Email & Password Registration
  static async registerWithEmail(email: string, pass: string, name: string): Promise<UserProfile> {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }
    try {
      await sendEmailVerification(cred.user);
    } catch (e) {
      console.warn('Could not send verification email:', e);
    }
    return await this.syncUserProfile(cred.user);
  }

  // Email & Password Login
  static async loginWithEmail(email: string, pass: string): Promise<UserProfile> {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return await this.syncUserProfile(cred.user);
  }

  // Password Reset
  static async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  // Phone OTP Sign-in Setup
  static getOrCreateRecaptcha(containerId: string): RecaptchaVerifier {
    if (!this.recaptchaVerifier) {
      this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
      });
    }
    return this.recaptchaVerifier;
  }

  // Send Phone OTP
  static async sendPhoneOtp(phoneNumber: string, containerId = 'recaptcha-container'): Promise<ConfirmationResult> {
    const verifier = this.getOrCreateRecaptcha(containerId);
    return await signInWithPhoneNumber(auth, phoneNumber, verifier);
  }

  // Verify Phone OTP
  static async verifyPhoneOtp(confirmationResult: ConfirmationResult, verificationCode: string): Promise<UserProfile> {
    const cred = await confirmationResult.confirm(verificationCode);
    return await this.syncUserProfile(cred.user);
  }

  // Logout
  static async logout(): Promise<void> {
    await fbSignOut(auth);
  }

  // Update profile data
  static async updateProfileData(uid: string, updates: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  }

  // Generate / Switch to Lifetime Creator Profile for Testing & Administration
  static createCreatorProfile(): UserProfile {
    const now = Date.now();
    return {
      uid: 'creator_kberryprime_master',
      displayName: 'Desir Asaph Berry (Créateur)',
      email: 'kberryprime@gmail.com',
      phoneNumber: '+509 35 97 58 63',
      photoURL: null,
      authProviders: ['google.com', 'admin_access'],
      role: 'admin',
      plan: 'PREMIUM_ACTIVE',
      createdAt: now - 365 * 24 * 3600 * 1000,
      updatedAt: now,
      preferences: {},
    };
  }
}
