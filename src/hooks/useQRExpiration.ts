import { useState, useEffect, useCallback } from 'react';

interface QRExpirationState {
  isExpired: boolean;
  timeRemaining: number;
  expiresAt: Date | null;
  resetExpiration: () => void;
}

export const useQRExpiration = (qrData: string): QRExpirationState => {
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  const resetExpiration = useCallback(() => {
    const newExpirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    setExpiresAt(newExpirationTime);
    setIsExpired(false);
    
    // Store in localStorage for persistence across page refreshes
    const qrDataHash = btoa(qrData || '');
    localStorage.setItem(`qr_expires_at_${qrDataHash}`, newExpirationTime.toISOString());
    localStorage.setItem(`qr_created_at_${qrDataHash}`, new Date().toISOString());
  }, [qrData]);

  // Initialize expiration time when QR data changes
  useEffect(() => {
    if (!qrData) {
      setExpiresAt(null);
      setTimeRemaining(0);
      setIsExpired(false);
      return;
    }

    const qrDataHash = btoa(qrData);
    const storedExpiration = localStorage.getItem(`qr_expires_at_${qrDataHash}`);
    
    if (storedExpiration) {
      const storedDate = new Date(storedExpiration);
      if (storedDate > new Date()) {
        // Use existing expiration if it's still valid
        setExpiresAt(storedDate);
        setIsExpired(false);
      } else {
        // Create new expiration if stored one is expired
        resetExpiration();
      }
    } else {
      // Create new expiration if none exists
      resetExpiration();
    }
  }, [qrData, resetExpiration]);

  // Update countdown timer
  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiration = expiresAt.getTime();
      const remaining = expiration - now;

      if (remaining <= 0) {
        setTimeRemaining(0);
        setIsExpired(true);
        
        // Clean up localStorage when expired
        if (qrData) {
          const qrDataHash = btoa(qrData);
          localStorage.removeItem(`qr_expires_at_${qrDataHash}`);
          localStorage.removeItem(`qr_created_at_${qrDataHash}`);
        }
      } else {
        setTimeRemaining(remaining);
        setIsExpired(false);
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, qrData]);

  // Cleanup expired QR codes from localStorage on component mount
  useEffect(() => {
    const cleanupExpiredQRs = () => {
      const now = new Date().getTime();
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('qr_expires_at_')) {
          const expirationTime = localStorage.getItem(key);
          if (expirationTime && new Date(expirationTime).getTime() <= now) {
            keysToRemove.push(key);
            const hashPart = key.replace('qr_expires_at_', '');
            keysToRemove.push(`qr_created_at_${hashPart}`);
          }
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    };

    cleanupExpiredQRs();
  }, []);

  return {
    isExpired,
    timeRemaining,
    expiresAt,
    resetExpiration
  };
};