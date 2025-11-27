import React from 'react';
import SEO from '../components/SEO';

const Terms: React.FC = () => {
  return (
    <>
      <SEO
        title="Terms of Service - Lady QR"
        description="Read Lady QR's terms of service and user agreement. Understand your rights and responsibilities when using our QR code generator."
        keywords="terms of service, user agreement, terms and conditions"
        url="/terms"
      />
      <div className="bg-white dark:bg-gray-900 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-poppins font-bold text-gray-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Last updated: November 8, 2024
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="space-y-8 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                1. Agreement to Terms
              </h2>
              <p className="mb-4">
                These Terms of Service ("Terms") constitute a legally binding agreement between you and Lady QR ("we," "us," or "our") governing your access to and use of our QR code generation and management platform, including our website, applications, and services (collectively, the "Services").
              </p>
              <p className="mb-4">
                By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use our Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                2. Eligibility
              </h2>
              <p className="mb-4">
                To use our Services, you must:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Be at least 16 years of age</li>
                <li>Have the legal capacity to enter into a binding contract</li>
                <li>Not be prohibited from using the Services under applicable laws</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
              </ul>
              <p className="mb-4">
                By registering for an account, you represent and warrant that you meet these eligibility requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                3. Account Registration and Security
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3.1 Account Creation
              </h3>
              <p className="mb-4">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate and current</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized access or security breach</li>
                <li>Be responsible for all activities that occur under your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3.2 Account Termination
              </h3>
              <p className="mb-4">
                We reserve the right to suspend or terminate your account if:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>You violate these Terms</li>
                <li>You engage in fraudulent or illegal activities</li>
                <li>Your account remains inactive for an extended period</li>
                <li>You fail to pay applicable fees</li>
                <li>We are required to do so by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                4. Subscription Plans and Payments
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                4.1 Plans and Pricing
              </h3>
              <p className="mb-4">
                We offer various subscription plans with different features and limitations:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Free Plan:</strong> Limited features with basic QR code creation</li>
                <li><strong>Basic Plan:</strong> Enhanced features including customization and analytics</li>
                <li><strong>Business Plan:</strong> Advanced features for larger organizations</li>
              </ul>
              <p className="mb-4">
                Pricing details are available on our pricing page. We reserve the right to modify pricing with 30 days' notice to existing subscribers.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                4.2 Billing and Payment
              </h3>
              <p className="mb-4">
                For paid subscriptions:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Payments are processed securely through Stripe</li>
                <li>Subscriptions automatically renew at the end of each billing period</li>
                <li>You authorize us to charge your payment method for renewal fees</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>You are responsible for all applicable taxes</li>
                <li>Failed payments may result in service suspension</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                4.3 Cancellation and Refunds
              </h3>
              <p className="mb-4">
                You may cancel your subscription at any time. Upon cancellation:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>You will retain access until the end of your current billing period</li>
                <li>No refunds will be provided for partial billing periods</li>
                <li>Static QR codes will continue to function indefinitely</li>
                <li>Dynamic QR codes will continue to work for 30 days after cancellation</li>
                <li>Your account data will be retained for 90 days</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                4.4 Plan Changes
              </h3>
              <p className="mb-4">
                You may upgrade or downgrade your plan at any time:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Upgrades take effect immediately with prorated billing</li>
                <li>Downgrades take effect at the start of the next billing period</li>
                <li>Feature limitations apply based on your current plan</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                5. Acceptable Use Policy
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                5.1 Permitted Uses
              </h3>
              <p className="mb-4">
                You may use our Services for lawful business and personal purposes, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Creating QR codes for marketing and promotional purposes</li>
                <li>Managing digital menus and product information</li>
                <li>Sharing contact information and social media profiles</li>
                <li>Event management and ticketing</li>
                <li>Any other lawful commercial or personal use</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                5.2 Prohibited Uses
              </h3>
              <p className="mb-4">
                You agree NOT to use our Services to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Violate any local, state, national, or international law</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Transmit malware, viruses, or harmful code</li>
                <li>Engage in phishing, spam, or fraudulent activities</li>
                <li>Distribute illegal, harmful, or offensive content</li>
                <li>Harass, abuse, or harm others</li>
                <li>Impersonate any person or entity</li>
                <li>Collect or harvest personal data without consent</li>
                <li>Interfere with or disrupt our Services or servers</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Resell or redistribute our Services without authorization</li>
                <li>Create QR codes linking to illegal content, malware, or phishing sites</li>
                <li>Use the Services for any adult content or gambling (unless legally permitted)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                6. QR Code Services
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                6.1 Static QR Codes
              </h3>
              <p className="mb-4">
                Static QR codes:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Encode data directly in the QR code image</li>
                <li>Cannot be edited after creation</li>
                <li>Work forever without our servers</li>
                <li>Do not provide analytics</li>
                <li>Are available on all plans</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                6.2 Dynamic QR Codes
              </h3>
              <p className="mb-4">
                Dynamic QR codes:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Redirect through our servers</li>
                <li>Can be edited anytime</li>
                <li>Provide detailed analytics</li>
                <li>Require an active subscription</li>
                <li>Continue working for 30 days after subscription cancellation</li>
                <li>Are subject to plan limitations (number of codes, scans)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                6.3 Service Availability
              </h3>
              <p className="mb-4">
                While we strive for 99.9% uptime:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>We do not guarantee uninterrupted service availability</li>
                <li>Maintenance windows may be required</li>
                <li>Force majeure events may cause service interruptions</li>
                <li>We are not liable for third-party service disruptions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                7. Intellectual Property Rights
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                7.1 Our Rights
              </h3>
              <p className="mb-4">
                All rights, title, and interest in the Services, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Software, code, and algorithms</li>
                <li>User interface and design elements</li>
                <li>Trademarks, logos, and brand elements</li>
                <li>Content and documentation</li>
              </ul>
              <p className="mb-4">
                Are owned by or licensed to Lady QR and are protected by intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                7.2 Your Rights
              </h3>
              <p className="mb-4">
                You retain all rights to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Content you encode in your QR codes</li>
                <li>Logos and images you upload</li>
                <li>Generated QR code images</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                7.3 License Grant
              </h3>
              <p className="mb-4">
                Subject to these Terms, we grant you a limited, non-exclusive, non-transferable license to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Access and use the Services for your personal or commercial purposes</li>
                <li>Download and use QR codes you create</li>
                <li>Use our Services in accordance with your subscription plan</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                8. User Content and Responsibility
              </h2>
              <p className="mb-4">
                You are solely responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>All content you encode in QR codes</li>
                <li>Ensuring you have rights to use any content, logos, or images</li>
                <li>Compliance with laws regarding the content and use of your QR codes</li>
                <li>Accuracy of information in your QR codes</li>
                <li>Monitoring and managing how your QR codes are used</li>
              </ul>
              <p className="mb-4">
                By uploading content, you grant us a license to store, process, and display that content solely for the purpose of providing the Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                9. Privacy and Data Protection
              </h2>
              <p className="mb-4">
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our Services, you consent to our privacy practices as described in the Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                10. Disclaimers and Limitations of Liability
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                10.1 Service Disclaimer
              </h3>
              <p className="mb-4">
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Warranties of merchantability or fitness for a particular purpose</li>
                <li>Warranties of non-infringement</li>
                <li>Warranties regarding accuracy, reliability, or availability</li>
                <li>Warranties that the Services will be uninterrupted or error-free</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                10.2 Limitation of Liability
              </h3>
              <p className="mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, LADY QR SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or business opportunities</li>
                <li>Service interruptions or data loss</li>
                <li>Third-party actions or content</li>
                <li>Unauthorized access to your account or content</li>
              </ul>
              <p className="mb-4">
                OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                10.3 Exceptions
              </h3>
              <p className="mb-4">
                These limitations do not apply to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Liability for death or personal injury caused by our negligence</li>
                <li>Liability for fraud or fraudulent misrepresentation</li>
                <li>Any liability that cannot be excluded by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                11. Indemnification
              </h2>
              <p className="mb-4">
                You agree to indemnify, defend, and hold harmless Lady QR, its affiliates, officers, directors, employees, and agents from any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys' fees) arising from:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Your use of the Services</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Content you create or encode in QR codes</li>
                <li>Your breach of any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                12. Dispute Resolution
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                12.1 Informal Resolution
              </h3>
              <p className="mb-4">
                Before filing a claim, you agree to contact us at legal@lady-qr.com to attempt to resolve the dispute informally. We will attempt to resolve disputes within 30 days.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                12.2 Governing Law
              </h3>
              <p className="mb-4">
                These Terms are governed by and construed in accordance with the laws of the jurisdiction in which Lady QR operates, without regard to conflict of law principles.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                12.3 Arbitration
              </h3>
              <p className="mb-4">
                Any disputes not resolved informally shall be resolved through binding arbitration, except where prohibited by law. You waive any right to a jury trial or to participate in a class action lawsuit.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                13. Modifications to Terms
              </h2>
              <p className="mb-4">
                We reserve the right to modify these Terms at any time. We will provide notice of material changes by:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Posting the updated Terms on our website</li>
                <li>Updating the "Last updated" date</li>
                <li>Sending email notification to registered users</li>
              </ul>
              <p className="mb-4">
                Your continued use of the Services after changes take effect constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                14. Termination
              </h2>
              <p className="mb-4">
                Either party may terminate this agreement:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>You:</strong> By closing your account at any time</li>
                <li><strong>Us:</strong> By providing notice if you violate these Terms or for business reasons</li>
              </ul>
              <p className="mb-4">
                Upon termination:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Your license to use the Services terminates</li>
                <li>You must stop using the Services</li>
                <li>Static QR codes will continue to function</li>
                <li>Dynamic QR codes will work for 30 days</li>
                <li>We may delete your data after 90 days</li>
              </ul>
              <p className="mb-4">
                Sections that by their nature should survive termination will survive, including intellectual property provisions, disclaimers, and limitations of liability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                15. General Provisions
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                15.1 Entire Agreement
              </h3>
              <p className="mb-4">
                These Terms, together with our Privacy Policy and Cookie Policy, constitute the entire agreement between you and Lady QR regarding the Services.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                15.2 Severability
              </h3>
              <p className="mb-4">
                If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                15.3 Waiver
              </h3>
              <p className="mb-4">
                Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                15.4 Assignment
              </h3>
              <p className="mb-4">
                You may not assign or transfer these Terms without our written consent. We may assign our rights and obligations without restriction.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                15.5 Force Majeure
              </h3>
              <p className="mb-4">
                We are not liable for any failure or delay in performance due to circumstances beyond our reasonable control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
                16. Contact Information
              </h2>
              <p className="mb-4">
                For questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-4">
                <p className="mb-2"><strong>Email:</strong> legal@lady-qr.com</p>
                <p className="mb-2"><strong>Support:</strong> support@lady-qr.com</p>
                <p className="mb-2"><strong>Contact Form:</strong> <a href="/contact" className="text-primary-600 hover:text-primary-700">lady-qr.com/contact</a></p>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            By using Lady QR, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default Terms;

