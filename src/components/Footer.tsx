import React from 'react';
import { Link } from 'react-router-dom';
import { QrCodeIcon } from '@heroicons/react/24/solid';

const Footer: React.FC = () => {
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
              The most complete QR code platform for businesses worldwide. 
              Create, customize and manage your QR codes with ease.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.328-1.297L3.182 17.73l-1.298-1.297l1.039-1.939c-.807-.88-1.297-2.031-1.297-3.328c0-2.609 2.109-4.717 4.717-4.717s4.717 2.108 4.717 4.717c0 1.297-.49 2.448-1.297 3.328l1.039 1.939l-1.297 1.297l-1.939-1.039c-.88.807-2.031 1.297-3.328 1.297z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-poppins font-semibold leading-6 text-white">Product</h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link to="/features" className="text-sm leading-6 text-gray-300 hover:text-white">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link to="/pricing" className="text-sm leading-6 text-gray-300 hover:text-white">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link to="/create" className="text-sm leading-6 text-gray-300 hover:text-white">
                      Create QR
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-poppins font-semibold leading-6 text-white">Company</h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link to="/about" className="text-sm leading-6 text-gray-300 hover:text-white">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-sm leading-6 text-gray-300 hover:text-white">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link to="/blog" className="text-sm leading-6 text-gray-300 hover:text-white">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-poppins font-semibold leading-6 text-white">Resources</h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link to="/faq" className="text-sm leading-6 text-gray-300 hover:text-white">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link to="/api" className="text-sm leading-6 text-gray-300 hover:text-white">
                      API
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-poppins font-semibold leading-6 text-white">Legal</h3>
                <ul className="mt-6 space-y-4">
                  <li>
                    <Link to="/privacy" className="text-sm leading-6 text-gray-300 hover:text-white">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-sm leading-6 text-gray-300 hover:text-white">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link to="/cookies" className="text-sm leading-6 text-gray-300 hover:text-white">
                      Cookie Policy
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
              &copy; 2024 Lady QR. All rights reserved. Made with ❤️ for businesses worldwide.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;