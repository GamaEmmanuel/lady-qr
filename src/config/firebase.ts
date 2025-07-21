import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableNetwork, disableNetwork, connectFirestoreEmulator, doc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { env } from './env';

const firebaseConfig = env.firebase;

// Debug: Log Firebase configuration (without sensitive data)
console.log('🔧 Firebase Config Check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasProjectId: !!firebaseConfig.projectId,
  hasAuthDomain: !!firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

// Validate Firebase configuration with detailed logging
const missingFields = [];
if (!firebaseConfig.apiKey) missingFields.push('VITE_FIREBASE_API_KEY');
if (!firebaseConfig.projectId) missingFields.push('VITE_FIREBASE_PROJECT_ID');
if (!firebaseConfig.authDomain) missingFields.push('VITE_FIREBASE_AUTH_DOMAIN');
if (!firebaseConfig.storageBucket) missingFields.push('VITE_FIREBASE_STORAGE_BUCKET');
if (!firebaseConfig.messagingSenderId) missingFields.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
if (!firebaseConfig.appId) missingFields.push('VITE_FIREBASE_APP_ID');

if (missingFields.length > 0) {
  console.error('❌ Missing Firebase configuration fields:', missingFields);
} else {
  console.log('✅ All Firebase configuration fields present');
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
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
    console.log('✅ Firebase Analytics initialized');
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

// Initialize services with error handling
let auth, db, storage;

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

// Enhanced helper function to check Firebase connection status
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    if (!db) {
      console.warn('⚠️ Firestore not initialized');
      return false;
    }
    
    console.log('🔍 Testing Firebase connection...');
    
    // Try to read a simple document to test connection
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    
    console.log('✅ Firebase connection test successful');
    return true;
  } catch (error: any) {
    console.warn('❌ Firebase connection test failed:', error.message);
    
    // Check specific error types
    if (error.code === 'unavailable') {
      console.warn('🔌 Firebase service unavailable - likely network issue');
    } else if (error.code === 'permission-denied') {
      console.warn('🔒 Firebase permission denied - check Firestore rules');
    } else if (error.code === 'failed-precondition') {
      console.warn('⚙️ Firebase failed precondition - check project configuration');
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
if (typeof window !== 'undefined' && db) {
  // Run connection test after a short delay to allow initialization
  setTimeout(async () => {
    console.log('🚀 Running initial Firebase connection test...');
    const isConnected = await checkFirebaseConnection();
    if (!isConnected) {
      console.warn('⚠️ Initial Firebase connection failed - app will run in offline mode');
    }
  }, 1000);
}

export { auth, db, storage };
export { analytics };
export default app;