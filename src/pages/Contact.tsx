import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const subject = encodeURIComponent(form.subject || `Support request from ${form.name || 'Customer'}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
    );

    window.location.href = `mailto:support@ladyqr.com?subject=${subject}&body=${body}`;

    setTimeout(() => setSubmitting(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-poppins font-bold text-gray-900 dark:text-white">Contact Support</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Our team is here to help. Fill out the form below or email us directly at
            {' '}<a href="mailto:support@ladyqr.com" className="text-primary-600 hover:text-primary-700">support@ladyqr.com</a>.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
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