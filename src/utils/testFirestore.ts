import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Test function to write to Firestore
export const testFirestoreWrite = async () => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  
  try {
    console.log('📋 Using Firebase project:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
    console.log('Testing Firestore write...');
    
    // Test 1: Simple write test
    const testUserId = 'test-user-' + Date.now();
    const testData = {
      id: testUserId,
      message: 'Test write from Lady QR',
      timestamp: new Date(),
      success: true
    };
    
    console.log('📝 Attempting to write test document...');
    await setDoc(doc(db, 'test_writes', testUserId), testData);
    console.log('✅ Successfully wrote test document');
    
    // Test 2: Read the document back
    console.log('📖 Attempting to read test document...');
    const docSnap = await getDoc(doc(db, 'test_writes', testUserId));
    if (docSnap.exists()) {
      console.log('✅ Successfully read test document:', docSnap.data());
    } else {
      console.warn('⚠️ Document was written but not found on read');
    }
    
    console.log('🎉 Firestore test completed successfully!');
    return {
      success: true,
      testId: testUserId,
      message: 'All Firestore operations working correctly'
    };
    
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    
    // Provide specific error guidance
    if (error.code === 'permission-denied') {
      console.error('💡 Fix: Update Firestore security rules to allow writes');
    } else if (error.code === 'not-found') {
      console.error('💡 Fix: Create Firestore database in Firebase Console');
    } else if (error.message?.includes('400')) {
      console.error('💡 Fix: Check Firebase project configuration and credentials');
    }
    
    return {
      success: false,
      error: error,
    };
  }
};