import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const faqData: FAQItem[] = [
    // General Questions
    {
      id: 'what-is-tuqr',
      category: 'general',
      question: 'What is tuQR?',
      answer: 'Lady QR is the most complete platform for creating, customizing and managing QR codes. We offer 10 different types of QR codes, advanced customization, detailed analytics and multiple payment methods for businesses worldwide.'
    },
    {
      id: 'how-qr-works',
      category: 'general',
      question: 'How do QR codes work?',
      answer: 'QR codes (Quick Response) are two-dimensional barcodes that can store information like URLs, text, contacts, etc. When scanned with a smartphone camera, the device can automatically read and process the encoded information, taking the user to a website, saving a contact, or executing another specific action.'
    },
    {
      id: 'qr-types-available',
      category: 'general',
      question: 'What types of QR codes can I create?',
      answer: 'We offer 10 types: Website (URL), Contact Card (vCard), Text, Email, SMS, WhatsApp Message, WiFi, Social Media (Instagram, Facebook, Twitter, LinkedIn, YouTube, TikTok, Telegram), Location (GPS), and Calendar Event. Each type is optimized for its specific use.'
    },
    {
      id: 'device-compatibility',
      category: 'general',
      question: 'What devices support QR codes?',
      answer: 'QR codes work on virtually all modern smartphones (iPhone, Android) and tablets. Most devices since 2017 have built-in QR readers in the camera. They also work with dedicated QR reading apps and some web browsers.'
    },

    // Static vs Dynamic
    {
      id: 'static-vs-dynamic',
      category: 'types',
      question: 'What\'s the difference between static and dynamic QR codes?',
      answer: 'Static QR codes have information encoded directly in the visual pattern and cannot be modified after creation, but work forever without depending on servers. Dynamic codes redirect through a short URL that you can change anytime, include complete analytics, but require internet connection and depend on our servers.'
    },
    {
      id: 'when-use-static',
      category: 'types',
      question: 'When should I use static QR codes?',
      answer: 'Static codes are ideal for: information that won\'t change (like contact data, WiFi credentials, fixed locations), when you need maximum scan speed, for offline use or places without reliable internet, and when you want permanent operation guarantee without depending on external services.'
    },
    {
      id: 'when-use-dynamic',
      category: 'types',
      question: 'When should I use dynamic QR codes?',
      answer: 'Dynamic codes are perfect for: marketing campaigns where you need to change destinations, when you want detailed scan analytics, temporary promotions, frequently changing menus, events with updatable information, and any case where you need flexibility to edit content after printing.'
    },

    // Pricing and Plans
    {
      id: 'free-plan-limits',
      category: 'pricing',
      question: 'What does the free plan include?',
      answer: 'The free plan includes: 2 static QR codes, 1 dynamic QR code, PNG format download, no design customization, and no technical support. It\'s perfect for trying the platform and basic personal use.'
    },
    {
      id: 'plan-differences',
      category: 'pricing',
      question: 'What are the differences between paid plans?',
      answer: 'Basic Plan ($7/month): Unlimited static QRs, 10 dynamic, complete customization, multiple formats. Professional Plan ($15/month): Everything above + 100 dynamic, advanced analytics, 5 users. Business Plan (contact): 1,000 dynamic, 20 users, full API, dedicated support.'
    },
    {
      id: 'payment-methods',
      category: 'pricing',
      question: 'What payment methods do you accept?',
      answer: 'We accept multiple payment methods: Visa/Mastercard credit cards, PayPal, Apple Pay, Google Pay, and bank transfers. All payments are securely processed by Stripe with enterprise-grade security.'
    },
    {
      id: 'annual-discount',
      category: 'pricing',
      question: 'Do you offer discounts for annual payment?',
      answer: 'Yes, by paying annually you get 2 months completely free on all paid plans. For example, the Professional plan costs $150 per year instead of $180, saving $30. The discount is automatically applied when selecting annual billing.'
    },
    {
      id: 'plan-changes',
      category: 'pricing',
      question: 'Can I change plans anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan anytime from your control panel. Changes apply immediately. If you upgrade, you only pay the prorated difference. If you downgrade, the change applies on your next billing cycle.'
    },
    {
      id: 'cancellation-policy',
      category: 'pricing',
      question: 'What happens if I cancel my subscription?',
      answer: 'You can cancel anytime without penalties. Static QR codes will continue working forever. Dynamic codes will continue working for an additional 30 days after cancellation, giving you time to migrate or upgrade your plan.'
    },
    {
      id: 'free-trial',
      category: 'pricing',
      question: 'Is there a free trial?',
      answer: 'Yes! Our Free plan lets you create 1 static QR code with no credit card required. Upgrade anytime to unlock more features.'
    },
    {
      id: 'setup-fees',
      category: 'pricing',
      question: 'Are there any setup fees?',
      answer: 'No! There are no setup fees, hidden costs, or long-term contracts. Pay monthly and cancel anytime.'
    },
    {
      id: 'commercial-use',
      category: 'pricing',
      question: 'Can I use QR codes for commercial purposes?',
      answer: 'Absolutely! All plans allow commercial use. Create QR codes for marketing, products, menus, events, and more.'
    },
    {
      id: 'getting-started',
      category: 'pricing',
      question: 'How do I get started?',
      answer: 'Simply sign up for a free account, choose your plan, and start creating QR codes immediately. No technical knowledge required!'
    },

    // Features and Customization
    {
      id: 'customization-options',
      category: 'features',
      question: 'What customization options are available?',
      answer: 'You can customize: foreground and background colors (including gradients), module shapes (square, rounded, circular), corner styles, add your logo in the center, decorative frames with custom text, and different design patterns. Customization is available on Basic plans and above.'
    },
    {
      id: 'logo-requirements',
      category: 'features',
      question: 'What are the logo requirements for QR codes?',
      answer: 'The logo should be: PNG, JPG or SVG format, maximum 2MB size, preferably square or circular, with transparent background for best results. We recommend simple logos with good contrast. The system automatically resizes and optimizes the logo to maintain QR code readability.'
    },
    {
      id: 'download-formats',
      category: 'features',
      question: 'What formats can I download my QR codes in?',
      answer: 'Free Plan: PNG. Basic plans and above: PNG, JPG, SVG, PDF, EPS. Vector formats (SVG, PDF, EPS) are ideal for professional printing as they can be scaled to any size without losing quality. All formats include high resolution.'
    },
    {
      id: 'analytics-features',
      category: 'features',
      question: 'What analytics are available?',
      answer: 'For dynamic codes on Professional and Business plans: total number of scans, unique scans, geographic location with interactive maps, device types used, peak activity times, real-time data, report exports, and historical trend charts.'
    },
    {
      id: 'bulk-creation',
      category: 'features',
      question: 'Can I create QR codes in bulk?',
      answer: 'Yes, on Professional and Business plans we offer bulk creation through: CSV/Excel file uploads, REST API for integration with your systems, custom templates for multiple similar codes, and mass management tools to update multiple dynamic codes simultaneously.'
    },

    // Technical Questions
    {
      id: 'qr-expiration',
      category: 'technical',
      question: 'Do QR codes have expiration dates?',
      answer: 'Static QR codes never expire and work forever. Dynamic codes work while you maintain your active subscription. If you cancel, you have an additional 30-day grace period. Temporary codes (unregistered users) expire in 24 hours.'
    },
    {
      id: 'scan-limits',
      category: 'technical',
      question: 'Are there limits on the number of scans?',
      answer: 'No, there are no limits on the number of scans for any plan. Your QR codes can be scanned unlimited times. We only limit the number of QR codes you can create according to your plan, but each code can receive infinite scans.'
    },
    {
      id: 'data-security',
      category: 'technical',
      question: 'How secure is my data?',
      answer: 'We use 256-bit SSL encryption for all transmissions, secure storage on Firebase (Google Cloud), daily automatic backups, GDPR and CCPA compliance, and we never share your data with third parties. Your QR codes and analytics are completely protected.'
    },
    {
      id: 'api-access',
      category: 'technical',
      question: 'Do you offer API access?',
      answer: 'Yes, the Business plan includes full access to our REST API that allows: creating and managing QR codes programmatically, getting real-time analytics, integration with your existing systems, webhooks for automatic notifications, and complete documentation with code examples.'
    },
    {
      id: 'uptime-guarantee',
      category: 'technical',
      question: 'What uptime guarantee do you offer?',
      answer: 'We guarantee 99.9% uptime for all our services. We use Google Cloud infrastructure with global redundancy, 24/7 monitoring, and automatic backups. In case of interruptions, we automatically extend affected subscriptions.'
    },

    // Support and Regional
    {
      id: 'customer-support',
      category: 'support',
      question: 'What technical support do you offer?',
      answer: 'Free Plan: Knowledge base and FAQs. Basic Plan: Email support (24-48h response). Professional Plan: Priority email and chat support (12h response). Business Plan: Dedicated support with account manager and 4h response.'
    },
    {
      id: 'language-support',
      category: 'support',
      question: 'What languages is support available in?',
      answer: 'Our support is available in English for all users worldwide. We also offer support in Spanish and Portuguese for Latin American customers. Our entire support team understands the needs of businesses in different regions.'
    },
    {
      id: 'regional-features',
      category: 'support',
      question: 'What makes tuQR special for global businesses?',
      answer: 'Lady QR is designed for businesses worldwide: multiple payment methods (cards, PayPal, Apple Pay), support in multiple languages, competitive pricing, compliance with international regulations, 24/7 support across time zones, and understanding of specific business needs in different markets.'
    },
    {
      id: 'training-resources',
      category: 'support',
      question: 'Do you offer training or educational resources?',
      answer: 'Yes, we offer: video tutorials, step-by-step guides for each QR code type, free monthly webinars, blog with use cases and best practices, downloadable templates for different industries, and for Business plans, personalized training sessions.'
    },

    // Business Use Cases
    {
      id: 'restaurant-use',
      category: 'business',
      question: 'How can restaurants use QR codes?',
      answer: 'Restaurants can use QR codes for: updatable digital menus without reprinting, direct online reservations, automatic review collection, special promotions, loyalty programs, takeout orders, detailed nutritional information, and direct contact for delivery services.'
    },
    {
      id: 'retail-use',
      category: 'business',
      question: 'What benefits do they offer for retail stores?',
      answer: 'For retail: detailed product information, links to online stores, digital discount coupons, loyalty programs, customer data collection, cross-promotions, real-time inventory, and direct connection to social media to increase followers.'
    },
    {
      id: 'event-use',
      category: 'business',
      question: 'How do QR codes help at events?',
      answer: 'For events: automatic registration and check-in, updatable program information, networking between attendees, instant satisfaction surveys, material downloads, direct contact with organizers, interactive venue maps, and real-time attendance tracking.'
    },
    {
      id: 'education-use',
      category: 'business',
      question: 'What applications do they have in education?',
      answer: 'In education: quick access to class materials, assignments and online resources, teacher contact information, links to educational platforms, feedback surveys, automatic attendance, access to digital libraries, and direct communication with parents.'
    }
  ];

  const categories = [
    { id: 'all', name: 'All questions', count: faqData.length },
    { id: 'general', name: 'General', count: faqData.filter(item => item.category === 'general').length },
    { id: 'types', name: 'QR Types', count: faqData.filter(item => item.category === 'types').length },
    { id: 'pricing', name: 'Pricing & Plans', count: faqData.filter(item => item.category === 'pricing').length },
    { id: 'features', name: 'Features', count: faqData.filter(item => item.category === 'features').length },
    { id: 'technical', name: 'Technical', count: faqData.filter(item => item.category === 'technical').length },
    { id: 'support', name: 'Support', count: faqData.filter(item => item.category === 'support').length },
    { id: 'business', name: 'Use Cases', count: faqData.filter(item => item.category === 'business').length }
  ];

  const filteredFAQs = selectedCategory === 'all'
    ? faqData
    : faqData.filter(item => item.category === selectedCategory);

  return (
    <div className="bg-white dark:bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">Support</h2>
          <p className="mt-2 text-4xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Frequently Asked Questions
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Find answers to the most common questions about tuQR, QR codes and our services
          </p>
        </div>

        {/* Category Filter */}
        <div className="mt-16 sm:mt-20">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            {filteredFAQs.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
                >
                  <span className="font-medium text-gray-900 dark:text-white pr-4">
                    {item.question}
                  </span>
                  {openItems.includes(item.id) ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openItems.includes(item.id) && (
                  <div className="px-6 pb-4">
                    <div className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {item.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-16 sm:mt-20 bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
            Didn't find what you were looking for?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Our support team is here to help you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              📧 Contact Support
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Response time: Basic Plan (24-48h) • Professional Plan (12h) • Business Plan (4h)
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-poppins font-bold text-primary-600 mb-2">50K+</div>
            <div className="text-gray-600 dark:text-gray-400">QR codes created</div>
          </div>
          <div>
            <div className="text-3xl font-poppins font-bold text-primary-600 mb-2">15K+</div>
            <div className="text-gray-600 dark:text-gray-400">Satisfied users</div>
          </div>
          <div>
            <div className="text-3xl font-poppins font-bold text-primary-600 mb-2">99.9%</div>
            <div className="text-gray-600 dark:text-gray-400">Uptime</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;