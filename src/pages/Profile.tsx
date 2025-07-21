import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { plans } from '../data/plans';
import { 
  UserCircleIcon,
  CreditCardIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const { currentUser, userData, subscription, updateUserProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: userData?.fullName || '',
    email: userData?.email || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentPlan = subscription ? plans.find(p => p.id === subscription.planType) : plans[0];

  // Show loading state while fetching subscription data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      await updateUserProfile({
        fullName: editForm.fullName,
        email: editForm.email
      });
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      fullName: userData?.fullName || '',
      email: userData?.email || ''
    });
    setIsEditing(false);
    setMessage(null);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-poppins font-bold text-gray-900 dark:text-white">
            Mi Perfil
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gestiona tu información personal y configuración de cuenta
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-700 text-success-700 dark:text-success-300'
              : 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-700 text-error-700 dark:text-error-300'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckIcon className="h-5 w-5 mr-2" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <UserCircleIcon className="h-8 w-8 text-primary-600" />
                  <h2 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white">
                    Información Personal
                  </h2>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Editar</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre completo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{userData?.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{userData?.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de registro
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {userData?.createdAt ? formatDate(userData.createdAt) : 'No disponible'}
                  </p>
                </div>

                {isEditing && (
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                    >
                      <CheckIcon className="h-4 w-4" />
                      <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-2 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-6">
                <ShieldCheckIcon className="h-8 w-8 text-primary-600" />
                <h2 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white">
                  Seguridad
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <KeyIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Contraseña</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Última actualización: Hace 30 días
                      </p>
                    </div>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Cambiar
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <BellIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Autenticación de dos factores</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Añade una capa extra de seguridad
                      </p>
                    </div>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Configurar
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-error-500">
              <div className="flex items-center space-x-3 mb-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-error-600" />
                <h2 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white">
                  Zona de Peligro
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-error-200 dark:border-error-700 rounded-lg bg-error-50 dark:bg-error-900/20">
                  <div>
                    <p className="font-medium text-error-800 dark:text-error-300">Eliminar cuenta</p>
                    <p className="text-sm text-error-600 dark:text-error-400">
                      Esta acción no se puede deshacer. Se eliminarán todos tus datos.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center space-x-2 bg-error-600 hover:bg-error-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CreditCardIcon className="h-6 w-6 text-primary-600" />
                <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white">
                  Plan Actual
                </h3>
              </div>

              <div className="space-y-4">
                <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-700">
                  <h4 className="text-xl font-poppins font-bold text-primary-900 dark:text-primary-100">
                    {currentPlan?.name}
                  </h4>
                  {currentPlan?.price && (
                    <p className="text-2xl font-bold text-primary-600 mt-1">
                      ${currentPlan.price}/mes
                    </p>
                  )}
                  <p className="text-sm text-primary-700 dark:text-primary-300 mt-2">
                    {subscription?.status === 'active' ? 'Activo' : 'Inactivo'}
                  </p>
                </div>

                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900 dark:text-white">Características incluidas:</h5>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {currentPlan?.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckIcon className="h-4 w-4 text-success-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <Link
                    to="/pricing"
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white text-center py-2 px-4 rounded-md transition-colors block"
                  >
                    {currentPlan?.id === 'gratis' ? 'Actualizar Plan' : 'Cambiar Plan'}
                  </Link>
                  {currentPlan?.id !== 'gratis' && (
                    <button className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-center py-2 px-4 rounded-md transition-colors">
                      Gestionar Facturación
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white mb-4">
                Estadísticas Rápidas
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">QR Codes creados:</span>
                  <span className="font-medium text-gray-900 dark:text-white">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Escaneos totales:</span>
                  <span className="font-medium text-gray-900 dark:text-white">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Último escaneo:</span>
                  <span className="font-medium text-gray-900 dark:text-white">Hace 2 horas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-error-600" />
                <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white">
                  Confirmar Eliminación
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                ¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer y se perderán todos tus datos, incluyendo códigos QR y estadísticas.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button className="flex-1 bg-error-600 hover:bg-error-700 text-white py-2 px-4 rounded-md transition-colors">
                  Eliminar Cuenta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;