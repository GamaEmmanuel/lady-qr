# ⚡ Quick Fixes Implementation Guide

These are the **5 most critical** items you can implement in a few hours.

---

## 1. Cookie Consent Banner (30 minutes) 🔥

### Install Package
```bash
cd ladyqr/lady-qr
npm install react-cookie-consent
```

### Update App.tsx
```tsx
// Add import at top
import CookieConsent from "react-cookie-consent";

// Add inside the Router div, before Footer
function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
              <Header />
              <main className="flex-grow">
                {/* Routes */}
              </main>
              <Footer />

              {/* ADD THIS: */}
              <CookieConsent
                location="bottom"
                buttonText="Accept All"
                declineButtonText="Decline"
                enableDeclineButton
                cookieName="ladyQRCookieConsent"
                style={{
                  background: "#1f2937",
                  padding: "20px"
                }}
                buttonStyle={{
                  background: "#9333ea",
                  color: "#fff",
                  fontSize: "14px",
                  borderRadius: "6px",
                  padding: "10px 20px"
                }}
                declineButtonStyle={{
                  background: "transparent",
                  border: "1px solid #9333ea",
                  color: "#9333ea",
                  fontSize: "14px",
                  borderRadius: "6px",
                  padding: "10px 20px"
                }}
                expires={365}
                onAccept={() => {
                  console.log('Cookies accepted');
                  // Enable analytics
                  window.gtag?.('consent', 'update', {
                    'analytics_storage': 'granted'
                  });
                }}
                onDecline={() => {
                  console.log('Cookies declined');
                  // Disable analytics
                  window.gtag?.('consent', 'update', {
                    'analytics_storage': 'denied'
                  });
                }}
              >
                <span className="text-sm">
                  We use cookies to enhance your experience and analyze site traffic.{" "}
                  <Link to="/cookies" className="underline">
                    Learn more
                  </Link>
                </span>
              </CookieConsent>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
```

✅ **Done! Test it:** Clear cookies and reload to see the banner.

---

## 2. Google Analytics 4 (15 minutes) 🔥

### Get Your GA4 ID
1. Go to [analytics.google.com](https://analytics.google.com)
2. Create property or use existing
3. Get Measurement ID (format: `G-XXXXXXXXXX`)

### Add to index.html
```html
<!-- Add in <head> section, AFTER other scripts -->
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}

  // Set default consent to 'denied' for GDPR
  gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied'
  });

  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    'anonymize_ip': true,
    'cookie_flags': 'SameSite=None;Secure'
  });
</script>
```

### Track Custom Events (Optional but Recommended)
```tsx
// src/utils/analytics.ts - ADD THESE:

export const trackGA4Event = (eventName: string, parameters?: Record<string, any>) => {
  if (window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Track important events
export const trackQRCreated = (qrType: string) => {
  trackGA4Event('qr_created', {
    qr_type: qrType,
  });
};

export const trackQRDownloaded = (format: string) => {
  trackGA4Event('qr_downloaded', {
    file_format: format,
  });
};

export const trackSubscriptionPurchase = (plan: string, value: number) => {
  trackGA4Event('purchase', {
    transaction_id: Date.now().toString(),
    value: value,
    currency: 'USD',
    items: [{
      item_name: plan,
    }]
  });
};
```

### Add TypeScript Types
```tsx
// src/vite-env.d.ts - ADD:
interface Window {
  gtag?: (
    command: string,
    action: string,
    params?: Record<string, any>
  ) => void;
}
```

✅ **Done! Test:** Check Real-time reports in GA4.

---

## 3. Error Boundary (20 minutes) 🔥

### Create Component
```tsx
// src/components/ErrorBoundary.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught:', error, errorInfo);

    // TODO: Send to error tracking service
    // trackError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-20 w-20 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Oops! Something went wrong
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-8">
              We're sorry for the inconvenience. The error has been logged and we'll fix it soon.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full rounded-md bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-500 transition-colors"
              >
                Go to Homepage
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Reload Page
              </button>

              <Link
                to="/contact"
                className="block text-sm text-primary-600 hover:text-primary-500 transition-colors"
              >
                Report this issue
              </Link>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Update App.tsx
```tsx
// Add import
import ErrorBoundary from './components/ErrorBoundary';

// Wrap everything
function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        {/* ... rest of your app */}
      </HelmetProvider>
    </ErrorBoundary>
  );
}
```

✅ **Done! Test:** Trigger an error to see the error page.

---

## 4. Sentry Error Monitoring (15 minutes) 🔥

### Install
```bash
npm install @sentry/react
```

### Create Account
1. Go to [sentry.io](https://sentry.io)
2. Create free account
3. Create new project (React)
4. Get your DSN

### Setup
```tsx
// src/main.tsx - ADD AT TOP:
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN_HERE",
  integrations: [
    new Sentry.BrowserTracing({
      // Set 'tracePropagationTargets' to control spans
      tracePropagationTargets: ["localhost", /^https:\/\/yourapp\.com/],
    }),
    new Sentry.Replay(),
  ],

  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of errors

  // Environment
  environment: import.meta.env.MODE, // 'development' or 'production'

  // Don't send errors in development
  enabled: import.meta.env.MODE === 'production',
});

// Then your existing code...
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### Environment Variable
```bash
# .env.production
VITE_SENTRY_DSN=your_sentry_dsn_here
```

### Use in Code
```tsx
// src/main.tsx - update
dsn: import.meta.env.VITE_SENTRY_DSN,
```

### Manual Error Tracking
```tsx
// Anywhere in your code
try {
  // risky code
} catch (error) {
  Sentry.captureException(error);
  console.error(error);
}
```

### Add User Context
```tsx
// After user logs in (in AuthContext.tsx)
import * as Sentry from "@sentry/react";

// In your login/register functions:
Sentry.setUser({
  id: user.uid,
  email: user.email,
  username: user.displayName || undefined,
});

// On logout:
Sentry.setUser(null);
```

✅ **Done! Deploy and check:** Errors will appear in Sentry dashboard.

---

## 5. Security Headers (10 minutes) 🔥

### For Firebase Hosting

Create/update `firebase.json`:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          },
          {
            "key": "Permissions-Policy",
            "value": "geolocation=(), microphone=(), camera=()"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

### Content Security Policy (Advanced)

Add to index.html `<head>`:

```html
<meta http-equiv="Content-Security-Policy"
      content="
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' data: https: blob:;
        connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://api.stripe.com;
        frame-src https://js.stripe.com;
      ">
```

✅ **Done! Test:** Check headers with browser DevTools → Network tab.

---

## Testing Your Implementations

### 1. Cookie Consent
- Clear browser cookies
- Reload page
- Should see banner at bottom
- Click "Accept" → banner disappears
- Check cookies in DevTools → Application → Cookies

### 2. Google Analytics
- Open GA4 dashboard
- Go to Reports → Realtime
- Navigate your site
- Should see your activity in real-time

### 3. Error Boundary
```tsx
// Temporarily add this to any page to test:
<button onClick={() => { throw new Error('Test error') }}>
  Break App
</button>
```
- Click button
- Should see error page, not white screen
- Remove test button after

### 4. Sentry
- Deploy to production
- Trigger an error
- Check Sentry dashboard
- Should see error logged with context

### 5. Security Headers
- Deploy changes
- Open DevTools → Network
- Click any request
- Check Response Headers
- Should see X-Frame-Options, etc.

---

## Deployment Checklist

Before deploying these changes:

- [ ] Test locally: `npm run dev`
- [ ] Test build: `npm run build && npm run preview`
- [ ] Update `.env.production` with real values
- [ ] Test cookie banner (accept & decline)
- [ ] Verify GA4 is receiving events
- [ ] Check error boundary shows nicely
- [ ] Verify Sentry DSN is correct
- [ ] Review firebase.json headers
- [ ] Deploy: `firebase deploy`
- [ ] Test on production URL
- [ ] Monitor Sentry for 24 hours
- [ ] Check GA4 reports next day

---

## 🎉 You're Done!

These 5 implementations cover:
- ✅ Legal compliance (cookies)
- ✅ User tracking (GA4)
- ✅ Error handling (boundary)
- ✅ Error monitoring (Sentry)
- ✅ Security (headers)

**Total Time: ~1.5 hours**
**Impact: Massive improvement in production readiness!**

Next steps: See `PRE_LAUNCH_CHECKLIST.md` for remaining items.

