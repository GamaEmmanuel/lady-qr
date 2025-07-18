import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  QrCodeIcon, 
  ChartBarIcon, 
  DevicePhoneMobileIcon, 
  GlobeAmericasIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

const Home: React.FC = () => {
  const { currentUser } = useAuth();

  const features = [
    {
      icon: QrCodeIcon,
      title: 'Advanced Generation',
      description: 'Create QR codes for 15+ content types with complete customization.'
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
                to={currentUser ? "/dashboard" : "/register"}
                className="rounded-md bg-primary-600 px-6 py-3 text-sm font-inter font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all duration-200 flex items-center space-x-2"
              >
                <span>{currentUser ? 'Go to Dashboard' : 'Start Free'}</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                to={currentUser ? "/create" : "/create-guest"}
                className="text-sm font-inter font-semibold leading-6 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
              >
                Create QR now <span aria-hidden="true">→</span>
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

      {/* CTA Section */}
      <div className="bg-primary-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-poppins font-bold tracking-tight text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
              Join thousands of businesses already using tuQR to grow their business. 
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
                to="/features"
                className="text-sm font-inter font-semibold leading-6 text-white hover:text-primary-100 transition-colors duration-200"
              >
                View features <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;