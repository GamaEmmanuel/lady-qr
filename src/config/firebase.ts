import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableNetwork, disableNetwork, doc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { env } from './env';

// Use your actual Firebase credentials directly
const firebaseConfig = {
  apiKey: "AIzaSyBkW-CAlGjRClcL5-AbJRI7c3hQ5wwhWDs",
  authDomain: "lady-qr.firebaseapp.com",
  projectId: "lady-qr",
  storageBucket: "lady-qr.firebasestorage.app",
  messagingSenderId: "534631817946",
  appId: "1:534631817946:web:9d15524fa569ed13c93be3",
  measurementId: "G-WKDZZLF91G"
};

// Validate Firebase configuration more thoroughly
const validateFirebaseConfig = (config: any) => {
  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missing = required.filter(field => !config[field] || config[field].trim() === '');
  
  if (missing.length > 0) {
    console.error('❌ Missing required Firebase config fields:', missing);
    return false;
  }
  
  // Validate format of key fields
  if (!config.projectId.match(/^[a-z0-9-]+$/)) {
    console.error('❌ Invalid projectId format:', config.projectId);
    return false;
  }
  
  if (!config.authDomain.includes('.firebaseapp.com')) {
    console.error('❌ Invalid authDomain format:', config.authDomain);
    return false;
  }
  
  // Validate storage bucket format
  if (!config.storageBucket.includes('.appspot.com') && !config.storageBucket.includes('.firebasestorage.app')) {
    console.error('❌ Invalid storageBucket format:', config.storageBucket);
    return false;
  }
  
  // Validate API key format
  if (!config.apiKey.startsWith('AIza')) {
    console.error('❌ Invalid API key format');
    return false;
  }
  
  return true;
};

// Debug: Log Firebase configuration (without sensitive data)
console.log('🔧 Firebase Config Check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasProjectId: !!firebaseConfig.projectId,
  hasAuthDomain: !!firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  isValid: validateFirebaseConfig(firebaseConfig)
});

// Force Firebase to work - no offline mode bullshit
let FORCE_OFFLINE_MODE = false;

// Only proceed if configuration is valid
if (validateFirebaseConfig(firebaseConfig)) {
  console.log('✅ All Firebase configuration fields present');
} else {
  console.error('❌ Firebase configuration validation failed');
  FORCE_OFFLINE_MODE = true;
}

// Initialize Firebase only if it hasn't been initialized already
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  console.log('✅ Firebase app initialized successfully');
} catch (error) {
  console.error('❌ Firebase app initialization failed:', error);
  throw error;
}

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined' && app) {
  try {
    analytics = getAnalytics(app);
    console.log('✅ Firebase Analytics initialized');
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

// Initialize services with error handling
let auth, db, storage;

if (app) {
  try {
    auth = getAuth(app);
    console.log('✅ Firebase Auth initialized');
    
    db = getFirestore(app);
    console.log('✅ Firebase Firestore initialized');
    
    storage = getStorage(app);
    console.log('✅ Firebase Storage initialized');
    
    console.log('✅ All Firebase services initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize Firebase services:', error);
    throw error;
  }
} else {
  throw new Error('Firebase app not initialized');
}

// Enhanced helper function to check Firebase connection status
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    // Try a simple read operation
    const testDoc = doc(db, '__connection_test__', 'ping');
    const result = await getDoc(testDoc);
    
    console.log('✅ Firebase connection test successful');
    return true;
  } catch (error: any) {
    console.error('❌ Firebase connection test failed:', error);
    
    // Check for specific error types
    if (error.code === 'permission-denied') {
      console.error('🚫 Firestore rules are blocking access');
    } else if (error.code === 'not-found') {
      console.error('🚫 Firestore database not found - create it in Firebase Console');
    } else if (error.message.includes('400') || error.message.includes('Bad Request')) {
      console.error('🚫 Invalid Firebase configuration - check your credentials');
      FORCE_OFFLINE_MODE = true;
    } else if (error.code === 'unavailable') {
      console.error('🚫 Firestore service unavailable');
    }
    
    throw error;
  }
};

// Helper functions for compatibility
export const isOfflineMode = (): boolean => false;
export const enableOfflineMode = (): void => {};
export const handleOfflineMode = async () => {};

export { auth, db, storage };
export { analytics };
export default app;