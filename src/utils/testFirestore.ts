import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { isOfflineMode } from '../config/firebase';

// Test function to write to Firestore
export const testFirestoreWrite = async () => {
  if (isOfflineMode() || !db) {
    // Don't use alert() in embedded environments - it gets blocked
    console.log('🔌 App running in offline mode - Firebase features disabled');
    return {
      success: false,
      error: 'Offline mode enabled',
      offline: true
    };
  }
  
  try {
    console.log('Testing Firestore write...');
    
    // Test 1: Create a test user document
    const testUserId = 'test-user-' + Date.now();
    const testUserData = {
      uid: testUserId,
      email: 'test@ladyqr.com',
      fullName: 'Test User',
      createdAt: new Date()
    };
    
    await setDoc(doc(db, 'users', testUserId), testUserData);
    console.log('✅ Successfully created test user document');
    
    // Test 2: Create a test subscription document
    const testSubscriptionData = {
      id: 'test-subscription',
      planType: 'gratis',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(doc(db, `users/${testUserId}/subscriptions`, 'current'), testSubscriptionData);
    console.log('✅ Successfully created test subscription document');
    
    // Test 3: Create a test QR code document
    const testQRData = {
      id: 'test-qr-' + Date.now(),
      userId: testUserId,
      name: 'Test QR Code',
      type: 'url',
      isDynamic: false,
      content: { url: 'https://example.com' },
      customizationOptions: {
        foregroundColor: '#000000',
        backgroundColor: '#ffffff',
        cornerSquareStyle: 'square',
        cornerDotStyle: 'square',
        dotsStyle: 'square'
      },
      scanCount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const qrDocRef = await addDoc(collection(db, 'qrcodes'), testQRData);
    console.log('✅ Successfully created test QR code document with ID:', qrDocRef.id);
    
    console.log('🎉 All Firestore write tests passed!');
    return {
      success: true,
      userId: testUserId,
      qrCodeId: qrDocRef.id
    };
    
  } catch (error) {
    console.error('❌ Firestore write test failed:', error);
    return {
      success: false,
      error: error,
      offline: false
    };
  }
};