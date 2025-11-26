import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { plans } from '../data/plans';
import { getFunctions, httpsCallable } from 'firebase/functions';
import getStripe from '../utils/stripe';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import SEO from '../components/SEO';
import { generateProductSchema } from '../utils/seoConfig';

const Pricing: React.FC = () => {
  const { currentUser, subscription } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showDowngradeWarning, setShowDowngradeWarning] = useState(false);
  const [pendingPriceId, setPendingPriceId] = useState<string | undefined>(undefined);

  // Debug logging for subscription
  console.log('[Pricing] Subscription data:', subscription);
  console.log('[Pricing] Plan type:', subscription?.planType);

  // Find current plan, default to free if not found
  const currentPlan = subscription
    ? (plans.find(p => p.id === subscription.planType) || plans[0])
    : plans[0];

  console.log('[Pricing] Current plan:', currentPlan);

  // Auto-fix invalid subscription data
  useEffect(() => {
    const fixInvalidSubscription = async () => {
      if (!currentUser || !subscription) return;

      // If planType is missing or invalid, fix it
      if (!subscription.planType || !plans.find(p => p.id === subscription.planType)) {
        console.warn('[Pricing] Invalid or missing planType, fixing to "free"');

        try {
          // Find the subscription document
          const subscriptionsRef = collection(db, 'subscriptions');
          const q = query(subscriptionsRef, where('userId', '==', currentUser.uid), where('status', '==', 'active'));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const subDoc = querySnapshot.docs[0];
            await updateDoc(subDoc.ref, {
              planType: 'free',
              updatedAt: new Date()
            });
            console.log('[Pricing] Successfully updated subscription to free plan');

            // Also update user document
            await updateDoc(doc(db, 'users', currentUser.uid), {
              planType: 'free',
              subscriptionStatus: 'active',
              subscriptionUpdatedAt: new Date()
            });

            // Reload the page to refresh data
            setTimeout(() => window.location.reload(), 1000);
          }
        } catch (error) {
          console.error('[Pricing] Failed to fix subscription:', error);
        }
      }
    };

    fixInvalidSubscription();
  }, [currentUser, subscription]);

  const handleSubscribe = async (priceId: string | undefined, planId: string) => {
    console.log(`[Subscription] Initiating subscription process for priceId: ${priceId}`);
    if (!currentUser) {
      console.log('[Subscription] User not logged in. Redirecting to register.');
      window.location.href = '/register';
      return;
    }
    if (!priceId && planId !== 'free') {
      console.warn('[Subscription] No priceId provided. Aborting.');
      alert(t('pricing.errorNotAvailable'));
      return;
    }

    // Check if user is downgrading from basic to free
    if (currentPlan?.id === 'basic' && planId === 'free') {
      setPendingPriceId(priceId);
      setShowDowngradeWarning(true);
      return;
    }

    setIsLoading(true);
    console.log('[Subscription] Loading state set to true.');

    try {
      // Handle downgrade to free plan (no Stripe needed)
      if (planId === 'free') {
        console.log('[Subscription] Downgrading to free plan...');
        const functions = getFunctions();
        const downgradeToPlan = httpsCallable(functions, 'downgradeToPlan');

        await downgradeToPlan({ planId: 'free' });
        console.log('[Subscription] Successfully downgraded to free plan');
        alert(t('pricing.successDowngrade'));
        window.location.reload();
        return;
      }

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

  const handleDowngradeConfirm = () => {
    setShowDowngradeWarning(false);
    handleSubscribe(pendingPriceId, 'free');
  };

  // Schema for pricing page
  const pricingSchema = {
    '@context': 'https://schema.org',
    '@graph': plans.filter(p => p.price !== null).map(plan =>
      generateProductSchema(
        `Lady QR ${plan.name} Plan`,
        plan.price || 0,
        plan.id === 'free' ? 'Free plan with basic QR code features' :
        plan.id === 'basic' ? 'Professional QR code generator with analytics and unlimited dynamic QR codes' :
        'Enterprise QR code solution with advanced features and priority support'
      )
    ),
  };

  return (
    <>
      <SEO
        title="Pricing - Lady QR Professional QR Code Generator Plans"
        description="Choose the perfect QR code generator plan for your business. Start free with unlimited static QR codes. Upgrade for dynamic QR codes, analytics, custom branding, and more. Flexible monthly and annual pricing."
        keywords="QR code pricing, QR generator plans, free QR code, QR code subscription, business QR codes, dynamic QR pricing"
        url="/pricing"
        schema={pricingSchema}
      />
      <div className="bg-white dark:bg-gray-900 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">{t('pricing.title')}</h2>
            <p className="mt-1 text-4xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              {t('pricing.subtitle')}
            </p>
            <p className="mt-3 text-lg leading-7 text-gray-600 dark:text-gray-300">
              {t('pricing.description')}
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
                    {t('pricing.currentPlan')}
                  </h3>
                  <p className="text-sm text-primary-700 dark:text-primary-400">
                    {t('pricing.currentPlanDesc', { plan: t(`pricing.${currentPlan?.id || 'free'}.name`) })}
                    {currentPlan?.price && currentPlan.price > 0 && ` ($${currentPlan.price}/${t('pricing.perMonth')})`}
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
                    {t(`pricing.${plan.id}.name`)}
                  </h3>
                  {index === 1 && (
                    <p className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold leading-5 text-white">
                      {t('pricing.mostPopular')}
                    </p>
                  )}
                </div>
                <p className={`mt-2 text-sm leading-5 ${
                  index === 1 ? 'text-white/70' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {t(`pricing.${plan.id}.tagline`)}
                </p>
                <p className="mt-3 flex items-baseline gap-x-1">
                  <span className={`text-4xl font-poppins font-bold tracking-tight ${
                    index === 1 ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}>
                    {plan.price !== null ? `$${plan.price}` : t('pricing.contact')}
                  </span>
                  {plan.price !== null && (
                    <span className={`text-sm font-semibold leading-6 ${
                    index === 1 ? 'text-white/70' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    USD/{plan.interval === 'month' ? t('pricing.perMonth') : t('pricing.perYear')}
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
                onClick={() => !isCurrentPlan && handleSubscribe(plan.priceId, plan.id)}
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
                  ? t('pricing.currentPlanButton')
                  : plan.id === 'free'
                  ? currentPlan?.id === 'basic' ? t('pricing.downgradeButton') : t('pricing.selectPlan')
                  : plan.price === null
                  ? t('pricing.contactUs')
                  : isLoading
                  ? t('pricing.selectPlan')
                  : t('pricing.selectPlan')}
              </button>
            </div>
          )})}
        </div>

        {/* Downgrade Warning Modal */}
        {showDowngradeWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-warning-600" />
                <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white">
                  {t('pricing.downgradeWarningTitle')}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('pricing.downgradeWarningMessage', { count: 0 })}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDowngradeWarning(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md transition-colors"
                >
                  {t('pricing.downgradeCancel')}
                </button>
                <button
                  onClick={handleDowngradeConfirm}
                  disabled={isLoading}
                  className="flex-1 bg-warning-600 hover:bg-warning-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                >
                  {t('pricing.downgradeConfirm')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Pricing;