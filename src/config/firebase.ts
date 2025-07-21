import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBkW-CAlGjRClcL5-AbJRI7c3hQ5wwhWDs",
  authDomain: "lady-qr.firebaseapp.com",
  projectId: "lady-qr",
  storageBucket: "lady-qr.firebasestorage.app",
  messagingSenderId: "534631817946",
  appId: "1:534631817946:web:9d15524fa569ed13c93be3",
  measurementId: "G-WKDZZLF91G"
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Add error handling for Firebase initialization
if (!app) {
  console.error('Failed to initialize Firebase app');
}

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
  
  // Test connection
  console.log('Firebase services initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase services:', error);
  throw error;
}

export { auth, db, storage };
export { analytics };
export default app;