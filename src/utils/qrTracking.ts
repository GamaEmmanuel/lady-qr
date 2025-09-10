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
 */
export const generateShortUrl = (qrCodeId: string): string => {
  // Use Firebase hosting domain if provided, otherwise default to production domain
  const baseUrl = import.meta.env.VITE_FIREBASE_HOSTING_URL || 'https://ladyqr.web.app';
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
export const createTrackableQRData = (originalData: string, qrCodeId: string, isStatic: boolean): string => {
  // All QR codes (both static and dynamic) now use short URLs for tracking
  // This ensures consistent analytics and tracking across all QR code types
  return generateShortUrl(qrCodeId);
};

/**
 * Generate the original data content for a QR code based on its type
 * This is used to determine what the QR code should redirect to
 */
export const generateOriginalData = (type: string, formData: Record<string, any>): string => {
  switch (type) {
    case 'url':
      return formData.url || '';
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
    case 'location':
      if (formData.latitude && formData.longitude) {
        return `geo:${formData.latitude},${formData.longitude}`;
      }
      return formData.address || '';
    case 'vcard':
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${formData.firstName || ''} ${formData.lastName || ''}\nORG:${formData.company || ''}\nTITLE:${formData.jobTitle || ''}\nEMAIL:${formData.email || ''}\nTEL:${formData.phone || ''}\nURL:${formData.website || ''}\nEND:VCARD`;
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