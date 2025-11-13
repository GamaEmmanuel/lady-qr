import React from 'react';
import { Link } from 'react-router-dom';
import {
  QrCodeIcon,
  ChartBarIcon,
  PhotoIcon,
  PaintBrushIcon,
  DevicePhoneMobileIcon,
  GlobeAmericasIcon,
  ShieldCheckIcon,
  CogIcon,
  ArrowPathIcon,
  DocumentIcon,
  EyeIcon,
  SparklesIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { qrTypes as importedQrTypes } from '../data/qrTypes';

const Features: React.FC = () => {
  const qrTypes = importedQrTypes;

  const imageFormats = [
    { name: 'PNG', description: 'Ideal for web and social media', quality: 'High quality', transparency: 'Yes' },
    { name: 'JPG', description: 'Perfect for print', quality: 'High quality', transparency: 'No' },
    { name: 'SVG', description: 'Infinitely scalable vector', quality: 'Vector', transparency: 'Yes' },
    { name: 'PDF', description: 'Ready for professional print', quality: 'Vector', transparency: 'Yes' },
    { name: 'EPS', description: 'For professional graphic design', quality: 'Vector', transparency: 'Yes' }
  ];

  const customizationOptions = [
    {
      icon: PaintBrushIcon,
      title: 'Custom Colors',
      description: 'Change the QR code colors to match your brand',
      features: ['Foreground color', 'Background color', 'Linear gradients', 'Contrast checking']
    },
    {
      icon: SparklesIcon,
      title: 'Shapes and Styles',
      description: 'Customize the appearance of QR code modules',
      features: ['Square modules', 'Rounded modules', 'Circular modules', 'Custom corners']
    },
    {
      icon: PhotoIcon,
      title: 'Center Logo',
      description: 'Add your logo in the center of the QR code',
      features: ['Image upload', 'Automatic resizing', 'Error correction level H', 'Transparent background']
    },
    {
      icon: DocumentIcon,
      title: 'Frames and Text',
      description: 'Add decorative frames with custom text',
      features: ['Frame gallery', 'Editable text', 'Calls to action', 'Preset styles']
    }
  ];

  const analyticsFeatures = [
    { icon: ChartBarIcon, title: 'Total Scans', description: 'Total number of times your code has been scanned' },
    { icon: EyeIcon, title: 'Unique Scans', description: 'Unique users who have scanned your code' },
    { icon: GlobeAmericasIcon, title: 'Geographic Location', description: 'Interactive map showing where scans occur' },
    { icon: DevicePhoneMobileIcon, title: 'Devices', description: 'Types of devices used to scan' },
    { icon: CogIcon, title: 'Activity Times', description: 'Charts of when your code is scanned most' },
    { icon: ArrowPathIcon, title: 'Real Time', description: 'Instantly updated data' }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">Features</h2>
          <p className="mt-2 text-4xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Everything you need to create professional QR codes
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Discover all the features that make Lady QR the most complete platform for businesses worldwide
          </p>
        </div>

        {/* QR Types Comparison */}
        <div className="mt-16 sm:mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white">
              Static vs Dynamic QR Codes
            </h3>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Understand the differences and choose the right type for your needs
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Static QR */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <QrCodeIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                <h4 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                  Static QR Codes
                </h4>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Data is encoded directly into the QR code pattern. Once created, it cannot be modified.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckIcon className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Permanent</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Works forever without relying on servers</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckIcon className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Fast</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Instant scanning with no redirects</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckIcon className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Ideal for</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">WiFi, text, contacts, locations</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-700">
                <p className="text-sm text-warning-700 dark:text-warning-300">
                  <strong>Limitation:</strong> Cannot be edited after creation and do not include analytics.
                </p>
              </div>
            </div>

            {/* Dynamic QR */}
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-8 border-2 border-primary-200 dark:border-primary-700">
              <div className="flex items-center space-x-3 mb-6">
                <ArrowPathIcon className="h-8 w-8 text-primary-600" />
                <h4 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                  Dynamic QR Codes
                </h4>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                They redirect through a short URL you can change at any time. Includes full analytics.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckIcon className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Editable</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Change the destination without reprinting the code</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckIcon className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Analytics</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Track scans, locations, and devices</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckIcon className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Ideal for</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Marketing, events, businesses, campaigns</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary-100 dark:bg-primary-800/30 rounded-lg">
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  <strong>Advantage:</strong> Perfect for marketing campaigns where you need flexibility and data.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Types Grid */}
        <div className="mt-16 sm:mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white">
              10 QR Code Types
            </h3>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Create QR codes for any purpose with our specialized types
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {qrTypes.map((type, index) => {
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  {type.iconImage ? (
                    <img src={type.iconImage} alt={type.name} className="w-8 h-8 mb-3 object-contain" />
                  ) : type.icon ? (
                    <type.icon className="w-8 h-8 mb-3" style={{ color: type.iconColor }} />
                  ) : null}
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{type.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Image Formats */}
        <div className="mt-16 sm:mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white">
              Download Formats
            </h3>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Download your QR codes in the perfect format for every use
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {imageFormats.map((format, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-poppins font-bold text-gray-900 dark:text-white">
                    {format.name}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    format.quality === 'Vector'
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {format.quality}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{format.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Transparency:</span>
                    <span className="text-gray-900 dark:text-white">{format.transparency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Quality:</span>
                    <span className="text-gray-900 dark:text-white">{format.quality}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-accent-50 dark:bg-accent-900/20 rounded-lg p-6 border border-accent-200 dark:border-accent-700">
            <h4 className="font-semibold text-accent-800 dark:text-accent-300 mb-2">
              💡 Usage Recommendations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-accent-700 dark:text-accent-400">
              <div>
                <strong>For Web and Social Media:</strong> PNG with transparent background
              </div>
              <div>
                <strong>For Print:</strong> PDF or EPS in high resolution
              </div>
              <div>
                <strong>For Email:</strong> Optimized JPG or PNG
              </div>
              <div>
                <strong>For Graphic Design:</strong> SVG or EPS vector
              </div>
            </div>
          </div>
        </div>

        {/* Customization Options */}
        <div className="mt-16 sm:mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white">
              Full Customization
            </h3>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Make your QR codes perfectly reflect your brand
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {customizationOptions.map((option, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <option.icon className="h-8 w-8 text-primary-600" />
                  <h4 className="text-xl font-poppins font-bold text-gray-900 dark:text-white">
                    {option.title}
                  </h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{option.description}</p>
                <ul className="space-y-2">
                  {option.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2">
                      <CheckIcon className="h-4 w-4 text-success-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Features */}
        <div className="mt-16 sm:mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white">
              Advanced Analytics
            </h3>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Gain valuable insights on how people interact with your QR codes
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyticsFeatures.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <feature.icon className="h-8 w-8 text-primary-600 mb-4" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6 border border-primary-200 dark:border-primary-700">
            <p className="text-sm text-primary-700 dark:text-primary-300 text-center">
              <strong>Note:</strong> Analytics are available only for dynamic QR codes on Professional and Business plans.
            </p>
          </div>
        </div>

        {/* Security & Reliability */}
        <div className="mt-16 sm:mt-20">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
            <div className="text-center mb-8">
              <ShieldCheckIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                Security and Reliability
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Your information and your users' information is protected
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl mb-2">🔒</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">SSL Encryption</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">All data is transmitted securely</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">☁️</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Cloud Backup</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your codes are safely stored in Firebase</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">99.9% Uptime</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Guaranteed availability for your codes</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 sm:mt-20 text-center">
          <h3 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
            Ready to create professional QR codes?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Start free and discover all the features of Lady QR
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/create"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Create QR Free
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              See Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;