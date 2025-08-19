import * as admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Helper function to get Firestore instance (default database)
export const getMainDatabase = () => {
  return admin.firestore();
};

console.log('✅ Firebase Admin initialized with default Firestore database');

// Import and export function modules
export {redirect} from './redirect';
export {getAnalytics} from './analytics';