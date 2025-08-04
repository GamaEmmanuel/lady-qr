import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDoc, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { env } from './env';

// Use environment variables from env.ts
const firebaseConfig = env.firebase;

// Validate Firebase configuration
const validateFirebaseConfig = (config: any) => {
  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missing = required.filter(field => !config[field] || config[field].trim() === '');

  if (missing.length > 0) {
    console.error('❌ Missing required Firebase config fields:', missing);
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
if (!validateFirebaseConfig(firebaseConfig)) {
  console.error('❌ Firebase configuration validation failed');
  throw new Error('Invalid Firebase configuration');
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
let auth: Auth, db: Firestore, storage: FirebaseStorage;

if (app) {
  try {
    auth = getAuth(app);
    console.log('✅ Firebase Auth initialized');

    db = getFirestore(app, 'main-database');
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
    } else if (error.code === 'unavailable') {
      console.error('🚫 Firestore service unavailable');
    }

    throw error;
  }
};

export { auth, db, storage };
export { analytics };
export default app;