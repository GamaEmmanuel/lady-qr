import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBkW-CAlGjRClcL5-AbJRI7c3hQ5wwhWDs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lady-qr.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lady-qr",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lady-qr.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "534631817946",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:534631817946:web:9d15524fa569ed13c93be3",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WKDZZLF91G"
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { analytics };
export default app;