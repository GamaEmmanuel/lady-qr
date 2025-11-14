import { Plan } from '../types';

export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      '1 static QR code',
      'No dynamic QR codes',
      'No customization',
      'No download',
      'Advanced Analytics',
      'No support'
    ],
    limits: {
      staticCodes: 1,
      dynamicCodes: 0,
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
    price: 5,
    productId: 'prod_TMLuyO6ZOw836h', // Stripe Product ID
    priceId: 'price_1SPdCcDUi8OxbbECORoClMl6', // Stripe Price ID for $5/month
    interval: 'month',
    features: [
      'Unlimited static QR codes',
      'Unlimited dynamic QR codes',
      'Complete customization',
      'Multi-format download (PNG, SVG, PDF)',
      'Advanced Analytics',
      'Full support'
    ],
    limits: {
      staticCodes: -1, // unlimited
      dynamicCodes: -1, // unlimited
      analytics: true,
      vectorExport: true,
      users: 1,
      apiAccess: false,
      branding: true,
      customization: true,
      emailSupport: true
    }
  },
  {
    id: 'business',
    name: 'Business',
    price: null,
    interval: 'month',
    features: [
      'Custom solutions for your needs',
      'Dedicated account manager',
      'Priority support',
      'Contact us for details'
    ],
    limits: {
      staticCodes: -1, // unlimited
      dynamicCodes: -1, // unlimited
      analytics: true,
      vectorExport: true,
      users: -1, // unlimited
      apiAccess: true,
      branding: true,
      customization: true,
      emailSupport: true
    }
  }
];