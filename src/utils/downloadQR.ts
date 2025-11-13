import QRCode from 'qrcode';

export interface QRDownloadOptions {
  data: string;
  filename?: string;
  size?: number;
  format?: 'png' | 'jpg' | 'svg' | 'pdf';
  foregroundColor?: string;
  backgroundColor?: string;
  logoUrl?: string;
}

export const downloadQRCode = async (options: QRDownloadOptions): Promise<void> => {
  const {
    data,
    filename = 'qr-code',
    size = 1024,
    format = 'png',
    foregroundColor = '#000000',
    backgroundColor = '#ffffff',
    logoUrl
  } = options;

  try {
    switch (format) {
      case 'svg':
        await downloadSVG(data, filename, foregroundColor, backgroundColor);
        break;
      case 'pdf':
        await downloadPDF(data, filename, size, foregroundColor, backgroundColor, logoUrl);
        break;
      case 'jpg':
        await downloadRaster(data, filename, size, foregroundColor, backgroundColor, logoUrl, 'image/jpeg', 'jpg');
        break;
      case 'png':
      default:
        await downloadRaster(data, filename, size, foregroundColor, backgroundColor, logoUrl, 'image/png', 'png');
        break;
    }
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw error;
  }
};

// Download raster formats (PNG, JPG)
const downloadRaster = async (
  data: string,
  filename: string,
  size: number,
  foregroundColor: string,
  backgroundColor: string,
  logoUrl: string | undefined,
  mimeType: string,
  extension: string
): Promise<void> => {
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
    link.download = `${filename}.${extension}`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, mimeType);
};

// Download SVG format
const downloadSVG = async (
  data: string,
  filename: string,
  foregroundColor: string,
  backgroundColor: string
): Promise<void> => {
  const svgString = await QRCode.toString(data, {
    type: 'svg',
    margin: 2,
    color: {
      dark: foregroundColor,
      light: backgroundColor
    },
    errorCorrectionLevel: 'M'
  });

  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${filename}.svg`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Download PDF format
const downloadPDF = async (
  data: string,
  filename: string,
  size: number,
  foregroundColor: string,
  backgroundColor: string,
  logoUrl: string | undefined
): Promise<void> => {
  // Create canvas first
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

  // Convert canvas to data URL
  const imgData = canvas.toDataURL('image/png');

  // Create PDF using jsPDF
  // Dynamically import jsPDF to avoid bundle size issues
  const { jsPDF } = await import('jspdf');

  // Create A4 PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Calculate size to fit nicely on A4 (210mm x 297mm)
  const pdfWidth = 150; // mm
  const pdfHeight = 150; // mm
  const xOffset = (210 - pdfWidth) / 2; // Center horizontally
  const yOffset = 40; // Start from top with some margin

  pdf.addImage(imgData, 'PNG', xOffset, yOffset, pdfWidth, pdfHeight);

  pdf.save(`${filename}.pdf`);
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

