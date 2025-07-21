// Environment configuration with type safety and validation

interface EnvConfig {
  // Firebase
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
  
  // Stripe
  stripe: {
    publishableKey: string;
  };
  
  // API
  api: {
    baseUrl: string;
    appUrl: string;
  };
  
  // Features
  features: {
    enableAnalytics: boolean;
    debugMode: boolean;
    enableGoogleAuth: boolean;
    enableStripePayments: boolean;
    enableQRAnalytics: boolean;
  };
  
  // Contact
  contact: {
    email: string;
  };
}

// Helper function to get boolean from string
const getBooleanEnv = (value: string | undefined, defaultValue: boolean = false): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
};

// Environment configuration with fallbacks
export const env: EnvConfig = {
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ladyqr.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lady-qr",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lady-qr.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "534631817946",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:534631817946:web:9d15524fa569ed13c93be3",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WKDZZLF91G"
  },
  
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_51234567890abcdef"
  },
  
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
    appUrl: import.meta.env.VITE_APP_URL || "http://localhost:5173"
  },
  
  features: {
    enableAnalytics: getBooleanEnv(import.meta.env.VITE_ENABLE_ANALYTICS, false),
    debugMode: getBooleanEnv(import.meta.env.VITE_DEBUG_MODE, true),
    enableGoogleAuth: getBooleanEnv(import.meta.env.VITE_ENABLE_GOOGLE_AUTH, true),
    enableStripePayments: getBooleanEnv(import.meta.env.VITE_ENABLE_STRIPE_PAYMENTS, true),
    enableQRAnalytics: getBooleanEnv(import.meta.env.VITE_ENABLE_QR_ANALYTICS, true)
  },
  
  contact: {
    email: import.meta.env.VITE_CONTACT_EMAIL || "support@ladyqr.com"
  }
};

// Validation function to check required environment variables
export const validateEnv = (): void => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_STRIPE_PUBLISHABLE_KEY'
  ];
  
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0 && import.meta.env.PROD) {
    console.warn('Missing required environment variables:', missing);
    console.warn('Please check your .env.local file');
  }
};

// Development helper to log current environment
export const logEnvInfo = (): void => {
  if (env.features.debugMode) {
    console.log('🔧 Environment Configuration:', {
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD,
      features: env.features,
      api: env.api
    });
  }
};

// Initialize environment validation
validateEnv();