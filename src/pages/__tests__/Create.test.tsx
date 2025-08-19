import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Create from '../Create';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import * as qrTracking from '../../utils/qrTracking';

// Mock QR tracking utilities
vi.mock('../../utils/qrTracking', () => ({
  createTrackableQRData: vi.fn(),
  generateOriginalData: vi.fn(),
  generateShortUrl: vi.fn()
}));

// Mock QR Code library
vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn().mockResolvedValue(undefined)
  }
}));

// Mock components
vi.mock('../../components/QRPreview', () => ({
  default: ({ data }: { data: string }) => <div data-testid="qr-preview">{data}</div>
}));

const mockAuthContext = {
  currentUser: {
    uid: 'test-user-123',
    email: 'test@example.com'
  },
  subscription: {
    planType: 'basico' as const,
    status: 'active' as const
  },
  qrCounts: {
    staticCodes: 5,
    dynamicCodes: 2
  },
  canCreateQR: jest.fn().mockReturnValue(true),
  isLoading: false,
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn()
};

const mockThemeContext = {
  theme: 'light' as const,
  toggleTheme: jest.fn()
};

const renderWithContext = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        <ThemeContext.Provider value={mockThemeContext}>
          {component}
        </ThemeContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Create Component - Unified QR System', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the tracking functions
    const mockCreateTrackableQRData = qrTracking.createTrackableQRData as jest.MockedFunction<typeof qrTracking.createTrackableQRData>;
    const mockGenerateOriginalData = qrTracking.generateOriginalData as jest.MockedFunction<typeof qrTracking.generateOriginalData>;
    const mockGenerateShortUrl = qrTracking.generateShortUrl as jest.MockedFunction<typeof qrTracking.generateShortUrl>;

    mockCreateTrackableQRData.mockImplementation((_, qrId) => `https://ladyqr.web.app/r/${qrId}`);
    mockGenerateOriginalData.mockImplementation((type, formData) => {
      if (type === 'url') return formData.url || '';
      return 'test-original-data';
    });
    mockGenerateShortUrl.mockImplementation((qrId) => `https://ladyqr.web.app/r/${qrId}`);
  });

  describe('QR Data Generation', () => {
    it('should generate trackable QR data for URL type', async () => {
      renderWithContext(<Create />);

      // Select URL type
      const urlButton = screen.getByRole('button', { name: /url/i });
      fireEvent.click(urlButton);

      // Enter URL
      const urlInput = screen.getByPlaceholderText(/enter website url/i);
      fireEvent.change(urlInput, { target: { value: 'https://example.com' } });

      // Check that createTrackableQRData is called
      await waitFor(() => {
        expect(qrTracking.createTrackableQRData).toHaveBeenCalled();
      });
    });

    it('should always use short URLs for both static and dynamic QR codes', async () => {
      renderWithContext(<Create />);

      // Test static QR code
      const staticToggle = screen.getByRole('button', { name: /static/i });
      fireEvent.click(staticToggle);

      const urlButton = screen.getByRole('button', { name: /url/i });
      fireEvent.click(urlButton);

      const urlInput = screen.getByPlaceholderText(/enter website url/i);
      fireEvent.change(urlInput, { target: { value: 'https://static.example.com' } });

      await waitFor(() => {
        expect(qrTracking.createTrackableQRData).toHaveBeenCalledWith(
          '',
          expect.stringMatching(/qr-\d+/),
          true // isStatic = true for static QR codes
        );
      });

      // Test dynamic QR code
      const dynamicToggle = screen.getByRole('button', { name: /dynamic/i });
      fireEvent.click(dynamicToggle);

      fireEvent.change(urlInput, { target: { value: 'https://dynamic.example.com' } });

      await waitFor(() => {
        expect(qrTracking.createTrackableQRData).toHaveBeenCalledWith(
          '',
          expect.stringMatching(/temp-\d+/),
          false // isStatic = false for dynamic QR codes
        );
      });
    });
  });

  describe('QR Code Saving with Unified System', () => {
    it('should save static QR code with correct properties', async () => {
      const { setDoc } = require('firebase/firestore');
      setDoc.mockResolvedValueOnce(undefined);

      renderWithContext(<Create />);

      // Configure static URL QR code
      const staticToggle = screen.getByRole('button', { name: /static/i });
      fireEvent.click(staticToggle);

      const urlButton = screen.getByRole('button', { name: /url/i });
      fireEvent.click(urlButton);

      const urlInput = screen.getByPlaceholderText(/enter website url/i);
      fireEvent.change(urlInput, { target: { value: 'https://example.com' } });

      const nameInput = screen.getByPlaceholderText(/enter qr code name/i);
      fireEvent.change(nameInput, { target: { value: 'Test Static QR' } });

      // Save the QR code
      const saveButton = screen.getByRole('button', { name: /save qr code/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(setDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            isDynamic: false,
            isEditable: false, // Static QR codes are not editable
            shortUrlId: expect.stringMatching(/short-\d+/), // All QR codes get short URLs
            destinationUrl: 'https://example.com', // For URL types, store the destination
            content: expect.objectContaining({
              url: 'https://example.com'
            })
          })
        );
      });
    });

    it('should save dynamic QR code with correct properties', async () => {
      const { setDoc } = require('firebase/firestore');
      setDoc.mockResolvedValueOnce(undefined);

      renderWithContext(<Create />);

      // Configure dynamic URL QR code
      const dynamicToggle = screen.getByRole('button', { name: /dynamic/i });
      fireEvent.click(dynamicToggle);

      const urlButton = screen.getByRole('button', { name: /url/i });
      fireEvent.click(urlButton);

      const urlInput = screen.getByPlaceholderText(/enter website url/i);
      fireEvent.change(urlInput, { target: { value: 'https://dynamic.example.com' } });

      const nameInput = screen.getByPlaceholderText(/enter qr code name/i);
      fireEvent.change(nameInput, { target: { value: 'Test Dynamic QR' } });

      // Save the QR code
      const saveButton = screen.getByRole('button', { name: /save qr code/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(setDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            isDynamic: true,
            isEditable: true, // Dynamic QR codes are editable
            shortUrlId: expect.stringMatching(/short-\d+/), // All QR codes get short URLs
            destinationUrl: 'https://dynamic.example.com',
            content: expect.objectContaining({
              url: 'https://dynamic.example.com'
            })
          })
        );
      });
    });

    it('should save non-URL QR code with correct destination data', async () => {
      const { setDoc } = require('firebase/firestore');
      setDoc.mockResolvedValueOnce(undefined);

      // Mock generateOriginalData for email type
      const mockGenerateOriginalData = qrTracking.generateOriginalData as jest.MockedFunction<typeof qrTracking.generateOriginalData>;
      mockGenerateOriginalData.mockImplementation((type, formData) => {
        if (type === 'email') {
          return `mailto:${formData.email}?subject=${encodeURIComponent(formData.subject || '')}&body=${encodeURIComponent(formData.body || '')}`;
        }
        return 'test-data';
      });

      renderWithContext(<Create />);

      // Configure email QR code
      const emailButton = screen.getByRole('button', { name: /email/i });
      fireEvent.click(emailButton);

      const emailInput = screen.getByPlaceholderText(/enter email address/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const subjectInput = screen.getByPlaceholderText(/enter email subject/i);
      fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });

      // Save the QR code
      const saveButton = screen.getByRole('button', { name: /save qr code/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(setDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            type: 'email',
            shortUrlId: expect.stringMatching(/short-\d+/),
            destinationUrl: 'mailto:test@example.com?subject=Test%20Subject&body=', // Generated from original data
            content: expect.objectContaining({
              email: 'test@example.com',
              subject: 'Test Subject'
            })
          })
        );
      });
    });
  });

  describe('QR Preview with Unified System', () => {
    it('should always show short URL in QR preview', async () => {
      renderWithContext(<Create />);

      const urlButton = screen.getByRole('button', { name: /url/i });
      fireEvent.click(urlButton);

      const urlInput = screen.getByPlaceholderText(/enter website url/i);
      fireEvent.change(urlInput, { target: { value: 'https://example.com' } });

      await waitFor(() => {
        const qrPreview = screen.getByTestId('qr-preview');
        expect(qrPreview).toHaveTextContent('https://ladyqr.web.app/r/temp-');
      });
    });

    it('should update QR preview when switching between static and dynamic', async () => {
      renderWithContext(<Create />);

      const urlButton = screen.getByRole('button', { name: /url/i });
      fireEvent.click(urlButton);

      const urlInput = screen.getByPlaceholderText(/enter website url/i);
      fireEvent.change(urlInput, { target: { value: 'https://example.com' } });

      // Both static and dynamic should show short URL
      const staticToggle = screen.getByRole('button', { name: /static/i });
      fireEvent.click(staticToggle);

      await waitFor(() => {
        const qrPreview = screen.getByTestId('qr-preview');
        expect(qrPreview).toHaveTextContent('https://ladyqr.web.app/r/temp-');
      });

      const dynamicToggle = screen.getByRole('button', { name: /dynamic/i });
      fireEvent.click(dynamicToggle);

      await waitFor(() => {
        const qrPreview = screen.getByTestId('qr-preview');
        expect(qrPreview).toHaveTextContent('https://ladyqr.web.app/r/temp-');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle save errors gracefully', async () => {
      const { setDoc } = require('firebase/firestore');
      setDoc.mockRejectedValueOnce(new Error('Firestore error'));

      // Mock alert
      window.alert = jest.fn();

      renderWithContext(<Create />);

      const urlButton = screen.getByRole('button', { name: /url/i });
      fireEvent.click(urlButton);

      const urlInput = screen.getByPlaceholderText(/enter website url/i);
      fireEvent.change(urlInput, { target: { value: 'https://example.com' } });

      const saveButton = screen.getByRole('button', { name: /save qr code/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Error al guardar el código QR. Intenta nuevamente.');
      });
    });

    it('should prevent saving when user has reached QR limit', async () => {
      const limitedAuthContext = {
        ...mockAuthContext,
        canCreateQR: jest.fn().mockReturnValue(false)
      };

      window.alert = jest.fn();

      render(
        <BrowserRouter>
          <AuthContext.Provider value={limitedAuthContext}>
            <ThemeContext.Provider value={mockThemeContext}>
              <Create />
            </ThemeContext.Provider>
          </AuthContext.Provider>
        </BrowserRouter>
      );

      const urlButton = screen.getByRole('button', { name: /url/i });
      fireEvent.click(urlButton);

      const urlInput = screen.getByPlaceholderPath(/enter website url/i);
      fireEvent.change(urlInput, { target: { value: 'https://example.com' } });

      const saveButton = screen.getByRole('button', { name: /save qr code/i });
      fireEvent.click(saveButton);

      expect(window.alert).toHaveBeenCalledWith('Has alcanzado el límite de códigos QR para tu plan actual.');
    });
  });
});