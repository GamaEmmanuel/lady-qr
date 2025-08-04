import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Create from '../Create';
import { customRender, mockQRCodeData, mockAnalyticsData, setupFetchMock } from '../../test/utils';
import { getDoc, setDoc } from 'firebase/firestore';

// Mock the components and hooks
vi.mock('../../components/QRAnalytics', () => ({
  default: ({ qrCodeId }: { qrCodeId: string }) => (
    <div data-testid="qr-analytics" data-qr-id={qrCodeId}>
      <div>Total Scans: {mockAnalyticsData.totalScans}</div>
      <div>Unique Scans: {mockAnalyticsData.uniqueScans}</div>
    </div>
  ),
}));

vi.mock('../../components/QRPreview', () => ({
  default: ({ data, customization }: any) => (
    <div data-testid="qr-preview" data-content={data}>
      <div>QR Preview</div>
      <div>Foreground: {customization.foregroundColor}</div>
      <div>Background: {customization.backgroundColor}</div>
    </div>
  ),
}));

vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn().mockResolvedValue(undefined),
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mock'),
  },
}));

vi.mock('react-colorful', () => ({
  HexColorPicker: ({ color, onChange }: any) => (
    <div data-testid="color-picker" onClick={() => onChange('#ff0000')}>
      Color: {color}
    </div>
  ),
}));



describe('Create Page', () => {
  beforeEach(() => {
    setupFetchMock();
    vi.clearAllMocks();
  });

  describe('Create Mode (New QR Code)', () => {
    it('renders create mode correctly', async () => {
      customRender(<Create />);
      await waitFor(() => {
        expect(screen.getByText('Create Professional QR Code')).toBeInTheDocument();
      });
    });

    it('shows QR type selection grid', async () => {
      customRender(<Create />);
      await waitFor(() => {
        expect(screen.getByText('QR Code Type')).toBeInTheDocument();
      });
    });

    it('allows selecting QR code type', async () => {
      const user = userEvent.setup();
      customRender(<Create />);

      const emailButton = await screen.findByText('Email');
      await user.click(emailButton);

      await waitFor(() => {
        expect(screen.getByText('Configuration')).toBeInTheDocument();
        expect(screen.getByLabelText('Email Address *')).toBeInTheDocument();
      });
    });

    it('shows static/dynamic selection for URL type', async () => {
      const user = userEvent.setup();
      customRender(<Create />);

      const urlButton = await screen.findByText('Website');
      await user.click(urlButton);

      await waitFor(() => {
        expect(screen.getByText('Code Type')).toBeInTheDocument();
      });
    });

    it('allows entering QR code name', async () => {
      const user = userEvent.setup();
      customRender(<Create />);

      const nameInput = screen.getByLabelText('Name (for your archive)');
      await user.type(nameInput, 'My Test QR Code');

      expect(nameInput).toHaveValue('My Test QR Code');
    });

    it('allows entering URL configuration', async () => {
      const user = userEvent.setup();
      customRender(<Create />);

      const urlButton = screen.getByText('URL');
      await user.click(urlButton);

      const urlInput = screen.getByLabelText('URL *');
      await user.type(urlInput, 'https://example.com');

      expect(urlInput).toHaveValue('https://example.com');
    });

    it('shows customization options for pro plan', async () => {
      const user = userEvent.setup();
      customRender(<Create />, {
        authValue: {
          currentUser: { uid: 'test-user', email: 'test@example.com' },
          subscription: { planType: 'pro', status: 'active' },
          qrCounts: { staticCodes: 0, dynamicCodes: 0 },
          canCreateQR: vi.fn(() => true),
          loading: false,
        },
      });

      const customizationButton = screen.getByText('Show');
      await user.click(customizationButton);

      expect(screen.getByText('Colors')).toBeInTheDocument();
      expect(screen.getByText('Logo')).toBeInTheDocument();
      expect(screen.getByText('Frame text')).toBeInTheDocument();
    });

    it('hides customization for free plan', () => {
      customRender(<Create />, {
        authValue: {
          currentUser: { uid: 'test-user', email: 'test@example.com' },
          subscription: { planType: 'gratis', status: 'active' },
          qrCounts: { staticCodes: 0, dynamicCodes: 0 },
          canCreateQR: vi.fn(() => true),
          loading: false,
        },
      });

      expect(screen.getByText('Not available on Gratis plan')).toBeInTheDocument();
    });

    it('shows QR preview', () => {
      customRender(<Create />);

      expect(screen.getByTestId('qr-preview')).toBeInTheDocument();
    });

    it('enables save button when form is valid', async () => {
      const user = userEvent.setup();
      customRender(<Create />);

      const urlButton = screen.getByText('URL');
      await user.click(urlButton);

      const urlInput = screen.getByLabelText('URL *');
      await user.type(urlInput, 'https://example.com');

      const saveButton = screen.getByText('Save to History');
      expect(saveButton).not.toBeDisabled();
    });

    it('disables save button when form is invalid', () => {
      customRender(<Create />);

      const saveButton = screen.getByText('Enter Data First');
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Edit Mode (Existing QR Code)', () => {
    beforeEach(() => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true as any,
        data: () => mockQRCodeData,
      } as any);
    });

    it('renders edit mode correctly', async () => {
      customRender(
        <Create />,
        { initialEntries: ['/create?edit=test-qr-id'] }
      );

      await waitFor(() => {
        expect(screen.getByText('Edit QR Code')).toBeInTheDocument();
        expect(screen.getByText('View analytics and edit your QR code settings')).toBeInTheDocument();
      });
    });

    it('shows analytics when editing', async () => {
      customRender(
        <Create />,
        { initialEntries: ['/create?edit=test-qr-id'] }
      );

      await waitFor(() => {
        expect(screen.getByTestId('qr-analytics')).toBeInTheDocument();
        expect(screen.getByText('QR Code Analytics')).toBeInTheDocument();
        expect(screen.getByText('Total Scans: 42')).toBeInTheDocument();
        expect(screen.getByText('Unique Scans: 35')).toBeInTheDocument();
      });
    });

    it('hides QR type selection when editing', async () => {
      customRender(
        <Create />,
        { initialEntries: ['/create?edit=test-qr-id'] }
      );

      await waitFor(() => {
        expect(screen.queryByText('QR Code Type')).not.toBeInTheDocument();
        expect(screen.queryByText('URL')).not.toBeInTheDocument();
        expect(screen.queryByText('Text')).not.toBeInTheDocument();
      });
    });

    it('hides static/dynamic selection when editing', async () => {
      customRender(
        <Create />,
        { initialEntries: ['/create?edit=test-qr-id'] }
      );

      await waitFor(() => {
        expect(screen.queryByText('Code Type')).not.toBeInTheDocument();
        expect(screen.queryByText('Static')).not.toBeInTheDocument();
        expect(screen.queryByText('Dynamic')).not.toBeInTheDocument();
      });
    });

    it('loads existing QR code data', async () => {
      customRender(
        <Create />,
        { initialEntries: ['/create?edit=test-qr-id'] }
      );

      await waitFor(() => {
        const nameInput = screen.getByLabelText('Name (for your archive)');
        expect(nameInput).toHaveValue('Test QR Code');

        const urlInput = screen.getByLabelText('URL *');
        expect(urlInput).toHaveValue('https://example.com');
      });
    });

    it('allows editing QR code name', async () => {
      const user = userEvent.setup();
      customRender(
        <Create />,
        { initialEntries: ['/create?edit=test-qr-id'] }
      );

      await waitFor(async () => {
        const nameInput = screen.getByLabelText('Name (for your archive)');
        await user.clear(nameInput);
        await user.type(nameInput, 'Updated QR Code Name');

        expect(nameInput).toHaveValue('Updated QR Code Name');
      });
    });

    it('allows editing QR code content', async () => {
      const user = userEvent.setup();
      customRender(
        <Create />,
        { initialEntries: ['/create?edit=test-qr-id'] }
      );

      await waitFor(async () => {
        const urlInput = screen.getByLabelText('URL *');
        await user.clear(urlInput);
        await user.type(urlInput, 'https://updated-example.com');

        expect(urlInput).toHaveValue('https://updated-example.com');
      });
    });

    it('allows editing customization options', async () => {
      const user = userEvent.setup();
      customRender(
        <Create />,
        {
          initialEntries: ['/create?edit=test-qr-id'],
          authValue: {
            currentUser: { uid: 'test-user', email: 'test@example.com' },
            subscription: { planType: 'pro', status: 'active' },
            qrCounts: { staticCodes: 0, dynamicCodes: 0 },
            canCreateQR: vi.fn(() => true),
            loading: false,
          },
        }
      );

      await waitFor(async () => {
        const customizationButton = screen.getByText('Show');
        await user.click(customizationButton);

        const frameTextInput = screen.getByLabelText('Frame text');
        await user.clear(frameTextInput);
        await user.type(frameTextInput, 'SCAN ME NOW');

        expect(frameTextInput).toHaveValue('SCAN ME NOW');
      });
    });

    it('shows update button instead of save button', async () => {
      customRender(
        <Create />,
        { initialEntries: ['/create?edit=test-qr-id'] }
      );

      await waitFor(() => {
        expect(screen.getByText('Update QR Code')).toBeInTheDocument();
        expect(screen.queryByText('Save to History')).not.toBeInTheDocument();
      });
    });

    it('shows creation and update dates in preview', async () => {
      customRender(
        <Create />,
        { initialEntries: ['/create?edit=test-qr-id'] }
      );

      await waitFor(() => {
        expect(screen.getByText('Created: 1/1/2024')).toBeInTheDocument();
        expect(screen.getByText('Last updated: 1/15/2024')).toBeInTheDocument();
      });
    });

    it('handles loading state', () => {
      vi.mocked(getDoc).mockImplementation(() => new Promise(() => {})); // Never resolves

      customRender(
        <Create />,
        { initialEntries: ['/create?edit=test-qr-id'] }
      );

      expect(screen.getByText('Loading QR code...')).toBeInTheDocument();
    });

    it('handles QR code not found', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false as any,
        data: () => null,
      } as any);

      customRender(
        <Create />,
        { initialEntries: ['/create?edit=test-qr-id'] }
      );

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('QR code not found');
      });

      alertSpy.mockRestore();
    });

    it('handles unauthorized access', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true as any,
        data: () => ({ ...mockQRCodeData, userId: 'different-user-id' }),
      } as any);

      customRender(
        <Create />,
        { initialEntries: ['/create?edit=test-qr-id'] }
      );

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('You do not have permission to edit this QR code');
      });

      alertSpy.mockRestore();
    });
  });

  describe('Form Validation', () => {
    it('requires URL for URL type', async () => {
      const user = userEvent.setup();
      customRender(<Create />);

      const urlButton = await screen.findByText('Website');
      await user.click(urlButton);

      const saveButton = screen.getByText('Enter Data First');
      expect(saveButton).toBeDisabled();

      const urlInput = screen.getByLabelText('Website URL *');
      await user.type(urlInput, 'https://example.com');

      await waitFor(() => {
        expect(screen.getByText('Save to History')).not.toBeDisabled();
      });
    });

    it('requires email for email type', async () => {
      const user = userEvent.setup();
      customRender(<Create />);

      const emailButton = await screen.findByText('Email');
      await user.click(emailButton);

      const emailInput = screen.getByLabelText('Email Address *');
      await user.type(emailInput, 'test@example.com');

      await waitFor(() => {
        expect(screen.getByText('Save to History')).not.toBeDisabled();
      });
    });

    it('requires phone for SMS type', async () => {
      const user = userEvent.setup();
      customRender(<Create />);

      const smsButton = await screen.findByText('SMS');
      await user.click(smsButton);

      const phoneInput = screen.getByLabelText('Phone Number *');
      await user.type(phoneInput, '+1234567890');

      await waitFor(() => {
        expect(screen.getByText('Save to History')).not.toBeDisabled();
      });
    });
  });

  describe('Plan Limitations', () => {
    it('shows plan limit warning when static codes limit reached', async () => {
      customRender(<Create />, {
        authValue: {
          currentUser: { uid: 'test-user', email: 'test@example.com' },
          subscription: { planType: 'gratis', status: 'active' },
          qrCounts: { staticCodes: 3, dynamicCodes: 0 },
          canCreateQR: vi.fn((type) => type === 'dynamic'),
          loading: false,
        },
      });

      await waitFor(() => {
        expect(screen.getByText('Plan Limit Reached')).toBeInTheDocument();
      });
    });

    it('shows plan limit warning when dynamic codes limit reached', async () => {
      customRender(<Create />, {
        authValue: {
          currentUser: { uid: 'test-user', email: 'test@example.com' },
          subscription: { planType: 'gratis', status: 'active' },
          qrCounts: { staticCodes: 0, dynamicCodes: 1 },
          canCreateQR: vi.fn((type) => type === 'static'),
          loading: false,
        },
      });

      await waitFor(() => {
        expect(screen.getByText('Plan Limit Reached')).toBeInTheDocument();
      });
    });
  });
});