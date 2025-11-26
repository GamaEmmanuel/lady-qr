import React from 'react';
import { Link } from 'react-router-dom';
import { QrCodeIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="flex items-center space-x-2">
              <QrCodeIcon className="h-8 w-8 text-primary-500" />
              <span className="text-2xl font-poppins font-bold text-white">
                Lady<span className="text-primary-500">QR</span>
              </span>
            </div>
            <p className="text-sm leading-6 text-gray-300">
              {t('footer.tagline')}
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-poppins font-semibold leading-6 text-white">{t('footer.product')}</h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link to="/features" className="text-sm leading-6 text-gray-300 hover:text-white">
                      {t('footer.features')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/pricing" className="text-sm leading-6 text-gray-300 hover:text-white">
                      {t('footer.pricing')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/create" className="text-sm leading-6 text-gray-300 hover:text-white">
                      {t('footer.createQR')}
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-poppins font-semibold leading-6 text-white">{t('footer.company')}</h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link to="/contact" className="text-sm leading-6 text-gray-300 hover:text-white">
                      {t('footer.contact')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-poppins font-semibold leading-6 text-white">{t('footer.resources')}</h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link to="/faq" className="text-sm leading-6 text-gray-300 hover:text-white">
                      {t('footer.faq')}
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-poppins font-semibold leading-6 text-white">{t('footer.legal')}</h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link to="/privacy" className="text-sm leading-6 text-gray-300 hover:text-white">
                      {t('footer.privacy')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-sm leading-6 text-gray-300 hover:text-white">
                      {t('footer.terms')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/cookies" className="text-sm leading-6 text-gray-300 hover:text-white">
                      {t('footer.cookies')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24">
          <div className="text-center">
            <p className="text-xs leading-5 text-gray-400">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;