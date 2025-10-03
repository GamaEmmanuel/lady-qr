import {onRequest} from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { getMainDatabase } from './index';
import { UAParser } from 'ua-parser-js';

// Simple private IP detection (IPv4 only; IPv6 treated as private for safety)
function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  const v4 = ip.replace('::ffff:', '');
  if (v4.includes(':')) return true; // IPv6 or unknown
  const parts = v4.split('.').map((n) => parseInt(n, 10));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
  const [a, b] = parts;
  return (
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a === 127 ||
    a === 0
  );
}

async function geoLookup(ip: string): Promise<{country: string; city: string; region: string; lat?: number; lng?: number}> {
  try {
    if (!ip || isPrivateIp(ip)) {
      return { country: 'Unknown', city: 'Unknown', region: '' };
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const resp = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!resp.ok) {
      return { country: 'Unknown', city: 'Unknown', region: '' };
    }
    const data: any = await resp.json();
    return {
      country: data.country_name || 'Unknown',
      city: data.city || 'Unknown',
      region: data.region || data.region_code || '',
      lat: typeof data.latitude === 'number' ? data.latitude : undefined,
      lng: typeof data.longitude === 'number' ? data.longitude : undefined,
    };
  } catch {
    return { country: 'Unknown', city: 'Unknown', region: '' };
  }
}

// Helper function to generate social media app URL
function generateSocialMediaUrl(platform: string, username: string): string {
  // Validate inputs
  if (!platform || !username) {
    return '';
  }

  // Clean username (remove @ if present)
  const cleanUsername = username.replace(/^@/, '');

  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${cleanUsername}`;
    case 'facebook':
      return `https://facebook.com/${cleanUsername}`;
    case 'twitter':
      return `https://twitter.com/${cleanUsername}`;
    case 'linkedin':
      return `https://linkedin.com/in/${cleanUsername}`;
    case 'youtube':
      return `https://youtube.com/@${cleanUsername}`;
    case 'tiktok':
      return `https://tiktok.com/@${cleanUsername}`;
    case 'whatsapp':
      return `https://wa.me/${cleanUsername}`;
    case 'telegram':
      return `https://t.me/${cleanUsername}`;
    default:
      return `https://${platform}.com/${cleanUsername}`;
  }
}

// Helper function to generate destination URL from QR content
function generateDestinationUrl(type: string, content: any): string {
  switch (type) {
    case 'url':
      return content.url || '';
    case 'text':
      return `data:text/plain;charset=utf-8,${encodeURIComponent(content.text || '')}`;
    case 'email':
      return `mailto:${content.email}?subject=${encodeURIComponent(content.subject || '')}&body=${encodeURIComponent(content.body || '')}`;
    case 'sms':
      return `sms:${content.phone}${content.message ? `?body=${encodeURIComponent(content.message)}` : ''}`;
    case 'wifi':
      return `WIFI:T:${content.encryption || 'WPA'};S:${content.ssid || ''};P:${content.password || ''};;`;
    case 'location':
      if (content.latitude && content.longitude) {
        return `geo:${content.latitude},${content.longitude}`;
      }
      return content.address || '';
    case 'vcard':
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${content.firstName || ''} ${content.lastName || ''}\nORG:${content.company || ''}\nTITLE:${content.jobTitle || ''}\nEMAIL:${content.email || ''}\nTEL:${content.phone || ''}\nURL:${content.website || ''}\nEND:VCARD`;
    case 'social':
      return generateSocialMediaUrl(content.platform, content.username);
    default:
      return JSON.stringify(content);
  }
}

export const redirect = onRequest(async (req, res) => {
  try {
    console.log('🚀 REDIRECT FUNCTION STARTED');
    console.log('📍 Request URL:', req.url);
    console.log('📍 Request Path:', req.path);
    console.log('📍 Request Method:', req.method);
    console.log('📍 Request Headers:', JSON.stringify(req.headers, null, 2));

    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      console.log('✅ OPTIONS request handled');
      res.status(200).send();
      return;
    }

    // Extract short ID from path
    const pathParts = req.path.split('/');
    const shortId = pathParts[pathParts.length - 1];

    console.log('🔍 Path analysis:');
    console.log('  - Full path:', req.path);
    console.log('  - Path parts:', pathParts);
    console.log('  - Extracted shortId:', shortId);

    if (!shortId) {
      console.log('❌ No shortId found in path');
      res.status(400).send('Invalid QR code URL');
      return;
    }

    console.log('🔄 Processing redirect for shortId:', shortId);

        // Get QR code data from main-database - look for both shortUrlId and direct ID matches
    console.log('🗄️ Connecting to main-database...');
    const db = getMainDatabase();
    console.log('✅ Database connection established');

    console.log('🔍 Step 1: Searching by shortUrlId field...');
    let qrQuery = await db
      .collection('qrcodes')
      .where('shortUrlId', '==', shortId)
      .limit(1)
      .get();

    console.log('📊 Query by shortUrlId results:');
    console.log('  - Query empty:', qrQuery.empty);
    console.log('  - Query size:', qrQuery.size);
    console.log('  - Docs found:', qrQuery.docs.length);

    let qrDoc: admin.firestore.DocumentSnapshot;

    if (qrQuery.empty) {
      console.log('🔍 Step 2: Searching by document ID...');
      qrDoc = await db
        .collection('qrcodes')
        .doc(shortId)
        .get();

      console.log('📄 Document lookup results:');
      console.log('  - Document exists:', qrDoc.exists);
      console.log('  - Document ID:', qrDoc.id);

      if (!qrDoc.exists) {
        console.log('❌ QR code not found for shortId:', shortId);
        console.log('🔍 Final search attempt: checking collection for any docs...');

        // Let's also check what documents actually exist
        const allDocsQuery = await db.collection('qrcodes').limit(5).get();
        console.log('📋 Sample QR codes in database:');
        allDocsQuery.docs.forEach((doc, index) => {
          const data = doc.data();
          console.log(`  ${index + 1}. ID: ${doc.id}`);
          console.log(`     shortUrlId: ${data.shortUrlId || 'not set'}`);
          console.log(`     type: ${data.type || 'not set'}`);
          console.log(`     userId: ${data.userId || 'not set'}`);
        });

        res.status(404).send('QR Code not found');
        return;
      }
    } else {
      console.log('✅ Found QR code by shortUrlId');
      qrDoc = qrQuery.docs[0];
    }

    const qrData = qrDoc.data();

    console.log('📄 QR Code document found:');
    console.log('  - Document ID:', qrDoc.id);
    console.log('  - Has data:', !!qrData);

    if (!qrData) {
      console.log('❌ QR code data not found for ID:', qrDoc.id);
      res.status(404).send('QR Code data not found');
      return;
    }

    console.log('✅ QR Code data retrieved:');
    console.log('  - Type:', qrData.type);
    console.log('  - UserId:', qrData.userId);
    console.log('  - IsActive:', qrData.isActive);
    console.log('  - ShortUrlId:', qrData.shortUrlId);
    console.log('  - DestinationUrl:', qrData.destinationUrl);
    console.log('  - Full data:', JSON.stringify(qrData, null, 2));

    // Check if QR code is active
    if (!qrData.isActive) {
      res.status(410).send('QR Code is inactive');
      return;
    }

    // Log basic scan data
    const userAgent = req.get('User-Agent') || '';
    const xff = (req.get('x-forwarded-for') || '').split(',')[0]?.trim();
    const ip = xff || req.get('x-real-ip') || req.ip || '';

    // Parse UA -> device info
    const parser = new UAParser(userAgent);
    const ua = parser.getResult();
    let deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown' = 'unknown';
    const uaDeviceType = ua.device?.type as ('mobile' | 'tablet' | 'console' | 'smarttv' | 'wearable' | 'embedded' | undefined);
    if (uaDeviceType === 'mobile') deviceType = 'mobile';
    else if (uaDeviceType === 'tablet') deviceType = 'tablet';
    else if (!uaDeviceType) deviceType = 'desktop';

    const deviceInfo = {
      type: deviceType,
      os: [ua.os?.name, ua.os?.version].filter(Boolean).join(' ') || 'unknown',
      browser: [ua.browser?.name].filter(Boolean).join('') || 'unknown',
      version: ua.browser?.version || '',
    } as const;

    // Geo lookup (best-effort, short timeout)
    const location = await geoLookup(ip);

    // Create scan record
    const scanData = {
      qrCodeId: qrDoc.id,
      scannedAt: admin.firestore.FieldValue.serverTimestamp(),
      ipAddress: ip,
      userAgent: userAgent,
      referrer: req.get('Referer') || null,
      location,
      deviceInfo,
    };

    // Log the scan and update scan count
    await Promise.allSettled([
      db.collection('scans').add(scanData),
      qrDoc.ref.update({
        scanCount: admin.firestore.FieldValue.increment(1),
        lastScannedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })
    ]);

    // Determine where to redirect based on QR code type and data
    console.log('🎯 Determining redirect URL...');
    let redirectUrl = qrData.destinationUrl;
    console.log('  - Stored destinationUrl:', redirectUrl);

    // If no destinationUrl is stored (legacy QR codes), generate it from content
    if (!redirectUrl && qrData.content) {
      console.log('  - No destinationUrl, generating from content...');
      console.log('  - Content:', JSON.stringify(qrData.content, null, 2));
      redirectUrl = generateDestinationUrl(qrData.type, qrData.content);
      console.log('  - Generated URL:', redirectUrl);
    }

    // Fallback if still no URL
    if (!redirectUrl) {
      console.error('❌ No destination URL found for QR code:', qrDoc.id);
      res.status(500).send('QR Code destination not configured');
      return;
    }

    console.log('✅ Final redirect URL:', redirectUrl);
    console.log('🚀 Performing redirect...');

    // Redirect to destination
    res.redirect(302, redirectUrl);

  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send('Internal server error');
  }
});