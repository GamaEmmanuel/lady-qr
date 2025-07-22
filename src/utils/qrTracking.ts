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
  const baseUrl = import.meta.env.VITE_SUPABASE_URL || window.location.origin;
  return `${baseUrl}/functions/v1/qr-redirect/${qrCodeId}`;
};

/**
 * Track a scan for static QR codes
 * This should be called when we detect a QR code has been scanned
 */
export const trackStaticScan = async (qrCodeId: string, scanData?: ScanData): Promise<boolean> => {
  try {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL || window.location.origin;
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
 * For static QR codes, this embeds tracking mechanisms
 */
export const createTrackableQRData = (originalData: string, qrCodeId: string, isStatic: boolean): string => {
  if (!isStatic) {
    // For dynamic QR codes, return the short URL
    return generateShortUrl(qrCodeId);
  }

  // For static QR codes, we need to embed tracking
  // This depends on the QR type:
  
  // If it's a URL, we can add tracking parameters
  if (originalData.startsWith('http')) {
    const url = new URL(originalData);
    url.searchParams.set('qr_track', qrCodeId);
    url.searchParams.set('qr_t', Date.now().toString());
    return url.toString();
  }

  // For other types (text, vCard, etc.), we return the original data
  // Tracking will need to be handled differently (e.g., through analytics pixels)
  return originalData;
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