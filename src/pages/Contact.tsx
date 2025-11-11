import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

const Contact: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    try {
      // EmailJS configuration
      const serviceId = 'gama-ventures';
      const templateId = 'template_kv50v38';
      const publicKey = 'dNgbSgz45xOHH5tbn';

      // Template parameters - matching EmailJS template variables
      const templateParams = {
        name: form.name,
        user_name: form.name,
        user_email: form.email,
        user_subject: form.subject || 'Support Request',
        user_message: form.message,
        to_name: 'Support Team',
        to_email: 'emmanuel.gama.ibarra@gmail.com', // Recipient email
      };

      console.log('Sending email with params:', templateParams);

      // Send email using EmailJS
      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );

      console.log('EmailJS response:', response);

      setStatusMessage({
        type: 'success',
        text: 'Message sent successfully! We\'ll get back to you soon.'
      });

      // Reset form
      setForm({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error: any) {
      console.error('EmailJS error:', error);
      const errorMessage = error?.text || error?.message || 'Failed to send message. Please try again later.';
      console.error('Error details:', errorMessage);
      setStatusMessage({
        type: 'error',
        text: `Failed to send message: ${errorMessage}`
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-poppins font-bold text-gray-900 dark:text-white">Contact Support</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Our team is here to help. Fill out the form below and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {statusMessage && (
            <div className={`mb-4 p-4 rounded-lg ${
              statusMessage.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
            }`}>
              {statusMessage.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
              <input
                id="subject"
                type="text"
                value={form.subject}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="How can we help?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
              <textarea
                id="message"
                value={form.message}
                onChange={handleChange}
                rows={6}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Please include as many details as possible"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className={`inline-flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                  submitting
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                {submitting ? 'Sending…' : 'Send message'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center">
          <p>Support hours: Monday to Friday, 9:00–18:00 (UTC)</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;