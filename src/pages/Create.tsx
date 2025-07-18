import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { qrTypes } from '../data/qrTypes';
import { plans } from '../data/plans';
import { QRCodeType, QRCustomization } from '../types';
import QRPreview from '../components/QRPreview';
import QRExpirationTimer from '../components/QRExpirationTimer';
import { useQRExpiration } from '../hooks/useQRExpiration';
import { HexColorPicker } from 'react-colorful';
import { 
  PhotoIcon, 
  ArrowDownTrayIcon, 
  AdjustmentsHorizontalIcon,
  SwatchIcon,
  EyeIcon,
  UserPlusIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

const Create: React.FC = () => {
  const { currentUser, subscription, qrCounts, canCreateQR } = useAuth();
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
  const { isExpired, timeRemaining, resetExpiration } = useQRExpiration(qrData);

  // Check if user can create this type of QR code
  const canCreate = currentUser ? canCreateQR(isDynamic ? 'dynamic' : 'static') : true;
  const currentPlan = subscription ? plans.find(p => p.id === subscription.planType) : plans[0];
  const hasCustomization = currentUser ? (currentPlan?.limits.customization ?? false) : false;

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

  const handleDownload = () => {
    if (!currentUser && isExpired) {
      alert('El código QR ha expirado. Genera uno nuevo o regístrate para códigos permanentes.');
      return;
    }
    
    if (!currentUser) {
      alert('Sign up to download permanent QR codes.');
      return;
    }
    
    // Implement download logic here
    console.log('Downloading QR code...');
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
            Customize your QR code with 15+ different types
          </p>
          {!currentUser && (
            <div className="mt-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-center space-x-3">
                <ShieldExclamationIcon className="h-6 w-6 text-warning-600 dark:text-warning-400 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="text-sm font-medium text-warning-800 dark:text-warning-300">
                    Temporary Codes
                  </h3>
                  <p className="text-sm text-warning-600 dark:text-warning-400 mt-1">
                    QR codes generated without an account expire in 24 hours.{' '}
                    <Link to="/register" className="font-medium underline hover:no-underline">
                      Sign up free
                    </Link>
                    {' '}for permanent codes.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Plan Limitations Warning */}
          {currentUser && !canCreate && (
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
            {selectedTypeConfig && selectedTypeConfig.canBeDynamic && selectedTypeConfig.canBeStatic && selectedType !== 'vcard' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4">
                  Code Type
                </h3>
                {currentUser && (
                  <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-700">
                    <div className="text-sm text-primary-700 dark:text-primary-300">
                      <strong>Your current plan:</strong> {currentPlan?.name} - 
                      Static: {currentPlan?.limits.staticCodes === -1 ? 'Unlimited' : `${qrCounts?.staticCodes || 0}/${currentPlan?.limits.staticCodes}`} | 
                      Dynamic: {qrCounts?.dynamicCodes || 0}/{currentPlan?.limits.dynamicCodes}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setIsDynamic(false)}
                    disabled={currentUser && !canCreateQR('static')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      !isDynamic && (!currentUser || canCreateQR('static'))
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : currentUser && !canCreateQR('static')
                        ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className={`font-medium ${currentUser && !canCreateQR('static') ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                      Static
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Cannot be edited after creation
                    </div>
                    {currentUser && !canCreateQR('static') && (
                      <div className="text-xs text-error-600 dark:text-error-400 mt-1">
                        Limit reached
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => setIsDynamic(true)}
                    disabled={currentUser && !canCreateQR('dynamic')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      isDynamic && (!currentUser || canCreateQR('dynamic'))
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : currentUser && !canCreateQR('dynamic')
                        ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className={`font-medium ${currentUser && !canCreateQR('dynamic') ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                      Dynamic
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Editable with analytics
                    </div>
                    {currentUser && !canCreateQR('dynamic') && (
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
                {!hasCustomization && currentUser && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    Not available on {currentPlan?.name} plan
                  </div>
                )}
                <button
                  onClick={() => setShowCustomization(!showCustomization)}
                  disabled={currentUser && !hasCustomization}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  <span>{showCustomization ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              
              {!currentUser && (
                <div className="mb-4 p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-700">
                  <p className="text-sm text-warning-700 dark:text-warning-300">
                    <strong>Customization not available:</strong> Unregistered users cannot customize QR codes.{' '}
                    <Link to="/register" className="font-medium underline hover:no-underline">
                      Sign up free
                    </Link>
                    {' '}to access customization.
                  </p>
                </div>
              )}
              
              {currentUser && !hasCustomization && (
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
                
                {/* Expiration Timer for non-logged users */}
                {!currentUser && qrData && (
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
                    customization={hasCustomization ? customization : {
                      foregroundColor: '#000000',
                      backgroundColor: '#ffffff',
                      cornerSquareStyle: 'square',
                      cornerDotStyle: 'square',
                      dotsStyle: 'square'
                    }}
                    size={250}
                    isExpired={!currentUser && isExpired}
                  />
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleDownload}
                    disabled={(!currentUser && isExpired) || (currentUser && !canCreate) || !qrData}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                      (!currentUser && isExpired) || (currentUser && !canCreate) || !qrData
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    <span>
                      {!currentUser && isExpired 
                        ? 'QR Code Expired' 
                        : currentUser && !canCreate
                        ? 'Limit Reached'
                        : !qrData
                        ? 'Enter Data First'
                        : 'Download PNG'
                      }
                    </span>
                  </button>
                  
                  {!currentUser ? (
                    <Link
                      to="/register"
                      className="w-full flex items-center justify-center space-x-2 bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      <UserPlusIcon className="h-5 w-5" />
                      <span>Sign Up for Permanent Codes</span>
                    </Link>
                  ) : (
                    <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md transition-colors">
                      <PhotoIcon className="h-5 w-5" />
                      <span>More formats</span>
                    </button>
                  )}
                </div>

                {!currentUser && (
                  <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-700">
                    <p className="text-xs text-primary-700 dark:text-primary-300 text-center">
                      💡 <strong>Tip:</strong> Sign up for permanent codes, customization, analytics and more download formats.
                    </p>
                  </div>
                )}
                
                {currentUser && currentPlan?.id === 'gratis' && (
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