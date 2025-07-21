import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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

  const login = async (email: string, password: string) => {
    // Test credentials for demo
    if (email === 'test@ladyqr.com' && password === 'password123') {
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
      trackUserLogin('email');
      setAnalyticsUserId(testUser.uid);
      setAnalyticsUserProperties({
        plan_type: testSubscription.planType,
        user_type: 'test_user'
      });
      return;
    }
    
    // For any other credentials, try Firebase (will likely fail with demo config)
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw new Error('Credenciales incorrectas. Usa test@ladyqr.com / password123 para la demo.');
    }
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
    trackUserSignUp('email');
    setAnalyticsUserId(result.user.uid);
    setAnalyticsUserProperties({
      plan_type: 'gratis',
      user_type: 'new_user'
    });
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
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
      trackUserSignUp('google');
      setAnalyticsUserId(result.user.uid);
      setAnalyticsUserProperties({
        plan_type: 'gratis',
        user_type: 'new_user'
      });
    } else {
      // Track login event for existing Google users
      trackUserLogin('google');
      setAnalyticsUserId(result.user.uid);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;
    
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
    // Auto-login for demo purposes
    const autoLogin = () => {
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
      setLoading(false);
    };

    // Auto-login immediately
    autoLogin();
    return () => {};

    // Original Firebase auth code (commented out for demo)
    /*
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Fetch user data
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as User);
        }
        
        // Fetch subscription
        const subscriptionDoc = await getDoc(doc(db, `users/${user.uid}/subscriptions`, 'current'));
        if (subscriptionDoc.exists()) {
          setSubscription(subscriptionDoc.data() as Subscription);
        }
        
        // Fetch QR counts
        const counts = await getUserQRCounts(user.uid);
        setQrCounts(counts);
      } else {
        setCurrentUser(null);
        setUserData(null);
        setSubscription(null);
        setQrCounts(null);
      }
      setLoading(false);
    });

    return unsubscribe;
    */
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