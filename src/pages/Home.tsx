import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  QrCodeIcon,
  PhotoIcon,
  PaintBrushIcon,
  DocumentIcon,
  SparklesIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { qrTypes as importedQrTypes } from '../data/qrTypes';
import analyticsOverviewImg from '../assets/analytics-overview.png';
import topCitiesImg from '../assets/top-cities.png';
import topPerformingQrsImg from '../assets/top-performing-qrs.png';

const Home: React.FC = () => {
  const { currentUser } = useAuth();

  // Redirect logged in users to dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const qrTypes = importedQrTypes;

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

      {/* Analytics Dashboard Showcase */}
      <div className="bg-white dark:bg-gray-900 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-8">
            <h2 className="text-3xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Professional Analytics Dashboard
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              See exactly how your QR codes are performing with beautiful, actionable insights
            </p>
          </div>

          {/* Analytics Overview Screenshot */}
          <div className="mb-8">
            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
              <img
                src={analyticsOverviewImg}
                alt="Analytics Overview Dashboard"
                className="w-full h-auto"
              />
            </div>
            <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
              Complete analytics overview with scans over time and performance metrics
            </p>
          </div>

          {/* Two Column Screenshots */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Cities */}
            <div>
              <div className="relative rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
                <img
                  src={topCitiesImg}
                  alt="Top Cities Geographic Distribution"
                  className="w-full h-auto"
                />
              </div>
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Geographic Distribution
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  See where your audience is located with interactive city and country breakdowns
                </p>
              </div>
            </div>

            {/* Top Performing QRs */}
            <div>
              <div className="relative rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
                <img
                  src={topPerformingQrsImg}
                  alt="Top Performing QR Codes"
                  className="w-full h-auto"
                />
              </div>
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Performance Rankings
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track which QR codes perform best and optimize your campaigns accordingly
                </p>
              </div>
            </div>
          </div>

          {/* CTA for Analytics */}
          <div className="mt-8 text-center">
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 rounded-md bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-all duration-200"
            >
              <span>Get Started with QR Code Analytics</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* QR Types Grid */}
      <div className="bg-gray-50 dark:bg-gray-800 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {qrTypes.length} QR Code Types
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Create QR codes for any purpose with our specialized types
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {qrTypes.map((type, index) => {
              return (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
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
      </div>

      {/* Static vs Dynamic Comparison */}
      <div className="bg-white dark:bg-gray-900 py-12 sm:py-16">
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

      {/* Customization Options */}
      <div className="bg-white dark:bg-gray-900 py-12 sm:py-16">
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

      {/* Security & Reliability */}
      <div className="bg-white dark:bg-gray-900 py-12 sm:py-16">
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