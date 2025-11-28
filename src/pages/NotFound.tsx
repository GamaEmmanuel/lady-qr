import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';

const NotFound: React.FC = () => {
  return (
    <>
      <SEO
        title="404 - Page Not Found | Lady QR"
        description="The page you're looking for doesn't exist. Return to Lady QR homepage or explore our QR code generator features."
        noindex={true}
        url="/404"
      />

      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <h1 className="text-9xl font-poppins font-bold text-primary-600 dark:text-primary-400">
              404
            </h1>
          </div>

          {/* Error Message */}
          <h2 className="text-3xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h2>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Go to Homepage
            </Link>

            <Link
              to="/features"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
              Explore Features
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Popular pages:
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/pricing" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
                Pricing
              </Link>
              <Link to="/faq" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
                FAQ
              </Link>
              <Link to="/contact" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
                Contact
              </Link>
              <Link to="/create-guest" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
                Try Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;

