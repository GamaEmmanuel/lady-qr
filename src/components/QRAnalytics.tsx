import React from 'react';
import { useQRAnalytics } from '../hooks/useQRAnalytics';
import {
  CalendarIcon,
  EyeIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import D3Area from './charts/D3Area';
import D3Donut from './charts/D3Donut';

interface QRAnalyticsProps {
  qrCodeId: string;
}

const QRAnalytics: React.FC<QRAnalyticsProps> = ({ qrCodeId }) => {
  const { analytics, loading, error } = useQRAnalytics(qrCodeId);

  // Modern: simple time range control for charts and deltas
  const [range, setRange] = React.useState<'7d' | '30d' | '90d' | 'all'>('30d');

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          <p>Error loading analytics: {error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>No analytics data available</p>
        </div>
      </div>
    );
  }

  // Helpers for range and deltas
  const rangeDays = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : null;

  const buildSeries = (start: Date, end: Date) => {
    const series: { x: Date; y: number }[] = [];
    const dayMs = 24 * 60 * 60 * 1000;
    for (let t = start.getTime(); t <= end.getTime(); t += dayMs) {
      const d = new Date(t);
      const key = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0, 10);
      const count = analytics.dateStats[key] || 0;
      series.push({
        x: d,
        y: count,
      });
    }
    return series;
  };

  const endCurrent = new Date();
  const startCurrent = new Date();

  if (rangeDays === null) {
    // All time - get the earliest scan date
    const allDates = Object.keys(analytics.dateStats);
    if (allDates.length > 0) {
      const earliestDate = allDates.sort()[0];
      startCurrent.setTime(new Date(earliestDate).getTime());
    } else {
      startCurrent.setDate(endCurrent.getDate() - 29); // Default to 30 days if no data
    }
  } else {
    startCurrent.setDate(endCurrent.getDate() - (rangeDays - 1));
  }

  const endPrevious = new Date(startCurrent);
  endPrevious.setDate(startCurrent.getDate() - 1);
  const startPrevious = new Date(endPrevious);
  if (rangeDays !== null) {
    startPrevious.setDate(endPrevious.getDate() - (rangeDays - 1));
  } else {
    // For "all time", use the same period length as current for comparison
    const currentPeriodDays = Math.ceil((endCurrent.getTime() - startCurrent.getTime()) / (24 * 60 * 60 * 1000));
    startPrevious.setDate(endPrevious.getDate() - (currentPeriodDays - 1));
  }

  const dateData = buildSeries(startCurrent, endCurrent);
  const previousDateData = buildSeries(startPrevious, endPrevious);

  const sumSeries = (arr: { y: number }[]) => arr.reduce((a, b) => a + b.y, 0);
  const currentTotal = sumSeries(dateData);
  const previousTotal = sumSeries(previousDateData);
  const deltaPct = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : null;

  // Filter scans for the current range
  const rangeStartTime = startCurrent.getTime();
  const rangeEndTime = endCurrent.getTime();
  const scansInRange = analytics.recentScans.filter(scan => {
    const scanTime = new Date(scan.scannedAt).getTime();
    return scanTime >= rangeStartTime && scanTime <= rangeEndTime;
  });

  // Calculate metrics for the selected range
  const uniqueScansInRange = new Set(scansInRange.map(s => s.fingerprint)).size;
  const returningInRange = scansInRange.filter(s => s.isReturningVisitor).length;
  const returnRateInRange = scansInRange.length > 0 ? (returningInRange / scansInRange.length) * 100 : 0;
  const lastScanInRange = scansInRange.length > 0
    ? scansInRange.reduce((latest, scan) =>
        new Date(scan.scannedAt) > new Date(latest.scannedAt) ? scan : latest
      ).scannedAt
    : null;

  // Prepare chart data
  const deviceData = Object.entries(analytics.deviceStats).map(([device, count]) => ({
    name: device.charAt(0).toUpperCase() + device.slice(1),
    value: count
  }));

  const platformData = Object.entries(analytics.platformStats || {}).map(([platform, count]) => ({
    name: platform,
    value: count
  }));

  const countryData = Object.entries(analytics.countryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([country, count]) => ({
      name: country,
      value: count
    }));

  const cityData = Object.entries(analytics.cityStats || {})
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([city, count]) => ({
      name: city,
      value: count
    }));

  // Prepare hour-of-day data (0-23)
  const hourData = Array.from({ length: 24 }, (_, i) => ({
    x: new Date(2000, 0, 1, i), // Use arbitrary date, just care about hour
    y: analytics.hourStats?.[i] || 0
  }));

  const RangeButton: React.FC<{ value: '7d' | '30d' | '90d' | 'all'; label: string }> = ({ value, label }) => (
    <button
      onClick={() => setRange(value)}
      className={`px-3 py-1.5 text-sm rounded-md transition-colors border ${
        range === value
          ? 'bg-primary-600 text-white border-primary-600'
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 ${className || ''}`}>
      {children}
    </div>
  );

  const StatCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 ${className || ''}`}>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white">Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Insights for this QR {rangeDays ? `over the last ${rangeDays} days` : 'for all time'}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
          <RangeButton value="7d" label="7d" />
          <RangeButton value="30d" label="30d" />
          <RangeButton value="90d" label="90d" />
          <RangeButton value="all" label="All" />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard>
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center">
              <EyeIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Scans</p>
              <p className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">{currentTotal.toLocaleString()}</p>
            </div>
          </div>
        </StatCard>

        <StatCard>
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-success-50 dark:bg-success-900/30 flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Scans</p>
              <p className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">{uniqueScansInRange.toLocaleString()}</p>
            </div>
          </div>
        </StatCard>

        <StatCard>
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Return Rate</p>
              <p className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">{returnRateInRange.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{returningInRange} returning</p>
            </div>
          </div>
        </StatCard>

        <StatCard>
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-warning-50 dark:bg-warning-900/30 flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Scan</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {lastScanInRange
                  ? new Date(lastScanInRange).toLocaleDateString()
                  : 'No scans'
                }
              </p>
            </div>
          </div>
        </StatCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scans Over Time */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white">Scans Over Time</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">{rangeDays ? `Last ${rangeDays} days` : 'All time'}</span>
          </div>
          <D3Area data={dateData} height={320} />
        </Card>

        {/* Platform Breakdown */}
        <Card>
          <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4">Platform Breakdown</h3>
          <D3Donut data={platformData.length > 0 ? platformData : deviceData} height={320} />
        </Card>
      </div>

      {/* Hour of Day Heatmap */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white">Scans by Hour of Day</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">UTC Time</span>
        </div>
        <D3Area data={hourData} height={240} />
      </Card>

      {/* City Distribution */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white">City Distribution</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">{cityData.length} cities</span>
        </div>
        <D3Donut data={cityData} height={400} />
      </Card>

      {/* Geographic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Cities */}
        <Card>
          <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4">Top Cities</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {cityData.map((c) => (
              <div key={c.name} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">{c.name}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{c.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Countries */}
        <Card>
          <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4">Top Countries</h3>
          <div className="space-y-2">
            {countryData.map((c) => (
              <div key={c.name} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">{c.name}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{c.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Scans */}
      <Card>
        <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4">Recent Scans</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Returning</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {analytics.recentScans.slice(0, 10).map((scan) => (
                <tr key={scan.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{new Date(scan.scannedAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{scan.location.city}, {scan.location.country}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                      {scan.platformCategory || scan.deviceInfo.os}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {scan.isReturningVisitor ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-400">
                        Yes
                      </span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default QRAnalytics;