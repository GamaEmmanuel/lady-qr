import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { qrTypes } from '../data/qrTypes';
import { plans } from '../data/plans';
import { QRCodeType, QRCustomization } from '../types';
import QRPreview from '../components/QRPreview';
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

  const selectedTypeConfig = qrTypes.find(type => type.id === selectedType);

  const generateQRData = () => {
    if (!selectedTypeConfig) return '';
    
    switch (selectedType) {
      case 'url':
        return formData.url || '';
      case 'text':
        return formData.text || '';
      case 'email':
        return `mailto:${formData.email}?subject=${encodeURIComponent(formData.subject || '')}&body=${encodeURIComponent(formData.body || '')}`;
      case 'sms':
        return `sms:${formData.phone}${formData.message ? `?body=${encodeURIComponent(formData.message)}` : ''}`;
      case 'wifi':
        return `WIFI:T:${formData.encryption || 'WPA'};S:${formData.ssid || ''};P:${formData.password || ''};;`;
      case 'location':
        if (formData.latitude && formData.longitude) {
          return `geo:${formData.latitude},${formData.longitude}`;
        }
        return formData.address || '';
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${formData.firstName || ''} ${formData.lastName || ''}\nORG:${formData.company || ''}\nTITLE:${formData.jobTitle || ''}\nEMAIL:${formData.email || ''}\nTEL:${formData.phone || ''}\nURL:${formData.website || ''}\nEND:VCARD`;
      default:
        return JSON.stringify(formData);
    }
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
          
          // Download the canvas
          downloadCanvas(canvas);
        };
        logo.onerror = () => {
          // Download without logo if logo fails to load
          downloadCanvas(canvas);
        };
        logo.src = customization.logoUrl;
      } else {
        // Download without logo
        downloadCanvas(canvas);
      }
    }).catch(error => {
      console.error('Error generating QR code:', error);
      alert('Error al generar el código QR. Intenta nuevamente.');
    });
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
            Create Professional QR Code
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create permanent QR codes with full customization and analytics
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
            {/* QR Type Selection */}
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

            {/* Static/Dynamic Selection */}
            {selectedTypeConfig && selectedTypeConfig.canBeDynamic && selectedTypeConfig.canBeStatic && (
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
                    onClick={() => setIsDynamic(false)}
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
                    onClick={() => setIsDynamic(true)}
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
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {customization.foregroundColor}
                            </span>
                          </button>
                          {showColorPicker === 'foreground' && (
                            <div className="absolute top-12 left-0 z-10 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                              <HexColorPicker
                                color={customization.foregroundColor}
                                onChange={(color) => handleCustomizationChange('foregroundColor', color)}
                              />
                            </div>
                          )}
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
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {customization.backgroundColor}
                            </span>
                          </button>
                          {showColorPicker === 'background' && (
                            <div className="absolute top-12 left-0 z-10 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                              <HexColorPicker
                                color={customization.backgroundColor}
                                onChange={(color) => handleCustomizationChange('backgroundColor', color)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Logo
                    </h4>
                    <div className="space-y-4">
                      {!logoPreview ? (
                        <div>
                          <label className="block">
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-500 dark:hover:border-primary-400 cursor-pointer transition-colors">
                              <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Click to upload logo
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                PNG, JPG, SVG up to 2MB
                              </p>
                            </div>
                          </label>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="w-12 h-12 object-cover rounded border border-gray-200 dark:border-gray-600"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {logoFile?.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {logoFile && (logoFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <button
                              onClick={removeLogo}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                          <label className="block">
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                            <button
                              type="button"
                              className="w-full text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 py-2 px-3 border border-primary-300 dark:border-primary-600 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                            >
                              Change Logo
                            </button>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Frame Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Frame text
                    </label>
                    <input
                      type="text"
                      value={customization.frameText || ''}
                      onChange={(e) => handleCustomizationChange('frameText', e.target.value)}
                      placeholder="SCAN ME"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              )}
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
                
                <div className="flex justify-center mb-6">
                  <QRPreview 
                    data={qrData}
                    customization={hasCustomization ? customization : {
                      foregroundColor: '#000000',
                      backgroundColor: '#ffffff',
                      cornerSquareStyle: 'square',
                      cornerDotStyle: 'square',
                      dotsStyle: 'square'
                    }}
                    size={250}
                  />
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleDownload}
                    disabled={!canCreate || !qrData}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                      !canCreate || !qrData
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    <span>
                      {!canCreate
                        ? 'Limit Reached'
                        : !qrData
                        ? 'Enter Data First'
                        : 'Download PNG'
                      }
                    </span>
                  </button>
                  
                  <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md transition-colors">
                    <PhotoIcon className="h-5 w-5" />
                    <span>More formats</span>
                  </button>
                </div>

                {currentPlan?.id === 'gratis' && (
                  <div className="mt-4 p-3 bg-accent-50 dark:bg-accent-900/20 rounded-lg border border-accent-200 dark:border-accent-700">
                    <p className="text-xs text-accent-700 dark:text-accent-300 text-center">
                      🚀 <strong>Enhance your experience:</strong>{' '}
                      <Link to="/pricing" className="font-medium underline hover:no-underline">
                        Upgrade your plan
                      </Link>
                      {' '}to get more codes, full customization and technical support.
                    </p>
                  </div>
                )}

                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    QR Information
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div>Type: {selectedTypeConfig?.name}</div>
                    <div>Mode: {isDynamic ? 'Dynamic' : 'Static'}</div>
                    <div>Size: 250x250 px</div>
                    <div>Status: Permanent</div>
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

export default Create;