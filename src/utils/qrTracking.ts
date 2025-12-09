// QR Code Tracking Utilities

export interface ScanData {
  userAgent?: string;
  referer?: string;
  ip?: string;
  timestamp?: string;
}

/**
 * Generate a tracking pixel URL for static QR codes
 * This creates a 1x1 transparent pixel that logs scans when loaded
 */
export const generateTrackingPixel = (qrCodeId: string): string => {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL || window.location.origin;
  return `${baseUrl}/functions/v1/track-scan?qr=${qrCodeId}&t=${Date.now()}`;
};

/**
 * Generate a short URL for dynamic QR codes
 * ALWAYS uses production URL, even in dev mode, so QR codes work when shared
 */
export const generateShortUrl = (qrCodeId: string): string => {
  // Get production URL - can be overridden with VITE_PRODUCTION_URL env var
  // Never uses localhost or development URLs, even in dev mode
  const productionUrl = import.meta.env.VITE_PRODUCTION_URL || 'https://lady-qr.web.app';

  // Safety check: if somehow localhost is in the URL, force production
  const baseUrl = productionUrl.includes('localhost') ? 'https://lady-qr.web.app' : productionUrl;

  return `${baseUrl}/r/${qrCodeId}`;
};

/**
 * Track a scan for static QR codes
 * This should be called when we detect a QR code has been scanned
 */
export const trackStaticScan = async (qrCodeId: string, scanData?: ScanData): Promise<boolean> => {
  try {
    // Prefer Supabase URL if configured, else fall back to Firebase hosting URL, else production default
    const baseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_FIREBASE_HOSTING_URL || 'https://ladyqr.web.app';
    const response = await fetch(`${baseUrl}/functions/v1/track-scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        qrCodeId,
        scanData: {
          userAgent: navigator.userAgent,
          referer: document.referrer,
          timestamp: new Date().toISOString(),
          ...scanData
        }
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to track static scan:', error);
    return false;
  }
};

/**
 * Create a tracking-enabled QR code data string
 * ALL QR codes now use short URLs for consistent tracking
 */
export const createTrackableQRData = (qrCodeId: string): string => {
  // All QR codes (both static and dynamic) now use short URLs for tracking
  // This ensures consistent analytics and tracking across all QR code types
  return generateShortUrl(qrCodeId);
};

/**
 * Generate social media app URL based on platform and username
 */
export const generateSocialMediaUrl = (platform: string, username: string): string => {
  // Validate inputs
  if (!platform || !username) {
    return '';
  }

  // Clean username (remove @ if present)
  const cleanUsername = username.replace(/^@/, '');

  switch (platform) {
    case 'instagram':
      // Universal link - opens Instagram app if installed
      return `https://www.instagram.com/${cleanUsername}`;
    case 'facebook':
      // App link - opens Facebook app if installed
      return `https://www.facebook.com/${cleanUsername}`;
    case 'twitter':
      // Universal link - opens X/Twitter app if installed (twitter.com works better than x.com for app opening)
      return `https://twitter.com/${cleanUsername}`;
    case 'linkedin':
      // Universal link - opens LinkedIn app if installed
      return `https://www.linkedin.com/in/${cleanUsername}`;
    case 'youtube':
      // Universal link - opens YouTube app if installed
      return `https://www.youtube.com/@${cleanUsername}`;
    case 'tiktok':
      // Universal link - opens TikTok app if installed
      return `https://www.tiktok.com/@${cleanUsername}`;
    case 'whatsapp':
      // WhatsApp universal link - opens WhatsApp app if installed
      return `https://wa.me/${cleanUsername}`;
    case 'telegram':
      // Telegram universal link - opens Telegram app if installed
      return `https://t.me/${cleanUsername}`;
    default:
      return `https://${platform}.com/${cleanUsername}`;
  }
};

/**
 * Ensures a URL has a proper protocol (https:// or http://)
 */
const ensureUrlProtocol = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

/**
 * Generate the original data content for a QR code based on its type
 * This is used to determine what the QR code should redirect to
 */
export const generateOriginalData = (type: string, formData: Record<string, any>): string => {
  switch (type) {
    case 'url':
      return ensureUrlProtocol(formData.url || '');
    case 'text':
      return formData.text || '';
    case 'email':
      return `mailto:${formData.email}?subject=${encodeURIComponent(formData.subject || '')}&body=${encodeURIComponent(formData.body || '')}`;
    case 'sms':
      return `sms:${formData.phone}${formData.message ? `?body=${encodeURIComponent(formData.message)}` : ''}`;
    case 'whatsapp': {
      const phone = String(formData.phone || '').replace(/\D/g, '');
      const text = formData.message ? `?text=${encodeURIComponent(formData.message)}` : '';
      return phone ? `https://wa.me/${phone}${text}` : '';
    }
    case 'wifi':
      return `WIFI:T:${formData.encryption || 'WPA'};S:${formData.ssid || ''};P:${formData.password || ''};;`;
    case 'location': {
      // Priority 1: Use Google Maps URL if provided
      if (formData.mapsUrl) {
        return ensureUrlProtocol(formData.mapsUrl);
      }
      // Priority 2: Convert address to Google Maps URL
      if (formData.address) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.address)}`;
      }
      return '';
    }
    case 'vcard':
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${formData.firstName || ''} ${formData.lastName || ''}\nORG:${formData.company || ''}\nTITLE:${formData.jobTitle || ''}\nEMAIL:${formData.email || ''}\nTEL:${formData.phone || ''}\nURL:${formData.website ? ensureUrlProtocol(formData.website) : ''}\nEND:VCARD`;
    case 'social':
      return generateSocialMediaUrl(formData.platform, formData.username);
    // Individual social platform types
    case 'instagram': {
      // Instagram can be profile or post
      if (formData.instagramType === 'post') {
        return ensureUrlProtocol(formData.instagramValue || '');
      }
      // Default to profile
      return generateSocialMediaUrl('instagram', formData.instagramValue || '');
    }
    case 'facebook': {
      // Facebook can be profile or post
      if (formData.facebookType === 'post') {
        return ensureUrlProtocol(formData.facebookValue || '');
      }
      // Default to profile
      return generateSocialMediaUrl('facebook', formData.facebookValue || '');
    }
    case 'twitter': {
      // X/Twitter can be profile or post
      if (formData.twitterType === 'post') {
        return ensureUrlProtocol(formData.twitterValue || '');
      }
      // Default to profile
      return generateSocialMediaUrl('twitter', formData.twitterValue || '');
    }
    case 'linkedin': {
      // LinkedIn can be profile or post
      if (formData.linkedinType === 'post') {
        return ensureUrlProtocol(formData.linkedinValue || '');
      }
      // Default to profile
      return generateSocialMediaUrl('linkedin', formData.linkedinValue || '');
    }
    case 'youtube': {
      // YouTube can be either a channel or a video
      if (formData.youtubeType === 'video') {
        return ensureUrlProtocol(formData.youtubeValue || '');
      }
      // Default to channel
      return generateSocialMediaUrl('youtube', formData.youtubeValue || '');
    }
    case 'tiktok': {
      // TikTok can be profile or video
      if (formData.tiktokType === 'video') {
        return ensureUrlProtocol(formData.tiktokValue || '');
      }
      // Default to profile
      return generateSocialMediaUrl('tiktok', formData.tiktokValue || '');
    }
    case 'telegram':
      return generateSocialMediaUrl('telegram', formData.username);
    case 'event': {
      // Generate iCalendar format for calendar events
      const formatDateForICal = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const title = formData.title || 'Event';
      const startDate = formatDateForICal(formData.startDate);
      const endDate = formData.endDate ? formatDateForICal(formData.endDate) : startDate;
      const location = formData.location || '';
      const description = formData.description || '';

      // Create iCalendar format
      const ical = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Lady QR//Calendar Event//EN',
        'BEGIN:VEVENT',
        `SUMMARY:${title}`,
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        location ? `LOCATION:${location}` : '',
        description ? `DESCRIPTION:${description.replace(/\n/g, '\\n')}` : '',
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        'END:VEVENT',
        'END:VCALENDAR'
      ].filter(line => line !== '').join('\r\n');

      // Return as data URL with proper MIME type
      return `data:text/calendar;charset=utf-8,${encodeURIComponent(ical)}`;
    }
    default:
      return JSON.stringify(formData);
  }
};

/**
 * Generate analytics tracking code for static QR codes
 * This creates HTML/JS that can be embedded in landing pages
 */
export const generateTrackingCode = (qrCodeId: string): string => {
  const trackingUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-scan`;

  return `
<!-- Lady QR Tracking Code -->
<script>
(function() {
  // Track QR code scan
  fetch('${trackingUrl}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      qrCodeId: '${qrCodeId}',
      scanData: {
        userAgent: navigator.userAgent,
        referer: document.referrer,
        timestamp: new Date().toISOString(),
        url: window.location.href
      }
    })
  }).catch(function(error) {
    console.warn('QR tracking failed:', error);
  });
})();
</script>
<img src="${generateTrackingPixel(qrCodeId)}" width="1" height="1" style="display:none;" alt="" />
<!-- End Lady QR Tracking Code -->
  `.trim();
};

/**
 * Check if a URL contains QR tracking parameters
 */
export const hasQRTracking = (url: string): { hasTracking: boolean; qrCodeId?: string } => {
  try {
    const urlObj = new URL(url);
    const qrTrack = urlObj.searchParams.get('qr_track');

    return {
      hasTracking: !!qrTrack,
      qrCodeId: qrTrack || undefined
    };
  } catch {
    return { hasTracking: false };
  }
};

/**
 * Auto-track scans when page loads (for static QR codes with tracking URLs)
 */
export const initAutoTracking = (): void => {
  // Check if current page was accessed via QR code
  const { hasTracking, qrCodeId } = hasQRTracking(window.location.href);

  if (hasTracking && qrCodeId) {
    trackStaticScan(qrCodeId, {
      referer: document.referrer,
      timestamp: new Date().toISOString()
    });
  }
};

// Auto-initialize tracking when script loads
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoTracking);
  } else {
    initAutoTracking();
  }
}