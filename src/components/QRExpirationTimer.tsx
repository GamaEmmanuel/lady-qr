import React from 'react';
import { ClockIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface QRExpirationTimerProps {
  timeRemaining: number;
  isExpired: boolean;
  onReset: () => void;
}

const QRExpirationTimer: React.FC<QRExpirationTimerProps> = ({
  timeRemaining,
  isExpired,
  onReset
}) => {
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getWarningLevel = () => {
    const hoursRemaining = timeRemaining / (1000 * 60 * 60);
    if (hoursRemaining <= 1) return 'critical';
    if (hoursRemaining <= 3) return 'warning';
    return 'normal';
  };

  const warningLevel = getWarningLevel();

  if (isExpired) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
              QR Code Expired
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              This QR code has expired after 24 hours. Generate a new one or sign up to save your codes permanently.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onReset}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Generate New Code
          </button>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-4 py-2 border border-red-300 dark:border-red-600 text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Sign Up for Permanent Codes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 border ${
      warningLevel === 'critical' 
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
        : warningLevel === 'warning'
        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
    }`}>
      <div className="flex items-center space-x-3">
        <ClockIcon className={`h-5 w-5 ${
          warningLevel === 'critical' 
            ? 'text-red-600 dark:text-red-400'
            : warningLevel === 'warning'
            ? 'text-yellow-600 dark:text-yellow-400'
            : 'text-blue-600 dark:text-blue-400'
        }`} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${
              warningLevel === 'critical' 
                ? 'text-red-800 dark:text-red-300'
                : warningLevel === 'warning'
                ? 'text-yellow-800 dark:text-yellow-300'
                : 'text-blue-800 dark:text-blue-300'
            }`}>
              Time remaining:
            </span>
            <span className={`text-lg font-mono font-bold ${
              warningLevel === 'critical' 
                ? 'text-red-900 dark:text-red-200'
                : warningLevel === 'warning'
                ? 'text-yellow-900 dark:text-yellow-200'
                : 'text-blue-900 dark:text-blue-200'
            }`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          <p className={`text-xs mt-1 ${
            warningLevel === 'critical' 
              ? 'text-red-600 dark:text-red-400'
              : warningLevel === 'warning'
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-blue-600 dark:text-blue-400'
          }`}>
            {warningLevel === 'critical' 
              ? '⚠️ Code will expire soon! Sign up to save it permanently.'
              : warningLevel === 'warning'
              ? '⏰ Your code will expire in less than 3 hours. Consider signing up.'
              : '💡 Temporary codes expire in 24 hours. Sign up for permanent codes.'
            }
          </p>
        </div>
      </div>
      
      {warningLevel !== 'normal' && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <Link
            to="/register"
            className={`inline-flex items-center text-sm font-medium hover:underline ${
              warningLevel === 'critical' 
                ? 'text-red-700 dark:text-red-300'
                : 'text-yellow-700 dark:text-yellow-300'
            }`}
          >
            Sign up now to save this QR code permanently →
          </Link>
        </div>
      )}
    </div>
  );
};

export default QRExpirationTimer;