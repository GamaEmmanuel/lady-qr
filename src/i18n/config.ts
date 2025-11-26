import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/es/translation.json';
import hiTranslation from './locales/hi/translation.json';
import frTranslation from './locales/fr/translation.json';
import deTranslation from './locales/de/translation.json';

const resources = {
  en: {
    translation: enTranslation
  },
  es: {
    translation: esTranslation
  },
  hi: {
    translation: hiTranslation
  },
  fr: {
    translation: frTranslation
  },
  de: {
    translation: deTranslation
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false,
    }
  });

export default i18n;

