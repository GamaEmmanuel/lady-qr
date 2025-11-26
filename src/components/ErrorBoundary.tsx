import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught:', error, errorInfo);

    // Firebase Crashlytics automatically captures console.error
    // Also manually log for better tracking
    if (typeof window !== 'undefined') {
      // Log error details for Firebase Crashlytics
      console.error('React Error Boundary:', {
        error: error.toString(),
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });

      // If you want to add custom attributes (optional):
      // import { analytics } from '../config/firebase';
      // logEvent(analytics, 'error_boundary_triggered', {
      //   error_message: error.message,
      //   error_stack: error.stack,
      // });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-20 w-20 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Oops! Something went wrong
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-8">
              We're sorry for the inconvenience. The error has been logged and we'll fix it soon.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full rounded-md bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-500 transition-colors"
              >
                Go to Homepage
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Reload Page
              </button>

              <Link
                to="/contact"
                className="block text-sm text-primary-600 hover:text-primary-500 transition-colors"
              >
                Report this issue
              </Link>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-48">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

