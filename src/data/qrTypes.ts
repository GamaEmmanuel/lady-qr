import { QRCodeType } from '../types';

export interface QRTypeConfig {
  id: QRCodeType;
  name: string;
  description: string;
  icon: string;
  canBeDynamic: boolean;
  canBeStatic: boolean;
  fields: QRField[];
}

export interface QRField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'url' | 'textarea' | 'select' | 'file' | 'number' | 'tel' | 'date' | 'datetime-local';
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  options?: Array<{ value: string; label: string }>;
  validation?: RegExp;
  multiple?: boolean;
}

export const qrTypes: QRTypeConfig[] = [
  {
    id: 'url',
    name: 'Website',
    description: 'Link to any website',
    icon: '🌐',
    canBeDynamic: true,
    canBeStatic: true,
    fields: [
      {
        id: 'url',
        label: 'Website URL',
        type: 'url',
        required: true,
        placeholder: 'https://example.com',
        validation: /^https?:\/\/.+/
      }
    ]
  },
  {
    id: 'vcard',
    name: 'Contact Card',
    description: 'Personal or business contact information',
    icon: '👤',
    canBeDynamic: true,
    canBeStatic: true,
    fields: [
      { id: 'firstName', label: 'First Name', type: 'text', required: true },
      { id: 'lastName', label: 'Last Name', type: 'text', required: true },
      { id: 'company', label: 'Company', type: 'text' },
      { id: 'jobTitle', label: 'Job Title', type: 'text' },
      { id: 'email', label: 'Email', type: 'email' },
      { id: 'phone', label: 'Phone', type: 'tel' },
      { id: 'website', label: 'Website', type: 'url' },
      { id: 'address', label: 'Address', type: 'textarea' }
    ]
  },
  {
    id: 'text',
    name: 'Text',
    description: 'Simple text message',
    icon: '📝',
    canBeDynamic: false,
    canBeStatic: true,
    fields: [
      {
        id: 'text',
        label: 'Text',
        type: 'textarea',
        required: true,
        maxLength: 300,
        placeholder: 'Write your message here...'
      }
    ]
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Predefined email sending',
    icon: '📧',
    canBeDynamic: false,
    canBeStatic: true,
    fields: [
      { id: 'email', label: 'Recipient email', type: 'email', required: true },
      { id: 'subject', label: 'Subject', type: 'text' },
      { id: 'body', label: 'Message', type: 'textarea' }
    ]
  },
  {
    id: 'sms',
    name: 'SMS',
    description: 'Text message to phone number',
    icon: '💬',
    canBeDynamic: false,
    canBeStatic: true,
    fields: [
      { id: 'phone', label: 'Phone number', type: 'tel', required: true },
      { id: 'message', label: 'Message', type: 'textarea' }
    ]
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Message',
    description: 'Start a WhatsApp chat with a predefined message',
    icon: '📲',
    canBeDynamic: false,
    canBeStatic: true,
    fields: [
      { id: 'phone', label: 'Phone number (with country code)', type: 'tel', required: true, placeholder: 'e.g., 14155552671' },
      { id: 'message', label: 'Message', type: 'textarea', placeholder: 'Hello! I found you via QR.' }
    ]
  },
  {
    id: 'wifi',
    name: 'WiFi',
    description: 'Automatic WiFi network connection',
    icon: '📶',
    canBeDynamic: false,
    canBeStatic: true,
    fields: [
      { id: 'ssid', label: 'Network name (SSID)', type: 'text', required: true },
      { id: 'password', label: 'Password', type: 'text' },
      {
        id: 'encryption',
        label: 'Security type',
        type: 'select',
        options: [
          { value: 'WPA', label: 'WPA/WPA2' },
          { value: 'WEP', label: 'WEP' },
          { value: 'nopass', label: 'No password' }
        ]
      }
    ]
  },
  {
    id: 'social',
    name: 'Social Media',
    description: 'Open social media app with profile',
    icon: '📱',
    canBeDynamic: true,
    canBeStatic: true,
    fields: [
      {
        id: 'platform',
        label: 'Social Media Platform',
        type: 'select',
        required: true,
        options: [
          { value: 'instagram', label: 'Instagram' },
          { value: 'facebook', label: 'Facebook' },
          { value: 'twitter', label: 'Twitter/X' },
          { value: 'linkedin', label: 'LinkedIn' },
          { value: 'youtube', label: 'YouTube' },
          { value: 'tiktok', label: 'TikTok' },
          { value: 'whatsapp', label: 'WhatsApp' },
          { value: 'telegram', label: 'Telegram' }
        ]
      },
      { id: 'username', label: 'Username/Handle', type: 'text', required: true, placeholder: 'e.g., @username or username' }
    ]
  },
  {
    id: 'location',
    name: 'Location',
    description: 'GPS coordinates or address',
    icon: '📍',
    canBeDynamic: false,
    canBeStatic: true,
    fields: [
      { id: 'address', label: 'Address', type: 'text' },
      { id: 'latitude', label: 'Latitude', type: 'number' },
      { id: 'longitude', label: 'Longitude', type: 'number' }
    ]
  },
  {
    id: 'event',
    name: 'Event',
    description: 'Event information for calendar',
    icon: '📅',
    canBeDynamic: true,
    canBeStatic: false,
    fields: [
      { id: 'title', label: 'Event title', type: 'text', required: true },
      { id: 'startDate', label: 'Start date', type: 'datetime-local', required: true },
      { id: 'endDate', label: 'End date', type: 'datetime-local' },
      { id: 'location', label: 'Location', type: 'text' },
      { id: 'description', label: 'Description', type: 'textarea' }
    ]
  },
  {
    id: 'business',
    name: 'Business Page',
    description: 'Complete business information',
    icon: '🏢',
    canBeDynamic: true,
    canBeStatic: false,
    fields: [
      { id: 'businessName', label: 'Business name', type: 'text', required: true },
      { id: 'description', label: 'Description', type: 'textarea' },
      { id: 'address', label: 'Address', type: 'text' },
      { id: 'phone', label: 'Phone', type: 'tel' },
      { id: 'email', label: 'Email', type: 'email' },
      { id: 'website', label: 'Website', type: 'url' },
      { id: 'hours', label: 'Hours', type: 'textarea' }
    ]
  },
  {
    id: 'crypto',
    name: 'Crypto Wallet',
    description: 'Cryptocurrency wallet address',
    icon: '₿',
    canBeDynamic: false,
    canBeStatic: true,
    fields: [
      {
        id: 'cryptocurrency',
        label: 'Cryptocurrency',
        type: 'select',
        required: true,
        options: [
          { value: 'bitcoin', label: 'Bitcoin (BTC)' },
          { value: 'ethereum', label: 'Ethereum (ETH)' },
          { value: 'litecoin', label: 'Litecoin (LTC)' },
          { value: 'dogecoin', label: 'Dogecoin (DOGE)' }
        ]
      },
      { id: 'address', label: 'Wallet address', type: 'text', required: true },
      { id: 'amount', label: 'Amount (optional)', type: 'number' }
    ]
  }
];