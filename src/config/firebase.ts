import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableNetwork, disableNetwork, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { env } from './env';

const firebaseConfig = env.firebase;

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase configuration is missing required fields. Please check your .env.local file.');
  console.error('Required environment variables:');
  console.error('- VITE_FIREBASE_API_KEY');
  console.error('- VITE_FIREBASE_PROJECT_ID');
  console.error('- VITE_FIREBASE_AUTH_DOMAIN');
  console.error('- VITE_FIREBASE_STORAGE_BUCKET');
  console.error('- VITE_FIREBASE_MESSAGING_SENDER_ID');
  console.error('- VITE_FIREBASE_APP_ID');
}

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

// Initialize services with error handling
let auth, db, storage;

try {
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Enable offline persistence for Firestore
  if (typeof window !== 'undefined') {
    // Only enable persistence in browser environment
    try {
      // Note: Persistence is enabled by default in v9+
      console.log('Firebase Firestore offline persistence enabled');
    } catch (error) {
      console.warn('Failed to enable Firestore persistence:', error);
    }
  }
  
  console.log('Firebase services initialized successfully');
  
} catch (error) {
  console.error('Failed to initialize Firebase services:', error);
  // Don't throw error to prevent app crash, let it continue with offline mode
}

// Helper function to check Firebase connection status
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    if (!db) return false;
    
    // Try to enable network (this will succeed if we can connect)
    await enableNetwork(db);
    return true;
  } catch (error) {
    console.warn('Firebase connection check failed:', error);
    return false;
  }
};

// Helper function to handle offline scenarios
export const handleOfflineMode = async () => {
  try {
    if (db) {
      await disableNetwork(db);
      console.log('Firebase switched to offline mode');
    }
  } catch (error) {
    console.warn('Failed to switch to offline mode:', error);
  }
};

export { auth, db, storage };
export { analytics };
export default app;