import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableNetwork, disableNetwork, connectFirestoreEmulator, doc, getDoc, connectFirestoreEmulator as connectEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { env } from './env';

const firebaseConfig = env.firebase;

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

// Only proceed if configuration is valid
if (validateFirebaseConfig(firebaseConfig)) {
  console.log('✅ All Firebase configuration fields present');
} else {
  console.error('❌ Firebase configuration validation failed');
}

// Initialize Firebase only if it hasn't been initialized already
let app;
try {
  if (validateFirebaseConfig(firebaseConfig)) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    console.log('✅ Firebase app initialized successfully');
  } else {
    throw new Error('Invalid Firebase configuration');
  }
} catch (error) {
  console.error('❌ Firebase app initialization failed:', error);
  // Don't throw to prevent app crash
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
    // Don't throw error to prevent app crash, let it continue with offline mode
  }
} else {
  console.error('❌ Firebase app not initialized - services unavailable');
}

// Enhanced helper function to check Firebase connection status
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    if (!db) {
      console.warn('⚠️ Firestore not initialized');
      return false;
    }
    
    console.log('🔍 Testing Firebase connection...');
    
    // Try to enable network first
    await enableNetwork(db);
    console.log('🔌 Network enabled for Firestore');
    
    // Try to read a simple document to test connection with timeout
    const testDoc = doc(db, '__test__', 'connection');
    const docSnap = await Promise.race([
      getDoc(testDoc),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 10000))
    ]);
    
    console.log('✅ Firebase connection test successful');
    return true;
  } catch (error: any) {
    console.warn('❌ Firebase connection test failed:', error.message);
    
    // Check specific error types
    if (error.code === 'unavailable') {
      console.warn('🔌 Firebase service unavailable - likely network issue');
    } else if (error.code === 'unauthenticated') {
      console.warn('🔑 Firebase authentication required');
    } else if (error.code === 'permission-denied') {
      console.warn('🔒 Firebase permission denied - check Firestore rules');
    } else if (error.code === 'failed-precondition') {
      console.warn('⚙️ Firebase failed precondition - check project configuration');
    } else if (error.message === 'Connection timeout') {
      console.warn('⏱️ Firebase connection timeout - slow network or server issues');
    } else if (error.code === 'invalid-argument') {
      console.warn('🔧 Firebase invalid argument - check project configuration');
    }
    
    return false;
  }
};

// Helper function to handle offline scenarios
export const handleOfflineMode = async () => {
  try {
    if (db) {
      await disableNetwork(db);
      console.log('🔌 Firebase switched to offline mode');
    }
  } catch (error) {
    console.warn('⚠️ Failed to switch to offline mode:', error);
  }
};

// Test Firebase connection on initialization
if (typeof window !== 'undefined' && db && validateFirebaseConfig(firebaseConfig)) {
  // Run connection test after a short delay to allow initialization
  setTimeout(async () => {
    console.log('🚀 Running initial Firebase connection test...');
    const isConnected = await checkFirebaseConnection();
    if (!isConnected) {
      console.warn('⚠️ Initial Firebase connection failed - app will run in offline mode');
      console.warn('💡 Check your Firebase project settings and network connection');
    }
  }, 1000);
}

export { auth, db, storage };
export { analytics };
export default app;