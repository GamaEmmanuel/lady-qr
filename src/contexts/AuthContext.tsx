import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, Subscription } from '../types';
import { plans } from '../data/plans';
import { trackUserSignUp, trackUserLogin, setAnalyticsUserId, setAnalyticsUserProperties } from '../utils/analytics';

// Mock function to get user's QR code counts
const getUserQRCounts = async (userId: string) => {
  // In a real implementation, this would query Firestore
  // For now, return mock data
  return {
    staticCodes: 0,
    dynamicCodes: 0
  };
};

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  subscription: Subscription | null;
  qrCounts: { staticCodes: number; dynamicCodes: number } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendPasswordlessLink: (email: string) => Promise<void>;
  completePasswordlessSignIn: (email: string) => Promise<void>;
  isPasswordlessSignIn: () => boolean;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  canCreateQR: (type: 'static' | 'dynamic') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [qrCounts, setQrCounts] = useState<{ staticCodes: number; dynamicCodes: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Action code settings for passwordless authentication
  const actionCodeSettings = {
    // URL to redirect back to after email verification
    url: window.location.origin + '/auth/complete',
    // This must be true for email link authentication
    handleCodeInApp: true,
    iOS: {
      bundleId: 'com.ladyqr.ios' // Replace with your iOS bundle ID
    },
    android: {
      packageName: 'com.ladyqr.android', // Replace with your Android package name
      installApp: true,
      minimumVersion: '12'
    },
    // Use your custom domain if you have one configured in Firebase Hosting
    dynamicLinkDomain: 'lady-qr.firebaseapp.com' // Replace with your custom domain if available
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, fullName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: fullName });
    
    const userData: User = {
      uid: result.user.uid,
      email: result.user.email!,
      fullName,
      createdAt: new Date()
    };
    
    await setDoc(doc(db, 'users', result.user.uid), userData);
    
    // Create free subscription
    const freeSubscription: Subscription = {
      id: 'free',
      planType: 'gratis',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(doc(db, `users/${result.user.uid}/subscriptions`, 'current'), freeSubscription);
    
    // Track sign up event
    try {
      trackUserSignUp('email');
      setAnalyticsUserId(result.user.uid);
      setAnalyticsUserProperties({
        plan_type: 'gratis',
        user_type: 'new_user'
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // Add additional scopes if needed
    provider.addScope('profile');
    provider.addScope('email');
    
    const result = await signInWithPopup(auth, provider);
    
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (!userDoc.exists()) {
      const userData: User = {
        uid: result.user.uid,
        email: result.user.email!,
        fullName: result.user.displayName || '',
        createdAt: new Date()
      };
      
      await setDoc(doc(db, 'users', result.user.uid), userData);
      
      // Create free subscription
      const freeSubscription: Subscription = {
        id: `sub_${result.user.uid}_${Date.now()}`,
        userId: result.user.uid,
        planType: 'gratis',
        status: 'active',
        stripeSubscriptionId: null,
        trialEndsAt: null,
        currentPeriodEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'suscriptions', freeSubscription.id), freeSubscription);
      
      // Track sign up event for new Google users
      try {
        trackUserSignUp('google');
        setAnalyticsUserId(result.user.uid);
        setAnalyticsUserProperties({
          plan_type: 'gratis',
          user_type: 'new_user'
        });
      } catch (error) {
        console.warn('Analytics tracking failed:', error);
      }
    } else {
      // Track login event for existing Google users
      try {
        trackUserLogin('google');
        setAnalyticsUserId(result.user.uid);
      } catch (error) {
        console.warn('Analytics tracking failed:', error);
      }
    }
  };

  const sendPasswordlessLink = async (email: string) => {
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // Store the email locally so we can complete the sign-in process
      localStorage.setItem('emailForSignIn', email);
      
      // Track passwordless authentication attempt
      try {
        trackUserLogin('email_link_sent');
      } catch (error) {
        console.warn('Analytics tracking failed:', error);
      }
    } catch (error: any) {
      console.error('Error sending passwordless link:', error);
      throw new Error('Error sending authentication link. Please try again.');
    }
  };

  const completePasswordlessSignIn = async (email?: string) => {
    try {
      // Get the email from parameter or localStorage
      const emailForSignIn = email || localStorage.getItem('emailForSignIn');
      
      if (!emailForSignIn) {
        throw new Error('Email not found. Please try the sign-in process again.');
      }

      // Confirm the link is a sign-in with email link
      if (!isSignInWithEmailLink(auth, window.location.href)) {
        throw new Error('Invalid authentication link.');
      }

      // Complete the sign-in process
      const result = await signInWithEmailLink(auth, emailForSignIn, window.location.href);
      
      // Clear the email from localStorage
      localStorage.removeItem('emailForSignIn');
      
      // Check if this is a new user and create profile if needed
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        const userData: User = {
          uid: result.user.uid,
          email: result.user.email!,
          fullName: result.user.displayName || '',
          createdAt: new Date()
        };
        
        await setDoc(doc(db, 'users', result.user.uid), userData);
        
        // Create free subscription for new users
        const freeSubscription: Subscription = {
          id: `sub_${result.user.uid}_${Date.now()}`,
          userId: result.user.uid,
          userId: result.user.uid,
          planType: 'gratis',
          status: 'active',
          stripeSubscriptionId: null,
          trialEndsAt: null,
          currentPeriodEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          cancelAtPeriodEnd: false,
          stripeSubscriptionId: null,
          trialEndsAt: null,
          currentPeriodEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          cancelAtPeriodEnd: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(doc(db, 'suscriptions', freeSubscription.id), freeSubscription);
        
        // Track sign up event for new users
        try {
          trackUserSignUp('email_link');
          setAnalyticsUserId(result.user.uid);
          setAnalyticsUserProperties({
            plan_type: 'gratis',
            user_type: 'new_user',
            auth_method: 'email_link'
          });
        } catch (error) {
          console.warn('Analytics tracking failed:', error);
        }
      } else {
        // Track login event for existing users
        try {
          trackUserLogin('email_link');
          setAnalyticsUserId(result.user.uid);
          setAnalyticsUserProperties({
            auth_method: 'email_link'
          });
        } catch (error) {
          console.warn('Analytics tracking failed:', error);
        }
      }
    } catch (error: any) {
      console.error('Error completing passwordless sign-in:', error);
      throw new Error('Error completing authentication. Please try again.');
    }
  };

  const isPasswordlessSignIn = (): boolean => {
    return isSignInWithEmailLink(auth, window.location.href);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!currentUser || !db) {
      return;
    }
    
    await setDoc(doc(db, 'users', currentUser.uid), updates, { merge: true });
    setUserData(prev => prev ? { ...prev, ...updates } : null);
  };

  const canCreateQR = (type: 'static' | 'dynamic'): boolean => {
    if (!subscription || !qrCounts) return false;
    
    const plan = plans.find(p => p.id === subscription.planType);
    if (!plan) return false;
    
    if (type === 'static') {
      return plan.limits.staticCodes === -1 || qrCounts.staticCodes < plan.limits.staticCodes;
    } else {
      return qrCounts.dynamicCodes < plan.limits.dynamicCodes;
    }
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Fetch user data with error handling
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as User);
          } else {
            // Create user data if document doesn't exist
            const userData = {
              uid: user.uid,
              email: user.email || '',
              fullName: user.displayName || 'User',
              createdAt: new Date()
            };
            await setDoc(doc(db, 'users', user.uid), userData);
            setUserData(userData);
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          throw error;
        }
        
        // Fetch subscription with error handling
        try {
          // Query the suscriptions collection to find the user's active subscription
          const subscriptionQuery = query(
            collection(db, 'suscriptions'),
            where('userId', '==', user.uid),
            where('status', '==', 'active'),
            limit(1)
          );
          
          const subscriptionSnapshot = await getDocs(subscriptionQuery);
          
          if (!subscriptionSnapshot.empty) {
            const subscriptionDoc = subscriptionSnapshot.docs[0];
            setSubscription({ id: subscriptionDoc.id, ...subscriptionDoc.data() } as Subscription);
          } else {
            // Create free subscription if document doesn't exist
            const freeSubscription: Subscription = {
              id: `sub_${user.uid}_${Date.now()}`,
              userId: user.uid,
              planType: 'gratis',
              status: 'active',
              stripeSubscriptionId: null,
              trialEndsAt: null,
              currentPeriodEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              cancelAtPeriodEnd: false,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            await setDoc(doc(db, 'suscriptions', freeSubscription.id), freeSubscription);
            setSubscription(freeSubscription);
          }
        } catch (error) {
          console.error('Failed to fetch subscription data:', error);
          // Set a default free subscription if query fails
          setSubscription({
            id: 'default',
            userId: user.uid,
            planType: 'gratis',
            status: 'active',
            stripeSubscriptionId: null,
            trialEndsAt: null,
            currentPeriodEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: false,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        
        // Fetch QR counts with error handling
        try {
          const counts = await getUserQRCounts(user.uid);
          setQrCounts(counts);
        } catch (error) {
          console.error('Failed to fetch QR counts:', error);
          setQrCounts({ staticCodes: 0, dynamicCodes: 0 });
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
        setSubscription(null);
        setQrCounts(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userData,
    subscription,
    qrCounts,
    loading,
    login,
    register,
    loginWithGoogle,
    sendPasswordlessLink,
    completePasswordlessSignIn,
    isPasswordlessSignIn,
    logout,
    updateUserProfile,
    canCreateQR
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};