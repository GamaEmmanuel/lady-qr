import * as admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Helper function to get Firestore instance (default database)
// Use admin.firestore() instead of getFirestore() for better compatibility
export const getMainDatabase = () => {
  return admin.firestore();
};

console.log('✅ Firebase Admin initialized with (default) Firestore database');

// Import and export function modules
export * from "./redirect";
export * from "./analytics";
export * from "./stripe";
export * from "./test";
export * from "./downgrade";
export * from "./cleanup";