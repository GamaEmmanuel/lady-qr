import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { plans } from '../data/plans';
import { loadStripe } from '@stripe/stripe-js';
import { env } from '../config/env';
import {
  CheckIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Initialize Stripe with environment variable (guard against empty key)
const stripePromise = env.stripe.publishableKey ? loadStripe(env.stripe.publishableKey) : null;

const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, subscription } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('basico');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'oxxo' | 'pix'>('card');
  const [formData, setFormData] = useState({
    email: currentUser?.email || '',
    fullName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    country: 'MX',
    taxId: ''
  });

  // Get plan from URL params or default to basico
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const planParam = params.get('plan');
    if (planParam && plans.find(p => p.id === planParam)) {
      setSelectedPlan(planParam);
    }
  }, [location]);

  const plan = plans.find(p => p.id === selectedPlan);
  const currentPlan = subscription ? plans.find(p => p.id === subscription.planType) : plans[0];

  if (!plan || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Plan no encontrado
          </h2>
          <Link to="/pricing" className="text-primary-600 hover:text-primary-700">
            Volver a precios
          </Link>
        </div>
      </div>
    );
  }

  const getPrice = () => {
    if (!plan.price) return 0;
    return billingCycle === 'yearly' ? plan.price * 10 : plan.price; // 2 months free on yearly
  };

  const getSavings = () => {
    if (!plan.price || billingCycle === 'monthly') return 0;
    return plan.price * 2; // 2 months free
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, you would:
      // 1. Create payment intent with Stripe
      // 2. Process payment
      // 3. Update user subscription in database
      // 4. Send confirmation email

      alert(`¡Pago procesado exitosamente! Bienvenido al plan ${plan.name}`);
      navigate('/dashboard');
    } catch (error) {
      alert('Error al procesar el pago. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'card', name: 'Tarjeta de Crédito/Débito', icon: '💳', countries: ['MX', 'CO', 'AR', 'CL', 'PE'] },
    { id: 'oxxo', name: 'OXXO (Efectivo)', icon: '🏪', countries: ['MX'] },
    { id: 'pix', name: 'PIX', icon: '📱', countries: ['BR'] }
  ];

  const countries = [
    { code: 'MX', name: 'México', currency: 'MXN' },
    { code: 'CO', name: 'Colombia', currency: 'COP' },
    { code: 'AR', name: 'Argentina', currency: 'ARS' },
    { code: 'CL', name: 'Chile', currency: 'CLP' },
    { code: 'PE', name: 'Perú', currency: 'PEN' },
    { code: 'BR', name: 'Brasil', currency: 'BRL' }
  ];

  const selectedCountry = countries.find(c => c.code === formData.country);
  const availablePaymentMethods = paymentMethods.filter(pm =>
    pm.countries.includes(formData.country)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Key missing warning */}
        {!env.stripe.publishableKey && (
          <div className="mb-4 p-3 rounded-md border border-yellow-300 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              Stripe publishable key is not set. Define VITE_STRIPE_PUBLISHABLE_KEY to enable payments.
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <Link
            to="/pricing"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to pricing
          </Link>
          <h1 className="text-3xl font-poppins font-bold text-gray-900 dark:text-white">
            Complete Subscription
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Complete your subscription to the {plan.name} plan
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 h-fit">
            <h2 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white mb-6">
              Order Summary
            </h2>

            {/* Plan Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Plan
              </label>
              <div className="space-y-2">
                {plans.filter(p => p.price !== null).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedPlan === p.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{p.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {p.features.slice(0, 2).join(', ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 dark:text-white">
                          ${p.price}/mes
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Billing Cycle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Billing Cycle
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    billingCycle === 'monthly'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">Mensual</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ${getPrice()}/month
                  </div>
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`p-3 rounded-lg border-2 transition-all relative ${
                    billingCycle === 'yearly'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {getSavings() > 0 && (
                    <div className="absolute -top-2 -right-2 bg-success-500 text-white text-xs px-2 py-1 rounded-full">
                      Save ${getSavings()}
                    </div>
                  )}
                  <div className="font-medium text-gray-900 dark:text-white">Annual</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ${getPrice()}/year
                  </div>
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {plan.name} Plan ({billingCycle === 'monthly' ? 'Monthly' : 'Annual'})
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    ${getPrice()} {selectedCountry?.currency}
                  </span>
                </div>
                {getSavings() > 0 && (
                  <div className="flex justify-between text-success-600">
                    <span>Annual discount</span>
                    <span>-${getSavings()} {selectedCountry?.currency}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Tax (16%)</span>
                  <span>${Math.round(getPrice() * 0.16)} {selectedCountry?.currency}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>${Math.round(getPrice() * 1.16)} {selectedCountry?.currency}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Included */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Included in your plan:
              </h3>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <CheckIcon className="h-4 w-4 text-success-600 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white mb-6">
              Payment Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Country Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {availablePaymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`p-4 rounded-lg border-2 transition-all flex items-center space-x-3 ${
                        paymentMethod === method.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="juan@ejemplo.com"
                  />
                </div>
              </div>

              {/* Payment Details */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                      maxLength={19}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                        maxLength={5}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').substring(0, 4))}
                        maxLength={4}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'oxxo' && (
                <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="h-6 w-6 text-warning-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-warning-800 dark:text-warning-300">
                        OXXO Payment
                      </h4>
                      <p className="text-sm text-warning-700 dark:text-warning-400 mt-1">
                        After confirming, you'll receive a barcode to pay at any OXXO store.
                        Your subscription will activate once payment is processed (24-48 hours).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'pix' && (
                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">📱</span>
                    <div>
                      <h4 className="font-medium text-primary-800 dark:text-primary-300">
                        PIX Payment
                      </h4>
                      <p className="text-sm text-primary-700 dark:text-primary-400 mt-1">
                        After confirming, you'll receive a QR code to pay with PIX.
                        Payment is processed instantly.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tax ID for some countries */}
              {['MX', 'BR', 'AR'].includes(formData.country) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {formData.country === 'MX' ? 'RFC' :
                     formData.country === 'BR' ? 'CPF/CNPJ' :
                     'CUIT/CUIL'} (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder={formData.country === 'MX' ? 'XAXX010101000' :
                                formData.country === 'BR' ? '000.000.000-00' :
                                '00-00000000-0'}
                  />
                </div>
              )}

              {/* Security Notice */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-6 w-6 text-success-600" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Secure Payment
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your information is protected with 256-bit SSL encryption.
                      Processed by Stripe, the global leader in secure payments.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <CreditCardIcon className="h-5 w-5" />
                    <span>
                      {paymentMethod === 'card' ? 'Pagar Ahora' :
                       paymentMethod === 'oxxo' ? 'Generar Código OXXO' :
                       'Generar Código PIX'} - ${Math.round(getPrice() * 1.16)} {selectedCountry?.currency}
                    </span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                By continuing, you accept our{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-700">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-700">
                  Privacy Policy
                </Link>
                . Your subscription will renew automatically.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;