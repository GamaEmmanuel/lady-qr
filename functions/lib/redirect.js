"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirect = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const index_1 = require("./index");
const ua_parser_js_1 = require("ua-parser-js");
const crypto = __importStar(require("crypto"));
// Enhanced private IP detection (IPv4 and IPv6)
function isPrivateIp(ip) {
    if (!ip)
        return true;
    // Handle IPv4-mapped IPv6 addresses (::ffff:192.168.1.1)
    const v4 = ip.replace('::ffff:', '');
    // Check if it's IPv6
    if (v4.includes(':')) {
        // IPv6 address - check for private ranges
        const ipv6 = v4.toLowerCase();
        // Private IPv6 ranges:
        // fc00::/7 (unique local addresses)
        // fe80::/10 (link-local addresses)
        // ::1 (localhost)
        // :: (unspecified)
        if (ipv6.startsWith('fc') || ipv6.startsWith('fd') ||
            ipv6.startsWith('fe80') || ipv6.startsWith('fe9') || ipv6.startsWith('fea') || ipv6.startsWith('feb') ||
            ipv6 === '::1' || ipv6 === '::') {
            return true;
        }
        // All other IPv6 addresses are considered public
        return false;
    }
    // IPv4 address - check for private ranges
    const parts = v4.split('.').map((n) => parseInt(n, 10));
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n)))
        return true;
    const [a, b] = parts;
    return (a === 10 ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        a === 127 ||
        a === 0);
}
// Generate a privacy-preserving fingerprint for tracking return visitors
function generateFingerprint(ip, userAgent) {
    // Create a hash of IP + UA for privacy (not storing raw IP/UA combination)
    const hash = crypto.createHash('sha256');
    hash.update(`${ip}|${userAgent}`);
    return hash.digest('hex');
}
async function geoLookup(ip) {
    try {
        console.log('🌍 Geolocation lookup for IP:', ip);
        if (!ip || isPrivateIp(ip)) {
            console.log('⚠️  Private/invalid IP detected');
            // Development mode: Return mock location data for testing
            // This helps developers test the map visualization with local IPs
            const isDevelopment = process.env.FUNCTIONS_EMULATOR === 'true' || ip.includes('127.0.0.1') || ip.includes('::1');
            if (isDevelopment) {
                console.log('🧪 Development mode: Using mock location data');
                // Generate random location for testing (various cities around the world)
                const mockLocations = [
                    { country: 'United States', city: 'New York', region: 'NY', lat: 40.7128, lng: -74.0060 },
                    { country: 'United Kingdom', city: 'London', region: 'England', lat: 51.5074, lng: -0.1278 },
                    { country: 'Japan', city: 'Tokyo', region: 'Tokyo', lat: 35.6762, lng: 139.6503 },
                    { country: 'Australia', city: 'Sydney', region: 'NSW', lat: -33.8688, lng: 151.2093 },
                    { country: 'Brazil', city: 'São Paulo', region: 'SP', lat: -23.5505, lng: -46.6333 },
                    { country: 'France', city: 'Paris', region: 'Île-de-France', lat: 48.8566, lng: 2.3522 },
                    { country: 'Germany', city: 'Berlin', region: 'Berlin', lat: 52.5200, lng: 13.4050 },
                    { country: 'Canada', city: 'Toronto', region: 'ON', lat: 43.6532, lng: -79.3832 },
                ];
                const randomLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)];
                console.log('📍 Mock location:', randomLocation);
                return randomLocation;
            }
            return { country: 'Unknown', city: 'Unknown', region: '' };
        }
        console.log('✅ Public IP detected, calling ip-api.com...');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1500);
        const resp = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}`, { signal: controller.signal });
        clearTimeout(timeout);
        if (!resp.ok) {
            console.log('❌ ip-api.com returned error status:', resp.status);
            return { country: 'Unknown', city: 'Unknown', region: '' };
        }
        const data = await resp.json();
        console.log('📍 Geolocation API response:', JSON.stringify(data, null, 2));
        // Check if API returned an error (ip-api.com uses status field)
        if (data.status === 'fail') {
            console.log('❌ ip-api.com lookup failed:', data.message);
            return { country: 'Unknown', city: 'Unknown', region: '' };
        }
        const result = {
            country: data.country || 'Unknown',
            city: data.city || 'Unknown',
            region: data.regionName || data.region || '',
            lat: typeof data.lat === 'number' ? data.lat : undefined,
            lng: typeof data.lon === 'number' ? data.lon : undefined,
        };
        console.log('📊 Parsed location:', JSON.stringify(result, null, 2));
        return result;
    }
    catch (error) {
        console.error('❌ Geolocation error:', error);
        return { country: 'Unknown', city: 'Unknown', region: '' };
    }
}
// Helper function to generate social media app URL
function generateSocialMediaUrl(platform, username) {
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
function generateDestinationUrl(type, content) {
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
        case 'event': {
            // Generate iCalendar format for calendar events
            const formatDateForICal = (dateString) => {
                if (!dateString)
                    return '';
                const date = new Date(dateString);
                return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            };
            const title = content.title || 'Event';
            const startDate = formatDateForICal(content.startDate);
            const endDate = content.endDate ? formatDateForICal(content.endDate) : startDate;
            const location = content.location || '';
            const description = content.description || '';
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
            return JSON.stringify(content);
    }
}
exports.redirect = (0, https_1.onRequest)(async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g;
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
        // Get QR code data from (default) database - look for both shortUrlId and direct ID matches
        console.log('🗄️ Connecting to (default) database...');
        const db = (0, index_1.getMainDatabase)();
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
        let qrDoc;
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
        }
        else {
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
        const xff = (_a = (req.get('x-forwarded-for') || '').split(',')[0]) === null || _a === void 0 ? void 0 : _a.trim();
        const ip = xff || req.get('x-real-ip') || req.ip || '';
        // Parse UA -> device info
        const parser = new ua_parser_js_1.UAParser(userAgent);
        const ua = parser.getResult();
        let deviceType = 'unknown';
        const uaDeviceType = (_b = ua.device) === null || _b === void 0 ? void 0 : _b.type;
        if (uaDeviceType === 'mobile')
            deviceType = 'mobile';
        else if (uaDeviceType === 'tablet')
            deviceType = 'tablet';
        else if (!uaDeviceType)
            deviceType = 'desktop';
        const deviceInfo = {
            type: deviceType,
            os: [(_c = ua.os) === null || _c === void 0 ? void 0 : _c.name, (_d = ua.os) === null || _d === void 0 ? void 0 : _d.version].filter(Boolean).join(' ') || 'unknown',
            browser: [(_e = ua.browser) === null || _e === void 0 ? void 0 : _e.name].filter(Boolean).join('') || 'unknown',
            version: ((_f = ua.browser) === null || _f === void 0 ? void 0 : _f.version) || '',
        };
        // Determine platform category for analytics
        const osName = (((_g = ua.os) === null || _g === void 0 ? void 0 : _g.name) || '').toLowerCase();
        let platformCategory = 'Other';
        if (osName.includes('ios') || osName.includes('iphone') || osName.includes('ipad')) {
            platformCategory = 'iOS';
        }
        else if (osName.includes('android')) {
            platformCategory = 'Android';
        }
        else if (osName.includes('windows')) {
            platformCategory = 'Windows';
        }
        else if (osName.includes('mac')) {
            platformCategory = 'macOS';
        }
        else if (osName.includes('linux')) {
            platformCategory = 'Linux';
        }
        // Geo lookup (best-effort, short timeout)
        const location = await geoLookup(ip);
        // Generate fingerprint for return visitor tracking
        const fingerprint = generateFingerprint(ip, userAgent);
        // Check if this is a returning visitor (same fingerprint has scanned this QR before)
        const previousScansQuery = await db
            .collection('scans')
            .where('qrCodeId', '==', qrDoc.id)
            .where('fingerprint', '==', fingerprint)
            .limit(1)
            .get();
        const isReturningVisitor = !previousScansQuery.empty;
        // Create scan record
        const scanData = {
            qrCodeId: qrDoc.id,
            scannedAt: admin.firestore.FieldValue.serverTimestamp(),
            ipAddress: ip,
            userAgent: userAgent,
            referrer: req.get('Referer') || null,
            location,
            deviceInfo,
            platformCategory,
            fingerprint,
            isReturningVisitor,
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
        // Special handling for calendar events - serve HTML page with download
        if (qrData.type === 'event' && qrData.content) {
            console.log('📅 Calendar event detected - serving landing page');
            const formatDateForICal = (dateString) => {
                if (!dateString)
                    return '';
                const date = new Date(dateString);
                return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            };
            const formatDateForDisplay = (dateString) => {
                if (!dateString)
                    return '';
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            };
            const title = qrData.content.title || 'Event';
            const startDate = formatDateForICal(qrData.content.startDate);
            const endDate = qrData.content.endDate ? formatDateForICal(qrData.content.endDate) : startDate;
            const location = qrData.content.location || '';
            const description = qrData.content.description || '';
            // Create iCalendar format
            const ical = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//Lady QR//Calendar Event//EN',
                'CALSCALE:GREGORIAN',
                'METHOD:PUBLISH',
                'BEGIN:VEVENT',
                `UID:${qrDoc.id}@ladyqr.com`,
                `SUMMARY:${title}`,
                `DTSTART:${startDate}`,
                `DTEND:${endDate}`,
                location ? `LOCATION:${location}` : '',
                description ? `DESCRIPTION:${description.replace(/\n/g, '\\n')}` : '',
                `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                'STATUS:CONFIRMED',
                'SEQUENCE:0',
                'END:VEVENT',
                'END:VCALENDAR'
            ].filter(line => line !== '').join('\r\n');
            // Create HTML page with auto-download and manual button
            const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Add to Calendar - ${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }
    .icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    h1 {
      color: #1a202c;
      font-size: 28px;
      margin-bottom: 16px;
      font-weight: 600;
    }
    .event-details {
      background: #f7fafc;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
      text-align: left;
    }
    .detail-item {
      margin-bottom: 12px;
      color: #4a5568;
      font-size: 14px;
    }
    .detail-label {
      font-weight: 600;
      color: #2d3748;
      display: block;
      margin-bottom: 4px;
    }
    .button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      margin-top: 8px;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: scale(1.02);
    }
    .button:active {
      transform: scale(0.98);
    }
    .footer {
      margin-top: 24px;
      color: #718096;
      font-size: 12px;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📅</div>
    <h1>Add Event to Calendar</h1>

    <div class="event-details">
      <div class="detail-item">
        <span class="detail-label">Event</span>
        ${title}
      </div>
      ${qrData.content.startDate ? `
      <div class="detail-item">
        <span class="detail-label">Date & Time</span>
        ${formatDateForDisplay(qrData.content.startDate)}
      </div>
      ` : ''}
      ${location ? `
      <div class="detail-item">
        <span class="detail-label">Location</span>
        ${location}
      </div>
      ` : ''}
      ${description ? `
      <div class="detail-item">
        <span class="detail-label">Description</span>
        ${description}
      </div>
      ` : ''}
    </div>

    <button class="button" onclick="downloadICS()">
      📥 Add to My Calendar
    </button>

    <div class="footer">
      Powered by <a href="https://lady-qr.web.app">Lady QR</a>
    </div>
  </div>

  <script>
    function downloadICS() {
      const icalContent = ${JSON.stringify(ical)};
      const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'event.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show feedback
      alert('Calendar file downloaded! Open it to add the event to your calendar.');
    }

    // Auto-download on page load for mobile devices
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setTimeout(() => {
        downloadICS();
      }, 500);
    }
  </script>
</body>
</html>
      `;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.status(200).send(html);
            return;
        }
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
    }
    catch (error) {
        console.error('Redirect error:', error);
        res.status(500).send('Internal server error');
    }
});
//# sourceMappingURL=redirect.js.map