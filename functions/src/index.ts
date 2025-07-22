import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Import function modules
import { redirect } from './redirect';
import { getAnalytics } from './analytics';

// Export functions
export { redirect, getAnalytics };