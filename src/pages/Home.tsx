import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IconType } from 'react-icons';
import {
  QrCodeIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  GlobeAmericasIcon,
  SparklesIcon,
  PhotoIcon,
  PaintBrushIcon,
  DocumentIcon,
  EyeIcon,
  CogIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import {
  TbWorld,
  TbUser,
  TbFileText,
  TbMail,
  TbMessage,
  TbWifi,
  TbShare3,
  TbMapPin,
  TbCalendar
} from 'react-icons/tb';
import { SiWhatsapp } from 'react-icons/si';

const Home: React.FC = () => {
  const { currentUser } = useAuth();

  // Redirect logged in users to dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: QrCodeIcon,
      title: 'Advanced Generation',
      description: 'Create QR codes for 10 content types with complete customization.'
    },
    {
      icon: ChartBarIcon,
      title: 'Detailed Analytics',
      description: 'Track scans, locations and devices in real time.'
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Responsive Design',
      description: 'Perfectly optimized for mobile, tablet and desktop.'
    },
    {
      icon: GlobeAmericasIcon,
      title: 'Global Ready',
      description: 'Multiple payment methods and international support.'
    },
    {
      icon: SparklesIcon,
      title: 'Complete Customization',
      description: 'Colors, shapes, logos and custom frames for your brand.'
    }
  ];

  const stats = [
    { name: 'QR Codes created', value: '50K+' },
    { name: 'Active users', value: '15K+' },
    { name: 'Countries served', value: '25+' },
    { name: 'Total scans', value: '2M+' }
  ];

  const qrTypes: Array<{ Icon: IconType; name: string; description: string; color: string }> = [
    { Icon: TbWorld, name: 'Website (URL)', description: 'Links to any website', color: '#3b82f6' },
    { Icon: TbUser, name: 'Contact Card', description: 'vCard with contact info', color: '#8b5cf6' },
    { Icon: TbFileText, name: 'Text', description: 'Simple text messages', color: '#6b7280' },
    { Icon: TbMail, name: 'Email', description: 'Send predefined emails', color: '#ef4444' },
    { Icon: TbMessage, name: 'SMS', description: 'Text messages to phones', color: '#10b981' },
    { Icon: SiWhatsapp, name: 'WhatsApp', description: 'Start WhatsApp chat', color: '#25D366' },
    { Icon: TbWifi, name: 'WiFi', description: 'Auto network connection', color: '#0ea5e9' },
    { Icon: TbShare3, name: 'Social Media', description: 'Social network profiles', color: '#ec4899' },
    { Icon: TbMapPin, name: 'Location', description: 'GPS coordinates/addresses', color: '#f59e0b' },
    { Icon: TbCalendar, name: 'Event', description: 'Calendar event details', color: '#f97316' }
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
    <div className="overflow-hidden">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-400 to-accent-400 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Create{' '}
              <span className="text-primary-600">professional</span>{' '}
              QR codes for your business
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              The most complete platform for generating, customizing and managing QR codes.
              With advanced analytics and professional features.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to={currentUser ? "/dashboard" : "/login"}
                className="rounded-md bg-primary-600 px-6 py-3 text-sm font-inter font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all duration-200 flex items-center space-x-2"
              >
                <span>{currentUser ? 'Go to Dashboard' : 'Start Free'}</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                to={currentUser ? "/create" : "/create-guest"}
                className="text-sm font-inter font-semibold leading-6 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
              >
                {currentUser ? 'Create QR Code' : 'Try Demo'} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-accent-400 to-primary-400 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
            }}
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white dark:bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Trusted by thousands of businesses worldwide
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
                Join the community of businesses already transforming their marketing with tuQR
              </p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.name} className="flex flex-col bg-gray-50 dark:bg-gray-800 p-8">
                  <dt className="text-sm font-inter font-medium leading-6 text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </dt>
                  <dd className="order-first text-3xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 dark:bg-gray-800 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything you need in one platform
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Professional tools designed for modern businesses
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-inter font-semibold leading-7 text-gray-900 dark:text-white">
                    <feature.icon className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
                    {feature.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Static vs Dynamic Comparison */}
      <div className="bg-white dark:bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
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
      </div>

      {/* QR Types Grid */}
      <div className="bg-gray-50 dark:bg-gray-800 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
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
              const IconComponent = type.Icon;
              return (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <IconComponent className="w-8 h-8 mb-3" style={{ color: type.color }} />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{type.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Customization Options */}
      <div className="bg-white dark:bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
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
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
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
      </div>

      {/* Analytics Features */}
      <div className="bg-gray-50 dark:bg-gray-800 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
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
              <div key={index} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <feature.icon className="h-8 w-8 text-primary-600 mb-4" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6 border border-primary-200 dark:border-primary-700">
            <p className="text-sm text-primary-700 dark:text-primary-300 text-center">
              <strong>Note:</strong> Analytics are available only for dynamic QR codes on paid plans.
            </p>
          </div>
        </div>
      </div>

      {/* Security & Reliability */}
      <div className="bg-white dark:bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
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
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-poppins font-bold tracking-tight text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
              Join thousands of businesses already using Lady QR to grow their business.
              Start free and upgrade when you need it.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-md bg-white px-6 py-3 text-sm font-inter font-semibold text-primary-600 shadow-sm hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200"
              >
                Start now
              </Link>
              <Link
                to="/pricing"
                className="text-sm font-inter font-semibold leading-6 text-white hover:text-primary-100 transition-colors duration-200"
              >
                View pricing <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;