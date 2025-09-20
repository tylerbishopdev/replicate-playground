/**
 * Security utilities for the Replicate Playground
 * Includes input validation, sanitization, and rate limiting
 */

import crypto from 'crypto';

/**
 * Rate limiting store (in production, use Redis or similar)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiter configuration
 */
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

/**
 * Check if request is within rate limits
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 10 }
): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Reset if window has passed
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { allowed: true };
  }

  // Check if under limit
  if (record.count < config.maxRequests) {
    record.count++;
    return { allowed: true };
  }

  return { allowed: false, resetTime: record.resetTime };
}

/**
 * Validate file upload security
 */
export interface FileValidationOptions {
  maxSize?: number; // Max file size in bytes
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}

export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): { valid: boolean; error?: string } {
  const {
    maxSize = 50 * 1024 * 1024, // 50MB default
    allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'text/plain',
      'application/pdf',
    ],
    allowedExtensions = [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'mp4',
      'webm',
      'mp3',
      'wav',
      'ogg',
      'txt',
      'pdf',
    ],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`,
    };
  }

  // Check MIME type
  if (!allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File extension .${extension} is not allowed`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate URL inputs
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);

    // Only allow HTTP(S) protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
    }

    // Block localhost and private IPs in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = parsed.hostname.toLowerCase();

      // Block localhost
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return { valid: false, error: 'Localhost URLs are not allowed' };
      }

      // Block private IP ranges
      const privateRanges = [
        /^10\./,
        /^172\.(1[6-9]|2\d|3[01])\./,
        /^192\.168\./,
        /^169\.254\./, // Link-local
        /^127\./, // Loopback
      ];

      if (privateRanges.some(range => range.test(hostname))) {
        return { valid: false, error: 'Private IP addresses are not allowed' };
      }
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validate JSON input
 */
export function validateJson(input: string): { valid: boolean; parsed?: any; error?: string } {
  try {
    const parsed = JSON.parse(input);

    // Limit object depth to prevent DoS
    if (getObjectDepth(parsed) > 10) {
      return { valid: false, error: 'JSON object too deeply nested' };
    }

    // Limit object size
    if (JSON.stringify(parsed).length > 100000) {
      return { valid: false, error: 'JSON object too large' };
    }

    return { valid: true, parsed };
  } catch (error: any) {
    return { valid: false, error: `Invalid JSON: ${error.message}` };
  }
}

/**
 * Get the depth of a nested object
 */
function getObjectDepth(obj: any, depth = 0): number {
  if (depth > 20) return depth; // Prevent stack overflow

  if (obj && typeof obj === 'object') {
    return 1 + Math.max(
      0,
      ...Object.values(obj).map(value => getObjectDepth(value, depth + 1))
    );
  }

  return 0;
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'),
    Buffer.from(storedToken, 'hex')
  );
}

/**
 * Hash sensitive data
 */
export function hashData(data: string, salt?: string): string {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(data, actualSalt, 100000, 64, 'sha512');
  return `${actualSalt}:${hash.toString('hex')}`;
}

/**
 * Verify hashed data
 */
export function verifyHashedData(data: string, hash: string): boolean {
  try {
    const [salt, originalHash] = hash.split(':');
    const newHash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha512');
    return crypto.timingSafeEqual(
      Buffer.from(originalHash, 'hex'),
      newHash
    );
  } catch {
    return false;
  }
}

/**
 * Generate secure random string
 */
export function generateSecureId(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Validate prediction input to prevent malicious payloads
 */
export function validatePredictionInput(input: Record<string, any>): {
  valid: boolean;
  sanitized?: Record<string, any>;
  errors?: string[];
} {
  const errors: string[] = [];
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(input)) {
    // Validate key
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
      errors.push(`Invalid parameter name: ${key}`);
      continue;
    }

    // Sanitize value based on type
    if (typeof value === 'string') {
      // Check for URLs
      if (value.startsWith('http://') || value.startsWith('https://')) {
        const urlValidation = validateUrl(value);
        if (!urlValidation.valid) {
          errors.push(`Invalid URL for ${key}: ${urlValidation.error}`);
          continue;
        }
      }

      sanitized[key] = value;
    } else if (typeof value === 'number') {
      // Validate numbers
      if (!isFinite(value)) {
        errors.push(`Invalid number for ${key}`);
        continue;
      }
      sanitized[key] = value;
    } else if (typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      // Limit array size
      if (value.length > 1000) {
        errors.push(`Array too large for ${key}`);
        continue;
      }
      sanitized[key] = value;
    } else if (value && typeof value === 'object') {
      // Validate JSON objects
      const jsonValidation = validateJson(JSON.stringify(value));
      if (!jsonValidation.valid) {
        errors.push(`Invalid object for ${key}: ${jsonValidation.error}`);
        continue;
      }
      sanitized[key] = value;
    } else {
      sanitized[key] = value;
    }
  }

  return {
    valid: errors.length === 0,
    sanitized: errors.length === 0 ? sanitized : undefined,
    errors: errors.length > 0 ? errors : undefined,
  };
}