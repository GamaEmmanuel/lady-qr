import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { qrTypes } from '../data/qrTypes';
import { QRCodeType, QRCustomization } from '../types';
import QRPreview from '../components/QRPreview';
import { generateOriginalData } from '../utils/qrTracking';
import QRExpirationTimer from '../components/QRExpirationTimer';
import { useQRExpiration } from '../hooks/useQRExpiration';
import QRCode from 'qrcode';
import { HexColorPicker } from 'react-colorful';
import {
  ArrowDownTrayIcon,
  EyeIcon,
  UserPlusIcon,
  ShieldExclamationIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const CreateGuest: React.FC = () => {
  const [selectedType, setSelectedType] = useState<QRCodeType>('url');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showCustomization, setShowCustomization] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<'foreground' | 'background' | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  // Customization for guest users
  const [customization, setCustomization] = useState<QRCustomization>({
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    cornerSquareStyle: 'square',
    cornerDotStyle: 'square',
    dotsStyle: 'square',
    frameText: 'ESCANÉAME'
  });

  const selectedTypeConfig = qrTypes.find(type => type.id === selectedType);

  const generateQRData = () => {
    if (!selectedTypeConfig) return '';

    // For guest users, generate temporary QR data for preview
    // This uses the original data format since guests can't save QR codes
    return generateOriginalData(selectedType, formData);
  };

  const qrData = generateQRData();
  const { isExpired, timeRemaining, resetExpiration } = useQRExpiration(qrData);

  // Filter QR types to only show static-compatible ones for guests
  const guestQRTypes = qrTypes;

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleCustomizationChange = (key: keyof QRCustomization, value: any) => {
    setCustomization(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        setLogoPreview(logoUrl);
        // Update customization to include logo URL
        setCustomization(prev => ({
          ...prev,
          logoUrl: logoUrl
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview('');
    // Remove logo from customization
    setCustomization(prev => ({
      ...prev,
      logoUrl: undefined
    }));
  };

  const handleDownload = () => {
    if (isExpired) {
      alert('El código QR ha expirado. Genera uno nuevo o regístrate para códigos permanentes.');
      return;
    }

    if (!qrData) {
      alert('Por favor ingresa los datos del código QR primero.');
      return;
    }

    // Generate QR code and download as PNG for guest users
    const canvas = document.createElement('canvas');
    const size = 512; // Higher resolution for download

    QRCode.toCanvas(canvas, qrData, {
      width: size,
      margin: 2,
      color: {
        dark: customization.foregroundColor,
        light: customization.backgroundColor
      },
      errorCorrectionLevel: customization.logoUrl ? 'H' : 'M'
    }).then(() => {
      // Add logo if provided
      if (customization.logoUrl) {
        const ctx = canvas.getContext('2d')!;
        const logo = new Image();
        logo.crossOrigin = 'anonymous';
        logo.onload = () => {
          const logoSize = size * 0.15;
          const logoX = (size - logoSize) / 2;
          const logoY = (size - logoSize) / 2;

          // Draw white background circle for logo
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, logoSize / 2 + 6, 0, 2 * Math.PI);
          ctx.fill();

          // Draw logo with rounded corners
          ctx.save();
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, logoSize / 2, 0, 2 * Math.PI);
          ctx.clip();
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
          ctx.restore();

          // Download the final image
          downloadCanvas();
        };
        logo.onerror = () => {
          console.warn('Failed to load logo for download, proceeding without logo');
          downloadCanvas();
        };
        logo.src = customization.logoUrl;
      } else {
        downloadCanvas();
      }

      function downloadCanvas() {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `qr-code-guest-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Show message about signing up for more features
            setTimeout(() => {
              alert('¡Descarga completada! Regístrate gratis para códigos permanentes, personalización y más formatos de descarga.');
            }, 500);
          }
        }, 'image/png', 1.0);
      }
    }).catch(error => {
      console.error('Error generating QR code:', error);
      alert('Error al generar el código QR. Intenta nuevamente.');
    });
  };

  const renderField = (field: any) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            required={field.required}
          />
        );
      case 'select':
        return (
          <select
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            required={field.required}
          >
            <option value="">Selecciona una opción</option>
            {field.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type={field.type}
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-poppins font-bold text-gray-900 dark:text-white">
            Create QR Code
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create temporary QR codes that expire in 24 hours
          </p>

          <div className="mt-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center space-x-3">
              <ShieldExclamationIcon className="h-6 w-6 text-warning-600 dark:text-warning-400 flex-shrink-0" />
              <div className="text-left">
                <h3 className="text-sm font-medium text-warning-800 dark:text-warning-300">
                  Temporary Codes Only
                </h3>
                <p className="text-sm text-warning-600 dark:text-warning-400 mt-1">
                  QR codes created without an account expire in 24 hours and you won't be able to see any stats or analytics.{' '}
                  <Link to="/register" className="font-medium underline hover:no-underline">
                    Sign up free
                  </Link>
                  {' '}for permanent codes with analytics and unlimited downloads.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* QR Type Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white mb-4">
                QR Code Type
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {guestQRTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      setFormData((prev) => ({ name: prev?.name || '' }));
                    }}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedType === type.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {type.name}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 <strong>Static QR Codes:</strong> Data is encoded directly in the QR pattern.
                  They work forever but cannot be edited after creation.
                </p>
              </div>
            </div>

            {/* Form Fields */}
            {selectedTypeConfig && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white">
                    Configuration
                  </h3>
                  <button
                    onClick={() => setShowCustomization(!showCustomization)}
                    className="inline-flex items-center px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                    Customize
                  </button>
                </div>

                {/* Universal Name Field */}
                <div className="mb-6">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="e.g., Guest - Test QR"
                    maxLength={120}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Customization Options */}
                {showCustomization && (
                  <div className="mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Foreground Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded border border-gray-200 dark:border-gray-600" style={{ backgroundColor: customization.foregroundColor }} />
                          <button
                            onClick={() => setShowColorPicker(showColorPicker === 'foreground' ? null : 'foreground')}
                            className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            {showColorPicker === 'foreground' ? 'Close' : 'Change'}
                          </button>
                        </div>
                        {showColorPicker === 'foreground' && (
                          <div className="mt-3">
                            <HexColorPicker color={customization.foregroundColor} onChange={(color) => handleCustomizationChange('foregroundColor', color)} />
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Background Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded border border-gray-200 dark:border-gray-600" style={{ backgroundColor: customization.backgroundColor }} />
                          <button
                            onClick={() => setShowColorPicker(showColorPicker === 'background' ? null : 'background')}
                            className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            {showColorPicker === 'background' ? 'Close' : 'Change'}
                          </button>
                        </div>
                        {showColorPicker === 'background' && (
                          <div className="mt-3">
                            <HexColorPicker color={customization.backgroundColor} onChange={(color) => handleCustomizationChange('backgroundColor', color)} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Logo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Add Logo (PNG/JPG/SVG)
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                          onChange={handleLogoUpload}
                          className="text-sm text-gray-700 dark:text-gray-300"
                        />
                        {logoPreview && (
                          <button
                            onClick={removeLogo}
                            className="inline-flex items-center px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            <XMarkIcon className="h-4 w-4 mr-1" />
                            Remove
                          </button>
                        )}
                      </div>
                      {logoPreview && (
                        <div className="mt-3">
                          <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600">
                            <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {selectedTypeConfig.fields.map((field) => (
                    <div key={field.id}>
                      <label
                        htmlFor={field.id}
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upgrade Prompt */}
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-lg p-6 border border-primary-200 dark:border-primary-700">
              <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-2">
                Want More Features?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Sign up for free to unlock permanent QR codes, analytics, and unlimited downloads!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-primary-600">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">Permanent codes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-primary-600">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">Analytics & tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-primary-600">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">Unlimited downloads</span>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
                >
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  Sign Up Free
                </Link>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <EyeIcon className="h-5 w-5 mr-2" />
                  Preview
                </h3>

                {/* Expiration Timer */}
                {qrData && (
                  <div className="mb-6">
                    <QRExpirationTimer
                      timeRemaining={timeRemaining}
                      isExpired={isExpired}
                      onReset={resetExpiration}
                    />
                  </div>
                )}

                <div className="flex justify-center mb-6">
                  <QRPreview
                    data={qrData}
                    customization={customization}
                    size={250}
                    isExpired={isExpired}
                  />
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleDownload}
                    disabled={isExpired || !qrData}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                      isExpired || !qrData
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    <span>
                      {isExpired
                        ? 'QR Code Expired'
                        : !qrData
                        ? 'Enter Data First'
                        : 'Download QR'
                      }
                    </span>
                  </button>

                  <Link
                    to="/register"
                    className="w-full flex items-center justify-center space-x-2 bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    <UserPlusIcon className="h-5 w-5" />
                    <span>Sign Up for Permanent Codes</span>
                  </Link>
                </div>

                <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-700">
                  <p className="text-xs text-primary-700 dark:text-primary-300 text-center">
                    💡 <strong>Tip:</strong> Sign up for permanent codes, analytics and unlimited downloads.
                  </p>
                </div>

                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    QR Information
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div>Type: {selectedTypeConfig?.name}</div>
                    <div>Mode: Static (Temporary)</div>
                    <div>Size: 250x250 px</div>
                    <div>Expires: 24 hours</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGuest;