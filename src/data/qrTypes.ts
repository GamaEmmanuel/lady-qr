import { QRCodeType } from '../types';
import { IconType } from 'react-icons';
import {
  TbWorld,
  TbUser,
  TbFileText,
  TbMessage,
  TbWifi,
  TbCalendar
} from 'react-icons/tb';

// Import logos
import facebookLogo from '../assets/facebook-logo.png';
import instagramLogo from '../assets/instagram-logo.jpeg';
import linkedinLogo from '../assets/linkedin-logo.png';
import telegramLogo from '../assets/telegram-logo.png';
import tiktokLogo from '../assets/tiktok-logo.png';
import whatsappLogo from '../assets/whatsapp-logo.jpeg';
import xLogo from '../assets/x-logo.png';
import youtubeLogo from '../assets/youtube-logo.png';
import googlemapsLogo from '../assets/googlemaps-logo.png';
import mailLogo from '../assets/mail-logo.png';

export interface QRTypeConfig {
  id: QRCodeType;
  name: string;
  description: string;
  icon?: IconType;
  iconImage?: string;
  iconColor?: string;
  canBeDynamic: boolean;
  canBeStatic: boolean;
  fields: QRField[];
}

export interface QRField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'url' | 'textarea' | 'select' | 'radio' | 'file' | 'number' | 'tel' | 'date' | 'datetime-local';
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  options?: Array<{ value: string; label: string }>;
  validation?: RegExp;
  multiple?: boolean;
  conditionalLabel?: Record<string, string>; // Dynamic labels based on other field values
  conditionalPlaceholder?: Record<string, string>; // Dynamic placeholders based on other field values
  conditionalType?: Record<string, 'text' | 'url'>; // Dynamic input type based on other field values
  dependsOn?: string; // Field ID this field depends on
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
    iconImage: mailLogo,
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
    name: 'WhatsApp',
    description: 'Link to WhatsApp profile or chat',
    iconImage: whatsappLogo,
    canBeDynamic: true,
    canBeStatic: true,
    fields: [
      { id: 'phone', label: 'Phone number (with country code)', type: 'tel', required: true, placeholder: 'e.g., 14155552671' },
      { id: 'message', label: 'Pre-filled Message (optional)', type: 'textarea', placeholder: 'Hello! I found you via QR.' }
    ]
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Link to Instagram profile or post',
    iconImage: instagramLogo,
    canBeDynamic: true,
    canBeStatic: true,
    fields: [
      {
        id: 'instagramType',
        label: 'Link Type',
        type: 'radio',
        required: true,
        options: [
          { value: 'profile', label: 'Profile' },
          { value: 'post', label: 'Post/Reel Link' }
        ]
      },
      {
        id: 'instagramValue',
        label: 'Username',
        type: 'text',
        required: true,
        placeholder: 'e.g., username or @username',
        dependsOn: 'instagramType',
        conditionalLabel: {
          profile: 'Username',
          post: 'Post/Reel URL'
        },
        conditionalPlaceholder: {
          profile: 'e.g., username or @username',
          post: 'e.g., https://www.instagram.com/p/...'
        },
        conditionalType: {
          profile: 'text',
          post: 'url'
        }
      }
    ]
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Link to Facebook profile or post',
    iconImage: facebookLogo,
    canBeDynamic: true,
    canBeStatic: true,
    fields: [
      {
        id: 'facebookType',
        label: 'Link Type',
        type: 'radio',
        required: true,
        options: [
          { value: 'profile', label: 'Profile/Page' },
          { value: 'post', label: 'Post/Video Link' }
        ]
      },
      {
        id: 'facebookValue',
        label: 'Username/Page',
        type: 'text',
        required: true,
        placeholder: 'e.g., username or page name',
        dependsOn: 'facebookType',
        conditionalLabel: {
          profile: 'Username/Page',
          post: 'Post/Video URL'
        },
        conditionalPlaceholder: {
          profile: 'e.g., username or page name',
          post: 'e.g., https://www.facebook.com/...'
        },
        conditionalType: {
          profile: 'text',
          post: 'url'
        }
      }
    ]
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    description: 'Link to X/Twitter profile or post',
    iconImage: xLogo,
    canBeDynamic: true,
    canBeStatic: true,
    fields: [
      {
        id: 'twitterType',
        label: 'Link Type',
        type: 'radio',
        required: true,
        options: [
          { value: 'profile', label: 'Profile' },
          { value: 'post', label: 'Post/Tweet Link' }
        ]
      },
      {
        id: 'twitterValue',
        label: 'Username',
        type: 'text',
        required: true,
        placeholder: 'e.g., username or @username',
        dependsOn: 'twitterType',
        conditionalLabel: {
          profile: 'Username',
          post: 'Post/Tweet URL'
        },
        conditionalPlaceholder: {
          profile: 'e.g., username or @username',
          post: 'e.g., https://twitter.com/.../status/...'
        },
        conditionalType: {
          profile: 'text',
          post: 'url'
        }
      }
    ]
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Link to LinkedIn profile or post',
    iconImage: linkedinLogo,
    canBeDynamic: true,
    canBeStatic: true,
    fields: [
      {
        id: 'linkedinType',
        label: 'Link Type',
        type: 'radio',
        required: true,
        options: [
          { value: 'profile', label: 'Profile/Company' },
          { value: 'post', label: 'Post Link' }
        ]
      },
      {
        id: 'linkedinValue',
        label: 'Username/Profile',
        type: 'text',
        required: true,
        placeholder: 'e.g., john-doe or company-name',
        dependsOn: 'linkedinType',
        conditionalLabel: {
          profile: 'Username/Profile',
          post: 'Post URL'
        },
        conditionalPlaceholder: {
          profile: 'e.g., john-doe or company-name',
          post: 'e.g., https://www.linkedin.com/posts/...'
        },
        conditionalType: {
          profile: 'text',
          post: 'url'
        }
      }
    ]
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Link to YouTube channel or video',
    iconImage: youtubeLogo,
    canBeDynamic: true,
    canBeStatic: true,
    fields: [
      {
        id: 'youtubeType',
        label: 'Link Type',
        type: 'radio',
        required: true,
        options: [
          { value: 'channel', label: 'Channel/Handle' },
          { value: 'video', label: 'Video Link' }
        ]
      },
      {
        id: 'youtubeValue',
        label: 'Channel Handle',
        type: 'text',
        required: true,
        placeholder: 'e.g., @channelname or channel ID',
        dependsOn: 'youtubeType',
        conditionalLabel: {
          channel: 'Channel Handle',
          video: 'Video URL'
        },
        conditionalPlaceholder: {
          channel: 'e.g., @channelname or channel ID',
          video: 'e.g., https://www.youtube.com/watch?v=...'
        },
        conditionalType: {
          channel: 'text',
          video: 'url'
        }
      }
    ]
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Link to TikTok profile or video',
    iconImage: tiktokLogo,
    canBeDynamic: true,
    canBeStatic: true,
    fields: [
      {
        id: 'tiktokType',
        label: 'Link Type',
        type: 'radio',
        required: true,
        options: [
          { value: 'profile', label: 'Profile' },
          { value: 'video', label: 'Video Link' }
        ]
      },
      {
        id: 'tiktokValue',
        label: 'Username',
        type: 'text',
        required: true,
        placeholder: 'e.g., @username',
        dependsOn: 'tiktokType',
        conditionalLabel: {
          profile: 'Username',
          video: 'Video URL'
        },
        conditionalPlaceholder: {
          profile: 'e.g., @username',
          video: 'e.g., https://www.tiktok.com/@user/video/...'
        },
        conditionalType: {
          profile: 'text',
          video: 'url'
        }
      }
    ]
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Link to Telegram profile or channel',
    iconImage: telegramLogo,
    canBeDynamic: true,
    canBeStatic: true,
    fields: [
      { id: 'username', label: 'Telegram Username/Channel', type: 'text', required: true, placeholder: 'e.g., username or channel name' }
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
    id: 'location',
    name: 'Location (Maps)',
    description: 'Address or Google Maps link',
    iconImage: googlemapsLogo,
    canBeDynamic: true,
    canBeStatic: true,
    fields: [
      {
        id: 'address',
        label: 'Address',
        type: 'text',
        placeholder: 'e.g., 123 Main St, New York, NY 10001'
      },
      {
        id: 'mapsUrl',
        label: 'Google Maps URL (optional)',
        type: 'url',
        placeholder: 'e.g., https://maps.app.goo.gl/...'
      }
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