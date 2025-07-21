export interface User {
  uid: string;
  email: string;
  fullName: string;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  planType: 'gratis' | 'basico' | 'profesional' | 'negocios';
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
  isDynamic: boolean;
  shortUrlId?: string;
  destinationUrl?: string;
  content: Record<string, any>;
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
  | 'business' 
  | 'crypto';

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