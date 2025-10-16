import React, { useMemo } from 'react';

interface GeoMapProps {
  data: Array<{
    lat: number;
    lng: number;
    count: number;
    city?: string;
    country?: string;
  }>;
  height?: number;
}

const GeoMap: React.FC<GeoMapProps> = ({ data, height = 400 }) => {
  // Convert lat/lng to SVG coordinates (simple equirectangular projection)
  const projectPoint = (lat: number, lng: number) => {
    // Map width is 0-100% of viewBox width (960)
    // Map height is 0-100% of viewBox height (based on height prop)
    const x = ((lng + 180) / 360) * 960;
    const y = ((90 - lat) / 180) * (height * 2);
    return { x, y };
  };

  // Group nearby points and calculate sizes
  const points = useMemo(() => {
    return data
      .filter(d => d.lat && d.lng && !isNaN(d.lat) && !isNaN(d.lng))
      .map(d => ({
        ...projectPoint(d.lat, d.lng),
        count: d.count,
        city: d.city,
        country: d.country,
      }));
  }, [data, height]);

  const maxCount = Math.max(...points.map(p => p.count), 1);

  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      <svg
        viewBox={`0 0 960 ${height * 2}`}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      >
        {/* Simple world map outline */}
        <rect
          x="0"
          y="0"
          width="960"
          height={height * 2}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-gray-300 dark:text-gray-600"
          opacity="0.2"
        />

        {/* Grid lines for continents (rough approximation) */}
        <g className="text-gray-200 dark:text-gray-700" opacity="0.3">
          {/* Latitude lines */}
          {[0, 30, 60, 90, 120, 150, 180].map(lat => (
            <line
              key={`lat-${lat}`}
              x1="0"
              y1={(lat / 180) * height * 2}
              x2="960"
              y2={(lat / 180) * height * 2}
              stroke="currentColor"
              strokeWidth="0.5"
            />
          ))}
          {/* Longitude lines */}
          {[0, 60, 120, 180, 240, 300, 360].map(lng => (
            <line
              key={`lng-${lng}`}
              x1={(lng / 360) * 960}
              y1="0"
              x2={(lng / 360) * 960}
              y2={height * 2}
              stroke="currentColor"
              strokeWidth="0.5"
            />
          ))}
        </g>

        {/* Data points */}
        {points.map((point, i) => {
          const radius = 4 + (point.count / maxCount) * 12;
          return (
            <g key={i}>
              {/* Outer glow */}
              <circle
                cx={point.x}
                cy={point.y}
                r={radius + 2}
                className="fill-primary-400 dark:fill-primary-500"
                opacity="0.2"
              />
              {/* Main point */}
              <circle
                cx={point.x}
                cy={point.y}
                r={radius}
                className="fill-primary-600 dark:fill-primary-400"
                opacity="0.8"
              >
                <title>
                  {point.city && point.country
                    ? `${point.city}, ${point.country}: ${point.count} scans`
                    : `${point.count} scans`}
                </title>
              </circle>
              {/* Center dot */}
              <circle
                cx={point.x}
                cy={point.y}
                r={2}
                className="fill-white dark:fill-gray-900"
              />
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-3 py-2">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Scan Locations</div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400"></div>
            <span className="text-xs text-gray-600 dark:text-gray-300">Few</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-primary-600 dark:bg-primary-400"></div>
            <span className="text-xs text-gray-600 dark:text-gray-300">Many</span>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {points.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">No geographic data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeoMap;

