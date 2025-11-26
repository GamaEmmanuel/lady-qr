// SEO Configuration and Schema.org structured data

export const siteConfig = {
  name: 'Lady QR',
  url: 'https://ladyqr.com',
  description: 'Create, customize, and track professional QR codes for your business. Generate dynamic QR codes with analytics, custom designs, and multiple formats.',
  author: 'Lady QR',
  keywords: 'QR code generator, custom QR codes, dynamic QR codes, QR code analytics, free QR code, business QR codes, QR code maker, track QR codes, branded QR codes',
  twitterHandle: '@ladyqr',
};

// Organization Schema
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Lady QR',
  url: 'https://ladyqr.com',
  logo: 'https://ladyqr.com/logo.png',
  description: siteConfig.description,
  sameAs: [
    'https://twitter.com/ladyqr',
    'https://facebook.com/ladyqr',
    'https://linkedin.com/company/ladyqr',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Support',
    email: 'support@ladyqr.com',
    url: 'https://ladyqr.com/contact',
  },
};

// WebSite Schema
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Lady QR',
  url: 'https://ladyqr.com',
  description: siteConfig.description,
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://ladyqr.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

// Software Application Schema
export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Lady QR - QR Code Generator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free plan available with premium options',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250',
    bestRating: '5',
    worstRating: '1',
  },
  description: 'Professional QR code generator with analytics, customization, and tracking features. Create dynamic and static QR codes for business, marketing, and personal use.',
  features: [
    'Dynamic QR Codes',
    'Analytics and Tracking',
    'Custom Designs',
    'Multiple QR Code Types',
    'Logo Integration',
    'Bulk QR Generation',
    'Team Collaboration',
    'API Access',
  ],
  screenshot: 'https://ladyqr.com/assets/analytics-overview.png',
};

// Homepage Breadcrumb Schema
export const homeBreadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://ladyqr.com',
    },
  ],
};

// FAQ Schema Generator
export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

// Product Schema for Pricing Pages
export const generateProductSchema = (planName: string, price: number, description: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: planName,
  description: description,
  brand: {
    '@type': 'Brand',
    name: 'Lady QR',
  },
  offers: {
    '@type': 'Offer',
    price: price.toString(),
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: 'https://ladyqr.com/pricing',
  },
});

// Article Schema for Blog Posts
export const generateArticleSchema = (
  title: string,
  description: string,
  publishedDate: string,
  modifiedDate: string,
  imageUrl: string,
  authorName: string = 'Lady QR Team'
) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description: description,
  image: imageUrl,
  datePublished: publishedDate,
  dateModified: modifiedDate,
  author: {
    '@type': 'Organization',
    name: authorName,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Lady QR',
    logo: {
      '@type': 'ImageObject',
      url: 'https://ladyqr.com/logo.png',
    },
  },
});

// How-To Schema (for tutorial pages)
export const generateHowToSchema = (
  name: string,
  description: string,
  steps: Array<{ name: string; text: string; image?: string }>
) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: name,
  description: description,
  step: steps.map((step, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: step.name,
    text: step.text,
    image: step.image,
  })),
});

