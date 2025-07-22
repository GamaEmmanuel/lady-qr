// Copy this code into Google Cloud Console > Cloud Functions
// Function name: getAnalytics
// Trigger: HTTP
// Runtime: Node.js 18

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

exports.getAnalytics = functions.https.onRequest(async (req, res) => {
  try {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(200).send();
      return;
    }

    // Get QR code ID from query params
    const qrCodeId = req.query.qrCodeId;
    const userId = req.query.userId;

    if (!qrCodeId || !userId) {
      return res.status(400).json({ error: 'Missing qrCodeId or userId' });
    }

    // Verify user owns this QR code
    const qrDoc = await admin.firestore().collection('qrcodes').doc(qrCodeId).get();
    
    if (!qrDoc.exists) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    const qrData = qrDoc.data();
    if (qrData.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get scan analytics
    const scansQuery = await admin.firestore()
      .collection('scans')
      .where('qrCodeId', '==', qrCodeId)
      .orderBy('scannedAt', 'desc')
      .limit(1000)
      .get();

    const scans = scansQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scannedAt: doc.data().scannedAt?.toDate?.()?.toISOString() || null
    }));

    // Calculate analytics
    const totalScans = scans.length;
    const uniqueIPs = new Set(scans.map(scan => scan.ipAddress)).size;
    
    // Group by country
    const countryStats = scans.reduce((acc, scan) => {
      const country = scan.location?.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    // Group by device type
    const deviceStats = scans.reduce((acc, scan) => {
      const deviceType = scan.deviceInfo?.type || 'unknown';
      acc[deviceType] = (acc[deviceType] || 0) + 1;
      return acc;
    }, {});

    // Group by date (last 30 days)
    const dateStats = scans.reduce((acc, scan) => {
      if (scan.scannedAt) {
        const date = new Date(scan.scannedAt).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {});

    const analytics = {
      totalScans,
      uniqueScans: uniqueIPs,
      recentScans: scans.slice(0, 50), // Last 50 scans
      countryStats,
      deviceStats,
      dateStats,
      lastScannedAt: scans[0]?.scannedAt || null
    };

    res.json(analytics);

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});