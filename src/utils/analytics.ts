import { analytics } from '../config/firebase';
import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';

// Analytics helper functions
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (analytics) {
    logEvent(analytics, eventName, parameters);
  }
};

// QR Code Events
export const trackQRCreated = (qrType: string, isDynamic: boolean) => {
  trackEvent('qr_created', {
    qr_type: qrType,
    is_dynamic: isDynamic
  });
};

export const trackQRScanned = (qrId: string, qrType: string) => {
  trackEvent('qr_scanned', {
    qr_id: qrId,
    qr_type: qrType
  });
};

export const trackQRDownloaded = (qrId: string, format: string) => {
  trackEvent('qr_downloaded', {
    qr_id: qrId,
    format: format
  });
};

// User Events
export const trackUserSignUp = (method: string) => {
  trackEvent('sign_up', {
    method: method
  });
};

export const trackUserLogin = (method: string) => {
  trackEvent('login', {
    method: method
  });
};

export const trackSubscription = (planType: string, value: number) => {
  trackEvent('purchase', {
    currency: 'USD',
    value: value,
    items: [{
      item_id: planType,
      item_name: `${planType} Plan`,
      category: 'subscription',
      quantity: 1,
      price: value
    }]
  });
};

// Page Views
export const trackPageView = (pageName: string) => {
  trackEvent('page_view', {
    page_title: pageName,
    page_location: window.location.href
  });
};

// Set user properties for analytics
export const setAnalyticsUserId = (userId: string) => {
  if (analytics) {
    setUserId(analytics, userId);
  }
};

export const setAnalyticsUserProperties = (properties: Record<string, any>) => {
  if (analytics) {
    setUserProperties(analytics, properties);
  }
};