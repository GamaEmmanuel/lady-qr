import * as UAParser from 'ua-parser-js';

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  os: string;
  browser: string;
  version: string;
}

export function parseUserAgent(userAgent: string): DeviceInfo {
  try {
    const parser = new UAParser(userAgent);
    const device = parser.getDevice();
    const os = parser.getOS();
    const browser = parser.getBrowser();
    
    // Determine device type
    let deviceType: DeviceInfo['type'] = 'unknown';
    if (device.type === 'mobile') {
      deviceType = 'mobile';
    } else if (device.type === 'tablet') {
      deviceType = 'tablet';
    } else if (device.type === undefined || device.type === 'desktop') {
      deviceType = 'desktop';
    }

    return {
      type: deviceType,
      os: os.name || 'Unknown',
      browser: browser.name || 'Unknown',
      version: browser.version || 'Unknown'
    };
  } catch (error) {
    console.error('Error parsing user agent:', error);
    return {
      type: 'unknown',
      os: 'Unknown',
      browser: 'Unknown',
      version: 'Unknown'
    };
  }
}