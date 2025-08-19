import React, { useState, useEffect } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { qrTypes } from '../data/qrTypes';
import { plans } from '../data/plans';
import { QRCodeType, QRCustomization } from '../types';
import { createTrackableQRData, generateOriginalData } from '../utils/qrTracking';
import QRPreview from '../components/QRPreview';
import QRAnalytics from '../components/QRAnalytics';
import { HexColorPicker } from 'react-colorful';
import QRCode from 'qrcode';
import {
  PhotoIcon,
  ArrowDownTrayIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  ShieldExclamationIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Create: React.FC = () => {
  const { currentUser, subscription, qrCounts, canCreateQR } = useAuth();
  const [searchParams] = useSearchParams();
  const editingQRId = searchParams.get('edit');
  const isEditing = !!editingQRId;

  // Redirect non-logged-in users to guest creation page
  if (!currentUser) {
    return <Navigate to="/create-guest" replace />;
  }

  const [selectedType, setSelectedType] = useState<QRCodeType>('url');
  const [isDynamic, setIsDynamic] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [customization, setCustomization] = useState<QRCustomization>({
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    cornerSquareStyle: 'square',
    cornerDotStyle: 'square',
    dotsStyle: 'square',
    frameText: 'ESCANÉAME'
  });
  const [showCustomization, setShowCustomization] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<'foreground' | 'background' | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  // Generate consistent QR ID for both preview and storage
  const [qrCodeId, setQrCodeId] = useState<string>('');

  // Load existing QR code data when editing
  useEffect(() => {
    const loadQRCode = async () => {
      if (!isEditing || !editingQRId || !currentUser) return;

      try {
        setLoading(true);
        const qrDoc = await getDoc(doc(db, 'qrcodes', editingQRId));

        if (!qrDoc.exists()) {
          alert('QR code not found');
          return;
        }

        const qrData = qrDoc.data();

        // Security check - ensure QR belongs to current user
        if (qrData.userId !== currentUser.uid) {
          alert('You do not have permission to edit this QR code');
          return;
        }

        // Load QR code data into form
        setSelectedType(qrData.type);
        setIsDynamic(qrData.isDynamic || false);
        setFormData(qrData.content || {});

        // Load customization options
        if (qrData.customizationOptions) {
          setCustomization(qrData.customizationOptions);

          // Load logo preview if exists
          if (qrData.customizationOptions.logoUrl) {
            setLogoPreview(qrData.customizationOptions.logoUrl);
          }
        }

      } catch (error) {
        console.error('Error loading QR code:', error);
        alert('Error loading QR code data');
      } finally {
        setLoading(false);
      }
    };

    loadQRCode();
  }, [isEditing, editingQRId, currentUser]);

  const selectedTypeConfig = qrTypes.find(type => type.id === selectedType);

  const generateQRData = () => {
    if (!selectedTypeConfig) return '';

    // Generate consistent QR ID for both preview and storage
    let finalQrId = qrCodeId;

    if (isEditing) {
      // When editing, use the existing QR ID
      finalQrId = editingQRId!;
      console.log('🔄 EDITING MODE: Using existing QR ID:', finalQrId);
    } else if (!finalQrId) {
      // When creating new, generate a consistent ID
      finalQrId = `qr-${Date.now()}`;
      setQrCodeId(finalQrId);
      console.log('🆕 NEW QR: Generated ID:', finalQrId);
    } else {
      console.log('🔄 EXISTING ID: Using current ID:', finalQrId);
    }

    // All QR codes now use short URLs for consistent tracking
    const qrData = createTrackableQRData('', finalQrId, !isDynamic);
    console.log('📱 QR Data Generated:', qrData);
    console.log('🎯 QR ID being used:', finalQrId);
    console.log('📊 Is Dynamic:', isDynamic);

    return qrData;
  };

  const qrData = generateQRData();

  // Check if user can create this type of QR code
  const canCreate = canCreateQR(isDynamic ? 'dynamic' : 'static');
  const currentPlan = subscription ? plans.find(p => p.id === subscription.planType) : plans[0];
  const hasCustomization = currentPlan?.limits.customization ?? false;

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Reset QR ID when form data changes (for new QR codes)
    if (!isEditing && qrCodeId) {
      setQrCodeId('');
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
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PNG, JPG, or SVG image.');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Please upload an image smaller than 2MB.');
        return;
      }

      setLogoFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        handleCustomizationChange('logoUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    handleCustomizationChange('logoUrl', undefined);
  };

  const handleDownload = () => {
    if (!canCreate) {
      alert('Has alcanzado el límite de códigos QR para tu plan actual.');
      return;
    }

    if (!qrData) {
      alert('Por favor ingresa los datos del código QR primero.');
      return;
    }

    // Generate QR code and download as PNG
    const canvas = document.createElement('canvas');
    const size = 512; // Higher resolution for download

    QRCode.toCanvas(canvas, qrData, {
      width: size,
      margin: 2,
      color: {
        dark: hasCustomization ? customization.foregroundColor : '#000000',
        light: hasCustomization ? customization.backgroundColor : '#ffffff'
      },
      errorCorrectionLevel: hasCustomization && customization.logoUrl ? 'H' : 'M'
    }).then(() => {
      // If there's a logo and customization is available, add it
      if (hasCustomization && customization.logoUrl) {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          downloadCanvas(canvas); // Proceed without logo if context cannot be created
          return;
        }
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

          // Draw logo
          ctx.save();
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, logoSize / 2, 0, 2 * Math.PI);
          ctx.clip();
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
          ctx.restore();

          downloadCanvas(canvas);
        };
        logo.src = customization.logoUrl;
      } else {
        downloadCanvas(canvas);
      }
    }).catch((error) => {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code. Please try again.');
    });
  };

  // Add: Save QR to Firestore so it appears in Dashboard/Archive
  const handleSave = async () => {
    if (!currentUser) {
      alert('Please log in to save your QR code.');
      return;
    }

    try {
      setLoading(true);

      // Ensure we have a consistent ID
      let finalQrId = qrCodeId;
      if (isEditing) {
        finalQrId = editingQRId!;
      } else if (!finalQrId) {
        finalQrId = `qr-${Date.now()}`;
        setQrCodeId(finalQrId);
      }

      // Prepare document data
      const destinationUrl = generateOriginalData(selectedType, formData);
      const docData: Record<string, any> = {
        userId: currentUser.uid,
        type: selectedType,
        isDynamic,
        isActive: true,
        name: formData.name || '',
        content: formData || {},
        shortUrlId: finalQrId,
        destinationUrl,
        scanCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Include customization if available on current plan
      if (hasCustomization) {
        docData.customizationOptions = customization;
      }

      await setDoc(doc(db, 'qrcodes', finalQrId), docData, { merge: true });

      alert('QR code saved successfully! You can find it in your Dashboard and Archive.');
    } catch (error) {
      console.error('Error saving QR code:', error);
      alert('Error saving QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCanvas = (canvas: HTMLCanvasElement) => {
    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-code-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png', 1.0);
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
            id={field.id}
            type={field.type}
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

  // Render
  if (!currentUser) {
    return <Navigate to="/create-guest" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                <span className="text-gray-900 dark:text-white">Loading QR code...</span>
              </div>
            </div>
          )}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-poppins font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Edit QR Code' : 'Create Professional QR Code'}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {isEditing ? 'View analytics and edit your QR code settings' : 'Create permanent QR codes with full customization and analytics'}
              </p>

              {/* Plan Limitations Warning */}
              {!canCreate && (
                <div className="mt-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-700 rounded-lg p-4 max-w-2xl mx-auto">
                  <div className="flex items-center space-x-3">
                    <ShieldExclamationIcon className="h-6 w-6 text-error-600 dark:text-error-400 flex-shrink-0" />
                    <div className="text-left">
                      <h3 className="text-sm font-medium text-error-800 dark:text-error-300">
                        Plan Limit Reached
                      </h3>
                      <p className="text-sm text-error-600 dark:text-error-400 mt-1">
                        You've reached the limit of {isDynamic ? 'dynamic' : 'static'} QR codes for your current plan.{' '}
                        <Link to="/pricing" className="font-medium underline hover:no-underline">
                          Upgrade your plan
                        </Link>
                        {' '}to create more codes.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Configuration Panel */}
              <div className="lg:col-span-2 space-y-6">
                {/* QR Analytics (when editing) */}
                {isEditing && editingQRId && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white mb-4">
                      QR Code Analytics
                    </h2>
                    <QRAnalytics qrCodeId={editingQRId} />
                  </div>
                )}

                {/* QR Type Selection (only when creating new) */}
                {!isEditing && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white mb-4">
                      QR Code Type
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {qrTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => {
                            setSelectedType(type.id);
                            setFormData({});
                            setIsDynamic(type.canBeDynamic && !type.canBeStatic);

                            // Reset QR ID when type changes (for new QR codes)
                            if (!isEditing) {
                              setQrCodeId('');
                            }
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
                  </div>
                )}

                {/* Static/Dynamic Selection (only when creating new) */}
                {!isEditing && selectedTypeConfig && selectedTypeConfig.canBeDynamic && selectedTypeConfig.canBeStatic && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4">
                      Code Type
                    </h3>
                    <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-700">
                      <div className="text-sm text-primary-700 dark:text-primary-300">
                        <strong>Your current plan:</strong> {currentPlan?.name} -
                        Static: {currentPlan?.limits.staticCodes === -1 ? 'Unlimited' : `${qrCounts?.staticCodes || 0}/${currentPlan?.limits.staticCodes}`} |
                        Dynamic: {qrCounts?.dynamicCodes || 0}/{currentPlan?.limits.dynamicCodes}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          setIsDynamic(false);
                          // Reset QR ID when switching types (for new QR codes)
                          if (!isEditing) {
                            setQrCodeId('');
                          }
                        }}
                        disabled={!canCreateQR('static')}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          !isDynamic && canCreateQR('static')
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : !canCreateQR('static')
                            ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className={`font-medium ${!canCreateQR('static') ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          Static
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Cannot be edited after creation
                        </div>
                        {!canCreateQR('static') && (
                          <div className="text-xs text-error-600 dark:text-error-400 mt-1">
                            Limit reached
                          </div>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsDynamic(true);
                          // Reset QR ID when switching types (for new QR codes)
                          if (!isEditing) {
                            setQrCodeId('');
                          }
                        }}
                        disabled={!canCreateQR('dynamic')}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          isDynamic && canCreateQR('dynamic')
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : !canCreateQR('dynamic')
                            ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className={`font-medium ${!canCreateQR('dynamic') ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          Dynamic
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Editable with analytics
                        </div>
                        {!canCreateQR('dynamic') && (
                          <div className="text-xs text-error-600 dark:text-error-400 mt-1">
                            Limit reached
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* QR Name Field */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4">
                    QR Code Name
                  </h3>
                  <div>
                    <label htmlFor="qrName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name (for your archive)
                    </label>
                    <input
                      type="text"
                      id="qrName"
                      value={formData.name || ''}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder={`My ${selectedTypeConfig?.name} QR Code`}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Form Fields */}
                {selectedTypeConfig && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4">
                      Configuration
                    </h3>
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

                {/* Customization Panel */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white">
                      Customization
                    </h3>
                    {!hasCustomization && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                        Not available on {currentPlan?.name} plan
                      </div>
                    )}
                    <button
                      onClick={() => setShowCustomization(!showCustomization)}
                      disabled={!hasCustomization}
                      className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                    >
                      <AdjustmentsHorizontalIcon className="h-5 w-5" />
                      <span>{showCustomization ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>

                  {!hasCustomization && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Customization not included:</strong> Your {currentPlan?.name} plan doesn't include customization options.{' '}
                        <Link to="/pricing" className="font-medium text-primary-600 hover:text-primary-700 underline hover:no-underline">
                          Upgrade your plan
                        </Link>
                        {' '}to access all customization options.
                      </p>
                    </div>
                  )}

                  {showCustomization && hasCustomization && (
                    <div className="space-y-6">
                      {/* Colors */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Colors
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Primary color
                            </label>
                            <div className="relative">
                              <button
                                onClick={() => setShowColorPicker(showColorPicker === 'foreground' ? null : 'foreground')}
                                className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 flex items-center space-x-2 px-3"
                              >
                                <div
                                  className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                                  style={{ backgroundColor: customization.foregroundColor }}
                                />
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Background color
                            </label>
                            <div className="relative">
                              <button
                                onClick={() => setShowColorPicker(showColorPicker === 'background' ? null : 'background')}
                                className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 flex items-center space-x-2 px-3"
                              >
                                <div
                                  className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                                  style={{ backgroundColor: customization.backgroundColor }}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Logo */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Logo
                        </h4>
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {logoPreview ? (
                              <img src={logoPreview} alt="Logo preview" className="w-12 h-12 rounded-full" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <PhotoIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                              onChange={handleLogoUpload}
                              className="hidden"
                              id="logoUpload"
                            />
                            <label
                              htmlFor="logoUpload"
                              className="block text-sm font-medium text-primary-600 hover:text-primary-700 cursor-pointer"
                            >
                              Upload logo
                            </label>
                            {logoPreview && (
                              <button
                                onClick={removeLogo}
                                className="mt-1 text-sm text-gray-500 hover:text-gray-700"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Frame Text */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Frame Text
                        </h4>
                        <input
                          type="text"
                          value={customization.frameText}
                          onChange={(e) => handleCustomizationChange('frameText', e.target.value)}
                          placeholder="ESCANÉAME"
                          maxLength={20}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Panel */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white mb-4">
                    Preview
                  </h2>
                  <div className="flex flex-col items-center space-y-4">
                     <QRPreview
                       data={qrData}
                       customization={hasCustomization ? customization : {
                         foregroundColor: '#000000',
                         backgroundColor: '#ffffff',
                         cornerSquareStyle: 'square',
                         cornerDotStyle: 'square',
                         dotsStyle: 'square'
                       }}
                     />
                     {/* Add Save and Download buttons */}
                     <div className="flex items-center gap-3">
                       <button
                         onClick={handleSave}
                         disabled={!canCreate || loading}
                         className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         Save
                       </button>
                       <button
                         onClick={handleDownload}
                         disabled={!canCreate}
                         className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                         Download
                       </button>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  );
};

export default Create;