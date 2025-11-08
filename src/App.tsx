import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
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

function App() {
  return (
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
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;