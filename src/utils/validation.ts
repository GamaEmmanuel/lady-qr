// Form validation utilities for QR code creation

export interface ValidationError {
  field: string;
  message: string;
  type?: 'error' | 'warning'; // warnings don't block save, just inform user
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  fixedData?: Record<string, any>;
}

// ============================================
// BASIC VALIDATORS
// ============================================

/**
 * Validates and optionally fixes a URL
 * - Checks if URL has a valid protocol (http:// or https://)
 * - Can auto-fix by adding https:// if missing
 */
export const validateUrl = (url: string, autoFix: boolean = false): { isValid: boolean; fixedValue?: string; error?: string } => {
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();

  // Check if it already has a valid protocol
  if (/^https?:\/\/.+/.test(trimmedUrl)) {
    // Basic URL structure validation
    try {
      const urlObj = new URL(trimmedUrl);
      // Make sure it has a valid hostname
      if (!urlObj.hostname || urlObj.hostname.length < 1) {
        return { isValid: false, error: 'Invalid URL format' };
      }
      return { isValid: true, fixedValue: trimmedUrl };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }

  // URL doesn't have protocol
  if (autoFix) {
    // Try to fix by adding https://
    const fixedUrl = `https://${trimmedUrl}`;
    try {
      const urlObj = new URL(fixedUrl);
      if (!urlObj.hostname || urlObj.hostname.length < 1) {
        return { isValid: false, error: 'Invalid URL format' };
      }
      return { isValid: true, fixedValue: fixedUrl };
    } catch {
      return { isValid: false, error: 'Invalid URL format. Please enter a valid website address.' };
    }
  }

  return {
    isValid: false,
    error: 'URL must start with https:// or http:// (e.g., https://example.com)'
  };
};

/**
 * Validates an email address
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address (e.g., name@example.com)' };
  }

  return { isValid: true };
};

/**
 * Validates a phone number
 * - Allows digits, spaces, dashes, parentheses, and plus sign
 * - Must have at least 7 digits
 */
export const validatePhone = (phone: string, requireCountryCode: boolean = false): { isValid: boolean; fixedValue?: string; error?: string } => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters except +
  const digitsOnly = phone.replace(/[^\d+]/g, '');
  const digitCount = digitsOnly.replace(/\+/g, '').length;

  if (digitCount < 7) {
    return { isValid: false, error: 'Phone number must have at least 7 digits' };
  }

  if (digitCount > 15) {
    return { isValid: false, error: 'Phone number is too long (max 15 digits)' };
  }

  if (requireCountryCode && !digitsOnly.startsWith('+') && digitCount < 10) {
    return { isValid: false, error: 'Please include country code (e.g., 14155552671 for US)' };
  }

  // Return cleaned version (digits only, no +)
  return { isValid: true, fixedValue: digitsOnly.replace(/\+/g, '') };
};

// ============================================
// NAME VALIDATORS
// ============================================

/**
 * Validates a person's name
 */
export const validateName = (name: string, fieldLabel: string = 'Name'): { isValid: boolean; error?: string } => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: `${fieldLabel} is required` };
  }

  const trimmed = name.trim();

  if (trimmed.length > 50) {
    return { isValid: false, error: `${fieldLabel} must be 50 characters or less` };
  }

  // Allow letters (including accented), spaces, hyphens, apostrophes
  if (!/^[\p{L}\s\-']+$/u.test(trimmed)) {
    return { isValid: false, error: `${fieldLabel} contains invalid characters` };
  }

  return { isValid: true };
};

// ============================================
// SOCIAL MEDIA VALIDATORS
// ============================================

/**
 * Validates Instagram username or URL
 */
export const validateInstagram = (value: string, type: 'profile' | 'post'): { isValid: boolean; fixedValue?: string; error?: string } => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: type === 'profile' ? 'Instagram username is required' : 'Instagram URL is required' };
  }

  const trimmed = value.trim();

  if (type === 'profile') {
    // Remove @ prefix if present
    let username = trimmed.startsWith('@') ? trimmed.substring(1) : trimmed;

    // Instagram usernames: 1-30 chars, letters, numbers, underscores, periods
    if (!/^[\w.]{1,30}$/.test(username)) {
      return { isValid: false, error: 'Instagram username must be 1-30 characters (letters, numbers, underscores, periods)' };
    }

    // Cannot start or end with period
    if (username.startsWith('.') || username.endsWith('.')) {
      return { isValid: false, error: 'Instagram username cannot start or end with a period' };
    }

    return { isValid: true, fixedValue: username };
  } else {
    // Validate Instagram post/reel URL
    const urlResult = validateUrl(trimmed, true);
    if (!urlResult.isValid) {
      return urlResult;
    }

    const fixedUrl = urlResult.fixedValue || trimmed;
    const instagramPattern = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv)\/[\w-]+/i;

    if (!instagramPattern.test(fixedUrl)) {
      return { isValid: false, error: 'Please enter a valid Instagram post or reel URL (e.g., https://instagram.com/p/... or https://instagram.com/reel/...)' };
    }

    return { isValid: true, fixedValue: fixedUrl };
  }
};

/**
 * Validates Facebook username or URL
 */
export const validateFacebook = (value: string, type: 'profile' | 'post'): { isValid: boolean; fixedValue?: string; error?: string } => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: type === 'profile' ? 'Facebook username/page is required' : 'Facebook URL is required' };
  }

  const trimmed = value.trim();

  if (type === 'profile') {
    // Facebook usernames: 5-50 chars
    if (trimmed.length < 5 || trimmed.length > 50) {
      return { isValid: false, error: 'Facebook username must be 5-50 characters' };
    }

    // Basic validation - allow alphanumeric and periods
    if (!/^[\w.]+$/.test(trimmed)) {
      return { isValid: false, error: 'Facebook username can only contain letters, numbers, and periods' };
    }

    return { isValid: true, fixedValue: trimmed };
  } else {
    // Validate Facebook post URL
    const urlResult = validateUrl(trimmed, true);
    if (!urlResult.isValid) {
      return urlResult;
    }

    const fixedUrl = urlResult.fixedValue || trimmed;
    const facebookPattern = /^https?:\/\/(www\.)?(facebook\.com|fb\.com|fb\.watch)\//i;

    if (!facebookPattern.test(fixedUrl)) {
      return { isValid: false, error: 'Please enter a valid Facebook URL (e.g., https://facebook.com/...)' };
    }

    return { isValid: true, fixedValue: fixedUrl };
  }
};

/**
 * Validates Twitter/X username or URL
 */
export const validateTwitter = (value: string, type: 'profile' | 'post'): { isValid: boolean; fixedValue?: string; error?: string } => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: type === 'profile' ? 'X/Twitter username is required' : 'X/Twitter URL is required' };
  }

  const trimmed = value.trim();

  if (type === 'profile') {
    // Remove @ prefix if present
    let username = trimmed.startsWith('@') ? trimmed.substring(1) : trimmed;

    // Twitter usernames: 1-15 chars, letters, numbers, underscores only
    if (!/^\w{1,15}$/.test(username)) {
      return { isValid: false, error: 'X/Twitter username must be 1-15 characters (letters, numbers, underscores only)' };
    }

    return { isValid: true, fixedValue: username };
  } else {
    // Validate Twitter post URL
    const urlResult = validateUrl(trimmed, true);
    if (!urlResult.isValid) {
      return urlResult;
    }

    const fixedUrl = urlResult.fixedValue || trimmed;
    const twitterPattern = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/i;

    if (!twitterPattern.test(fixedUrl)) {
      return { isValid: false, error: 'Please enter a valid X/Twitter post URL (e.g., https://twitter.com/user/status/123...)' };
    }

    return { isValid: true, fixedValue: fixedUrl };
  }
};

/**
 * Validates LinkedIn username or URL
 */
export const validateLinkedIn = (value: string, type: 'profile' | 'post'): { isValid: boolean; fixedValue?: string; error?: string } => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: type === 'profile' ? 'LinkedIn profile is required' : 'LinkedIn URL is required' };
  }

  const trimmed = value.trim();

  if (type === 'profile') {
    // LinkedIn profile slugs: letters, numbers, hyphens, 3-100 chars
    if (trimmed.length < 3 || trimmed.length > 100) {
      return { isValid: false, error: 'LinkedIn profile must be 3-100 characters' };
    }

    if (!/^[\w-]+$/.test(trimmed)) {
      return { isValid: false, error: 'LinkedIn profile can only contain letters, numbers, and hyphens' };
    }

    return { isValid: true, fixedValue: trimmed };
  } else {
    // Validate LinkedIn post URL
    const urlResult = validateUrl(trimmed, true);
    if (!urlResult.isValid) {
      return urlResult;
    }

    const fixedUrl = urlResult.fixedValue || trimmed;
    const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/(posts|feed|pulse)\//i;

    if (!linkedinPattern.test(fixedUrl)) {
      return { isValid: false, error: 'Please enter a valid LinkedIn post URL (e.g., https://linkedin.com/posts/...)' };
    }

    return { isValid: true, fixedValue: fixedUrl };
  }
};

/**
 * Validates YouTube channel or video URL
 */
export const validateYouTube = (value: string, type: 'channel' | 'video'): { isValid: boolean; fixedValue?: string; error?: string } => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: type === 'channel' ? 'YouTube channel is required' : 'YouTube URL is required' };
  }

  const trimmed = value.trim();

  if (type === 'channel') {
    // YouTube handles start with @ or can be channel IDs
    let handle = trimmed;

    // If it doesn't start with @ and isn't a channel ID format, add @
    if (!handle.startsWith('@') && !handle.startsWith('UC')) {
      handle = `@${handle}`;
    }

    // Validate handle format (if starts with @)
    if (handle.startsWith('@')) {
      const username = handle.substring(1);
      if (!/^[\w.-]{1,30}$/.test(username)) {
        return { isValid: false, error: 'YouTube handle must be 1-30 characters (letters, numbers, underscores, hyphens, periods)' };
      }
    }

    return { isValid: true, fixedValue: handle };
  } else {
    // Validate YouTube video URL
    const urlResult = validateUrl(trimmed, true);
    if (!urlResult.isValid) {
      return urlResult;
    }

    const fixedUrl = urlResult.fixedValue || trimmed;
    const youtubePatterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/i,
      /^https?:\/\/youtu\.be\/[\w-]+/i,
      /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/i,
    ];

    const isValidYouTube = youtubePatterns.some(pattern => pattern.test(fixedUrl));

    if (!isValidYouTube) {
      return { isValid: false, error: 'Please enter a valid YouTube URL (e.g., https://youtube.com/watch?v=... or https://youtu.be/...)' };
    }

    return { isValid: true, fixedValue: fixedUrl };
  }
};

/**
 * Validates TikTok username or video URL
 */
export const validateTikTok = (value: string, type: 'profile' | 'video'): { isValid: boolean; fixedValue?: string; error?: string } => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: type === 'profile' ? 'TikTok username is required' : 'TikTok URL is required' };
  }

  const trimmed = value.trim();

  if (type === 'profile') {
    // Remove @ prefix if present, then add it back
    let username = trimmed.startsWith('@') ? trimmed.substring(1) : trimmed;

    // TikTok usernames: 2-24 chars, letters, numbers, underscores, periods
    if (!/^[\w.]{2,24}$/.test(username)) {
      return { isValid: false, error: 'TikTok username must be 2-24 characters (letters, numbers, underscores, periods)' };
    }

    return { isValid: true, fixedValue: username };
  } else {
    // Validate TikTok video URL
    const urlResult = validateUrl(trimmed, true);
    if (!urlResult.isValid) {
      return urlResult;
    }

    const fixedUrl = urlResult.fixedValue || trimmed;
    const tiktokPatterns = [
      /^https?:\/\/(www\.)?tiktok\.com\/@[\w.]+\/video\/\d+/i,
      /^https?:\/\/vm\.tiktok\.com\/[\w]+/i,
    ];

    const isValidTikTok = tiktokPatterns.some(pattern => pattern.test(fixedUrl));

    if (!isValidTikTok) {
      return { isValid: false, error: 'Please enter a valid TikTok video URL (e.g., https://tiktok.com/@user/video/...)' };
    }

    return { isValid: true, fixedValue: fixedUrl };
  }
};

/**
 * Validates Telegram username
 */
export const validateTelegram = (username: string): { isValid: boolean; fixedValue?: string; error?: string } => {
  if (!username || username.trim() === '') {
    return { isValid: false, error: 'Telegram username is required' };
  }

  // Remove @ prefix if present
  let clean = username.trim();
  if (clean.startsWith('@')) {
    clean = clean.substring(1);
  }

  // Telegram usernames: 5-32 chars, letters, numbers, underscores
  if (clean.length < 5 || clean.length > 32) {
    return { isValid: false, error: 'Telegram username must be 5-32 characters' };
  }

  if (!/^[a-zA-Z][\w]*$/.test(clean)) {
    return { isValid: false, error: 'Telegram username must start with a letter and contain only letters, numbers, and underscores' };
  }

  return { isValid: true, fixedValue: clean };
};

// ============================================
// WIFI VALIDATOR
// ============================================

/**
 * Validates WiFi configuration
 */
export const validateWiFi = (ssid: string, password: string, encryption: string): { errors: ValidationError[] } => {
  const errors: ValidationError[] = [];

  // SSID validation
  if (!ssid || ssid.trim() === '') {
    errors.push({ field: 'ssid', message: 'Network name (SSID) is required' });
  } else if (ssid.length > 32) {
    errors.push({ field: 'ssid', message: 'Network name must be 32 characters or less' });
  }

  // Password validation based on encryption type
  if (encryption === 'WPA' || encryption === 'WPA2' || encryption === 'WPA/WPA2') {
    if (!password || password.trim() === '') {
      errors.push({ field: 'password', message: 'Password is required for WPA networks' });
    } else if (password.length < 8) {
      errors.push({ field: 'password', message: 'WPA password must be at least 8 characters' });
    } else if (password.length > 63) {
      errors.push({ field: 'password', message: 'WPA password must be 63 characters or less' });
    }
  } else if (encryption === 'WEP') {
    if (!password || password.trim() === '') {
      errors.push({ field: 'password', message: 'Password is required for WEP networks' });
    } else if (password.length !== 5 && password.length !== 13 && password.length !== 10 && password.length !== 26) {
      errors.push({ field: 'password', message: 'WEP password must be 5 or 13 characters (ASCII) or 10 or 26 characters (hex)' });
    }
  }
  // No password validation needed for 'nopass'

  return { errors };
};

// ============================================
// LOCATION VALIDATOR
// ============================================

/**
 * Validates Google Maps URL
 */
export const validateMapsUrl = (url: string, autoFix: boolean = false): { isValid: boolean; fixedValue?: string; error?: string } => {
  if (!url || url.trim() === '') {
    return { isValid: true }; // Maps URL is optional
  }

  // First validate as a regular URL
  const urlResult = validateUrl(url, autoFix);
  if (!urlResult.isValid) {
    return urlResult;
  }

  const fixedUrl = urlResult.fixedValue || url;

  // Check if it's a valid Google Maps URL
  const mapsPatterns = [
    /^https?:\/\/(www\.)?google\.[a-z.]+\/maps/,
    /^https?:\/\/maps\.google\.[a-z.]+/,
    /^https?:\/\/goo\.gl\/maps/,
    /^https?:\/\/maps\.app\.goo\.gl/,
  ];

  const isGoogleMaps = mapsPatterns.some(pattern => pattern.test(fixedUrl));

  if (!isGoogleMaps) {
    return {
      isValid: false,
      error: 'Please enter a valid Google Maps URL (e.g., https://maps.google.com/... or https://maps.app.goo.gl/...)'
    };
  }

  return { isValid: true, fixedValue: fixedUrl };
};

/**
 * Validates location data
 */
export const validateLocation = (address: string, mapsUrl: string): { errors: ValidationError[]; fixedData?: Record<string, any> } => {
  const errors: ValidationError[] = [];
  const fixedData: Record<string, any> = {};

  // At least one of address or mapsUrl is required
  if ((!address || address.trim() === '') && (!mapsUrl || mapsUrl.trim() === '')) {
    errors.push({ field: 'address', message: 'Please enter an address or a Google Maps URL' });
    return { errors };
  }

  // Validate address length
  if (address && address.length > 200) {
    errors.push({ field: 'address', message: 'Address must be 200 characters or less' });
  }

  // Validate mapsUrl if provided
  if (mapsUrl && mapsUrl.trim() !== '') {
    const mapsResult = validateMapsUrl(mapsUrl, true);
    if (!mapsResult.isValid) {
      errors.push({ field: 'mapsUrl', message: mapsResult.error || 'Invalid Maps URL' });
    } else if (mapsResult.fixedValue && mapsResult.fixedValue !== mapsUrl) {
      fixedData.mapsUrl = mapsResult.fixedValue;
    }
  }

  return { errors, fixedData: Object.keys(fixedData).length > 0 ? fixedData : undefined };
};

// ============================================
// CALENDAR EVENT VALIDATOR
// ============================================

/**
 * Validates calendar event data
 */
export const validateEvent = (
  title: string,
  startDate: string,
  endDate?: string,
  location?: string,
  description?: string
): { errors: ValidationError[]; warnings: ValidationError[] } => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Title validation
  if (!title || title.trim() === '') {
    errors.push({ field: 'title', message: 'Event title is required' });
  } else if (title.length > 100) {
    errors.push({ field: 'title', message: 'Event title must be 100 characters or less' });
  }

  // Start date validation
  if (!startDate) {
    errors.push({ field: 'startDate', message: 'Start date is required' });
  } else {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      errors.push({ field: 'startDate', message: 'Invalid start date format' });
    } else {
      // Warning if date is in the past
      const now = new Date();
      if (start < now) {
        warnings.push({ field: 'startDate', message: 'Start date is in the past', type: 'warning' });
      }
    }
  }

  // End date validation
  if (endDate) {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      errors.push({ field: 'endDate', message: 'Invalid end date format' });
    } else if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime()) && end <= start) {
        errors.push({ field: 'endDate', message: 'End date must be after start date' });
      }
    }
  }

  // Location validation
  if (location && location.length > 200) {
    errors.push({ field: 'location', message: 'Location must be 200 characters or less' });
  }

  // Description validation
  if (description && description.length > 1000) {
    errors.push({ field: 'description', message: 'Description must be 1000 characters or less' });
  }

  return { errors, warnings };
};

// ============================================
// TEXT VALIDATORS
// ============================================

/**
 * Validates text content
 */
export const validateText = (text: string): { isValid: boolean; error?: string } => {
  if (!text || text.trim() === '') {
    return { isValid: false, error: 'Text content is required' };
  }

  if (text.length > 300) {
    return { isValid: false, error: 'Text must be 300 characters or less' };
  }

  return { isValid: true };
};

/**
 * Validates email subject
 */
export const validateEmailSubject = (subject: string): { isValid: boolean; error?: string } => {
  if (subject && subject.length > 200) {
    return { isValid: false, error: 'Subject must be 200 characters or less' };
  }

  if (subject && subject.includes('\n')) {
    return { isValid: false, error: 'Subject cannot contain line breaks' };
  }

  return { isValid: true };
};

/**
 * Validates SMS message (with warning for length)
 */
export const validateSmsMessage = (message: string): { isValid: boolean; warning?: string } => {
  if (message && message.length > 160) {
    return { isValid: true, warning: 'Message exceeds 160 characters and may be split into multiple SMS' };
  }

  return { isValid: true };
};

// ============================================
// MAIN FORM VALIDATOR
// ============================================

/**
 * Validates form data for a specific QR type
 * Returns validation errors, warnings, and optionally fixed data
 */
export const validateFormData = (
  type: string,
  formData: Record<string, any>,
  autoFix: boolean = true
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const fixedData: Record<string, any> = { ...formData };

  switch (type) {
    case 'url': {
      if (formData.url) {
        const result = validateUrl(formData.url, autoFix);
        if (!result.isValid) {
          errors.push({ field: 'url', message: result.error || 'Invalid URL' });
        } else if (result.fixedValue && result.fixedValue !== formData.url) {
          fixedData.url = result.fixedValue;
        }
      } else {
        errors.push({ field: 'url', message: 'Website URL is required' });
      }
      break;
    }

    case 'text': {
      const textResult = validateText(formData.text);
      if (!textResult.isValid) {
        errors.push({ field: 'text', message: textResult.error || 'Invalid text' });
      }
      break;
    }

    case 'email': {
      // Email recipient
      if (!formData.email) {
        errors.push({ field: 'email', message: 'Recipient email is required' });
      } else {
        const emailResult = validateEmail(formData.email);
        if (!emailResult.isValid) {
          errors.push({ field: 'email', message: emailResult.error || 'Invalid email' });
        }
      }

      // Subject
      if (formData.subject) {
        const subjectResult = validateEmailSubject(formData.subject);
        if (!subjectResult.isValid) {
          errors.push({ field: 'subject', message: subjectResult.error || 'Invalid subject' });
        }
      }

      // Body length
      if (formData.body && formData.body.length > 1000) {
        errors.push({ field: 'body', message: 'Message must be 1000 characters or less' });
      }
      break;
    }

    case 'sms': {
      // Phone number
      if (!formData.phone) {
        errors.push({ field: 'phone', message: 'Phone number is required' });
      } else {
        const phoneResult = validatePhone(formData.phone);
        if (!phoneResult.isValid) {
          errors.push({ field: 'phone', message: phoneResult.error || 'Invalid phone number' });
        } else if (phoneResult.fixedValue) {
          fixedData.phone = phoneResult.fixedValue;
        }
      }

      // SMS message warning
      if (formData.message) {
        const smsResult = validateSmsMessage(formData.message);
        if (smsResult.warning) {
          warnings.push({ field: 'message', message: smsResult.warning, type: 'warning' });
        }
      }
      break;
    }

    case 'whatsapp': {
      // Phone number with country code
      if (!formData.phone) {
        errors.push({ field: 'phone', message: 'Phone number is required' });
      } else {
        const phoneResult = validatePhone(formData.phone, true); // require country code
        if (!phoneResult.isValid) {
          errors.push({ field: 'phone', message: phoneResult.error || 'Invalid phone number' });
        } else if (phoneResult.fixedValue) {
          fixedData.phone = phoneResult.fixedValue;
        }
      }

      // Message length
      if (formData.message && formData.message.length > 1000) {
        errors.push({ field: 'message', message: 'Message must be 1000 characters or less' });
      }
      break;
    }

    case 'vcard': {
      // First name
      if (!formData.firstName) {
        errors.push({ field: 'firstName', message: 'First name is required' });
      } else {
        const fnResult = validateName(formData.firstName, 'First name');
        if (!fnResult.isValid) {
          errors.push({ field: 'firstName', message: fnResult.error || 'Invalid first name' });
        }
      }

      // Last name
      if (!formData.lastName) {
        errors.push({ field: 'lastName', message: 'Last name is required' });
      } else {
        const lnResult = validateName(formData.lastName, 'Last name');
        if (!lnResult.isValid) {
          errors.push({ field: 'lastName', message: lnResult.error || 'Invalid last name' });
        }
      }

      // Company
      if (formData.company && formData.company.length > 100) {
        errors.push({ field: 'company', message: 'Company must be 100 characters or less' });
      }

      // Job title
      if (formData.jobTitle && formData.jobTitle.length > 100) {
        errors.push({ field: 'jobTitle', message: 'Job title must be 100 characters or less' });
      }

      // Email
      if (formData.email) {
        const emailResult = validateEmail(formData.email);
        if (!emailResult.isValid) {
          errors.push({ field: 'email', message: emailResult.error || 'Invalid email' });
        }
      }

      // Phone
      if (formData.phone) {
        const phoneResult = validatePhone(formData.phone);
        if (!phoneResult.isValid) {
          errors.push({ field: 'phone', message: phoneResult.error || 'Invalid phone' });
        } else if (phoneResult.fixedValue) {
          fixedData.phone = phoneResult.fixedValue;
        }
      }

      // Website
      if (formData.website) {
        const urlResult = validateUrl(formData.website, autoFix);
        if (!urlResult.isValid) {
          errors.push({ field: 'website', message: urlResult.error || 'Invalid website URL' });
        } else if (urlResult.fixedValue && urlResult.fixedValue !== formData.website) {
          fixedData.website = urlResult.fixedValue;
        }
      }

      // Address
      if (formData.address && formData.address.length > 200) {
        errors.push({ field: 'address', message: 'Address must be 200 characters or less' });
      }
      break;
    }

    case 'wifi': {
      const wifiResult = validateWiFi(formData.ssid, formData.password, formData.encryption || 'WPA');
      errors.push(...wifiResult.errors);
      break;
    }

    case 'location': {
      const locationResult = validateLocation(formData.address, formData.mapsUrl);
      errors.push(...locationResult.errors);
      if (locationResult.fixedData) {
        Object.assign(fixedData, locationResult.fixedData);
      }
      break;
    }

    case 'event': {
      const eventResult = validateEvent(
        formData.title,
        formData.startDate,
        formData.endDate,
        formData.location,
        formData.description
      );
      errors.push(...eventResult.errors);
      warnings.push(...eventResult.warnings);
      break;
    }

    case 'instagram': {
      if (!formData.instagramType) {
        errors.push({ field: 'instagramType', message: 'Please select profile or post' });
      } else {
        const result = validateInstagram(formData.instagramValue, formData.instagramType);
        if (!result.isValid) {
          errors.push({ field: 'instagramValue', message: result.error || 'Invalid Instagram value' });
        } else if (result.fixedValue && result.fixedValue !== formData.instagramValue) {
          fixedData.instagramValue = result.fixedValue;
        }
      }
      break;
    }

    case 'facebook': {
      if (!formData.facebookType) {
        errors.push({ field: 'facebookType', message: 'Please select profile or post' });
      } else {
        const result = validateFacebook(formData.facebookValue, formData.facebookType);
        if (!result.isValid) {
          errors.push({ field: 'facebookValue', message: result.error || 'Invalid Facebook value' });
        } else if (result.fixedValue && result.fixedValue !== formData.facebookValue) {
          fixedData.facebookValue = result.fixedValue;
        }
      }
      break;
    }

    case 'twitter': {
      if (!formData.twitterType) {
        errors.push({ field: 'twitterType', message: 'Please select profile or post' });
      } else {
        const result = validateTwitter(formData.twitterValue, formData.twitterType);
        if (!result.isValid) {
          errors.push({ field: 'twitterValue', message: result.error || 'Invalid X/Twitter value' });
        } else if (result.fixedValue && result.fixedValue !== formData.twitterValue) {
          fixedData.twitterValue = result.fixedValue;
        }
      }
      break;
    }

    case 'linkedin': {
      if (!formData.linkedinType) {
        errors.push({ field: 'linkedinType', message: 'Please select profile or post' });
      } else {
        const result = validateLinkedIn(formData.linkedinValue, formData.linkedinType);
        if (!result.isValid) {
          errors.push({ field: 'linkedinValue', message: result.error || 'Invalid LinkedIn value' });
        } else if (result.fixedValue && result.fixedValue !== formData.linkedinValue) {
          fixedData.linkedinValue = result.fixedValue;
        }
      }
      break;
    }

    case 'youtube': {
      if (!formData.youtubeType) {
        errors.push({ field: 'youtubeType', message: 'Please select channel or video' });
      } else {
        const result = validateYouTube(formData.youtubeValue, formData.youtubeType);
        if (!result.isValid) {
          errors.push({ field: 'youtubeValue', message: result.error || 'Invalid YouTube value' });
        } else if (result.fixedValue && result.fixedValue !== formData.youtubeValue) {
          fixedData.youtubeValue = result.fixedValue;
        }
      }
      break;
    }

    case 'tiktok': {
      if (!formData.tiktokType) {
        errors.push({ field: 'tiktokType', message: 'Please select profile or video' });
      } else {
        const result = validateTikTok(formData.tiktokValue, formData.tiktokType);
        if (!result.isValid) {
          errors.push({ field: 'tiktokValue', message: result.error || 'Invalid TikTok value' });
        } else if (result.fixedValue && result.fixedValue !== formData.tiktokValue) {
          fixedData.tiktokValue = result.fixedValue;
        }
      }
      break;
    }

    case 'telegram': {
      const result = validateTelegram(formData.username);
      if (!result.isValid) {
        errors.push({ field: 'username', message: result.error || 'Invalid Telegram username' });
      } else if (result.fixedValue && result.fixedValue !== formData.username) {
        fixedData.username = result.fixedValue;
      }
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fixedData: Object.keys(fixedData).length > 0 ? fixedData : undefined
  };
};

/**
 * Gets an error message for a specific field
 */
export const getFieldError = (errors: ValidationError[], fieldId: string): string | undefined => {
  const error = errors.find(e => e.field === fieldId);
  return error?.message;
};

/**
 * Gets a warning message for a specific field
 */
export const getFieldWarning = (warnings: ValidationError[], fieldId: string): string | undefined => {
  const warning = warnings.find(w => w.field === fieldId);
  return warning?.message;
};

/**
 * Checks if a field has an error
 */
export const hasFieldError = (errors: ValidationError[], fieldId: string): boolean => {
  return errors.some(e => e.field === fieldId);
};

/**
 * Checks if a field has a warning
 */
export const hasFieldWarning = (warnings: ValidationError[], fieldId: string): boolean => {
  return warnings.some(w => w.field === fieldId);
};
