import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';

// Mock Firebase Firestore
export const mockFirestore = {
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
};

// Mock Firebase Auth
export const mockAuth = {
  currentUser: null,
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
};

// Mock subscription data
export const mockSubscription = {
  planType: 'pro',
  status: 'active',
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

// Mock QR counts
export const mockQRCounts = {
  staticCodes: 5,
  dynamicCodes: 3,
};

// Mock user data
export const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
};

// Mock QR code data
export const mockQRCodeData = {
  id: 'test-qr-id',
  userId: 'test-user-id',
  name: 'Test QR Code',
  type: 'url' as const,
  isDynamic: true,
  content: {
    url: 'https://example.com',
    name: 'Test QR Code',
  },
  originalContent: {
    url: 'https://example.com',
    name: 'Test QR Code',
  },
  customizationOptions: {
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    cornerSquareStyle: 'square',
    cornerDotStyle: 'square',
    dotsStyle: 'square',
    frameText: 'SCAN ME',
  },
  destinationUrl: 'https://example.com',
  shortUrlId: 'short-test-id',
  scanCount: 42,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
};

// Mock analytics data
export const mockAnalyticsData = {
  totalScans: 42,
  uniqueScans: 35,
  recentScans: [
    {
      id: 'scan-1',
      qrCodeId: 'test-qr-id',
      scannedAt: '2024-01-15T10:00:00Z',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      location: {
        country: 'United States',
        city: 'New York',
        region: 'NY',
        lat: 40.7128,
        lng: -74.0060,
      },
      deviceInfo: {
        type: 'mobile' as const,
        os: 'iOS',
        browser: 'Safari',
        version: '14.0',
      },
    },
  ],
  countryStats: {
    'United States': 25,
    'Canada': 10,
    'Mexico': 7,
  },
  deviceStats: {
    mobile: 30,
    desktop: 10,
    tablet: 2,
  },
  dateStats: {
    '2024-01-15': 5,
    '2024-01-14': 8,
    '2024-01-13': 12,
    '2024-01-12': 6,
    '2024-01-11': 4,
    '2024-01-10': 3,
    '2024-01-09': 4,
  },
  lastScannedAt: '2024-01-15T10:00:00Z',
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authValue?: any;
  themeValue?: any;
  initialEntries?: string[];
}

export const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    authValue = {
      currentUser: mockUser,
      subscription: mockSubscription,
      qrCounts: mockQRCounts,
      canCreateQR: vi.fn(() => true),
      loading: false,
    },
    themeValue = {
      isDark: false,
      toggleTheme: vi.fn(),
    },
    initialEntries = ['/'],
    ...renderOptions
  } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>
      <ThemeContext.Provider value={themeValue}>
        <AuthContext.Provider value={authValue}>
          {children}
        </AuthContext.Provider>
      </ThemeContext.Provider>
    </MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock fetch for analytics API
export const mockFetch = vi.fn();

// Setup global fetch mock
export const setupFetchMock = () => {
  global.fetch = mockFetch;
  mockFetch.mockClear();
};

// Mock QRCode library
export const mockQRCode = {
  toCanvas: vi.fn().mockResolvedValue(undefined),
  toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mock'),
};

// Mock react-colorful
export const mockHexColorPicker = vi.fn(() => <div data-testid="color-picker" />);