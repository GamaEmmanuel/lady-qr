import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-poppins font-bold text-gray-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Last updated: November 8, 2024
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="space-y-8 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                1. Introduction
              </h2>
              <p className="mb-4">
                Welcome to Lady QR ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, disclose, and safeguard your information when you use our QR code generation and management platform.
              </p>
              <p>
                By using Lady QR, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                2. Information We Collect
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                2.1 Personal Information
              </h3>
              <p className="mb-4">
                When you register for an account, we collect:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Name and email address</li>
                <li>Password (encrypted)</li>
                <li>Profile information you choose to provide</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Billing address and company information (if applicable)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                2.2 QR Code Data
              </h3>
              <p className="mb-4">
                We store the content and settings of QR codes you create, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>URLs, text, contact information, and other encoded data</li>
                <li>Design customizations (colors, logos, styles)</li>
                <li>QR code metadata (creation date, name, category)</li>
                <li>Dynamic QR code destination URLs</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                2.3 Analytics and Usage Data
              </h3>
              <p className="mb-4">
                For dynamic QR codes, we collect anonymous analytics data:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Scan timestamps and frequency</li>
                <li>Geographic location (city/country level)</li>
                <li>Device type and operating system</li>
                <li>Browser information</li>
                <li>Referrer information</li>
                <li>IP addresses (anonymized)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                2.4 Automatically Collected Information
              </h3>
              <p className="mb-4">
                When you access our platform, we automatically collect:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Log data (IP address, browser type, pages visited)</li>
                <li>Device information</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Usage patterns and preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                3. How We Use Your Information
              </h2>
              <p className="mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Service Delivery:</strong> To create, manage, and deliver QR codes and related services</li>
                <li><strong>Account Management:</strong> To maintain your account and provide customer support</li>
                <li><strong>Analytics:</strong> To provide scan analytics for your dynamic QR codes</li>
                <li><strong>Payment Processing:</strong> To process payments and prevent fraud</li>
                <li><strong>Communication:</strong> To send service updates, security alerts, and support messages</li>
                <li><strong>Improvement:</strong> To improve our services, develop new features, and enhance user experience</li>
                <li><strong>Marketing:</strong> To send promotional communications (with your consent, which you can withdraw at any time)</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                4. Data Sharing and Disclosure
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                4.1 Third-Party Service Providers
              </h3>
              <p className="mb-4">
                We share data with trusted third-party service providers who assist us in operating our platform:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Firebase/Google Cloud:</strong> Database and hosting services</li>
                <li><strong>Stripe:</strong> Payment processing</li>
                <li><strong>EmailJS:</strong> Email communications</li>
                <li><strong>Analytics Providers:</strong> Usage analytics and monitoring</li>
              </ul>
              <p className="mb-4">
                These providers are contractually obligated to protect your data and use it only for the purposes we specify.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                4.2 Legal Requirements
              </h3>
              <p className="mb-4">
                We may disclose your information if required by law or in response to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Valid legal processes (subpoenas, court orders)</li>
                <li>Government or regulatory requests</li>
                <li>Enforcement of our Terms of Service</li>
                <li>Protection of our rights, property, or safety</li>
                <li>Prevention of fraud or security threats</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                4.3 Business Transfers
              </h3>
              <p className="mb-4">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity. We will notify you of any such change and any choices you may have regarding your information.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                4.4 What We Don't Do
              </h3>
              <p className="mb-4">
                We will never:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Sell your personal information to third parties</li>
                <li>Share your data for third-party marketing purposes</li>
                <li>Use your QR code content for any purpose other than providing our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                5. Data Security
              </h2>
              <p className="mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>256-bit SSL/TLS encryption for data transmission</li>
                <li>Encrypted storage of sensitive data</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Secure authentication and password hashing</li>
                <li>Access controls and monitoring</li>
                <li>Regular data backups</li>
                <li>Incident response procedures</li>
              </ul>
              <p className="mb-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                6. Data Retention
              </h2>
              <p className="mb-4">
                We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this policy:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Account Data:</strong> Retained while your account is active and for 90 days after account deletion</li>
                <li><strong>Static QR Codes:</strong> Data retained indefinitely as they function independently</li>
                <li><strong>Dynamic QR Codes:</strong> Retained while your subscription is active, plus 30 days grace period</li>
                <li><strong>Analytics Data:</strong> Aggregated analytics retained for up to 2 years</li>
                <li><strong>Payment Records:</strong> Retained for 7 years for tax and legal compliance</li>
                <li><strong>Support Communications:</strong> Retained for 3 years</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                7. Your Rights and Choices
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                7.1 Access and Portability
              </h3>
              <p className="mb-4">
                You have the right to access and download your personal data and QR code information at any time through your account dashboard.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                7.2 Correction and Updates
              </h3>
              <p className="mb-4">
                You can update your account information and QR code settings at any time through your account settings.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                7.3 Deletion
              </h3>
              <p className="mb-4">
                You can delete your QR codes or close your account at any time. To request complete data deletion, contact us at support@ladyqr.com.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                7.4 Marketing Communications
              </h3>
              <p className="mb-4">
                You can opt out of promotional emails by clicking the unsubscribe link in any marketing email or by updating your preferences in your account settings.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                7.5 Cookies
              </h3>
              <p className="mb-4">
                You can control cookies through your browser settings. See our Cookie Policy for more details.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                7.6 GDPR Rights (EU Users)
              </h3>
              <p className="mb-4">
                If you are in the European Economic Area, you have additional rights under GDPR:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Right to be informed</li>
                <li>Right of access</li>
                <li>Right to rectification</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object</li>
                <li>Rights related to automated decision-making</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                7.7 CCPA Rights (California Users)
              </h3>
              <p className="mb-4">
                California residents have additional rights under the CCPA:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to say no to the sale of personal information</li>
                <li>Right to access personal information</li>
                <li>Right to equal service and price</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                8. Children's Privacy
              </h2>
              <p className="mb-4">
                Our services are not intended for users under the age of 16. We do not knowingly collect personal information from children under 16. If you believe we have collected information from a child under 16, please contact us immediately and we will delete such information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                9. International Data Transfers
              </h2>
              <p className="mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy and applicable laws.
              </p>
              <p className="mb-4">
                We use Google Cloud Platform (Firebase) which provides data residency options and complies with international data protection standards including GDPR.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                10. Third-Party Links
              </h2>
              <p className="mb-4">
                Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                11. Changes to This Privacy Policy
              </h2>
              <p className="mb-4">
                We may update this privacy policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Posting the new policy on this page</li>
                <li>Updating the "Last updated" date</li>
                <li>Sending you an email notification (for significant changes)</li>
              </ul>
              <p className="mb-4">
                Your continued use of our services after any changes indicates your acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                12. Contact Us
              </h2>
              <p className="mb-4">
                If you have questions, concerns, or requests regarding this privacy policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-4">
                <p className="mb-2"><strong>Email:</strong> privacy@ladyqr.com</p>
                <p className="mb-2"><strong>Support:</strong> support@ladyqr.com</p>
                <p className="mb-2"><strong>Contact Form:</strong> <a href="/contact" className="text-primary-600 hover:text-primary-700">ladyqr.com/contact</a></p>
              </div>
              <p className="mb-4">
                We will respond to your inquiry within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                13. Dispute Resolution
              </h2>
              <p className="mb-4">
                If you have a complaint about our data practices, we encourage you to contact us first. If you are not satisfied with our response, you may have the right to lodge a complaint with your local data protection authority.
              </p>
            </section>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This privacy policy is effective as of November 8, 2024 and will remain in effect except with respect to any changes in its provisions in the future.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;

