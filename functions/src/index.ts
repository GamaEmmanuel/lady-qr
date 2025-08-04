import * as admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Import and export function modules
export {redirect} from './redirect';
export {getAnalytics} from './analytics';