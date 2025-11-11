import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { plans } from '../data/plans';
import { downloadQRCode } from '../utils/downloadQR';
import { generateShortUrl } from '../utils/qrTracking';
import ConfirmDialog from '../components/ConfirmDialog';
import QRPreview from '../components/QRPreview';
import D3Area from '../components/charts/D3Area';
import D3Donut from '../components/charts/D3Donut';
import { useAggregateAnalytics } from '../hooks/useAggregateAnalytics';
import {
  QrCodeIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  PauseIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { currentUser, userData, subscription } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created');
  const [filterType, setFilterType] = useState('all');
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [qrLoading, setQrLoading] = useState(true);

  // Confirmation dialog state
  const [pauseDialog, setPauseDialog] = useState<{ isOpen: boolean; qrId: string | null; currentStatus: boolean }>({
    isOpen: false,
    qrId: null,
    currentStatus: false
  });
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; qrId: string | null }>({
    isOpen: false,
    qrId: null
  });

  // QR Preview modal state
  const [previewQR, setPreviewQR] = useState<any | null>(null);

  // Aggregate analytics
  const { analytics: aggregateAnalytics, loading: analyticsLoading } = useAggregateAnalytics();

  // Fetch QR codes from Firestore
  React.useEffect(() => {
    const fetchQRCodes = async () => {
      if (!currentUser) return;

      try {
        setQrLoading(true);
        const primaryQuery = query(
          collection(db, 'qrcodes'),
          where('userId', '==', currentUser.uid)
        );

        const primarySnap = await getDocs(primaryQuery);
        let allDocs = primarySnap.docs;

        // Fallback for legacy documents that might use different ownership fields
        if (primarySnap.empty) {
          const [ownerIdSnap, userIDSnap] = await Promise.all([
            getDocs(query(collection(db, 'qrcodes'), where('ownerId', '==', currentUser.uid))),
            getDocs(query(collection(db, 'qrcodes'), where('userID', '==', currentUser.uid)))
          ]);

          const merged: Record<string, typeof allDocs[number]> = {};
          [...ownerIdSnap.docs, ...userIDSnap.docs].forEach((d) => {
            merged[d.id] = d;
          });
          allDocs = Object.values(merged);
        }

        const qrCodesData = allDocs.map(d => {
          const data: any = d.data();
          return ({
            id: d.id,
            ...data,
            // Normalize ownership field for UI safety
            userId: data.userId || data.ownerId || data.userID || '',
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || new Date()),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt || new Date())
          });
        }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

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

  const stats = [
    { name: 'Total QR Codes', value: qrCodes.length, icon: QrCodeIcon, clickable: true, navigationIcon: ArrowTopRightOnSquareIcon },
    { name: 'Total Scans', value: qrCodes.reduce((sum, qr) => sum + (qr.scanCount || 0), 0), icon: ChartBarIcon },
    { name: 'Active QRs', value: qrCodes.filter(qr => qr.isActive).length, icon: EyeIcon, clickable: true, navigationIcon: ArrowTopRightOnSquareIcon },
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
      menu: '🍽️'
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
      menu: 'Menú'
    };
    return names[type] || 'Desconocido';
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

  // Button Handlers
  const handleView = (qrId: string) => {
    const qr = qrCodes.find(q => q.id === qrId);
    if (qr) {
      setPreviewQR(qr);
    }
  };

  const handleEdit = (qrId: string) => {
    navigate(`/create?edit=${qrId}`);
  };

  const handleDownload = async (qr: any) => {
    try {
      const qrData = generateShortUrl(qr.shortUrlId || qr.id);
      await downloadQRCode({
        data: qrData,
        filename: qr.name || 'qr-code',
        foregroundColor: qr.customizationOptions?.foregroundColor,
        backgroundColor: qr.customizationOptions?.backgroundColor,
        logoUrl: qr.customizationOptions?.logoUrl
      });
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Error downloading QR code. Please try again.');
    }
  };

  const handlePauseClick = (qrId: string, currentStatus: boolean) => {
    setPauseDialog({ isOpen: true, qrId, currentStatus });
  };

  const handlePauseConfirm = async () => {
    if (!pauseDialog.qrId) return;

    try {
      const newStatus = !pauseDialog.currentStatus;
      await updateDoc(doc(db, 'qrcodes', pauseDialog.qrId), {
        isActive: newStatus,
        updatedAt: new Date()
      });

      // Update local state
      setQrCodes(prevCodes =>
        prevCodes.map(qr =>
          qr.id === pauseDialog.qrId
            ? { ...qr, isActive: newStatus, updatedAt: new Date() }
            : qr
        )
      );
    } catch (error) {
      console.error('Error updating QR code status:', error);
      alert('Error updating QR code status. Please try again.');
    }
  };

  const handleDeleteClick = (qrId: string) => {
    setDeleteDialog({ isOpen: true, qrId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.qrId) return;

    try {
      await deleteDoc(doc(db, 'qrcodes', deleteDialog.qrId));

      // Update local state
      setQrCodes(prevCodes => prevCodes.filter(qr => qr.id !== deleteDialog.qrId));
    } catch (error) {
      console.error('Error deleting QR code:', error);
      alert('Error deleting QR code. Please try again.');
    }
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
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${
                stat.clickable ? 'cursor-pointer hover:shadow-md transition-all duration-200' : ''
              }`}
              onClick={stat.clickable ? () => navigate('/archive') : undefined}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                    {stat.name}
                    {stat.navigationIcon && (
                      <stat.navigationIcon className="h-3 w-3 ml-1 text-gray-400" />
                    )}
                  </p>
                  <p className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* QR Codes Archive */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white">
                My QR Codes History
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and edit your saved QR codes
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
                      No QR codes found. <Link to="/create" className="text-primary-600 hover:text-primary-700">Create your first QR code</Link>
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
                      {qr.createdAt?.toLocaleDateString('es-ES') || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleView(qr.id)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 p-1 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          title="View details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(qr.id)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(qr)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Download"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePauseClick(qr.id, qr.isActive)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title={qr.isActive ? 'Pause' : 'Activate'}
                        >
                          {qr.isActive ? (
                            <PauseIcon className="h-4 w-4" />
                          ) : (
                            <PlayIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(qr.id)}
                          className="text-error-600 hover:text-error-900 dark:text-error-400 dark:hover:text-error-300 p-1 rounded hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
                          title="Delete"
                        >
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

        {/* Aggregate Analytics Section */}
        {!analyticsLoading && aggregateAnalytics && aggregateAnalytics.totalScans > 0 && (
          <div className="space-y-6 mt-8">
            {/* Section Header */}
            <div>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                Analytics Overview
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Performance metrics across all your QR codes
              </p>
            </div>

            {/* Active QR Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">This Week</p>
                    <p className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                      {aggregateAnalytics.scansThisWeek.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {aggregateAnalytics.scansThisWeek >= aggregateAnalytics.scansLastWeek ? (
                      <ArrowTrendingUpIcon className="h-8 w-8 text-success-600" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-8 w-8 text-error-600" />
                    )}
                  </div>
                </div>
                {aggregateAnalytics.scansLastWeek > 0 && (
                  <p className={`text-xs mt-2 ${
                    aggregateAnalytics.scansThisWeek >= aggregateAnalytics.scansLastWeek
                      ? 'text-success-600'
                      : 'text-error-600'
                  }`}>
                    {aggregateAnalytics.scansThisWeek >= aggregateAnalytics.scansLastWeek ? '+' : ''}
                    {(((aggregateAnalytics.scansThisWeek - aggregateAnalytics.scansLastWeek) / aggregateAnalytics.scansLastWeek) * 100).toFixed(1)}%
                    {' '}vs last week
                  </p>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg per QR</p>
                    <p className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                      {aggregateAnalytics.averageScansPerQR.toFixed(1)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-8 w-8 text-primary-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Scans per QR code
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Peak Hour</p>
                    <p className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                      {aggregateAnalytics.peakHour}:00
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-8 w-8 text-accent-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Most active time
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Scans Today</p>
                    <p className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                      {aggregateAnalytics.scansToday.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <EyeIcon className="h-8 w-8 text-warning-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Activity today
                </p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Total Scans Over Time */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white">
                    Scans Over Time
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Last 30 days</span>
                </div>
                <D3Area
                  data={Object.entries(aggregateAnalytics.dateStats)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, count]) => ({ x: new Date(date), y: count }))}
                  height={280}
                />
              </div>

              {/* OS Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4">
                  Platform Distribution
                </h3>
                <D3Donut
                  data={Object.entries(aggregateAnalytics.osStats)
                    .sort(([,a], [,b]) => b - a)
                    .map(([os, count]) => ({
                      name: `${os} (${count.toLocaleString()})`,
                      value: count
                    }))}
                  height={280}
                />
              </div>
            </div>

            {/* Top Performing QR Codes & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performing QR Codes */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
                <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4">
                  Top Performing QR Codes
                </h3>
                <div className="space-y-3 flex-1">
                  {aggregateAnalytics.topQRCodes.slice(0, 5).map((qr, index) => (
                    <div
                      key={qr.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => navigate(`/create?edit=${qr.id}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {qr.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {qr.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {qr.scanCount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">scans</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
                <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3 flex-1">
                  {aggregateAnalytics.recentScans.slice(0, 5).map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                        <EyeIcon className="h-4 w-4 text-success-600 dark:text-success-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {scan.qrCodeName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {scan.location.city}, {scan.location.country} • {scan.deviceInfo.type}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {new Date(scan.scannedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={pauseDialog.isOpen}
        onClose={() => setPauseDialog({ isOpen: false, qrId: null, currentStatus: false })}
        onConfirm={handlePauseConfirm}
        title={pauseDialog.currentStatus ? 'Pause QR Code?' : 'Activate QR Code?'}
        message={
          pauseDialog.currentStatus
            ? 'This QR code will stop redirecting users when scanned. You can reactivate it at any time.'
            : 'This QR code will start redirecting users when scanned.'
        }
        confirmText={pauseDialog.currentStatus ? 'Pause' : 'Activate'}
        confirmButtonClass={pauseDialog.currentStatus ? 'bg-warning-600 hover:bg-warning-700' : 'bg-success-600 hover:bg-success-700'}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, qrId: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete QR Code?"
        message="This action cannot be undone. The QR code and all its analytics data will be permanently deleted."
        confirmText="Delete"
        confirmButtonClass="bg-error-600 hover:bg-error-700"
      />

      {/* QR Preview Modal */}
      {previewQR && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewQR(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white">
                  {previewQR.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {getTypeName(previewQR.type)} • {previewQR.isDynamic ? 'Dynamic' : 'Static'}
                </p>
              </div>
              <button
                onClick={() => setPreviewQR(null)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex justify-center mb-4">
              <QRPreview
                data={generateShortUrl(previewQR.shortUrlId || previewQR.id)}
                customization={previewQR.customizationOptions || {}}
                size={300}
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Scans</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{previewQR.scanCount || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Status</p>
                  <p className={`font-semibold ${previewQR.isActive ? 'text-success-600' : 'text-gray-500'}`}>
                    {previewQR.isActive ? 'Active' : 'Paused'}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setPreviewQR(null);
                    handleEdit(previewQR.id);
                  }}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium"
                >
                  Edit QR Code
                </button>
                <button
                  onClick={() => {
                    handleDownload(previewQR);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Download
                </button>
              </div>

              <button
                onClick={() => {
                  setPreviewQR(null);
                  handleEdit(previewQR.id);
                }}
                className="w-full mt-2 px-4 py-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors font-medium text-sm"
              >
                View Full Details & Analytics →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;