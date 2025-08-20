import React from 'react';
import { useQRAnalytics } from '../hooks/useQRAnalytics';
import {
  ChartBarIcon,
  GlobeAmericasIcon,
  DevicePhoneMobileIcon,
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
  const [range, setRange] = React.useState<'7d' | '30d' | '90d'>('30d');

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
  const rangeDays = range === '7d' ? 7 : range === '30d' ? 30 : 90;

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
  startCurrent.setDate(endCurrent.getDate() - (rangeDays - 1));

  const endPrevious = new Date(startCurrent);
  endPrevious.setDate(startCurrent.getDate() - 1);
  const startPrevious = new Date(endPrevious);
  startPrevious.setDate(endPrevious.getDate() - (rangeDays - 1));

  const dateData = buildSeries(startCurrent, endCurrent);
  const previousDateData = buildSeries(startPrevious, endPrevious);

  const sumSeries = (arr: { y: number }[]) => arr.reduce((a, b) => a + b.y, 0);
  const currentTotal = sumSeries(dateData);
  const previousTotal = sumSeries(previousDateData);
  const deltaPct = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : null;

  // Prepare chart data
  const deviceData = Object.entries(analytics.deviceStats).map(([device, count]) => ({
    name: device.charAt(0).toUpperCase() + device.slice(1),
    value: count
  }));

  const countryData = Object.entries(analytics.countryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([country, count]) => ({
      name: country,
      value: count
    }));

  const RangeButton: React.FC<{ value: '7d' | '30d' | '90d'; label: string }> = ({ value, label }) => (
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

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white">Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Insights for this QR over the last {rangeDays} days</p>
        </div>
        <div className="inline-flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
          <RangeButton value="7d" label="7d" />
          <RangeButton value="30d" label="30d" />
          <RangeButton value="90d" label="90d" />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center">
                <EyeIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Scans</p>
                <p className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">{currentTotal.toLocaleString()}</p>
                {deltaPct !== null && (
                  <p className={`text-xs mt-1 ${deltaPct >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                    {deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(0)}% vs prev {rangeDays}d
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <D3Area data={dateData} height={80} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-success-50 dark:bg-success-900/30 flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Scans</p>
              <p className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">{analytics.uniqueScans.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center">
              <GlobeAmericasIcon className="h-6 w-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Countries</p>
              <p className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">{Object.keys(analytics.countryStats).length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-warning-50 dark:bg-warning-900/30 flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Scan</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {analytics.lastScannedAt
                  ? new Date(analytics.lastScannedAt).toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scans Over Time */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white">Scans Over Time</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">Last {rangeDays} days</span>
          </div>
          <D3Area data={dateData} height={320} />
        </Card>

        {/* Device Types */}
        <Card>
          <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4">Device Types</h3>
          <D3Donut data={deviceData} height={320} />
        </Card>
      </div>

      {/* Top Countries */}
      <Card>
        <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4">Top Countries</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {countryData.map((c) => (
            <div key={c.name} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-700 dark:text-gray-300">{c.name}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{c.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Scans */}
      <Card>
        <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4">Recent Scans</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Device</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Browser</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {analytics.recentScans.slice(0, 10).map((scan) => (
                <tr key={scan.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{new Date(scan.scannedAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{scan.location.city}, {scan.location.country}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                      {scan.deviceInfo.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{scan.deviceInfo.browser} on {scan.deviceInfo.os}</td>
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