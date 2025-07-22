import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  QrCodeIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  PauseIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const Archive: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created');
  const [filterType, setFilterType] = useState('all');
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [qrLoading, setQrLoading] = useState(true);

  // Fetch QR codes from Firestore
  React.useEffect(() => {
    const fetchQRCodes = async () => {
      if (!currentUser) return;
      
      try {
        setQrLoading(true);
        const qrCodesQuery = query(
          collection(db, 'qrcodes'),
          where('userId', '==', currentUser.uid)
        );
        
        const qrCodesSnapshot = await getDocs(qrCodesQuery);
        const qrCodesData = qrCodesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        }));
        
        setQrCodes(qrCodesData);
      } catch (error) {
        console.error('Error fetching QR codes:', error);
        setQrCodes([]);
      } finally {
        setQrLoading(false);
      }
    };

    fetchQRCodes();
  }, [currentUser]);

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

  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      url: 'Website',
      vcard: 'Contact Card',
      text: 'Text',
      email: 'Email',
      sms: 'SMS',
      wifi: 'WiFi',
      social: 'Social Media',
      location: 'Location',
      event: 'Event',
      business: 'Business',
      menu: 'Menu',
      crypto: 'Crypto'
    };
    return names[type] || 'Unknown';
  };

  // Filter and sort QR codes
  const filteredQRCodes = qrCodes
    .filter(qr => {
      const matchesSearch = qr.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const matchesType = filterType === 'all' || qr.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'updated':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'scans':
          return (b.scanCount || 0) - (a.scanCount || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-poppins font-bold text-gray-900 dark:text-white">
                QR Code History
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage and organize all your saved QR codes
              </p>
            </div>
            <Link
              to="/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <QrCodeIcon className="h-4 w-4 mr-2" />
              Create New QR Code
            </Link>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <QrCodeIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total QR Codes
                </p>
                <p className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                  {qrCodes.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active QR Codes
                </p>
                <p className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                  {qrCodes.filter(qr => qr.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MagnifyingGlassIcon className="h-8 w-8 text-accent-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Scans
                </p>
                <p className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                  {qrCodes.reduce((sum, qr) => sum + (qr.scanCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Codes Archive */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white">
                Your QR Codes
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                View, edit, and manage all your saved QR codes
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All types</option>
                <option value="url">Website</option>
                <option value="vcard">Contact Card</option>
                <option value="menu">Menu</option>
                <option value="business">Business</option>
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="wifi">WiFi</option>
              </select>
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="created">Creation date</option>
                <option value="updated">Last update</option>
                <option value="scans">Number of scans</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {/* QR Codes Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    QR Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Scans
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {qrLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredQRCodes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm || filterType !== 'all' ? 'No QR codes match your filters.' : 'No QR codes found.'}{' '}
                      <Link to="/create" className="text-primary-600 hover:text-primary-700">
                        Create your first QR code
                      </Link>
                    </td>
                  </tr>
                ) : filteredQRCodes.map((qr) => (
                  <tr 
                    key={qr.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => navigate(`/create?edit=${qr.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">{getTypeIcon(qr.type)}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {qr.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {qr.isDynamic ? 'Dynamic' : 'Static'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                        {getTypeName(qr.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {qr.scanCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        qr.isActive
                          ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {qr.isActive ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {qr.createdAt?.toLocaleDateString('en-US') || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 p-1 rounded">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded">
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded">
                          {qr.isActive ? (
                            <PauseIcon className="h-4 w-4" />
                          ) : (
                            <PlayIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button className="text-error-600 hover:text-error-900 dark:text-error-400 dark:hover:text-error-300 p-1 rounded">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Archive;