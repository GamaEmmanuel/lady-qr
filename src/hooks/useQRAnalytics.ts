import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface ScanAnalytics {
  id: string;
  qrCodeId: string;
  scannedAt: string;
  ipAddress: string;
  userAgent: string;
  location: {
    country: string;
    city: string;
    region: string;
    lat?: number;
    lng?: number;
  };
  deviceInfo: {
    type: 'mobile' | 'tablet' | 'desktop' | 'unknown';
    os: string;
    browser: string;
    version: string;
  };
  platformCategory?: string;
  isReturningVisitor?: boolean;
  referrer?: string;
}

export interface AnalyticsData {
  totalScans: number;
  uniqueScans: number;
  recentScans: ScanAnalytics[];
  countryStats: Record<string, number>;
  cityStats: Record<string, number>;
  deviceStats: Record<string, number>;
  platformStats: Record<string, number>;
  dateStats: Record<string, number>;
  hourStats: Record<number, number>;
  returnVisitorRate: number;
  returningVisitors: number;
  lastScannedAt: string | null;
}

export const useQRAnalytics = (qrCodeId: string) => {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!currentUser || !qrCodeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Build candidate URLs
        const getAnalyticsUrl = (import.meta.env.VITE_GET_ANALYTICS_URL as string | undefined) || undefined;
        const hostingUrl = (import.meta.env.VITE_FIREBASE_HOSTING_URL as string | undefined) || undefined;
        const functionsOrigin = (import.meta.env.VITE_FUNCTIONS_ORIGIN as string | undefined) || undefined;
        const projectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined) || undefined;

        const sanitizeBase = (base: string) => base.replace(/\/$/, '');
        const query = `?qrCodeId=${encodeURIComponent(qrCodeId)}&userId=${encodeURIComponent(currentUser.uid)}`;

        const candidates: string[] = [];
        // Prefer direct 2nd gen function URL first (if available)
        if (getAnalyticsUrl) {
          candidates.push(`${sanitizeBase(getAnalyticsUrl)}${query}`);
        }
        // Then try 1st gen function URL
        if (functionsOrigin) {
          candidates.push(`${sanitizeBase(functionsOrigin)}/getAnalytics${query}`);
        } else if (projectId) {
          candidates.push(`https://us-central1-${projectId}.cloudfunctions.net/getAnalytics${query}`);
        }
        // Then try relative proxy and explicit hosting URL (won't work in dev mode)
        candidates.push(`/api/analytics${query}`);
        if (hostingUrl) {
          candidates.push(`${sanitizeBase(hostingUrl)}/api/analytics${query}`);
        }

        console.log('🔍 Analytics URL candidates:', candidates);

        const fetchWithTimeout = async (url: string, ms = 3500): Promise<any> => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), ms);

          try {
            console.log(`🔄 Fetching: ${url}`);
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            console.log(`✅ Response from ${url}:`, response.status);

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log(`✅ Data received from ${url}`);
            return data;
          } catch (err: any) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
              console.warn(`⏱️ Timeout for ${url}`);
              throw new Error('timeout');
            }
            console.error(`❌ Failed ${url}:`, err.message);
            throw err;
          }
        };

        const firstFulfilled = <T,>(promises: Promise<T>[]): Promise<T> =>
          new Promise((resolve, reject) => {
            let rejectedCount = 0;
            const total = promises.length;
            if (total === 0) {
              reject(new Error('No candidates'));
              return;
            }
            promises.forEach((p) => {
              p.then(resolve).catch(() => {
                rejectedCount += 1;
                if (rejectedCount === total) {
                  reject(new Error('All candidates failed'));
                }
              });
            });
          });

        let data: any | null = null;

        // Try all candidates in parallel and take the first success
        try {
          data = await firstFulfilled(candidates.map((u) => fetchWithTimeout(u)));
        } catch (e) {
          // All endpoints failed; fall back to client-side aggregation
          data = null;
        }

        if (!data) {
          // Client-side fallback: compute analytics from Firestore
          const fallback = await computeClientSideAnalytics(qrCodeId, currentUser.uid);
          setAnalytics(fallback);
          return;
        }

        setAnalytics(data as AnalyticsData);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        try {
          // Final attempt: client-side fallback
          const fallback = await computeClientSideAnalytics(qrCodeId, currentUser!.uid);
          setAnalytics(fallback);
        } catch (inner) {
          setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [qrCodeId, currentUser]);

  const refetch = () => {
    if (currentUser && qrCodeId) {
      setLoading(true);
    }
  };

  return { analytics, loading, error, refetch };
};

// --- Client-side fallback implementation ---
import { db } from '../config/firebase';
import { doc, getDoc, collection, query as fsQuery, where, getDocs } from 'firebase/firestore';

async function findQRCodeDocId(qrCodeId: string): Promise<string | null> {
  // Try direct doc ID
  const direct = await getDoc(doc(db, 'qrcodes', qrCodeId));
  if (direct.exists()) return direct.id;
  // Try by shortUrlId
  const alt = await getDocs(
    fsQuery(collection(db, 'qrcodes'), where('shortUrlId', '==', qrCodeId))
  );
  if (!alt.empty) return alt.docs[0].id;
  return null;
}

async function computeClientSideAnalytics(qrCodeId: string, userId: string): Promise<AnalyticsData> {
  const docId = await findQRCodeDocId(qrCodeId);
  if (!docId) {
    throw new Error('QR code not found');
  }

  // Verify ownership
  const qrSnap = await getDoc(doc(db, 'qrcodes', docId));
  if (!qrSnap.exists() || (qrSnap.data() as any).userId !== userId) {
    throw new Error('Access denied');
  }

  // Fetch scans without orderBy to avoid composite indexes
  const scansSnap = await getDocs(
    fsQuery(collection(db, 'scans'), where('qrCodeId', '==', docId))
  );

  const scans = scansSnap.docs.map((d) => {
    const v: any = d.data();
    const scannedAt: string | null = v.scannedAt?.toDate?.()?.toISOString?.() || v.scannedAt || null;
    return {
      id: d.id,
      ...v,
      scannedAt
    } as any;
  });

  // Sort by scannedAt desc in memory and cap to 1000
  const sorted = scans
    .slice()
    .sort((a: any, b: any) => {
      const aTs = a.scannedAt ? Date.parse(a.scannedAt) : 0;
      const bTs = b.scannedAt ? Date.parse(b.scannedAt) : 0;
      return bTs - aTs;
    })
    .slice(0, 1000);

  const recent = sorted.slice(0, 50).map((scan: any) => ({
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

  const totalScans = scans.length;
  const uniqueScans = new Set(scans.map((s: any) => s.ipAddress)).size;

  const countryStats = recent.reduce((acc: Record<string, number>, scan: any) => {
    const country = scan.location?.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cityStats = recent.reduce((acc: Record<string, number>, scan: any) => {
    const city = scan.location?.city || 'Unknown';
    const country = scan.location?.country || 'Unknown';
    const cityKey = `${city}, ${country}`;
    acc[cityKey] = (acc[cityKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deviceStats = recent.reduce((acc: Record<string, number>, scan: any) => {
    const type = scan.deviceInfo?.type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const platformStats = recent.reduce((acc: Record<string, number>, scan: any) => {
    const platform = scan.platformCategory || 'Other';
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dateStats = scans.reduce((acc: Record<string, number>, scan: any) => {
    if (!scan.scannedAt) return acc;
    const dateKey = new Date(scan.scannedAt).toISOString().slice(0, 10);
    acc[dateKey] = (acc[dateKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const hourStats = scans.reduce((acc: Record<number, number>, scan: any) => {
    if (!scan.scannedAt) return acc;
    const hour = new Date(scan.scannedAt).getUTCHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const returningVisitors = scans.filter((scan: any) => scan.isReturningVisitor).length;
  const returnVisitorRate = totalScans > 0 ? (returningVisitors / totalScans) * 100 : 0;

  return {
    totalScans,
    uniqueScans,
    recentScans: recent,
    countryStats,
    cityStats,
    deviceStats,
    platformStats,
    dateStats,
    hourStats,
    returnVisitorRate,
    returningVisitors,
    lastScannedAt: sorted[0]?.scannedAt || null,
  };
}