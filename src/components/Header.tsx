import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { QrCodeIcon } from '@heroicons/react/24/solid';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout, userData } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Create QR', href: currentUser ? '/create' : '/create-guest' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Features', href: '/features' },
  ];

  // Navigation for logged-in users (header tabs)
  const loggedInNavigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Create QR', href: '/create' },
    { name: 'Features', href: '/features' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        <div className="flex lg:flex-1">
          <Link to="/" className="flex items-center space-x-2">
            <QrCodeIcon className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
              Lady<span className="text-primary-600">QR</span>
            </span>
          </Link>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 dark:text-gray-300"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation for non-logged-in users */}
        <div className={`hidden lg:flex lg:gap-x-12 ${currentUser ? 'lg:hidden' : ''}`}>
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-sm font-inter font-medium leading-6 transition-colors duration-200 ${
                location.pathname === item.href
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-900 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Navigation for logged-in users (header tabs) */}
        <div className={`hidden lg:flex lg:gap-x-12 ${!currentUser ? 'lg:hidden' : ''}`}>
          {loggedInNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-sm font-inter font-medium leading-6 transition-colors duration-200 ${
                location.pathname === item.href
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-900 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {isDark ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {currentUser ? (
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-2 text-sm font-inter font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                <UserCircleIcon className="h-6 w-6" />
                <span>{currentUser.displayName || userData?.fullName || currentUser.email}</span>
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
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      <Link
                        to="/pricing"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Pricing
                      </Link>
                    </Menu.Item>
                    <Menu.Item>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Profile
                      </Link>
                    </Menu.Item>
                    <Menu.Item>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-sm font-inter font-medium text-gray-900 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-primary-600 px-4 py-2 text-sm font-inter font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50 bg-black bg-opacity-25" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2">
                <QrCodeIcon className="h-8 w-8 text-primary-600" />
                <span className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                  Lady<span className="text-primary-600">QR</span>
                </span>
              </Link>
              <button
                type="button"
                className="rounded-md p-2 text-gray-700 dark:text-gray-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                {!currentUser && (
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block rounded-lg px-3 py-2 text-base font-inter font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
                <div className="py-6">
                  {currentUser ? (
                    <div className="space-y-2">
                      <Link
                        to="/dashboard"
                        className="block rounded-lg px-3 py-2 text-base font-inter font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/create"
                        className="block rounded-lg px-3 py-2 text-base font-inter font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Create QR
                      </Link>
                      <Link
                        to="/features"
                        className="block rounded-lg px-3 py-2 text-base font-inter font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Features
                      </Link>
                      <Link
                        to="/pricing"
                        className="block rounded-lg px-3 py-2 text-base font-inter font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Pricing
                      </Link>
                      <Link
                        to="/profile"
                        className="block rounded-lg px-3 py-2 text-base font-inter font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left rounded-lg px-3 py-2 text-base font-inter font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        to="/login"
                        className="block rounded-lg px-3 py-2 text-base font-inter font-medium text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        className="block rounded-lg px-3 py-2 text-base font-inter font-medium text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;