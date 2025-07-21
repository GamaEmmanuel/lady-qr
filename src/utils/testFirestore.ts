import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Test function to write to Firestore
export const testFirestoreWrite = async () => {
  if (!db) {
    throw new Error('Firestore not initialized');
  }
  
  try {
    console.log('📋 Using Firebase project:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
    console.log('Creating documents for all collections...');
    
    const testUserId = 'test-user-' + Date.now();
    const timestamp = new Date();
    
    // 1. Users collection
    console.log('📝 Creating user document...');
    const userData = {
      uid: testUserId,
      email: 'test@ladyqr.com',
      fullName: 'Test User',
      createdAt: timestamp
    };
    await setDoc(doc(db, 'users', testUserId), userData);
    console.log('✅ Created user document');
    
    // 2. QR Codes collection
    console.log('📝 Creating QR code document...');
    const qrCodeData = {
      id: 'qr-' + Date.now(),
      userId: testUserId,
      name: 'Test QR Code',
      type: 'url',
      isDynamic: true,
      shortUrlId: 'abc123',
      destinationUrl: 'https://ladyqr.com',
      content: { url: 'https://ladyqr.com' },
      customizationOptions: {
        foregroundColor: '#000000',
        backgroundColor: '#ffffff',
        cornerSquareStyle: 'square',
        cornerDotStyle: 'square',
        dotsStyle: 'square'
      },
      scanCount: 0,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await setDoc(doc(db, 'qrcodes', qrCodeData.id), qrCodeData);
    console.log('✅ Created QR code document');
    
    // 3. Subscriptions collection (subcollection under user)
    console.log('📝 Creating subscription document...');
    const subscriptionData = {
      id: 'sub-' + Date.now(),
      planType: 'gratis',
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await setDoc(doc(db, `users/${testUserId}/subscriptions`, 'current'), subscriptionData);
    console.log('✅ Created subscription document');
    
    // 4. Analytics collection
    console.log('📝 Creating analytics scan document...');
    const analyticsData = {
      id: 'scan-' + Date.now(),
      qrCodeId: qrCodeData.id,
      scannedAt: timestamp,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Test Browser)',
      location: {
        city: 'Test City',
        country: 'Test Country',
        lat: 40.7128,
        lng: -74.0060
      }
    };
    await setDoc(doc(db, 'analytics', analyticsData.id), analyticsData);
    console.log('✅ Created analytics document');
    
    // 5. Short URLs collection (for dynamic QR codes)
    console.log('📝 Creating short URL document...');
    const shortUrlData = {
      id: 'abc123',
      qrCodeId: qrCodeData.id,
      originalUrl: 'https://ladyqr.com',
      clicks: 0,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await setDoc(doc(db, 'short_urls', shortUrlData.id), shortUrlData);
    console.log('✅ Created short URL document');
    
    // 6. Plans collection (for subscription plans)
    console.log('📝 Creating plan document...');
    const planData = {
      id: 'gratis',
      name: 'Free',
      price: 0,
      interval: 'month',
      features: [
        '2 static QR codes',
        '1 dynamic QR code',
        'No customization',
        'PNG download',
        'No technical support'
      ],
      limits: {
        staticCodes: 2,
        dynamicCodes: 1,
        analytics: false,
        vectorExport: false,
        users: 1,
        apiAccess: false,
        branding: false,
        customization: false,
        emailSupport: false
      },
      createdAt: timestamp
    };
    await setDoc(doc(db, 'plans', planData.id), planData);
    console.log('✅ Created plan document');
    
    // 7. Settings collection (for app settings)
    console.log('📝 Creating settings document...');
    const settingsData = {
      id: 'app_settings',
      maintenanceMode: false,
      maxQRCodesPerUser: 1000,
      allowedFileTypes: ['png', 'jpg', 'svg', 'pdf'],
      maxFileSize: 5242880, // 5MB
      updatedAt: timestamp
    };
    await setDoc(doc(db, 'settings', settingsData.id), settingsData);
    console.log('✅ Created settings document');
    
    console.log('🎉 All collection documents created successfully!');
    return {
      success: true,
      testId: testUserId,
      message: 'Created documents in all collections: users, qrcodes, subscriptions, analytics, short_urls, plans, settings'
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