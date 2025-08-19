import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { QRCode as QRCodeType } from '../types';
import QRPreview from '../components/QRPreview';
import QRAnalytics from '../components/QRAnalytics';
import { generateShortUrl } from '../utils/qrTracking';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  EyeIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

const QRDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [qrCode, setQrCode] = useState<QRCodeType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  useEffect(() => {
    const fetchQRCode = async () => {
      if (!id || !currentUser) return;

      try {
        const qrDoc = await getDoc(doc(db, 'qrcodes', id));

        if (!qrDoc.exists()) {
          navigate('/dashboard');
          return;
        }

        const qrData = qrDoc.data() as QRCodeType;

        // Security check
        if (qrData.userId !== currentUser.uid) {
          navigate('/dashboard');
          return;
        }

        setQrCode({ ...qrData, id: qrDoc.id });
      } catch (error) {
        console.error('Error fetching QR code:', error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchQRCode();
  }, [id, currentUser, navigate]);

  const handleToggleActive = async () => {
    if (!qrCode || !id) return;

    try {
      const newStatus = !qrCode.isActive;
      await updateDoc(doc(db, 'qrcodes', id), {
        isActive: newStatus,
        updatedAt: new Date()
      });

      setQrCode(prev => prev ? { ...prev, isActive: newStatus } : null);
    } catch (error) {
      console.error('Error updating QR code status:', error);
      alert('Error updating QR code status');
    }
  };

  const handleDelete = async () => {
    if (!qrCode || !id) return;

    if (!confirm('Are you sure you want to delete this QR code? This action cannot be undone.')) {
      return;
    }

    try {
      // In a real implementation, you'd want to soft delete or archive
      // For now, we'll just navigate back
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting QR code:', error);
      alert('Error deleting QR code');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            QR Code not found
          </h2>
          <Link to="/dashboard" className="text-primary-600 hover:text-primary-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      url: '🌐',
      vcard: '👤',
      text: '📝',
      email: '📧',
      sms: '💬',
      wifi: '📶',
      social: '📱',
      location: '📍',
      event: '📅',
      business: '🏢',
      menu: '🍽️',
      crypto: '₿'
    };
    return icons[type] || '📄';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{getTypeIcon(qrCode.type)}</div>
              <div>
                <h1 className="text-3xl font-poppins font-bold text-gray-900 dark:text-white">
                  {qrCode.name}
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    qrCode.isActive
                      ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {qrCode.isActive ? 'Active' : 'Paused'}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                    {qrCode.isDynamic ? 'Dynamic' : 'Static'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {qrCode.scanCount || 0} scans
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(`/create?edit=${id}`)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </button>

              <button
                onClick={handleToggleActive}
                className={`inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white ${
                  qrCode.isActive
                    ? 'bg-warning-600 hover:bg-warning-700'
                    : 'bg-success-600 hover:bg-success-700'
                }`}
              >
                {qrCode.isActive ? (
                  <>
                    <PauseIcon className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </button>

              <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-error-600 hover:bg-error-700"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <EyeIcon className="h-4 w-4 inline mr-2" />
              Overview
            </button>
            {qrCode.isDynamic && (
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <ChartBarIcon className="h-4 w-4 inline mr-2" />
                Analytics
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* QR Code Preview */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4">
                  QR Code
                </h3>

                <div className="flex justify-center mb-6">
                                    <QRPreview
                    data={generateShortUrl(qrCode.shortUrlId)}
                    customization={qrCode.customizationOptions}
                    size={250}
                  />
                </div>

                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors">
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    <span>Download PNG</span>
                  </button>

                  <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md transition-colors">
                    <ShareIcon className="h-5 w-5" />
                    <span>Share QR Code</span>
                  </button>
                </div>
              </div>
            </div>

            {/* QR Code Details */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4">
                  Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Basic Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                          {qrCode.type.charAt(0).toUpperCase() + qrCode.type.slice(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Mode:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                          {qrCode.isDynamic ? 'Dynamic' : 'Static'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Created:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                          {qrCode.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                          {qrCode.updatedAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Content
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(qrCode.content).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white break-all">
                            {typeof value === 'string' ? value : JSON.stringify(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {qrCode.isDynamic && qrCode.destinationUrl && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Redirect Information
                    </h4>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Short URL:</span>
                      <span className="ml-2 text-sm font-medium text-primary-600 dark:text-primary-400">
                        {generateShortUrl(qrCode.shortUrlId)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Destination:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white break-all">
                        {qrCode.destinationUrl}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <QRAnalytics qrCodeId={id!} />
        )}
      </div>
    </div>
  );
};

export default QRDetails;