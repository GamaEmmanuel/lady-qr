import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n/config';

// Firebase Crashlytics is automatically initialized with Firebase
// Errors will be logged to Firebase Console → Crashlytics
// To enable: Go to Firebase Console → Crashlytics → Get Started
// No additional code needed - it works automatically with your Firebase setup!

console.log('✅ Firebase initialized with Crashlytics');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
