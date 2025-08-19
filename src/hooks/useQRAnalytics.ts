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
  referrer?: string;
}

export interface AnalyticsData {
  totalScans: number;
  uniqueScans: number;
  recentScans: ScanAnalytics[];
  countryStats: Record<string, number>;
  deviceStats: Record<string, number>;
  dateStats: Record<string, number>;
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

        // Build candidate URLs and try them in order until one succeeds
        const hostingUrl = (import.meta.env.VITE_FIREBASE_HOSTING_URL as string | undefined) || undefined;
        const functionsOrigin = (import.meta.env.VITE_FUNCTIONS_ORIGIN as string | undefined) || undefined;
        const projectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined) || undefined;

        const sanitizeBase = (base: string) => base.replace(/\/$/, '');
        const query = `?qrCodeId=${encodeURIComponent(qrCodeId)}&userId=${encodeURIComponent(currentUser.uid)}`;

        const candidates: string[] = [];
        // 1) Relative path – works on hosting and via Vite proxy
        candidates.push(`/api/analytics${query}`);
        // 2) Explicit hosting url if provided
        if (hostingUrl) {
          candidates.push(`${sanitizeBase(hostingUrl)}/api/analytics${query}`);
        }
        // 3) Direct Cloud Functions origin (v2 HTTPS function name is getAnalytics)
        if (functionsOrigin) {
          candidates.push(`${sanitizeBase(functionsOrigin)}/getAnalytics${query}`);
        }
        // 4) Fallback to default Cloud Functions domain using project ID (works in production without extra env)
        if (!functionsOrigin && projectId) {
          candidates.push(`https://us-central1-${projectId}.cloudfunctions.net/getAnalytics${query}`);
        }

        let lastError: Error | null = null;
        let success = false;

        for (const url of candidates) {
          try {
            const response = await fetch(url);
            if (response.ok) {
              const data = await response.json();
              setAnalytics(data);
              lastError = null;
              success = true;
              break;
            } else {
              lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
          } catch (e: any) {
            lastError = e instanceof Error ? e : new Error('Network error');
          }
        }

        if (!success && lastError) {
          throw lastError;
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();

    // Refresh analytics every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);

    return () => clearInterval(interval);
  }, [qrCodeId, currentUser]);

  const refetch = () => {
    if (currentUser && qrCodeId) {
      setLoading(true);
      // Trigger useEffect by updating a dependency
    }
  };

  return { analytics, loading, error, refetch };
};