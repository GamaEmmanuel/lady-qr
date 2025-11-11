export interface User {
  uid: string;
  email: string;
  fullName: string;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  planType: 'free' | 'basic' | 'business' | string;
  status: 'active' | 'payment_pending' | 'cancelled' | 'expired';
  stripeSubscriptionId?: string;
  trialEndsAt?: Date;
  currentPeriodEndsAt?: Date;
  cancelAtPeriodEnd?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QRCode {
  id: string;
  userId: string;
  name: string;
  type: QRCodeType;
  isDynamic: boolean; // Keep for backward compatibility
  isEditable: boolean; // New field: true for dynamic, false for static
  shortUrlId: string; // Now required - all QR codes get short URLs
  destinationUrl?: string; // For URL-type QR codes, this is where they redirect
  content: Record<string, any>;
  originalContent?: Record<string, any>; // Store original data for static QR codes
  customizationOptions: QRCustomization;
  scanCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type QRCodeType =
  | 'url'
  | 'vcard'
  | 'text'
  | 'email'
  | 'sms'
  | 'wifi'
  | 'social'
  | 'pdf'
  | 'video'
  | 'location'
  | 'event'
  | 'appstore'
  | 'images'
  | 'menu'
  | 'mp3'
  | 'coupon'
  | 'feedback'
  | 'whatsapp';

export interface QRCustomization {
  foregroundColor: string;
  backgroundColor: string;
  cornerSquareStyle: 'square' | 'rounded' | 'circle';
  cornerDotStyle: 'square' | 'rounded' | 'circle';
  dotsStyle: 'square' | 'rounded' | 'dots';
  logoUrl?: string;
  frameStyle?: string;
  frameText?: string;
}

export interface AnalyticsScan {
  id: string;
  qrCodeId: string;
  scannedAt: Date;
  ipAddress: string;
  userAgent: string;
  location: {
    city: string;
    country: string;
    lat?: number;
    lng?: number;
  };
}

export interface Plan {
  id: string;
  name: string;
  price: number | null;
  productId?: string; // Stripe Product ID (prod_xxx)
  priceId?: string; // Stripe Price ID (price_xxx) - required for checkout
  interval: 'month' | 'year';
  features: string[];
  limits: {
    staticCodes: number; // -1 for unlimited
    dynamicCodes: number;
    analytics: boolean;
    vectorExport: boolean;
    users: number;
    apiAccess: boolean;
    branding: boolean;
    customization: boolean;
    emailSupport: boolean;
  };
}