import React from 'react';

const Cookies: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-poppins font-bold text-gray-900 dark:text-white">
            Cookie Policy
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
                This Cookie Policy explains how Lady QR ("we," "us," or "our") uses cookies and similar tracking technologies when you visit our website and use our services. This policy should be read in conjunction with our Privacy Policy and Terms of Service.
              </p>
              <p className="mb-4">
                By using our website, you consent to the use of cookies in accordance with this Cookie Policy. If you do not agree to our use of cookies, you should change your browser settings accordingly or discontinue use of our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                2. What Are Cookies?
              </h2>
              <p className="mb-4">
                Cookies are small text files that are placed on your device (computer, smartphone, tablet) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
              <p className="mb-4">
                Cookies allow websites to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Keep you signed in</li>
                <li>Understand how you use the website</li>
                <li>Improve your user experience</li>
                <li>Provide personalized content</li>
                <li>Analyze website performance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                3. Types of Cookies We Use
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3.1 Essential Cookies
              </h3>
              <p className="mb-4">
                These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-4">
                <p className="mb-2"><strong>Purpose:</strong></p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>User authentication and session management</li>
                  <li>Security features</li>
                  <li>Load balancing</li>
                  <li>Payment processing</li>
                </ul>
                <p className="mb-2"><strong>Duration:</strong> Session or up to 1 year</p>
                <p className="mb-2"><strong>Can be disabled:</strong> No (website won't function properly)</p>
              </div>
              <p className="mb-4"><strong>Examples:</strong></p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><code>auth_token</code> - Maintains your login session</li>
                <li><code>session_id</code> - Identifies your current session</li>
                <li><code>csrf_token</code> - Security token to prevent cross-site attacks</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3.2 Functional Cookies
              </h3>
              <p className="mb-4">
                These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-4">
                <p className="mb-2"><strong>Purpose:</strong></p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Remember your preferences (language, theme, timezone)</li>
                  <li>Store your dashboard customizations</li>
                  <li>Remember QR code design preferences</li>
                  <li>Maintain filter and sort settings</li>
                </ul>
                <p className="mb-2"><strong>Duration:</strong> Up to 1 year</p>
                <p className="mb-2"><strong>Can be disabled:</strong> Yes (some features may not work as intended)</p>
              </div>
              <p className="mb-4"><strong>Examples:</strong></p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><code>theme_preference</code> - Stores your light/dark mode preference</li>
                <li><code>language</code> - Remembers your language choice</li>
                <li><code>dashboard_layout</code> - Saves your dashboard customizations</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3.3 Analytics Cookies
              </h3>
              <p className="mb-4">
                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-4">
                <p className="mb-2"><strong>Purpose:</strong></p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Analyze website traffic and usage patterns</li>
                  <li>Understand which pages are most popular</li>
                  <li>Identify technical issues</li>
                  <li>Improve website performance</li>
                  <li>Track conversion rates</li>
                </ul>
                <p className="mb-2"><strong>Duration:</strong> Up to 2 years</p>
                <p className="mb-2"><strong>Can be disabled:</strong> Yes</p>
              </div>
              <p className="mb-4"><strong>Services we use:</strong></p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Google Analytics:</strong> Web analytics service (anonymized IP addresses)</li>
                <li><strong>Firebase Analytics:</strong> App analytics and crash reporting</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3.4 Performance Cookies
              </h3>
              <p className="mb-4">
                These cookies help us monitor and improve the performance of our website.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-4">
                <p className="mb-2"><strong>Purpose:</strong></p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Measure page load times</li>
                  <li>Monitor application performance</li>
                  <li>Track error rates</li>
                  <li>Optimize content delivery</li>
                </ul>
                <p className="mb-2"><strong>Duration:</strong> Up to 1 year</p>
                <p className="mb-2"><strong>Can be disabled:</strong> Yes</p>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3.5 Marketing Cookies (If Applicable)
              </h3>
              <p className="mb-4">
                These cookies track your online activity to help advertisers deliver more relevant advertising or limit how many times you see an ad.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-4">
                <p className="mb-2"><strong>Purpose:</strong></p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Deliver relevant advertisements</li>
                  <li>Track advertising campaign effectiveness</li>
                  <li>Limit ad frequency</li>
                  <li>Measure conversion rates</li>
                </ul>
                <p className="mb-2"><strong>Duration:</strong> Up to 2 years</p>
                <p className="mb-2"><strong>Can be disabled:</strong> Yes</p>
              </div>
              <p className="mb-4">
                <em>Note: We currently do not use third-party marketing cookies, but if we do in the future, we will update this policy and obtain your consent.</em>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                4. First-Party vs. Third-Party Cookies
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                4.1 First-Party Cookies
              </h3>
              <p className="mb-4">
                These cookies are set directly by Lady QR and can only be read by our website. We use first-party cookies for essential functionality, preferences, and basic analytics.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                4.2 Third-Party Cookies
              </h3>
              <p className="mb-4">
                These cookies are set by third-party services we use. Third parties may include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Firebase/Google Cloud:</strong> Authentication, hosting, and analytics</li>
                <li><strong>Stripe:</strong> Payment processing</li>
                <li><strong>Google Analytics:</strong> Website analytics (if enabled)</li>
              </ul>
              <p className="mb-4">
                These third parties have their own privacy and cookie policies, which we recommend you review.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                5. QR Code Scan Tracking
              </h2>
              <p className="mb-4">
                For dynamic QR codes, we collect anonymized data when a QR code is scanned:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>We do not use cookies on the redirect pages</li>
                <li>We collect basic information from the HTTP request (user agent, IP address, referrer)</li>
                <li>IP addresses are anonymized before storage</li>
                <li>No personally identifiable information is collected from scanners</li>
                <li>Scan data is aggregated for analytics purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                6. How to Manage Cookies
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                6.1 Browser Settings
              </h3>
              <p className="mb-4">
                Most web browsers allow you to manage cookies through their settings. You can:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>View and delete cookies</li>
                <li>Block all cookies</li>
                <li>Block third-party cookies only</li>
                <li>Clear cookies when closing your browser</li>
                <li>Create exceptions for specific websites</li>
              </ul>

              <p className="mb-4"><strong>How to manage cookies in popular browsers:</strong></p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Google Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and data stored</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                6.2 Our Cookie Preferences
              </h3>
              <p className="mb-4">
                You can manage your cookie preferences for our website:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Through your account settings (for registered users)</li>
                <li>By clicking the cookie preferences link in the footer</li>
                <li>By configuring your browser as described above</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                6.3 Opt-Out Links
              </h3>
              <p className="mb-4">
                You can opt out of specific tracking services:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Google Analytics:</strong> <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">Google Analytics Opt-out Browser Add-on</a></li>
                <li><strong>General Opt-Out:</strong> <a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">Your Online Choices</a></li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                6.4 Impact of Blocking Cookies
              </h3>
              <p className="mb-4">
                Please note that blocking or deleting cookies may:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Prevent you from using certain features</li>
                <li>Require you to re-enter your preferences each visit</li>
                <li>Log you out of your account</li>
                <li>Affect the functionality of our services</li>
                <li>Prevent us from remembering your settings</li>
              </ul>
              <p className="mb-4">
                Essential cookies are required for the website to function and cannot be disabled in our systems.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                7. Do Not Track (DNT)
              </h2>
              <p className="mb-4">
                Some browsers include a "Do Not Track" (DNT) feature that signals websites you visit that you do not want to have your online activity tracked.
              </p>
              <p className="mb-4">
                Currently, there is no uniform standard for how DNT signals should be interpreted. We honor DNT signals for analytics cookies but essential cookies are still required for the website to function properly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                8. Cookie Consent
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                8.1 How We Obtain Consent
              </h3>
              <p className="mb-4">
                When you first visit our website, we may display a cookie banner informing you about our use of cookies. By continuing to use our website, you consent to our use of cookies as described in this policy.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                8.2 Withdrawing Consent
              </h3>
              <p className="mb-4">
                You can withdraw your consent at any time by:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Deleting cookies through your browser settings</li>
                <li>Changing your cookie preferences in your account settings</li>
                <li>Contacting us at privacy@ladyqr.com</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                9. Mobile Applications
              </h2>
              <p className="mb-4">
                If you access our services through a mobile application, we may use similar technologies to cookies, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Local storage</li>
                <li>Device identifiers</li>
                <li>SDKs (Software Development Kits)</li>
                <li>Mobile analytics tools</li>
              </ul>
              <p className="mb-4">
                You can manage these through your device settings and app permissions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                10. Updates to This Cookie Policy
              </h2>
              <p className="mb-4">
                We may update this Cookie Policy from time to time to reflect changes in technology, legislation, our operations, or business practices. We will notify you of any material changes by:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Posting the updated policy on this page</li>
                <li>Updating the "Last updated" date</li>
                <li>Displaying a notice on our website</li>
                <li>Sending email notifications for significant changes</li>
              </ul>
              <p className="mb-4">
                We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                11. More Information
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                11.1 Related Policies
              </h3>
              <p className="mb-4">
                For more information about how we handle your data, please see:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><a href="/privacy" className="text-primary-600 hover:text-primary-700">Privacy Policy</a></li>
                <li><a href="/terms" className="text-primary-600 hover:text-primary-700">Terms of Service</a></li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                11.2 External Resources
              </h3>
              <p className="mb-4">
                Learn more about cookies:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><a href="https://www.allaboutcookies.org/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">All About Cookies</a></li>
                <li><a href="https://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">Your Online Choices (EU)</a></li>
                <li><a href="https://www.networkadvertising.org/choices/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">Network Advertising Initiative</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                12. Contact Us
              </h2>
              <p className="mb-4">
                If you have questions or concerns about our use of cookies, please contact us:
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
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This Cookie Policy was last updated on November 8, 2024. Please check back regularly for any updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cookies;

