import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, query as fsQuery, where, getDocs } from 'firebase/firestore';

export interface AggregateAnalytics {
  totalScans: number;
  scansThisWeek: number;
  scansLastWeek: number;
  scansToday: number;
  averageScansPerQR: number;
  osStats: Record<string, number>;
  dateStats: Record<string, number>;
  topQRCodes: Array<{
    id: string;
    name: string;
    scanCount: number;
    type: string;
  }>;
  recentScans: Array<{
    id: string;
    qrCodeId: string;
    qrCodeName: string;
    scannedAt: string;
    location: {
      city: string;
      country: string;
    };
    deviceInfo: {
      type: string;
      os: string;
    };
  }>;
  peakHour: number;
}

export const useAggregateAnalytics = () => {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState<AggregateAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAggregateAnalytics = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch all QR codes for this user
        const qrCodesSnap = await getDocs(
          fsQuery(collection(db, 'qrcodes'), where('userId', '==', currentUser.uid))
        );

        const qrCodes = qrCodesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];

        if (qrCodes.length === 0) {
          setAnalytics({
            totalScans: 0,
            scansThisWeek: 0,
            scansLastWeek: 0,
            scansToday: 0,
            averageScansPerQR: 0,
            osStats: {},
            dateStats: {},
            topQRCodes: [],
            recentScans: [],
            peakHour: 0,
          });
          setLoading(false);
          return;
        }

        // Fetch all scans for all QR codes
        const qrCodeIds = qrCodes.map(qr => qr.id);
        const allScans: any[] = [];

        // Fetch scans in batches (Firestore 'in' query limit is 30)
        const batchSize = 30;
        for (let i = 0; i < qrCodeIds.length; i += batchSize) {
          const batch = qrCodeIds.slice(i, i + batchSize);
          const scansSnap = await getDocs(
            fsQuery(collection(db, 'scans'), where('qrCodeId', 'in', batch))
          );
          allScans.push(...scansSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            scannedAt: doc.data().scannedAt?.toDate?.()?.toISOString?.() || doc.data().scannedAt || new Date().toISOString()
          })));
        }

        // Calculate date ranges
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        // Calculate metrics
        const totalScans = allScans.length;
        const scansToday = allScans.filter(scan =>
          new Date(scan.scannedAt) >= todayStart
        ).length;
        const scansThisWeek = allScans.filter(scan =>
          new Date(scan.scannedAt) >= weekAgo
        ).length;
        const scansLastWeek = allScans.filter(scan => {
          const scanDate = new Date(scan.scannedAt);
          return scanDate >= twoWeeksAgo && scanDate < weekAgo;
        }).length;

        // OS stats - normalize OS names
        const normalizeOS = (os: string): string => {
          const osLower = (os || 'unknown').toLowerCase();
          if (osLower.includes('ios') || osLower.includes('iphone') || osLower.includes('ipad')) {
            return 'iOS';
          } else if (osLower.includes('android')) {
            return 'Android';
          } else if (osLower.includes('windows')) {
            return 'Windows';
          } else if (osLower.includes('mac') || osLower.includes('macos')) {
            return 'macOS';
          } else if (osLower.includes('linux')) {
            return 'Linux';
          } else {
            return 'Other';
          }
        };

        const osStats = allScans.reduce((acc: Record<string, number>, scan) => {
          const os = normalizeOS(scan.deviceInfo?.os || 'unknown');
          acc[os] = (acc[os] || 0) + 1;
          return acc;
        }, {});

        // Date stats (last 30 days)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const dateStats = allScans
          .filter(scan => new Date(scan.scannedAt) >= thirtyDaysAgo)
          .reduce((acc: Record<string, number>, scan) => {
            const dateKey = new Date(scan.scannedAt).toISOString().slice(0, 10);
            acc[dateKey] = (acc[dateKey] || 0) + 1;
            return acc;
          }, {});

        // Top QR codes
        const qrCodeScanCounts = qrCodes.map(qr => ({
          id: qr.id,
          name: qr.name || 'Unnamed QR',
          scanCount: qr.scanCount || 0,
          type: qr.type || 'unknown'
        })).sort((a, b) => b.scanCount - a.scanCount);

        const topQRCodes = qrCodeScanCounts.slice(0, 10);

        // Recent scans (last 20)
        const sortedScans = allScans
          .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime())
          .slice(0, 20);

        const recentScans = sortedScans.map(scan => {
          const qr = qrCodes.find(q => q.id === scan.qrCodeId);
          return {
            id: scan.id,
            qrCodeId: scan.qrCodeId,
            qrCodeName: qr?.name || 'Unknown QR',
            scannedAt: scan.scannedAt,
            location: {
              city: scan.location?.city || 'Unknown',
              country: scan.location?.country || 'Unknown'
            },
            deviceInfo: {
              type: scan.deviceInfo?.type || 'unknown',
              os: scan.deviceInfo?.os || 'unknown'
            }
          };
        });

        // Peak hour
        const hourStats = allScans.reduce((acc: Record<number, number>, scan) => {
          const hour = new Date(scan.scannedAt).getHours();
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        }, {});
        const peakHour = Object.entries(hourStats)
          .sort(([,a], [,b]) => b - a)[0]?.[0] ? parseInt(Object.entries(hourStats).sort(([,a], [,b]) => b - a)[0][0]) : 0;

        const averageScansPerQR = qrCodes.length > 0 ? totalScans / qrCodes.length : 0;

        setAnalytics({
          totalScans,
          scansThisWeek,
          scansLastWeek,
          scansToday,
          averageScansPerQR,
          osStats,
          dateStats,
          topQRCodes,
          recentScans,
          peakHour,
        });
      } catch (err) {
        console.error('Error fetching aggregate analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAggregateAnalytics();

    // Refresh every 2 minutes
    const interval = setInterval(fetchAggregateAnalytics, 120000);
    return () => clearInterval(interval);
  }, [currentUser]);

  return { analytics, loading, error };
};

