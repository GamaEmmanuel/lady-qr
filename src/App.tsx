import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import CookieConsent from 'react-cookie-consent';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Create from './pages/Create';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import Features from './pages/Features';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import FAQ from './pages/FAQ';
import CreateGuest from './pages/CreateGuest';
import AuthComplete from './pages/AuthComplete';
import Archive from './pages/Archive';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <AuthProvider>
            <Router>
              <ScrollToTop />
              <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/create" element={<Create />} />
                    <Route path="/create-guest" element={<CreateGuest />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/auth/complete" element={<AuthComplete />} />
                    <Route path="/archive" element={<ProtectedRoute><Archive /></ProtectedRoute>} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/cookies" element={<Cookies />} />
                    {/* 404 Catch-all Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />

                {/* Cookie Consent Banner */}
                <CookieConsent
                  location="bottom"
                  buttonText="Accept All Cookies"
                  declineButtonText="Decline"
                  enableDeclineButton
                  cookieName="ladyQRCookieConsent"
                  style={{
                    background: "#1f2937",
                    padding: "20px",
                    alignItems: "center"
                  }}
                  buttonStyle={{
                    background: "#9333ea",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    borderRadius: "6px",
                    padding: "10px 24px",
                    margin: "0 8px"
                  }}
                  declineButtonStyle={{
                    background: "transparent",
                    border: "1px solid #9ca3af",
                    color: "#9ca3af",
                    fontSize: "14px",
                    fontWeight: "600",
                    borderRadius: "6px",
                    padding: "10px 24px"
                  }}
                  expires={365}
                  onAccept={() => {
                    console.log('✅ Cookies accepted');
                    // Enable Google Analytics
                    if (window.gtag) {
                      window.gtag('consent', 'update', {
                        'analytics_storage': 'granted'
                      });
                    }
                  }}
                  onDecline={() => {
                    console.log('❌ Cookies declined');
                    // Disable Google Analytics
                    if (window.gtag) {
                      window.gtag('consent', 'update', {
                        'analytics_storage': 'denied'
                      });
                    }
                  }}
                >
                  <span className="text-sm text-gray-100">
                    We use cookies to enhance your experience, analyze site traffic, and personalize content.{" "}
                    <Link
                      to="/cookies"
                      className="underline text-primary-400 hover:text-primary-300"
                    >
                      Learn more about our cookie policy
                    </Link>
                  </span>
                </CookieConsent>
              </div>
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;