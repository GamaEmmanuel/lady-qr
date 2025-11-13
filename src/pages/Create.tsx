import React, { useState, useEffect } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { qrTypes } from '../data/qrTypes';
import { plans } from '../data/plans';
import { QRCodeType, QRCustomization } from '../types';
import { createTrackableQRData, generateOriginalData } from '../utils/qrTracking';
import { downloadQRCode } from '../utils/downloadQR';
import QRPreview from '../components/QRPreview';
import QRAnalytics from '../components/QRAnalytics';
import DownloadModal, { DownloadOptions } from '../components/DownloadModal';
import { HexColorPicker } from 'react-colorful';
import QRCode from 'qrcode';
import {
  PhotoIcon,
  ArrowDownTrayIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  ShieldExclamationIcon,
  XMarkIcon,
  QuestionMarkCircleIcon
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
  const [isDynamic, setIsDynamic] = useState(true); // Default to dynamic
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [customization, setCustomization] = useState<QRCustomization>({
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    cornerSquareStyle: 'square',
    cornerDotStyle: 'square',
    dotsStyle: 'square',
    frameText: '' // No frame text by default
  });
  const [showColorPicker, setShowColorPicker] = useState<'foreground' | 'background' | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showQRTypeInfo, setShowQRTypeInfo] = useState<'static' | 'dynamic' | null>(null);
  // Track saved QR ID - only set after explicit save
  const [savedQrCodeId, setSavedQrCodeId] = useState<string>('');
  // Track saved state to compare against current state
  const [savedFormData, setSavedFormData] = useState<Record<string, any> | null>(null);
  const [savedCustomization, setSavedCustomization] = useState<QRCustomization | null>(null);

  // Download modal state
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Check if user can create this type of QR code and has customization access
  const currentPlan = subscription ? plans.find(p => p.id === subscription.planType) : plans[0];
  const hasCustomization = currentPlan?.limits.customization ?? false;

  // Compute if there are unsaved changes by comparing current state to saved state
  const hasUnsavedChanges =
    savedQrCodeId === '' || // Never been saved
    JSON.stringify(formData) !== JSON.stringify(savedFormData) ||
    JSON.stringify(customization) !== JSON.stringify(savedCustomization);

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
        // Ensure name is available in formData for editing
        setFormData({ ...(qrData.content || {}), name: qrData.name || '' });

        // Load customization options
        if (qrData.customizationOptions) {
          // Remove frame text for cleaner display
          setCustomization({
            ...qrData.customizationOptions,
            frameText: '' // Always remove frame text
          });

          // Load logo preview if exists
          if (qrData.customizationOptions.logoUrl) {
            setLogoPreview(qrData.customizationOptions.logoUrl);
          }
        }

        // Store the saved QR ID so it doesn't change
        setSavedQrCodeId(editingQRId);

        // Store the saved state snapshot for comparison
        setSavedFormData({ ...(qrData.content || {}), name: qrData.name || '' });
        // Store customization without frame text (to match what we loaded)
        setSavedCustomization(qrData.customizationOptions ? {
          ...qrData.customizationOptions,
          frameText: ''
        } : customization);

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

  // Show all QR types for creation UI (same as CreateGuest page)
  const allowedCreateTypes = qrTypes;

  const generateQRData = () => {
    if (!selectedTypeConfig) return '';

    // If already saved, use the saved QR ID (doesn't change)
    if (savedQrCodeId) {
      console.log('📌 Using saved QR ID:', savedQrCodeId);
      return createTrackableQRData(savedQrCodeId);
    }

    // Before saving: Generate dynamic preview based on form data
    // This makes the QR code change as user types (visual feedback)
    const previewId = `preview-${selectedType}-${JSON.stringify(formData)}`;

    // Create a simple hash of the preview ID
    let hash = 0;
    for (let i = 0; i < previewId.length; i++) {
      const char = previewId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    const hashedId = `qr-preview-${Math.abs(hash)}`;
    console.log('👁️ Generating preview QR (not saved yet):', hashedId);

    // Show short URL in preview, but it won't work until saved
    return createTrackableQRData(hashedId);
  };

  const qrData = generateQRData();

  // Check if user can create this type of QR code
  const canCreate = canCreateQR(isDynamic ? 'dynamic' : 'static');

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Don't reset QR ID - keep it stable!
    // The QR ID should remain the same from creation to save
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

  const handleDownloadClick = () => {
    if (!canCreate) {
      alert('Has alcanzado el límite de códigos QR para tu plan actual.');
      return;
    }

    if (!qrData) {
      alert('Por favor ingresa los datos del código QR primero.');
      return;
    }

    setDownloadModalOpen(true);
  };

  const handleDownloadConfirm = async (options: DownloadOptions) => {
    if (!qrData) return;

    try {
      setIsDownloading(true);

      await downloadQRCode({
        data: qrData,
        filename: formData.name || 'qr-code',
        format: options.format,
        size: options.size,
        foregroundColor: hasCustomization ? customization.foregroundColor : '#000000',
        backgroundColor: hasCustomization ? customization.backgroundColor : '#ffffff',
        logoUrl: hasCustomization ? customization.logoUrl : undefined
      });

      // Close modal after successful download
      setDownloadModalOpen(false);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Error downloading QR code. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Save QR to Firestore - only creates document on explicit save
  const handleSave = async () => {
    if (!currentUser) {
      alert('Please log in to save your QR code.');
      return;
    }

    if (!formData.name || !String(formData.name).trim()) {
      alert('Please enter a name for your QR code.');
      return;
    }

    try {
      setLoading(true);

      // Generate new QR ID for new codes, or use existing ID when editing
      const finalQrId = isEditing ? editingQRId! : `qr-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      console.log('💾 Saving QR code with ID:', finalQrId);

      // Prepare document data
      const destinationUrl = generateOriginalData(selectedType, formData);
      console.log('📦 Document data being saved:', {
        id: finalQrId,
        userId: currentUser.uid,
        type: selectedType,
        isDynamic,
        shortUrlId: finalQrId,
        destinationUrl,
        contentKeys: Object.keys(formData)
      });

      const docData: Record<string, any> = {
        userId: currentUser.uid,
        type: selectedType,
        isDynamic,
        isActive: true, // Only set to active on explicit save
        name: formData.name || '',
        content: formData || {},
        shortUrlId: finalQrId,
        destinationUrl,
        updatedAt: new Date()
      };

      // Only set createdAt and scanCount if creating new (not editing)
      if (!isEditing) {
        docData.createdAt = new Date();
        docData.scanCount = 0;
      }

      // Include customization if available on current plan
      if (hasCustomization) {
        docData.customizationOptions = customization;
      }

      console.log('💾 Saving to Firestore collection: qrcodes, doc ID:', finalQrId);
      await setDoc(doc(db, 'qrcodes', finalQrId), docData);
      console.log('✅ QR code saved successfully to Firestore!');

      // Lock the QR ID so it doesn't change after save
      setSavedQrCodeId(finalQrId);

      // Store snapshot of saved state for comparison
      setSavedFormData({ ...formData });
      setSavedCustomization({ ...customization });

      alert('QR code saved successfully! You can find it in your Dashboard and Archive.');
    } catch (error) {
      console.error('Error saving QR code:', error);
      alert('Error saving QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const renderField = (field: any) => {
    const value = formData[field.id] || '';

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

    switch (field.type) {
      case 'radio':
        return (
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
        );
      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={actualPlaceholder}
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
            type={actualType}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={actualPlaceholder}
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                <span className="text-gray-900 dark:text-white">Loading QR code...</span>
              </div>
            </div>
          )}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-poppins font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Edit QR Code' : 'Create Professional QR Code'}
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {isEditing ? 'View analytics and edit your QR code settings' : 'Create permanent QR codes with full customization and analytics'}
              </p>

              {/* Plan Limitations Warning */}
              {!canCreate && (
                <div className="mt-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-700 rounded-lg p-3 max-w-2xl mx-auto">
                  <div className="flex items-center space-x-3">
                    <ShieldExclamationIcon className="h-5 w-5 text-error-600 dark:text-error-400 flex-shrink-0" />
                    <div className="text-left">
                      <h3 className="text-sm font-medium text-error-800 dark:text-error-300">
                        Plan Limit Reached
                      </h3>
                      <p className="text-sm text-error-600 dark:text-error-400 mt-0.5">
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

            {/* When editing/viewing QR: Different layout */}
            {isEditing ? (
              <div className="space-y-6">
                {/* Top Section: QR Preview + Configuration */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-stretch">
                  {/* QR Preview + Customization - Top Left */}
                  <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* QR Preview */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
                      <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <EyeIcon className="h-5 w-5 mr-2" />
                        QR Code Preview
                      </h3>
                      <div className="flex justify-center mb-4">
                        <QRPreview
                          data={qrData}
                          customization={customization}
                          size={250}
                        />
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div>Type: {selectedTypeConfig?.name}</div>
                        <div>Mode: {isDynamic ? 'Dynamic (Editable)' : 'Static (Permanent)'}</div>
                        <div>Size: 250x250 px</div>
                      </div>
                    </div>

                    {/* Customization Options */}
                    {hasCustomization && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
                        <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                          Customization
                          {!isDynamic && (
                            <span className="ml-auto text-xs text-gray-500">(Colors only)</span>
                          )}
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

                          {/* Logo Upload - Only for dynamic QR codes */}
                          {isDynamic && (
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
                          )}
                          {!isDynamic && logoPreview && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Logo (Read-only)
                              </label>
                              <div className="w-16 h-16 rounded overflow-hidden border border-gray-200 dark:border-gray-600">
                                <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover opacity-75" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Configuration - Top Right */}
                  <div className="lg:col-span-2 flex">
                    {/* Form Fields */}
                    {selectedTypeConfig && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 w-full">
                        <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-3">
                          Configuration
                        </h3>

                        {/* Static QR Warning */}
                        {isEditing && !isDynamic && (
                          <div className="mb-4 p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-700">
                            <p className="text-sm text-warning-700 dark:text-warning-300">
                              <strong>⚠️ Static QR Code:</strong> Content cannot be changed after creation. You can only update the name and colors.
                            </p>
                          </div>
                        )}

                        {/* Universal Name Field */}
                        <div className="mb-4">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Name <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            id="name"
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            placeholder="e.g., Promo - Summer Sale"
                            maxLength={120}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                            required
                          />
                        </div>

                        <div className="space-y-3 mb-4">
                          {selectedTypeConfig.fields.map((field) => {
                            // Calculate conditional label
                            let displayLabel = field.label;
                            if (field.dependsOn && field.conditionalLabel && formData[field.dependsOn]) {
                              displayLabel = field.conditionalLabel[formData[field.dependsOn]] || field.label;
                            }

                            // Disable content fields for saved static QR codes
                            const isFieldDisabled = isEditing && !isDynamic;

                            return (
                              <div key={field.id}>
                                <label
                                  htmlFor={field.id}
                                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                                >
                                  {displayLabel}
                                  {field.required && <span className="text-red-500 ml-1">*</span>}
                                  {isFieldDisabled && <span className="ml-2 text-xs text-gray-500">(Read-only)</span>}
                                </label>
                                {isFieldDisabled ? (
                                  <div className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400">
                                    {formData[field.id] || '-'}
                                  </div>
                                ) : (
                                  renderField(field)
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Download/Save Buttons - Integrated in Configuration */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                              onClick={handleDownloadClick}
                              disabled={!canCreate || !qrData}
                              className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                                !canCreate || !qrData
                                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-600'
                              }`}
                            >
                              <ArrowDownTrayIcon className="h-5 w-5" />
                              <span>Download QR</span>
                            </button>
                            <button
                              onClick={handleSave}
                              disabled={!canCreate || !qrData}
                              className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                                !canCreate || !qrData
                                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                  : hasUnsavedChanges
                                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                  : 'bg-green-600 hover:bg-green-700 text-white'
                              }`}
                            >
                              <PhotoIcon className="h-5 w-5" />
                              <span>
                                {isEditing && !isDynamic ? 'Save Changes' : savedQrCodeId && hasUnsavedChanges ? 'Save Changes' : 'Save'}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Analytics - Bottom Full Width */}
                {editingQRId && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
                    <h2 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white mb-3">
                      QR Code Analytics
                    </h2>
                    <QRAnalytics qrCodeId={editingQRId} />
                  </div>
                )}
              </div>
            ) : (
              /* When creating new QR: Original layout */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="lg:col-span-2 space-y-5">
                {/* QR Type Selection (only when creating new) */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
                    <h2 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-3">
                      QR Code Type
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {allowedCreateTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => {
                            setSelectedType(type.id);
                            setIsDynamic(type.canBeDynamic && !type.canBeStatic);

                            // Keep name field sticky across type changes, reset other fields
                            setFormData((prev) => ({ name: prev?.name || '' }));
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

                    {/* Static/Dynamic Selection - Integrated in same card */}
                    {selectedTypeConfig && selectedTypeConfig.canBeDynamic && selectedTypeConfig.canBeStatic && (
                      <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                          Code Type
                        </h3>
                        <div className="mb-3 p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-700">
                          <div className="text-sm text-primary-700 dark:text-primary-300">
                            <strong>Your current plan:</strong> {currentPlan?.name} -
                            Static: {currentPlan?.limits.staticCodes === -1 ? 'Unlimited' : `${qrCounts?.staticCodes || 0}/${currentPlan?.limits.staticCodes}`} |
                            Dynamic: {qrCounts?.dynamicCodes || 0}/{currentPlan?.limits.dynamicCodes}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <button
                              onClick={() => {
                                setIsDynamic(true);
                              }}
                              disabled={!canCreateQR('dynamic')}
                              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                                isDynamic && canCreateQR('dynamic')
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                  : !canCreateQR('dynamic')
                                  ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <div className={`font-medium ${!canCreateQR('dynamic') ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                  Dynamic
                                </div>
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowQRTypeInfo(showQRTypeInfo === 'dynamic' ? null : 'dynamic');
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                  >
                                    <QuestionMarkCircleIcon className="h-5 w-5" />
                                  </button>
                                  {showQRTypeInfo === 'dynamic' && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
                                      <div className="bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg py-2 px-3 shadow-lg max-w-xs whitespace-normal">
                                        Editable QR code - change destination URL anytime without reprinting
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                          <div className="border-8 border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          </div>
                          <div className="relative">
                            <button
                              onClick={() => {
                                setIsDynamic(false);
                              }}
                              disabled={!canCreateQR('static')}
                              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                                !isDynamic && canCreateQR('static')
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                  : !canCreateQR('static')
                                  ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <div className={`font-medium ${!canCreateQR('static') ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                  Static
                                </div>
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowQRTypeInfo(showQRTypeInfo === 'static' ? null : 'static');
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                  >
                                    <QuestionMarkCircleIcon className="h-5 w-5" />
                                  </button>
                                  {showQRTypeInfo === 'static' && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
                                      <div className="bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg py-2 px-3 shadow-lg max-w-xs whitespace-normal">
                                        Permanent QR code - content cannot be changed after creation
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                          <div className="border-8 border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                {/* Form Fields */}
                {selectedTypeConfig && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
                    <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-3">
                      Configuration
                    </h3>

                    {/* Universal Name Field */}
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Name <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        placeholder="e.g., Promo - Summer Sale"
                        maxLength={120}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>

                    <div className="space-y-3">
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
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
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

                {/* Download/Save Buttons */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleDownloadClick}
                      disabled={!canCreate || !qrData}
                      className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                        !canCreate || !qrData
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                      <span>Download QR</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!canCreate || !qrData}
                      className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                        !canCreate || !qrData
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : hasUnsavedChanges
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      <PhotoIcon className="h-5 w-5" />
                      <span>{savedQrCodeId && hasUnsavedChanges ? 'Save Changes' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Panel */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-5">
                  {/* QR Preview */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
                    <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <EyeIcon className="h-5 w-5 mr-2" />
                      Preview
                    </h3>
                    <div className="flex justify-center mb-4">
                      <QRPreview
                        data={qrData}
                        customization={customization}
                        size={250}
                      />
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div>Type: {selectedTypeConfig?.name}</div>
                      <div>Mode: {isDynamic ? 'Dynamic (Editable)' : 'Static (Permanent)'}</div>
                      <div>Size: 250x250 px</div>
                    </div>
                  </div>

                  {/* Customization Options */}
                  {hasCustomization && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
                      <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                        Customization
                        {isEditing && !isDynamic && (
                          <span className="ml-auto text-xs text-gray-500">(Colors only)</span>
                        )}
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

                        {/* Logo Upload - Only for dynamic QR codes when editing */}
                        {!(isEditing && !isDynamic) && (
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
                        )}
                        {isEditing && !isDynamic && logoPreview && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Logo (Read-only)
                            </label>
                            <div className="w-16 h-16 rounded overflow-hidden border border-gray-200 dark:border-gray-600">
                              <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover opacity-75" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>

        {/* Download Modal */}
        <DownloadModal
          isOpen={downloadModalOpen}
          onClose={() => setDownloadModalOpen(false)}
          onDownload={handleDownloadConfirm}
          isLoading={isDownloading}
        />
      </div>
  );
};

export default Create;