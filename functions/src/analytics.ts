import {onRequest} from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

export const getAnalytics = onRequest(async (req, res) => {
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
    const qrCodeId = req.query.qrCodeId as string;
    const userId = req.query.userId as string;

    if (!qrCodeId || !userId) {
      res.status(400).json({ error: 'Missing qrCodeId or userId' });
      return;
    }

    // Verify user owns this QR code
    const qrDoc = await admin.firestore().collection('qrcodes').doc(qrCodeId).get();

    if (!qrDoc.exists) {
      res.status(404).json({ error: 'QR code not found' });
      return;
    }

    const qrData = qrDoc.data();
    if (qrData?.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
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

    // Calculate basic analytics
    const totalScans = scans.length;
    const uniqueIPs = new Set(scans.map((scan: any) => scan.ipAddress)).size;

    const analytics = {
      totalScans,
      uniqueScans: uniqueIPs,
      recentScans: scans.slice(0, 50), // Last 50 scans
      lastScannedAt: scans[0]?.scannedAt || null
    };

    res.json(analytics);

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});