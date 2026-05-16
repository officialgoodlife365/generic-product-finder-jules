const { maskEmail, sanitizeObject } = require('../../src/utils/pii');

describe('PII Utility', () => {

  describe('maskEmail', () => {
    it('masks a standard email', () => {
      expect(maskEmail('john.doe@example.com')).toBe('j***e@example.com');
    });

    it('masks a short local part', () => {
      expect(maskEmail('a@example.com')).toBe('*@example.com');
    });

    it('handles non-email strings', () => {
      expect(maskEmail('not-an-email')).toBe('not-an-email');
    });

    it('handles null/undefined', () => {
      expect(maskEmail(null)).toBe(null);
      expect(maskEmail(undefined)).toBe(undefined);
    });
  });

  describe('sanitizeObject', () => {
    it('redacts sensitive fields', () => {
      const input = {
        email: 'test@example.com',
        password: 'secretpassword',
        other: 'info'
      };
      const output = sanitizeObject(input);
      expect(output.email).toBe('t***t@example.com');
      expect(output.password).toBe('[REDACTED]');
      expect(output.other).toBe('info');
    });

    it('handles nested objects', () => {
      const input = {
        user: {
          email: 'nested@example.com',
          details: {
            address: '123 Main St'
          }
        }
      };
      const output = sanitizeObject(input);
      expect(output.user.email).toBe('n***d@example.com');
      expect(output.user.details.address).toBe('[REDACTED]');
    });

    it('handles arrays', () => {
      const input = [
        { email: 'one@example.com' },
        { email: 'two@example.com' }
      ];
      const output = sanitizeObject(input);
      expect(output[0].email).toBe('o***e@example.com');
      expect(output[1].email).toBe('t***o@example.com');
    });

    it('is case insensitive for keys', () => {
      const input = {
        EMAIL: 'caps@example.com',
        User_Email: 'mixed@example.com'
      };
      const output = sanitizeObject(input);
      expect(output.EMAIL).toBe('c***s@example.com');
      expect(output.User_Email).toBe('m***d@example.com');
    });
  });

});
