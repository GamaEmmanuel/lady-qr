import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Transition } from '@headlessui/react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    // Update the HTML lang attribute
    document.documentElement.lang = languageCode;
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center space-x-1 p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
        <GlobeAltIcon className="h-5 w-5" />
        <span className="text-lg">{currentLanguage.flag}</span>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            {languages.map((language) => (
              <Menu.Item key={language.code}>
                {({ active }) => (
                  <button
                    onClick={() => changeLanguage(language.code)}
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700' : ''
                    } ${
                      i18n.language === language.code ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                  >
                    <span className="mr-3 text-lg">{language.flag}</span>
                    <span className="flex-1 text-left">{language.name}</span>
                    {i18n.language === language.code && (
                      <span className="text-primary-600 dark:text-primary-400">✓</span>
                    )}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default LanguageSwitcher;

