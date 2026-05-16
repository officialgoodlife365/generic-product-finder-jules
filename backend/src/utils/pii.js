/**
 * PII Utility for masking and sanitizing sensitive information.
 */

/**
 * Partially masks an email address for logging and storage.
 * @param {string} email
 * @returns {string}
 */
function maskEmail(email) {
  if (!email || typeof email !== 'string') return email;
  const [localPart, domain] = email.split('@');
  if (!domain) return email; // Not a valid email format

  if (localPart.length <= 1) {
    return `*@${domain}`;
  }
  return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
}

/**
 * Recursively scans and sanitizes an object, masking PII-like keys.
 * @param {any} data
 * @returns {any}
 */
function sanitizeObject(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  const sensitiveKeys = ['email', 'buyer_email', 'buyerEmail', 'address', 'phone', 'password', 'token', 'secret'];

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      if (typeof value === 'string') {
        if (key.toLowerCase().includes('email')) {
          sanitized[key] = maskEmail(value);
        } else {
          sanitized[key] = '[REDACTED]';
        }
      } else {
        sanitized[key] = '[REDACTED]';
      }
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

module.exports = {
  maskEmail,
  sanitizeObject
};
