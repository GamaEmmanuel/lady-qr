import React, { useState, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { qrTypes } from '../data/qrTypes';
import { QRCodeType, QRCustomization } from '../types';
import QRPreview from '../components/QRPreview';
import { generateOriginalData, generateShortUrl } from '../utils/qrTracking';
import { validateFormData, validateUrl, validateEmail, validatePhone, ValidationError, getFieldError, hasFieldError, getFieldWarning, hasFieldWarning } from '../utils/validation';
import QRExpirationTimer from '../components/QRExpirationTimer';
import { useQRExpiration } from '../hooks/useQRExpiration';
import QRCode from 'qrcode';
import { HexColorPicker } from 'react-colorful';
import { db } from '../config/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import {
  ArrowDownTrayIcon,
  EyeIcon,
  UserPlusIcon,
  ShieldExclamationIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline';

// Generate a random short ID for the QR code
const generateShortId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const CreateGuest: React.FC = () => {
  const { currentUser } = useAuth();

  // Redirect logged-in users to the authenticated create page
  if (currentUser) {
    return <Navigate to="/create" replace />;
  }

  const [selectedType, setSelectedType] = useState<QRCodeType>('url');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showColorPicker, setShowColorPicker] = useState<'foreground' | 'background' | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<ValidationError[]>([]);

  // State for saved QR code
  const [savedQRCode, setSavedQRCode] = useState<{ id: string; shortUrlId: string; expiresAt: Date } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Customization for guest users
  const [customization, setCustomization] = useState<QRCustomization>({
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    cornerSquareStyle: 'square',
    cornerDotStyle: 'square',
    dotsStyle: 'square',
    frameText: '' // No frame text by default
  });

  const selectedTypeConfig = qrTypes.find(type => type.id === selectedType);

  // Generate the original data for preview (before saving)
  const generatePreviewData = () => {
    if (!selectedTypeConfig) {
      console.log('👁️ Preview: No type config');
      return '';
    }
    const data = generateOriginalData(selectedType, formData);
    console.log('👁️ Preview data generated:', { type: selectedType, formData, result: data });
    return data;
  };

  // The QR data to display - use short URL if saved, otherwise preview data
  const getQRDisplayData = useCallback(() => {
    if (savedQRCode) {
      return generateShortUrl(savedQRCode.shortUrlId);
    }
    return generatePreviewData();
  }, [savedQRCode, selectedType, formData]);

  const previewData = generatePreviewData();
  const qrData = getQRDisplayData();
  const { isExpired, timeRemaining, resetExpiration } = useQRExpiration(savedQRCode ? qrData : '');

  // Debug: Log state on each render
  console.log('🔄 Render state:', {
    selectedType,
    formDataKeys: Object.keys(formData),
    formData,
    previewData,
    savedQRCode: !!savedQRCode,
    shouldShowBlur: !savedQRCode && !!previewData
  });

  // Save QR code to database
  const saveGuestQRCode = async (): Promise<{ id: string; shortUrlId: string; expiresAt: Date } | null> => {
    console.log('💾 saveGuestQRCode called');
    try {
      setIsSaving(true);
      setSaveError(null);

      const shortUrlId = generateShortId();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      const destinationUrl = generateOriginalData(selectedType, formData);

      const qrCodeData = {
        userId: null, // Guest - no user
        name: formData.name || `Guest QR - ${selectedTypeConfig?.name || selectedType}`,
        type: selectedType,
        isDynamic: false,
        isEditable: false,
        shortUrlId,
        destinationUrl,
        content: { ...formData },
        customizationOptions: customization,
        scanCount: 0,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        // Guest-specific fields
        isGuest: true,
        expiresAt: Timestamp.fromDate(expiresAt),
        guestMetadata: {
          userAgent: navigator.userAgent,
          createdAt: new Date().toISOString(),
        },
      };

      console.log('📦 QR code data to save:', JSON.stringify(qrCodeData, null, 2));
      console.log('🗄️ Saving to Firestore collection: qrcodes');

      const docRef = await addDoc(collection(db, 'qrcodes'), qrCodeData);
      console.log('📄 Document reference ID:', docRef.id);

      const savedData = {
        id: docRef.id,
        shortUrlId,
        expiresAt,
      };

      setSavedQRCode(savedData);
      resetExpiration(); // Start the expiration timer

      console.log('✅ Guest QR code saved successfully:', savedData);
      return savedData;
    } catch (error: any) {
      console.error('❌ Failed to save guest QR code:', error);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      setSaveError(`Failed to create QR code: ${error?.message || 'Please try again.'}`);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Filter QR types to only show static-compatible ones for guests
  const guestQRTypes = qrTypes;

  const handleFieldChange = (fieldId: string, value: any) => {
    console.log('📝 Field change:', fieldId, '=', value);
    setFormData(prev => {
      const newData = {
        ...prev,
        [fieldId]: value
      };
      console.log('📋 Updated formData:', newData);
      return newData;
    });

    // Clear validation error for this field when user starts typing
    setValidationErrors(prev => prev.filter(e => e.field !== fieldId));

    // Reset saved QR code when form data changes (user needs to create a new one)
    if (savedQRCode) {
      setSavedQRCode(null);
      setSaveError(null);
    }
  };

  // Validate a single field on blur
  const handleFieldBlur = (fieldId: string, value: any) => {
    const field = selectedTypeConfig?.fields.find(f => f.id === fieldId);
    if (!field) return;

    // Get the actual field type (considering conditional types)
    let actualType = field.type;
    if (field.dependsOn && field.conditionalType && formData[field.dependsOn]) {
      actualType = field.conditionalType[formData[field.dependsOn]] || field.type;
    }

    // Validate based on field type
    let error: string | undefined;
    let fixedValue: string | undefined;

    if (actualType === 'url' && value) {
      const result = validateUrl(value, true); // autoFix = true
      if (!result.isValid) {
        error = result.error;
      } else if (result.fixedValue && result.fixedValue !== value) {
        fixedValue = result.fixedValue;
      }
    } else if (actualType === 'email' && value) {
      const result = validateEmail(value);
      if (!result.isValid) {
        error = result.error;
      }
    } else if (actualType === 'tel' && value) {
      const result = validatePhone(value);
      if (!result.isValid) {
        error = result.error;
      } else if (result.fixedValue && result.fixedValue !== value) {
        fixedValue = result.fixedValue;
      }
    }

    // Update validation errors
    if (error) {
      setValidationErrors(prev => {
        const filtered = prev.filter(e => e.field !== fieldId);
        return [...filtered, { field: fieldId, message: error! }];
      });
    } else {
      setValidationErrors(prev => prev.filter(e => e.field !== fieldId));

      // Auto-fix the value if needed
      if (fixedValue) {
        setFormData(prev => ({
          ...prev,
          [fieldId]: fixedValue
        }));
      }
    }
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

  // Create QR code (save to database and reveal)
  const handleCreate = async () => {
    console.log('🔓 handleCreate called', { previewData, formData });

    if (!previewData) {
      console.log('❌ No preview data - showing alert');
      alert('Please enter the QR code data first.');
      return;
    }

    // Validate all form data before creating
    const validation = validateFormData(selectedType, formData, true);
    setValidationErrors(validation.errors);
    setValidationWarnings(validation.warnings || []);

    if (!validation.isValid) {
      const errorMessages = validation.errors.map(e => `• ${e.message}`).join('\n');
      alert(`Please fix the following errors:\n\n${errorMessages}`);
      return;
    }

    // Update form data with fixed values if available
    if (validation.fixedData) {
      setFormData(validation.fixedData);
    }

    // Save to database
    const result = await saveGuestQRCode();
    if (result) {
      console.log('✅ QR Code created and revealed!');
    }
  };

  const handleDownload = async () => {
    console.log('🚀 handleDownload called', { isExpired, savedQRCode, previewData, formData });

    if (isExpired && savedQRCode) {
      alert('This QR code has expired. Create a new one or sign up for permanent codes.');
      return;
    }

    if (!previewData) {
      console.log('❌ No preview data - showing alert');
      alert('Please enter the QR code data first.');
      return;
    }

    // Validate all form data before downloading
    const validation = validateFormData(selectedType, formData, true);

    // Update errors and warnings
    setValidationErrors(validation.errors);
    setValidationWarnings(validation.warnings || []);

    if (!validation.isValid) {
      const errorMessages = validation.errors.map(e => `• ${e.message}`).join('\n');
      alert(`Please fix the following errors before downloading:\n\n${errorMessages}`);
      return;
    }

    // Show warnings but allow download
    if (validation.warnings && validation.warnings.length > 0) {
      const warningMessages = validation.warnings.map(w => `• ${w.message}`).join('\n');
      const proceed = window.confirm(`Warnings:\n\n${warningMessages}\n\nDo you want to continue downloading?`);
      if (!proceed) return;
    }

    // Update form data with fixed values if available
    if (validation.fixedData) {
      setFormData(validation.fixedData);
    }

    // Save to database first if not already saved
    let qrToDownload = savedQRCode;
    if (!savedQRCode) {
      qrToDownload = await saveGuestQRCode();
      if (!qrToDownload) {
        alert('Failed to create QR code. Please try again.');
        return;
      }
    }

    // Use the short URL for the QR code
    const qrDataToEncode = generateShortUrl(qrToDownload!.shortUrlId);

    // Generate QR code and download as PNG for guest users
    const canvas = document.createElement('canvas');
    const size = 512; // Higher resolution for download

    QRCode.toCanvas(canvas, qrDataToEncode, {
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
              alert('Download complete! This QR code will expire in 24 hours. Sign up free for permanent codes with analytics!');
            }, 500);
          }
        }, 'image/png', 1.0);
      }
    }).catch(error => {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code. Please try again.');
    });
  };

  const renderField = (field: any) => {
    const value = formData[field.id] || '';
    const fieldError = getFieldError(validationErrors, field.id);
    const hasError = hasFieldError(validationErrors, field.id);
    const fieldWarning = getFieldWarning(validationWarnings, field.id);
    const hasWarning = hasFieldWarning(validationWarnings, field.id);

    // Handle conditional fields
    let actualPlaceholder = field.placeholder;
    let actualType = field.type;

    if (field.dependsOn && field.conditionalPlaceholder) {
      const dependentValue = formData[field.dependsOn];
      if (dependentValue && field.conditionalPlaceholder[dependentValue]) {
        actualPlaceholder = field.conditionalPlaceholder[dependentValue];
      }
      if (dependentValue && field.conditionalType && field.conditionalType[dependentValue]) {
        actualType = field.conditionalType[dependentValue];
      }
    }

    // Base input classes with error/warning state
    const inputBaseClasses = `block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none dark:bg-gray-700 dark:text-white ${
      hasError
        ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
        : hasWarning
        ? 'border-yellow-500 dark:border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500'
        : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'
    }`;

    const renderError = () => {
      if (!fieldError) return null;
      return (
        <div className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400">
          <ExclamationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{fieldError}</span>
        </div>
      );
    };

    const renderWarning = () => {
      if (!fieldWarning || hasError) return null; // Don't show warning if there's an error
      return (
        <div className="mt-1 flex items-center text-sm text-yellow-600 dark:text-yellow-400">
          <ExclamationTriangleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{fieldWarning}</span>
        </div>
      );
    };

    switch (field.type) {
      case 'radio':
        return (
          <>
            <div className="grid grid-cols-2 gap-3">
              {field.options?.map((option: any) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 cursor-pointer p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                >
                  <input
                    type="radio"
                    name={field.id}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    required={field.required}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
            {renderError()}
            {renderWarning()}
          </>
        );
      case 'textarea':
        return (
          <>
            <textarea
              id={field.id}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              onBlur={(e) => handleFieldBlur(field.id, e.target.value)}
              placeholder={actualPlaceholder}
              maxLength={field.maxLength}
              rows={3}
              className={inputBaseClasses}
              required={field.required}
            />
            {renderError()}
            {renderWarning()}
          </>
        );
      case 'select':
        return (
          <>
            <select
              id={field.id}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={inputBaseClasses}
              required={field.required}
            >
              <option value="">Selecciona una opción</option>
              {field.options?.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {renderError()}
            {renderWarning()}
          </>
        );
      default:
        return (
          <>
            <input
              type={actualType}
              id={field.id}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              onBlur={(e) => handleFieldBlur(field.id, e.target.value)}
              placeholder={actualPlaceholder}
              maxLength={field.maxLength}
              className={inputBaseClasses}
              required={field.required}
            />
            {renderError()}
            {renderWarning()}
          </>
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
                      // Reset saved QR code when type changes
                      setSavedQRCode(null);
                      setSaveError(null);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedType === type.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    {type.iconImage ? (
                      <img src={type.iconImage} alt={type.name} className="w-7 h-7 mb-2 mx-auto object-contain" />
                    ) : type.icon ? (
                      <type.icon className="w-7 h-7 mb-2 mx-auto" style={{ color: type.iconColor }} />
                    ) : null}
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
                <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4">
                  Configuration
                </h3>

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

                <div className="space-y-4">
                  {selectedTypeConfig.fields.map((field) => {
                    // Calculate conditional label
                    let displayLabel = field.label;
                    if (field.dependsOn && field.conditionalLabel && formData[field.dependsOn]) {
                      displayLabel = field.conditionalLabel[formData[field.dependsOn]] || field.label;
                    }

                    return (
                      <div key={field.id}>
                        <label
                          htmlFor={field.id}
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          {displayLabel}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {renderField(field)}
                      </div>
                    );
                  })}
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
            <div className="sticky top-8 space-y-5">
              {/* QR Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <EyeIcon className="h-5 w-5 mr-2" />
                  Preview
                </h3>

                {/* Expiration Timer - only show after QR is saved */}
                {savedQRCode && (
                  <div className="mb-6">
                    <QRExpirationTimer
                      timeRemaining={timeRemaining}
                      isExpired={isExpired}
                      onReset={resetExpiration}
                    />
                  </div>
                )}

                {/* Save Error Message */}
                {saveError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>
                  </div>
                )}

                {/* Saved Status */}
                {savedQRCode && !isExpired && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ✅ QR Code created! It will work for 24 hours.
                    </p>
                  </div>
                )}

                {/* QR Preview with blur effect for uncreated codes */}
                <div className="flex justify-center mb-6 relative">
                  {/* Blur overlay for uncreated QR codes */}
                  {!savedQRCode && previewData && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg">
                      <div className="text-center px-4">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Preview Only
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Click "Create QR Code" below to activate
                        </p>
                      </div>
                    </div>
                  )}

                  {/* QR Code Preview - blurred when not saved */}
                  <div className={!savedQRCode && previewData ? 'filter blur-md' : ''}>
                    <QRPreview
                      data={savedQRCode ? qrData : previewData}
                      customization={customization}
                      size={250}
                      isExpired={isExpired && !!savedQRCode}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Create QR Button - only show when QR is not yet created */}
                  {!savedQRCode && (
                    <button
                      onClick={handleCreate}
                      disabled={!previewData || isSaving}
                      className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                        !previewData || isSaving
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Creating QR Code...</span>
                        </>
                      ) : (
                        <>
                          <LockOpenIcon className="h-5 w-5" />
                          <span>
                            {!previewData ? 'Enter Data First' : 'Create QR Code'}
                          </span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Download Button - only show after QR is created */}
                  {savedQRCode && (
                    <button
                      onClick={handleDownload}
                      disabled={isExpired}
                      className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                        isExpired
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                      <span>{isExpired ? 'QR Code Expired' : 'Download QR Code'}</span>
                    </button>
                  )}

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
                    {savedQRCode ? (
                      <>💡 <strong>Tip:</strong> Sign up for permanent codes, analytics and unlimited downloads.</>
                    ) : (
                      <>🔒 <strong>Note:</strong> The QR code above is just a preview. Click "Create QR Code" to make it scannable.</>
                    )}
                  </p>
                </div>

                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    QR Information
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div>Type: {selectedTypeConfig?.name}</div>
                    <div className="flex items-center">
                      <span>Status:</span>
                      {savedQRCode ? (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          ✓ Active
                        </span>
                      ) : (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Preview
                        </span>
                      )}
                    </div>
                    <div>Size: 250x250 px</div>
                    <div>Expires: {savedQRCode
                      ? savedQRCode.expiresAt.toLocaleString()
                      : '24 hours after creation'
                    }</div>
                    {savedQRCode && (
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        ID: {savedQRCode.shortUrlId}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Customization Options */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                  Customization
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Foreground Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded border border-gray-200 dark:border-gray-600 flex-shrink-0" style={{ backgroundColor: customization.foregroundColor }} />
                        <button
                          onClick={() => setShowColorPicker(showColorPicker === 'foreground' ? null : 'foreground')}
                          className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          {showColorPicker === 'foreground' ? 'Close' : 'Change'}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Background Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded border border-gray-200 dark:border-gray-600 flex-shrink-0" style={{ backgroundColor: customization.backgroundColor }} />
                        <button
                          onClick={() => setShowColorPicker(showColorPicker === 'background' ? null : 'background')}
                          className="px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          {showColorPicker === 'background' ? 'Close' : 'Change'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Color Pickers */}
                  {showColorPicker === 'foreground' && (
                    <div className="mt-3">
                      <HexColorPicker color={customization.foregroundColor} onChange={(color) => handleCustomizationChange('foregroundColor', color)} />
                    </div>
                  )}
                  {showColorPicker === 'background' && (
                    <div className="mt-3">
                      <HexColorPicker color={customization.backgroundColor} onChange={(color) => handleCustomizationChange('backgroundColor', color)} />
                    </div>
                  )}

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Add Logo (PNG/JPG/SVG)
                    </label>
                    <div className="flex flex-col space-y-2">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                        onChange={handleLogoUpload}
                        className="text-sm text-gray-700 dark:text-gray-300"
                      />
                      {logoPreview && (
                        <div className="flex items-center space-x-3">
                          <div className="w-16 h-16 rounded overflow-hidden border border-gray-200 dark:border-gray-600">
                            <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                          </div>
                          <button
                            onClick={removeLogo}
                            className="inline-flex items-center px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            <XMarkIcon className="h-4 w-4 mr-1" />
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
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