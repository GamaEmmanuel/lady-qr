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
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { checkFirebaseConnection, isOfflineMode } from '../config/firebase';
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
    // Test credentials for demo
    if (email === 'test@ladyqr.com' && password === 'password123') {
      console.log('🧪 Using test credentials for demo');
      // Simulate successful login with test user
      const testUser = {
        uid: 'test-user-123',
        email: 'test@ladyqr.com',
        displayName: 'Usuario de Prueba',
        emailVerified: true
      } as FirebaseUser;

      const testUserData: User = {
        uid: 'test-user-123',
        email: 'test@ladyqr.com',
        fullName: 'Usuario de Prueba',
        createdAt: new Date('2024-01-15')
      };

      const testSubscription: Subscription = {
        id: 'test-sub',
        planType: 'profesional',
        status: 'active',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      };

      const testQrCounts = {
        staticCodes: 5,
        dynamicCodes: 8
      };

      setCurrentUser(testUser);
      setUserData(testUserData);
      setSubscription(testSubscription);
      setQrCounts(testQrCounts);
      
      // Track login event
      try {
        trackUserLogin('email');
        setAnalyticsUserId(testUser.uid);
        setAnalyticsUserProperties({
          plan_type: testSubscription.planType,
          user_type: 'test_user'
        });
      } catch (error) {
        console.warn('Analytics tracking failed:', error);
      }
      return;
    }
    
    // For any other credentials, try Firebase if available
    if (isOfflineMode() || !auth) {
      throw new Error('Firebase authentication not available. Use test@ladyqr.com / password123 for demo.');
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw new Error('Credenciales incorrectas. Usa test@ladyqr.com / password123 para la demo.');
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    if (isOfflineMode() || !auth || !db) {
      throw new Error('Registration not available in offline mode. Firebase connection required.');
    }
    
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
    if (isOfflineMode() || !auth || !db) {
      throw new Error('Google login not available in offline mode. Firebase connection required.');
    }
    
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
        id: 'free',
        planType: 'gratis',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, `users/${result.user.uid}/subscriptions`, 'current'), freeSubscription);
      
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
    if (isOfflineMode() || !auth) {
      throw new Error('Passwordless login not available in offline mode. Firebase connection required.');
    }
    
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
    if (isOfflineMode() || !auth || !db) {
      throw new Error('Passwordless login not available in offline mode. Firebase connection required.');
    }
    
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
          id: 'free',
          planType: 'gratis',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(doc(db, `users/${result.user.uid}/subscriptions`, 'current'), freeSubscription);
        
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
    if (isOfflineMode() || !auth) {
      return false;
    }
    return isSignInWithEmailLink(auth, window.location.href);
  };

  const logout = async () => {
    if (auth && !isOfflineMode()) {
      await signOut(auth);
    } else {
      // Manual logout for offline mode
      setCurrentUser(null);
      setUserData(null);
      setSubscription(null);
      setQrCounts(null);
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!currentUser || isOfflineMode() || !db) {
      console.warn('Profile update not available in offline mode');
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
    if (isOfflineMode() || !auth) {
      console.log('🔌 Auth state monitoring disabled - offline mode');
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Check Firebase connection before making Firestore calls
        const isConnected = await checkFirebaseConnection();
        if (!isConnected) {
          console.warn('Firebase is offline, using cached/default data only');
          // Set default values when offline
          setUserData({
            uid: user.uid,
            email: user.email || '',
            fullName: user.displayName || 'User',
            createdAt: new Date()
          });
          setSubscription({
            id: 'offline-free',
            planType: 'gratis',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          setQrCounts({ staticCodes: 0, dynamicCodes: 0 });
          setLoading(false);
          return;
        }
        
        // Fetch user data with error handling
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as User);
          } else {
            // Create default user data if document doesn't exist
            setUserData({
              uid: user.uid,
              email: user.email || '',
              fullName: user.displayName || 'User',
              createdAt: new Date()
            });
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // Set default user data on error
          setUserData({
            uid: user.uid,
            email: user.email || '',
            fullName: user.displayName || 'User',
            createdAt: new Date()
          });
        }
        
        // Fetch subscription with error handling
        try {
          const subscriptionDoc = await getDoc(doc(db, `users/${user.uid}/subscriptions`, 'current'));
          if (subscriptionDoc.exists()) {
            setSubscription(subscriptionDoc.data() as Subscription);
          } else {
            // Create default free subscription if document doesn't exist
            setSubscription({
              id: 'default-free',
              planType: 'gratis',
              status: 'active',
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        } catch (error) {
          console.error('Failed to fetch subscription data:', error);
          // Set default free subscription if offline
          setSubscription({
            id: 'error-free',
            planType: 'gratis',
            status: 'active',
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
          // Set default counts if offline
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