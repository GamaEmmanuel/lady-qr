import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { parseUserAgent } from './utils/deviceParser';
import { getLocationFromIP } from './utils/geoip';

export const redirect = functions.https.onRequest(async (req, res) => {
  try {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).send();
      return;
    }

    // Extract short ID from path
    const pathParts = req.path.split('/');
    const shortId = pathParts[pathParts.length - 1];

    if (!shortId) {
      return res.status(400).send('Invalid QR code URL');
    }

    console.log('Processing redirect for shortId:', shortId);

    // Get QR code data
    const qrQuery = await admin.firestore()
      .collection('qrcodes')
      .where('shortUrlId', '==', shortId)
      .limit(1)
      .get();

    if (qrQuery.empty) {
      console.log('QR code not found for shortId:', shortId);
      return res.status(404).send('QR Code not found');
    }

    const qrDoc = qrQuery.docs[0];
    const qrData = qrDoc.data();

    console.log('Found QR code:', qrDoc.id);

    // Check if QR code is active
    if (!qrData.isActive) {
      return res.status(410).send('QR Code is inactive');
    }

    // Parse request data
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip || req.get('x-forwarded-for') || req.get('x-real-ip') || '';
    const referrer = req.get('Referer') || req.get('Referrer') || null;

    console.log('Request info - IP:', ip, 'UserAgent:', userAgent.substring(0, 50));

    // Parse device info
    const deviceInfo = parseUserAgent(userAgent);
    
    // Get location info (async, don't wait for it to complete redirect)
    const locationPromise = getLocationFromIP(ip);

    // Create scan record
    const scanData = {
      qrCodeId: qrDoc.id,
      scannedAt: admin.firestore.FieldValue.serverTimestamp(),
      ipAddress: ip,
      userAgent: userAgent,
      deviceInfo: deviceInfo,
      referrer: referrer
    };

    // Log the scan and update scan count in parallel
    const [locationInfo] = await Promise.allSettled([
      locationPromise,
      admin.firestore().collection('scans').add({
        ...scanData,
        location: { country: 'Unknown', city: 'Unknown', region: 'Unknown' } // Will be updated below
      }),
      qrDoc.ref.update({
        scanCount: admin.firestore.FieldValue.increment(1),
        lastScannedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })
    ]);

    // Update location info if available
    if (locationInfo.status === 'fulfilled') {
      const scanRef = await admin.firestore().collection('scans').add({
        ...scanData,
        location: locationInfo.value
      });
      console.log('Scan logged with location:', scanRef.id);
    }

    console.log('Redirecting to:', qrData.destinationUrl);

    // Redirect to destination
    res.redirect(302, qrData.destinationUrl);

  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send('Internal server error');
  }
});