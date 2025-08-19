import {onRequest} from 'firebase-functions/v2/https';
import { getMainDatabase } from './index';

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

    // Verify user owns this QR code (from main-database)
    const db = getMainDatabase();
    let qrDoc = await db.collection('qrcodes').doc(qrCodeId).get();

    // If not found by direct document ID, try locating by shortUrlId
    if (!qrDoc.exists) {
      const altQuery = await db
        .collection('qrcodes')
        .where('shortUrlId', '==', qrCodeId)
        .limit(1)
        .get();
      if (!altQuery.empty) {
        qrDoc = altQuery.docs[0];
      }
    }

    if (!qrDoc.exists) {
      res.status(404).json({ error: 'QR code not found' });
      return;
    }

    const qrData = qrDoc.data();
    if (qrData?.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Get scan analytics without requiring composite index
    const scansQuery = await db
      .collection('scans')
      .where('qrCodeId', '==', qrDoc.id)
      // Intentionally avoid orderBy to prevent index requirement
      .get();

    const scans = scansQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scannedAt: doc.data().scannedAt?.toDate?.()?.toISOString() || null
    }));

    // Sort by scannedAt desc in memory and cap to 1000
    const sortedScans = scans
      .slice()
      .sort((a: any, b: any) => {
        const aTs = a.scannedAt ? Date.parse(a.scannedAt) : 0;
        const bTs = b.scannedAt ? Date.parse(b.scannedAt) : 0;
        return bTs - aTs;
      })
      .slice(0, 1000);

    // Enrich recent scans with defaults expected by frontend
    const enrichedRecentScans = sortedScans.slice(0, 50).map((scan: any) => ({
      ...scan,
      location: {
        country: scan.location?.country || 'Unknown',
        city: scan.location?.city || 'Unknown',
        region: scan.location?.region || '',
        lat: scan.location?.lat,
        lng: scan.location?.lng,
      },
      deviceInfo: {
        type: scan.deviceInfo?.type || 'unknown',
        os: scan.deviceInfo?.os || 'unknown',
        browser: scan.deviceInfo?.browser || 'unknown',
        version: scan.deviceInfo?.version || '',
      },
    }));

    // Calculate basic analytics
    const totalScans = scans.length;

    // Unique scans by IP as a simple heuristic
    const uniqueIPs = new Set(scans.map((scan: any) => scan.ipAddress)).size;

    // Aggregate country stats
    const countryStats = enrichedRecentScans.reduce((acc: Record<string, number>, scan: any) => {
      const country = scan.location?.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Aggregate device stats by type
    const deviceStats = enrichedRecentScans.reduce((acc: Record<string, number>, scan: any) => {
      const type = scan.deviceInfo?.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Aggregate date stats (YYYY-MM-DD)
    const dateStats = scans.reduce((acc: Record<string, number>, scan: any) => {
      if (!scan.scannedAt) return acc;
      const dateKey = new Date(scan.scannedAt).toISOString().slice(0, 10);
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const analytics = {
      totalScans,
      uniqueScans: uniqueIPs,
      recentScans: enrichedRecentScans,
      countryStats,
      deviceStats,
      dateStats,
      lastScannedAt: sortedScans[0]?.scannedAt || null
    };

    res.json(analytics);

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});