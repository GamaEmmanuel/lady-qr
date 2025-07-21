import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableNetwork, disableNetwork, doc, getDoc } from 'firebase/firestore';
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

// Force offline mode flag
let FORCE_OFFLINE_MODE = false;

// Check if running in embedded environment (like WebContainer)
const isEmbeddedEnvironment = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true; // If we can't access window.top, we're probably embedded
  }
};

// Only proceed if configuration is valid
if (validateFirebaseConfig(firebaseConfig)) {
  if (isEmbeddedEnvironment()) {
    console.log('🔧 Running in embedded environment (WebContainer)');
  }
  console.log('✅ All Firebase configuration fields present');
} else {
  console.error('❌ Firebase configuration validation failed');
  FORCE_OFFLINE_MODE = true;
}

// Initialize Firebase only if it hasn't been initialized already
let app;
try {
  if (validateFirebaseConfig(firebaseConfig) && !FORCE_OFFLINE_MODE) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    console.log('✅ Firebase app initialized successfully');
  } else {
    console.warn('⚠️ Firebase initialization skipped - running in offline mode');
    FORCE_OFFLINE_MODE = true;
  }
} catch (error) {
  console.error('❌ Firebase app initialization failed:', error);
  console.warn('🔄 Switching to offline mode');
  FORCE_OFFLINE_MODE = true;
}

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined' && app && !FORCE_OFFLINE_MODE) {
  try {
    analytics = getAnalytics(app);
    console.log('✅ Firebase Analytics initialized');
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

// Initialize services with error handling
let auth, db, storage;

if (app && !FORCE_OFFLINE_MODE) {
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
    console.warn('🔄 Switching to offline mode due to service initialization failure');
    FORCE_OFFLINE_MODE = true;
    // Clear services to prevent partial initialization
    auth = undefined;
    db = undefined;
    storage = undefined;
  }
} else {
  console.log('🔌 Firebase not configured - running in offline mode');
  FORCE_OFFLINE_MODE = true;
}

// Enhanced helper function to check Firebase connection status
export const checkFirebaseConnection = async (): Promise<boolean> => {
  if (FORCE_OFFLINE_MODE) {
    console.log('🔌 Firebase connection check skipped - offline mode enabled');
    return false;
  }
  
  try {
    if (!db) {
      console.warn('⚠️ Firestore not initialized');
      return false;
    }
    // Try a simple read operation first (less likely to fail)
    const testDoc = doc(db, '__connection_test__', 'ping');
    const result = await Promise.race([
      getDoc(testDoc),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
    ]);
    
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
    
    return false;
  }
};

// Helper to check if we're in forced offline mode
export const isOfflineMode = (): boolean => {
  return FORCE_OFFLINE_MODE;
};

// Helper to enable offline mode manually
export const enableOfflineMode = (): void => {
  FORCE_OFFLINE_MODE = true;
  console.log('🔌 Offline mode manually enabled');
};

// Helper function to handle offline scenarios
export const handleOfflineMode = async () => {
  try {
    if (db && !FORCE_OFFLINE_MODE) {
      await disableNetwork(db);
      console.log('🔌 Firebase switched to offline mode');
    }
  } catch (error) {
    console.warn('⚠️ Failed to switch to offline mode:', error);
  }
};

// Test Firebase connection on initialization
if (typeof window !== 'undefined' && db && validateFirebaseConfig(firebaseConfig) && !FORCE_OFFLINE_MODE) {
  // Run connection test after a short delay to allow initialization
  setTimeout(async () => {
    console.log('🚀 Running initial Firebase connection test...');
    const isConnected = await checkFirebaseConnection();
    if (!isConnected) {
      console.warn('⚠️ Initial Firebase connection failed - enabling offline mode');
      FORCE_OFFLINE_MODE = true;
    }
  }, 2000);
} else if (FORCE_OFFLINE_MODE) {
  console.log('🔌 App running in offline mode - Firebase features disabled');
}

export { auth, db, storage };
export { analytics };
export default app;