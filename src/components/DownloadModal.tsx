import React, { useState } from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export interface DownloadOptions {
  format: 'png' | 'jpg' | 'svg' | 'pdf';
  size: number;
}

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (options: DownloadOptions) => void;
  isLoading?: boolean;
}

const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  onDownload,
  isLoading = false
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpg' | 'svg' | 'pdf'>('png');
  const [selectedSize, setSelectedSize] = useState<number>(1024);

  const formats = [
    {
      id: 'png',
      name: 'PNG',
      description: 'High quality with transparency',
      recommended: 'Web & Social Media'
    },
    {
      id: 'jpg',
      name: 'JPG',
      description: 'Compressed format for print',
      recommended: 'Print Materials'
    },
    {
      id: 'svg',
      name: 'SVG',
      description: 'Vector format, infinitely scalable',
      recommended: 'Professional Design'
    },
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Ready for professional printing',
      recommended: 'Print & Documents'
    }
  ];

  const sizes = [
    { value: 256, label: 'Small', description: '256 × 256 px' },
    { value: 512, label: 'Medium', description: '512 × 512 px' },
    { value: 1024, label: 'Large', description: '1024 × 1024 px' },
    { value: 2048, label: 'Extra Large', description: '2048 × 2048 px' }
  ];

  const handleDownload = () => {
    onDownload({ format: selectedFormat, size: selectedSize });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white">
              Download QR Code
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                {formats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id as any)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      selectedFormat === format.id
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {format.name}
                      </span>
                      {selectedFormat === format.id && (
                        <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {format.description}
                    </p>
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                      {format.recommended}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection - Only for raster formats */}
            {(selectedFormat === 'png' || selectedFormat === 'jpg') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Size
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setSelectedSize(size.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedSize === size.value
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          {size.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {size.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {selectedFormat === 'svg' && 'SVG files are vector-based and can be scaled to any size without losing quality. Perfect for professional design work.'}
                    {selectedFormat === 'pdf' && 'PDF files are ideal for printing and can be opened with any PDF reader. They maintain high quality at any size.'}
                    {selectedFormat === 'png' && 'PNG files support transparency and are perfect for web use. Choose a larger size for better quality.'}
                    {selectedFormat === 'jpg' && 'JPG files are compressed and ideal for print materials. They don\'t support transparency.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span>Download {selectedFormat.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;

