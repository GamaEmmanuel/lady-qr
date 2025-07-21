import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { plans } from '../data/plans';
import { 
  PlusIcon, 
  QrCodeIcon, 
  ChartBarIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { userData, subscription, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created');
  const [filterType, setFilterType] = useState('all');

  // Mock data for demonstration
  const mockQRCodes = [
    {
      id: '1',
      name: 'Sitio Web Principal',
      type: 'url',
      isDynamic: true,
      scanCount: 156,
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: '2',
      name: 'Tarjeta de Contacto',
      type: 'vcard',
      isDynamic: false,
      scanCount: 45,
      isActive: true,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10')
    },
    {
      id: '3',
      name: 'Menú Restaurante',
      type: 'menu',
      isDynamic: true,
      scanCount: 89,
      isActive: true,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-18')
    }
  ];

  const stats = [
    { name: 'Total QR Codes', value: mockQRCodes.length, icon: QrCodeIcon },
    { name: 'Total Scans', value: mockQRCodes.reduce((sum, qr) => sum + qr.scanCount, 0), icon: ChartBarIcon },
    { name: 'Active QRs', value: mockQRCodes.filter(qr => qr.isActive).length, icon: EyeIcon },
    { name: 'Current Plan', value: subscription?.planType ? plans.find(p => p.id === subscription.planType)?.name || 'Unknown' : 'Loading...', icon: ChartBarIcon }
  ];

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
      url: 'Sitio Web',
      vcard: 'Tarjeta de Contacto',
      text: 'Texto',
      email: 'Email',
      sms: 'SMS',
      wifi: 'WiFi',
      social: 'Redes Sociales',
      location: 'Ubicación',
      event: 'Evento',
      business: 'Negocio',
      menu: 'Menú',
      crypto: 'Cripto'
    };
    return names[type] || 'Desconocido';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-poppins font-bold text-gray-900 dark:text-white">
            Hello, {userData?.fullName}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your QR codes and review your statistics
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white">
                My QR Codes
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and edit your QR codes
              </p>
            </div>
            <Link
              to="/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create New QR
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
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
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort by
              </label>
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
        </div>

        {/* QR Codes List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
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
                {mockQRCodes.map((qr) => (
                  <tr key={qr.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                      {qr.scanCount}
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
                      {qr.createdAt.toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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

export default Dashboard;