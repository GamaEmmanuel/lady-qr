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

    // Verify user owns this QR code (from default database)
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
      platformCategory: scan.platformCategory || 'Other',
      isReturningVisitor: scan.isReturningVisitor || false,
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

    // Aggregate city stats (top 10)
    const cityStats = enrichedRecentScans.reduce((acc: Record<string, number>, scan: any) => {
      const city = scan.location?.city || 'Unknown';
      const country = scan.location?.country || 'Unknown';
      const cityKey = `${city}, ${country}`;
      acc[cityKey] = (acc[cityKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Aggregate device stats by type
    const deviceStats = enrichedRecentScans.reduce((acc: Record<string, number>, scan: any) => {
      const type = scan.deviceInfo?.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Aggregate platform stats (iOS, Android, etc.)
    const platformStats = enrichedRecentScans.reduce((acc: Record<string, number>, scan: any) => {
      const platform = scan.platformCategory || 'Other';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Aggregate date stats (YYYY-MM-DD)
    const dateStats = scans.reduce((acc: Record<string, number>, scan: any) => {
      if (!scan.scannedAt) return acc;
      const dateKey = new Date(scan.scannedAt).toISOString().slice(0, 10);
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Aggregate hour-of-day stats (0-23)
    const hourStats = scans.reduce((acc: Record<number, number>, scan: any) => {
      if (!scan.scannedAt) return acc;
      try {
        const hour = new Date(scan.scannedAt).getUTCHours();
        if (!isNaN(hour) && hour >= 0 && hour <= 23) {
          acc[hour] = (acc[hour] || 0) + 1;
        }
      } catch (err) {
        // Skip invalid dates
      }
      return acc;
    }, {} as Record<number, number>);

    // Calculate return visitor rate (handle missing field gracefully)
    const returningVisitors = scans.filter((scan: any) => scan.isReturningVisitor === true).length;
    const returnVisitorRate = totalScans > 0 ? (returningVisitors / totalScans) * 100 : 0;

    const analytics = {
      totalScans,
      uniqueScans: uniqueIPs,
      recentScans: enrichedRecentScans,
      countryStats,
      cityStats,
      deviceStats,
      platformStats,
      dateStats,
      hourStats,
      returnVisitorRate,
      returningVisitors,
      lastScannedAt: sortedScans[0]?.scannedAt || null
    };

    res.json(analytics);

  } catch (error) {
    console.error('Analytics error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});