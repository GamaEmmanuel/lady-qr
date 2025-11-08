import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Helper function to get Firestore instance (main-database)
export const getMainDatabase = () => {
  return getFirestore(admin.app(), 'main-database');
};

console.log('✅ Firebase Admin initialized with main-database Firestore database');

// Import and export function modules
export * from "./redirect";
export * from "./analytics";
export * from "./stripe";
export * from "./test";