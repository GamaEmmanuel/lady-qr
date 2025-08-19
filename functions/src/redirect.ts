import {onRequest} from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { getMainDatabase } from './index';

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
    const ip = req.ip || req.get('x-forwarded-for') || req.get('x-real-ip') || '';

    // Create scan record
    const scanData = {
      qrCodeId: qrDoc.id,
      scannedAt: admin.firestore.FieldValue.serverTimestamp(),
      ipAddress: ip,
      userAgent: userAgent,
      referrer: req.get('Referer') || null
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