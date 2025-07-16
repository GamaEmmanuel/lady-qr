import React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { plans } from '../data/plans';

const Pricing: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">Pricing</h2>
          <p className="mt-2 text-4xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Plans designed for modern businesses
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Start free and upgrade as your business grows. All plans include professional support and multiple payment methods.
          </p>
        </div>
        
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-4 lg:gap-x-8">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`flex flex-col justify-between rounded-3xl p-8 xl:p-10 ${
                index === 2 
                  ? 'bg-primary-600 text-white ring-2 ring-primary-600' 
                  : 'bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className={`text-lg font-poppins font-semibold leading-8 ${
                    index === 2 ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {plan.name}
                  </h3>
                  {index === 2 && (
                    <p className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold leading-5 text-white">
                      Most popular
                    </p>
                  )}
                </div>
                <p className={`mt-4 text-sm leading-6 ${
                  index === 2 ? 'text-white/70' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {plan.id === 'gratis' && 'Perfect to get started'}
                  {plan.id === 'basico' && 'Ideal for small businesses'}
                  {plan.id === 'profesional' && 'For growing companies'}
                  {plan.id === 'negocios' && 'For large organizations'}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className={`text-4xl font-poppins font-bold tracking-tight ${
                    index === 2 ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {plan.price !== null ? `$${plan.price}` : 'Contact'}
                  </span>
                  {plan.price !== null && (
                    <span className={`text-sm font-semibold leading-6 ${
                    index === 2 ? 'text-white/70' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    USD/{plan.interval === 'month' ? 'month' : 'year'}
                  </span>
                  )}
                </p>
                <ul className={`mt-8 space-y-3 text-sm leading-6 ${
                  index === 2 ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {plan.features.map((feature) => {
                    const isNegativeFeature = (feature.startsWith('Sin ') || feature.startsWith('No ')) && !feature.includes('marca');
                    return (
                    <li key={feature} className="flex gap-x-3">
                      {isNegativeFeature ? (
                        <XMarkIcon
                          className={`h-6 w-5 flex-none ${
                            index === 2 ? 'text-red-300' : 'text-red-500'
                          }`}
                          aria-hidden="true"
                        />
                      ) : (
                        <CheckIcon
                          className={`h-6 w-5 flex-none ${
                            index === 2 ? 'text-white' : 'text-primary-600'
                          }`}
                          aria-hidden="true"
                        />
                      )}
                      {feature}
                    </li>
                    );
                  })}
                </ul>
              </div>
              <Link
                to={plan.id === 'gratis' ? '/register' : plan.id === 'negocios' ? '/contact' : '/checkout'}
                className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 transition-all duration-200 ${
                  index === 2
                    ? 'bg-white text-primary-600 shadow-sm hover:bg-gray-50'
                    : 'bg-primary-600 text-white shadow-sm hover:bg-primary-500'
                }`}
              >
                {plan.id === 'gratis' ? 'Start free' : plan.id === 'negocios' ? 'Contact Sales' : 'Subscribe'}
              </Link>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="mt-16 bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
          <h3 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white text-center mb-6">
            Available Payment Methods
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-white dark:bg-gray-700 rounded-lg">
              <div className="text-2xl mb-2">💳</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Cards</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Visa, Mastercard</div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-700 rounded-lg">
              <div className="text-2xl mb-2">🏪</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">PayPal</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Digital wallet</div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-700 rounded-lg">
              <div className="text-2xl mb-2">🏦</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Bank Transfer</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">ACH/Wire</div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-700 rounded-lg">
              <div className="text-2xl mb-2">📱</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Apple Pay</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Mobile payment</div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h3 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I change plans at any time?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time from your control panel.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                What happens to my QR codes if I cancel?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Static codes will continue working forever. Dynamic codes will work for an additional 30 days.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Do you offer discounts for annual payment?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, by paying annually you get 2 months free on all paid plans.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is support available 24/7?
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, our support team is available 24/7 via email and chat for all paid plans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;