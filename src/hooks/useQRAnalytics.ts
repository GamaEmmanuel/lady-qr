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

        const baseUrl = import.meta.env.VITE_FIREBASE_HOSTING_URL || window.location.origin;
        const response = await fetch(
          `${baseUrl}/api/analytics?qrCodeId=${qrCodeId}&userId=${currentUser.uid}`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setAnalytics(data);
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