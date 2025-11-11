import { QRCodeType } from '../types';
import { IconType } from 'react-icons';
import {
  TbWorld,
  TbUser,
  TbFileText,
  TbMail,
  TbMessage,
  TbWifi,
  TbShare3,
  TbMapPin,
  TbCalendar
} from 'react-icons/tb';
import {
  SiWhatsapp
} from 'react-icons/si';

export interface QRTypeConfig {
  id: QRCodeType;
  name: string;
  description: string;
  icon: IconType;
  iconColor?: string;
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
    name: 'Website (URL)',
    description: 'Link to any website',
    icon: TbWorld,
    iconColor: '#3b82f6',
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
    name: 'Contact Card (vCard)',
    description: 'Personal or business contact information',
    icon: TbUser,
    iconColor: '#8b5cf6',
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
    icon: TbFileText,
    iconColor: '#6b7280',
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
    icon: TbMail,
    iconColor: '#ef4444',
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
    icon: TbMessage,
    iconColor: '#10b981',
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
    icon: SiWhatsapp,
    iconColor: '#25D366',
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
    icon: TbWifi,
    iconColor: '#0ea5e9',
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
    icon: TbShare3,
    iconColor: '#ec4899',
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
    name: 'Location (GPS)',
    description: 'GPS coordinates or address',
    icon: TbMapPin,
    iconColor: '#f59e0b',
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
    name: 'Calendar Event',
    description: 'Event information for calendar',
    icon: TbCalendar,
    iconColor: '#f97316',
    canBeDynamic: true,
    canBeStatic: true,
    fields: [
      { id: 'title', label: 'Event title', type: 'text', required: true },
      { id: 'startDate', label: 'Start date', type: 'datetime-local', required: true },
      { id: 'endDate', label: 'End date', type: 'datetime-local' },
      { id: 'location', label: 'Location', type: 'text' },
      { id: 'description', label: 'Description', type: 'textarea' }
    ]
  }
];