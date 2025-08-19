import { vi, beforeEach, describe, it, expect, afterEach } from 'vitest';
import {
  generateShortUrl,
  createTrackableQRData,
  generateOriginalData,
  hasQRTracking,
  trackStaticScan
} from '../qrTracking';

describe('QR Tracking Utilities', () => {
  beforeEach(() => {
    // Mock environment variable for each test
    vi.stubEnv('VITE_FIREBASE_HOSTING_URL', 'https://test-ladyqr.web.app');
  });

  afterEach(() => {
    // Clean up environment variable mocks
    vi.unstubAllEnvs();
  });

  describe('generateShortUrl', () => {
    it('should generate a short URL with custom domain from environment', () => {
      const qrCodeId = 'test-qr-123';
      const expectedUrl = 'https://test-ladyqr.web.app/r/test-qr-123';

      const result = generateShortUrl(qrCodeId);

      expect(result).toBe(expectedUrl);
    });

        it('should use default domain when environment variable is not set', () => {
      vi.unstubAllEnvs();
      const qrCodeId = 'test-qr-456';
      const expectedUrl = 'https://ladyqr.web.app/r/test-qr-456';

      const result = generateShortUrl(qrCodeId);

      expect(result).toBe(expectedUrl);
    });

    it('should handle special characters in QR code ID', () => {
      const qrCodeId = 'test-qr-with-special@#$';
      const expectedUrl = 'https://test-ladyqr.web.app/r/test-qr-with-special@#$';

      const result = generateShortUrl(qrCodeId);

      expect(result).toBe(expectedUrl);
    });
  });

  describe('createTrackableQRData', () => {
    it('should always return short URL regardless of QR type (static)', () => {
      const originalData = 'https://example.com';
      const qrCodeId = 'static-qr-123';
      const isStatic = true;

      const result = createTrackableQRData(originalData, qrCodeId, isStatic);

      expect(result).toBe('https://test-ladyqr.web.app/r/static-qr-123');
    });

    it('should always return short URL regardless of QR type (dynamic)', () => {
      const originalData = 'https://example.com';
      const qrCodeId = 'dynamic-qr-456';
      const isStatic = false;

      const result = createTrackableQRData(originalData, qrCodeId, isStatic);

      expect(result).toBe('https://test-ladyqr.web.app/r/dynamic-qr-456');
    });

    it('should ignore original data and always use short URL', () => {
      const originalData = 'mailto:test@example.com';
      const qrCodeId = 'email-qr-789';
      const isStatic = true;

      const result = createTrackableQRData(originalData, qrCodeId, isStatic);

      expect(result).toBe('https://test-ladyqr.web.app/r/email-qr-789');
    });
  });

  describe('generateOriginalData', () => {
    it('should generate correct URL data', () => {
      const formData = { url: 'https://example.com' };
      const result = generateOriginalData('url', formData);
      expect(result).toBe('https://example.com');
    });

    it('should generate correct text data', () => {
      const formData = { text: 'Hello World' };
      const result = generateOriginalData('text', formData);
      expect(result).toBe('Hello World');
    });

    it('should generate correct email data', () => {
      const formData = {
        email: 'test@example.com',
        subject: 'Test Subject',
        body: 'Test Body'
      };
      const result = generateOriginalData('email', formData);
      expect(result).toBe('mailto:test@example.com?subject=Test%20Subject&body=Test%20Body');
    });

    it('should generate correct SMS data with message', () => {
      const formData = {
        phone: '+1234567890',
        message: 'Hello from QR'
      };
      const result = generateOriginalData('sms', formData);
      expect(result).toBe('sms:+1234567890?body=Hello%20from%20QR');
    });

    it('should generate correct SMS data without message', () => {
      const formData = { phone: '+1234567890' };
      const result = generateOriginalData('sms', formData);
      expect(result).toBe('sms:+1234567890');
    });

    it('should generate correct WiFi data', () => {
      const formData = {
        encryption: 'WPA2',
        ssid: 'MyNetwork',
        password: 'mypassword'
      };
      const result = generateOriginalData('wifi', formData);
      expect(result).toBe('WIFI:T:WPA2;S:MyNetwork;P:mypassword;;');
    });

    it('should generate correct location data with coordinates', () => {
      const formData = {
        latitude: '40.7128',
        longitude: '-74.0060'
      };
      const result = generateOriginalData('location', formData);
      expect(result).toBe('geo:40.7128,-74.0060');
    });

    it('should generate correct location data with address fallback', () => {
      const formData = {
        address: '123 Main St, New York, NY'
      };
      const result = generateOriginalData('location', formData);
      expect(result).toBe('123 Main St, New York, NY');
    });

    it('should generate correct vCard data', () => {
      const formData = {
        firstName: 'John',
        lastName: 'Doe',
        company: 'Acme Corp',
        jobTitle: 'Developer',
        email: 'john@example.com',
        phone: '+1234567890',
        website: 'https://johndoe.com'
      };
      const result = generateOriginalData('vcard', formData);
      const expected = 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nORG:Acme Corp\nTITLE:Developer\nEMAIL:john@example.com\nTEL:+1234567890\nURL:https://johndoe.com\nEND:VCARD';
      expect(result).toBe(expected);
    });

    it('should generate JSON string for unknown types', () => {
      const formData = { customField: 'customValue' };
      const result = generateOriginalData('unknown', formData);
      expect(result).toBe(JSON.stringify(formData));
    });

    it('should handle empty form data', () => {
      const formData = {};
      const result = generateOriginalData('url', formData);
      expect(result).toBe('');
    });
  });

  describe('hasQRTracking', () => {
    it('should detect QR tracking parameters', () => {
      const url = 'https://example.com?qr_track=qr-123&qr_t=1234567890';
      const result = hasQRTracking(url);

      expect(result.hasTracking).toBe(true);
      expect(result.qrCodeId).toBe('qr-123');
    });

    it('should return false for URLs without tracking', () => {
      const url = 'https://example.com?other=param';
      const result = hasQRTracking(url);

      expect(result.hasTracking).toBe(false);
      expect(result.qrCodeId).toBeUndefined();
    });

    it('should handle invalid URLs gracefully', () => {
      const url = 'not-a-valid-url';
      const result = hasQRTracking(url);

      expect(result.hasTracking).toBe(false);
      expect(result.qrCodeId).toBeUndefined();
    });
  });

  describe('trackStaticScan', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
      global.navigator = { userAgent: 'Test Browser' } as any;
      global.document = { referrer: 'https://test-referrer.com' } as any;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should make correct API call for tracking', async () => {
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true
      } as Response);

      const qrCodeId = 'test-qr-123';
      const scanData = { ip: '192.168.1.1' };

      const result = await trackStaticScan(qrCodeId, scanData);

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-ladyqr.web.app/functions/v1/track-scan',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer')
          },
          body: expect.stringContaining(qrCodeId)
        })
      );
    });

    it('should handle fetch errors gracefully', async () => {
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await trackStaticScan('test-qr-123');

      expect(result).toBe(false);
    });

    it('should handle non-ok responses', async () => {
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false
      } as Response);

      const result = await trackStaticScan('test-qr-123');

      expect(result).toBe(false);
    });
  });
});