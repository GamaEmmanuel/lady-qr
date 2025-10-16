import QRCode from 'qrcode';

export interface QRDownloadOptions {
  data: string;
  filename?: string;
  size?: number;
  foregroundColor?: string;
  backgroundColor?: string;
  logoUrl?: string;
}

export const downloadQRCode = async (options: QRDownloadOptions): Promise<void> => {
  const {
    data,
    filename = 'qr-code',
    size = 512,
    foregroundColor = '#000000',
    backgroundColor = '#ffffff',
    logoUrl
  } = options;

  try {
    const canvas = document.createElement('canvas');

    await QRCode.toCanvas(canvas, data, {
      width: size,
      margin: 2,
      color: {
        dark: foregroundColor,
        light: backgroundColor
      },
      errorCorrectionLevel: logoUrl ? 'H' : 'M'
    });

    // Add logo if provided
    if (logoUrl) {
      await addLogoToCanvas(canvas, logoUrl, size);
    }

    // Download the canvas
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to generate QR code blob');
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw error;
  }
};

const addLogoToCanvas = (canvas: HTMLCanvasElement, logoUrl: string, size: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(); // Proceed without logo if context cannot be created
      return;
    }

    const logo = new Image();
    logo.crossOrigin = 'anonymous';

    logo.onload = () => {
      try {
        const logoSize = size * 0.15;
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;

        // Draw white background circle for logo
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, logoSize / 2 + 6, 0, 2 * Math.PI);
        ctx.fill();

        // Draw logo with rounded corners
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, logoSize / 2, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
        ctx.restore();

        resolve();
      } catch (error) {
        console.warn('Failed to add logo to QR code:', error);
        resolve(); // Proceed without logo
      }
    };

    logo.onerror = () => {
      console.warn('Failed to load logo image:', logoUrl);
      resolve(); // Proceed without logo
    };

    logo.src = logoUrl;
  });
};

