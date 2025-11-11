import React, { useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { plans } from '../data/plans';
import { getFunctions, httpsCallable } from 'firebase/functions';
import getStripe from '../utils/stripe';

const Pricing: React.FC = () => {
  const { currentUser, subscription } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const currentPlan = subscription ? plans.find(p => p.id === subscription.planType) : plans[0];

  const handleSubscribe = async (priceId: string | undefined) => {
    console.log(`[Subscription] Initiating subscription process for priceId: ${priceId}`);
    if (!currentUser) {
      console.log('[Subscription] User not logged in. Redirecting to register.');
      window.location.href = '/register';
      return;
    }
    if (!priceId) {
      console.warn('[Subscription] No priceId provided. Aborting.');
      alert('This plan is not available for online purchase. Please contact us.');
      return;
    }

    setIsLoading(true);
    console.log('[Subscription] Loading state set to true.');

    try {
      console.log('[Subscription] Creating Stripe checkout session...');
      const functions = getFunctions();
      // The cloud function name should be the same as the exported function name in the backend
      const createCheckoutSession = httpsCallable(functions, 'createStripeCheckoutSession');
      console.log('[Subscription] httpsCallable instance created for createStripeCheckoutSession.');

      const response = await createCheckoutSession({
        priceId,
        origin: window.location.origin
      });

      const sessionId = (response.data as any).sessionId;
      console.log(`[Subscription] Successfully created checkout session: ${sessionId}`);

      const stripe = await getStripe();
      if (stripe && sessionId) {
        console.log('[Subscription] Redirecting to Stripe checkout...');
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('[Subscription] Stripe redirect error:', error);
          alert('An error occurred during the checkout process.');
        }
      } else {
        console.error('[Subscription] Stripe could not be initialized or session ID is missing.');
        alert('Stripe could not be initialized.');
      }
    } catch (error) {
      console.error('[Subscription] Error creating checkout session:', error);
      alert('An error occurred. Please try again.');
    } finally {
      console.log('[Subscription] Loading state set to false.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">Pricing</h2>
          <p className="mt-1 text-4xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Plans designed for modern businesses
          </p>
          <p className="mt-3 text-lg leading-7 text-gray-600 dark:text-gray-300">
            Start free and upgrade as your business grows. All plans include professional support and multiple payment methods.
          </p>
        </div>

        {/* Current Plan Notification */}
        {currentUser && (
          <div className="isolate mx-auto mt-4 max-w-md">
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-primary-800 dark:text-primary-300">
                    Current Plan
                  </h3>
                  <p className="text-sm text-primary-700 dark:text-primary-400">
                    You are currently subscribed to the <strong>{currentPlan?.name}</strong> plan
                    {currentPlan?.price && ` ($${currentPlan.price}/month)`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="isolate mx-auto mt-6 grid max-w-md grid-cols-1 gap-y-6 sm:mt-8 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-6">
          {plans.map((plan, index) => {
            const isCurrentPlan = plan.id === currentPlan?.id;
            return (
            <div
              key={plan.id}
              className={`flex flex-col justify-between rounded-2xl p-5 ${
                index === 1
                  ? 'bg-primary-600 text-white ring-2 ring-primary-600'
                  : 'bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className={`text-lg font-poppins font-semibold leading-7 ${
                    index === 1 ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {plan.name}
                  </h3>
                  {index === 1 && (
                    <p className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold leading-5 text-white">
                      Most popular
                    </p>
                  )}
                </div>
                <p className={`mt-2 text-sm leading-5 ${
                  index === 1 ? 'text-white/70' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {plan.id === 'free' && 'Perfect to get started'}
                  {plan.id === 'basic' && 'Ideal for small businesses'}
                  {plan.id === 'business' && 'For large organizations'}
                </p>
                <p className="mt-3 flex items-baseline gap-x-1">
                  <span className={`text-4xl font-poppins font-bold tracking-tight ${
                    index === 1 ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {plan.price !== null ? `$${plan.price}` : 'Contact'}
                  </span>
                  {plan.price !== null && (
                    <span className={`text-sm font-semibold leading-6 ${
                    index === 1 ? 'text-white/70' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    USD/{plan.interval === 'month' ? 'month' : 'year'}
                  </span>
                  )}
                </p>
                <ul className={`mt-4 space-y-1.5 text-sm leading-5 ${
                  index === 1 ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {plan.features.map((feature) => {
                    const isNegativeFeature = (feature.startsWith('Sin ') || feature.startsWith('No ')) && !feature.includes('marca');
                    return (
                    <li key={feature} className="flex gap-x-2">
                      {isNegativeFeature ? (
                        <XMarkIcon
                          className={`h-5 w-5 flex-none ${
                            index === 1 ? 'text-red-300' : 'text-red-500'
                          }`}
                          aria-hidden="true"
                        />
                      ) : (
                        <CheckIcon
                          className={`h-5 w-5 flex-none ${
                            index === 1 ? 'text-white' : 'text-primary-600'
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
              <button
                onClick={() => !isCurrentPlan && handleSubscribe(plan.priceId)}
                disabled={isLoading || isCurrentPlan}
                className={`mt-5 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 transition-all duration-200 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : isCurrentPlan
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : index === 1
                    ? 'bg-white text-primary-600 shadow-sm hover:bg-gray-50'
                    : 'bg-primary-600 text-white shadow-sm hover:bg-primary-500'
                }`}
              >
                {isCurrentPlan
                  ? 'Current Plan'
                  : plan.id === 'free'
                  ? 'Start free'
                  : plan.price === null
                  ? 'Contact Sales'
                  : isLoading
                  ? 'Processing...'
                  : 'Subscribe'}
              </button>
            </div>
          )})}
        </div>
      </div>
    </div>
  );
};

export default Pricing;