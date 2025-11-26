import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  QrCodeIcon,
  PhotoIcon,
  PaintBrushIcon,
  DocumentIcon,
  SparklesIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { qrTypes as importedQrTypes } from '../data/qrTypes';
import analyticsOverviewImg from '../assets/analytics-overview.png';
import topCitiesImg from '../assets/top-cities.png';
import topPerformingQrsImg from '../assets/top-performing-qrs.png';
import SEO from '../components/SEO';
import {
  organizationSchema,
  websiteSchema,
  softwareApplicationSchema,
  homeBreadcrumbSchema
} from '../utils/seoConfig';

const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  // Redirect logged in users to dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const qrTypes = importedQrTypes;

  const customizationOptions = [
    {
      icon: PaintBrushIcon,
      title: t('home.customization.colors.title'),
      description: t('home.customization.colors.description'),
      features: t('home.customization.colors.features', { returnObjects: true }) as string[]
    },
    {
      icon: SparklesIcon,
      title: t('home.customization.shapes.title'),
      description: t('home.customization.shapes.description'),
      features: t('home.customization.shapes.features', { returnObjects: true }) as string[]
    },
    {
      icon: PhotoIcon,
      title: t('home.customization.logo.title'),
      description: t('home.customization.logo.description'),
      features: t('home.customization.logo.features', { returnObjects: true }) as string[]
    },
    {
      icon: DocumentIcon,
      title: t('home.customization.frames.title'),
      description: t('home.customization.frames.description'),
      features: t('home.customization.frames.features', { returnObjects: true }) as string[]
    }
  ];

  // Combine schemas for homepage
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema,
      websiteSchema,
      softwareApplicationSchema,
      homeBreadcrumbSchema,
    ],
  };

  return (
    <>
      <SEO
        title="Lady QR - Professional QR Code Generator with Analytics & Tracking"
        description="Create, customize, and track professional QR codes for your business. Generate dynamic QR codes with real-time analytics, custom designs, logos, and 20+ QR types. Free QR code generator with premium features."
        keywords="QR code generator, custom QR codes, dynamic QR codes, QR code analytics, free QR code, business QR codes, QR code maker, track QR codes, branded QR codes, QR code with logo, bulk QR codes, marketing QR codes"
        url="/"
        type="website"
        schema={combinedSchema}
      />
      <div className="overflow-hidden">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-400 to-accent-400 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              {t('home.hero.title')}{' '}
              <span className="text-primary-600">{t('home.hero.titleHighlight')}</span>{' '}
              {t('home.hero.titleEnd')}
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              {t('home.hero.subtitle')}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to={currentUser ? "/dashboard" : "/login"}
                className="rounded-md bg-primary-600 px-6 py-3 text-sm font-inter font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all duration-200 flex items-center space-x-2"
              >
                <span>{currentUser ? t('home.hero.ctaDashboard') : t('home.hero.ctaStart')}</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                to={currentUser ? "/create" : "/create-guest"}
                className="text-sm font-inter font-semibold leading-6 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
              >
                {currentUser ? t('home.hero.ctaCreateQR') : t('home.hero.ctaTryDemo')} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-accent-400 to-primary-400 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
            }}
          />
        </div>
      </div>

      {/* Analytics Dashboard Showcase */}
      <div className="bg-white dark:bg-gray-900 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-8">
            <h2 className="text-3xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {t('home.analytics.title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              {t('home.analytics.subtitle')}
            </p>
          </div>

          {/* Analytics Overview Screenshot */}
          <div className="mb-8">
            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
              <img
                src={analyticsOverviewImg}
                alt="Analytics Overview Dashboard"
                className="w-full h-auto"
              />
            </div>
            <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
              {t('home.analytics.overviewCaption')}
            </p>
          </div>

          {/* Two Column Screenshots */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Cities */}
            <div>
              <div className="relative rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
                <img
                  src={topCitiesImg}
                  alt="Top Cities Geographic Distribution"
                  className="w-full h-auto"
                />
              </div>
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('home.analytics.geographicTitle')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('home.analytics.geographicDesc')}
                </p>
              </div>
            </div>

            {/* Top Performing QRs */}
            <div>
              <div className="relative rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
                <img
                  src={topPerformingQrsImg}
                  alt="Top Performing QR Codes"
                  className="w-full h-auto"
                />
              </div>
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('home.analytics.performanceTitle')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('home.analytics.performanceDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* CTA for Analytics */}
          <div className="mt-8 text-center">
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 rounded-md bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-all duration-200"
            >
              <span>{t('home.analytics.cta')}</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* QR Types Grid */}
      <div className="bg-gray-50 dark:bg-gray-800 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {qrTypes.length} {t('home.qrTypes.title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              {t('home.qrTypes.subtitle')}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {qrTypes.map((type, index) => {
              return (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  {type.iconImage ? (
                    <img src={type.iconImage} alt={type.name} className="w-8 h-8 mb-3 object-contain" />
                  ) : type.icon ? (
                    <type.icon className="w-8 h-8 mb-3" style={{ color: type.iconColor }} />
                  ) : null}
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{type.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Static vs Dynamic Comparison */}
      <div className="bg-white dark:bg-gray-900 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white">
              {t('home.comparison.title')}
            </h3>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              {t('home.comparison.subtitle')}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Static QR */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <QrCodeIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                <h4 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                  {t('home.comparison.static.title')}
                </h4>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('home.comparison.static.description')}
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckIcon className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{t('home.comparison.static.feature1Title')}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('home.comparison.static.feature1Desc')}</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckIcon className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{t('home.comparison.static.feature2Title')}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('home.comparison.static.feature2Desc')}</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckIcon className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{t('home.comparison.static.feature3Title')}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('home.comparison.static.feature3Desc')}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-700">
                <p className="text-sm text-warning-700 dark:text-warning-300">
                  <strong>{t('home.comparison.static.limitationLabel')}</strong> {t('home.comparison.static.limitation')}
                </p>
              </div>
            </div>

            {/* Dynamic QR */}
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-8 border-2 border-primary-200 dark:border-primary-700">
              <div className="flex items-center space-x-3 mb-6">
                <ArrowPathIcon className="h-8 w-8 text-primary-600" />
                <h4 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                  {t('home.comparison.dynamic.title')}
                </h4>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('home.comparison.dynamic.description')}
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckIcon className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{t('home.comparison.dynamic.feature1Title')}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('home.comparison.dynamic.feature1Desc')}</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckIcon className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{t('home.comparison.dynamic.feature2Title')}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('home.comparison.dynamic.feature2Desc')}</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckIcon className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{t('home.comparison.dynamic.feature3Title')}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('home.comparison.dynamic.feature3Desc')}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary-100 dark:bg-primary-800/30 rounded-lg">
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  <strong>{t('home.comparison.dynamic.advantageLabel')}</strong> {t('home.comparison.dynamic.advantage')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customization Options */}
      <div className="bg-white dark:bg-gray-900 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white">
              {t('home.customization.title')}
            </h3>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              {t('home.customization.subtitle')}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {customizationOptions.map((option, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <option.icon className="h-8 w-8 text-primary-600" />
                  <h4 className="text-xl font-poppins font-bold text-gray-900 dark:text-white">
                    {option.title}
                  </h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{option.description}</p>
                <ul className="space-y-2">
                  {option.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2">
                      <CheckIcon className="h-4 w-4 text-success-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security & Reliability */}
      <div className="bg-white dark:bg-gray-900 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
            <div className="text-center mb-8">
              <ShieldCheckIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                {t('home.security.title')}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {t('home.security.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl mb-2">🔒</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('home.security.sslTitle')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('home.security.sslDesc')}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">☁️</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('home.security.cloudTitle')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('home.security.cloudDesc')}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('home.security.uptimeTitle')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('home.security.uptimeDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-poppins font-bold tracking-tight text-white sm:text-4xl">
              {t('home.cta.title')}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
              {t('home.cta.subtitle')}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-md bg-white px-6 py-3 text-sm font-inter font-semibold text-primary-600 shadow-sm hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200"
              >
                {t('home.cta.button')}
              </Link>
              <Link
                to="/pricing"
                className="text-sm font-inter font-semibold leading-6 text-white hover:text-primary-100 transition-colors duration-200"
              >
                {t('home.cta.link')} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Home;