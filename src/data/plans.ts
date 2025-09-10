import { Plan } from '../types';

export const plans: Plan[] = [
  {
    id: 'free',
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
    }
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 7,
    interval: 'month',
    features: [
      'Unlimited static QR codes',
      '10 dynamic QR codes',
      'Complete customization',
      'PNG, SVG, PDF download',
      'No tuQR branding',
      'Priority support'
    ],
    limits: {
      staticCodes: -1, // unlimited
      dynamicCodes: 10,
      analytics: false,
      vectorExport: true,
      users: 1,
      apiAccess: false,
      branding: true,
      customization: true,
      emailSupport: true
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 15,
    interval: 'month',
    features: [
      'Unlimited static QR codes',
      '100 dynamic QR codes',
      'Advanced analytics',
      'All format downloads',
      'No tuQR branding',
      '5 users per account',
      'Premium support'
    ],
    limits: {
      staticCodes: -1, // unlimited
      dynamicCodes: 100,
      analytics: true,
      vectorExport: true,
      users: 5,
      apiAccess: false,
      branding: true,
      customization: true,
      emailSupport: true
    }
  },
  {
    id: 'Business',
    name: 'Business',
    price: null,
    interval: 'month',
    features: [
      'Unlimited static QR codes',
      '1,000 dynamic QR codes',
      'Advanced analytics',
      'All format downloads',
      'No tuQR branding',
      '20 users per account',
      'Dedicated support'
    ],
    limits: {
      staticCodes: -1, // unlimited
      dynamicCodes: 1000,
      analytics: true,
      vectorExport: true,
      users: 20,
      apiAccess: true,
      branding: true,
      customization: true,
      emailSupport: true
    }
  }
];