export interface LocationInfo {
  country: string;
  city: string;
  region: string;
  lat?: number;
  lng?: number;
}

export async function getLocationFromIP(ip: string): Promise<LocationInfo> {
  try {
    // Skip localhost and private IPs
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return {
        country: 'Local',
        city: 'Local',
        region: 'Local'
      };
    }

    // Use ipapi.co for geolocation (free tier: 1000 requests/day)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      timeout: 5000,
      headers: {
        'User-Agent': 'LadyQR/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Check for API errors
    if (data.error) {
      throw new Error(data.reason || 'API Error');
    }

    return {
      country: data.country_name || 'Unknown',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      lat: data.latitude || undefined,
      lng: data.longitude || undefined
    };
  } catch (error) {
    console.error('Geolocation error for IP', ip, ':', error);
    return {
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown'
    };
  }
}