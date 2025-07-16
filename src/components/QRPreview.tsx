import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QRCustomization } from '../types';
import { ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface QRPreviewProps {
  data: string;
  customization: QRCustomization;
  size?: number;
  className?: string;
  isExpired?: boolean;
}

const QRPreview: React.FC<QRPreviewProps> = ({ 
  data, 
  customization, 
  size = 200,
  className = '',
  isExpired = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data || isExpired) return;

    const generateQR = async () => {
      try {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Generate QR code
        await QRCode.toCanvas(canvas, data, {
          width: size,
          margin: 2,
          color: {
            dark: customization.foregroundColor || '#000000',
            light: customization.backgroundColor || '#ffffff'
          },
          errorCorrectionLevel: customization.logoUrl ? 'H' : 'M'
        });
        
        // Add logo if provided
        if (customization.logoUrl) {
          const logo = new Image();
          logo.crossOrigin = 'anonymous';
          logo.onload = () => {
            const logoSize = size * 0.2;
            const logoX = (size - logoSize) / 2;
            const logoY = (size - logoSize) / 2;
            
            // Draw white background circle for logo
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, logoSize / 2 + 4, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw logo
            ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
          };
          logo.src = customization.logoUrl;
        }
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();
  }, [data, customization, size, isExpired]);

  if (!data || isExpired) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`} style={{ width: size, height: size }}>
        {isExpired ? (
          <>
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-2" />
            <span className="text-red-600 dark:text-red-400 text-sm text-center px-4">
              QR Code Expired
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-4 mt-1">
              Generate a new code
            </span>
          </>
        ) : (
          <>
            <ClockIcon className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-gray-500 dark:text-gray-400 text-sm">Enter data to preview</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden shadow-lg ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className={`border border-gray-200 dark:border-gray-700 rounded-lg ${
          isExpired ? 'opacity-50 grayscale' : ''
        }`}
      />
      {customization.frameText && (
        <div className={`bg-primary-600 text-white text-center py-2 px-4 text-sm font-inter font-medium ${
          isExpired ? 'opacity-50' : ''
        }`}>
          {customization.frameText}
        </div>
      )}
    </div>
  );
};

export default QRPreview;