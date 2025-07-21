import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const AuthComplete: React.FC = () => {
  const { completePasswordlessSignIn, isPasswordlessSignIn, currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handlePasswordlessSignIn = async () => {
      // Check if this is a passwordless sign-in link
      if (!isPasswordlessSignIn()) {
        setError('Invalid authentication link');
        setLoading(false);
        return;
      }

      try {
        // Get email from URL parameters or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email') || localStorage.getItem('emailForSignIn');
        
        await completePasswordlessSignIn(email || undefined);
        setSuccess(true);
      } catch (error: any) {
        setError(error.message || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    handlePasswordlessSignIn();
  }, [completePasswordlessSignIn, isPasswordlessSignIn]);

  // Redirect to dashboard if already authenticated
  if (currentUser && success) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {loading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white mb-2">
                Completing Sign In
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we verify your authentication...
              </p>
            </div>
          )}

          {error && (
            <div className="text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error}
              </p>
              <div className="space-y-3">
                <a
                  href="/login"
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  Try Again
                </a>
                <a
                  href="/"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Go Home
                </a>
              </div>
            </div>
          )}

          {success && !currentUser && (
            <div className="text-center">
              <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white mb-2">
                Authentication Successful!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You have been successfully signed in. Redirecting to your dashboard...
              </p>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthComplete;