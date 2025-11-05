import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateName,
  validatePhoneNumber,
} from '../validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should return valid for correct email', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email is required');
    });

    it('should return invalid for email without @', () => {
      const result = validateEmail('testexample.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    });

    it('should return invalid for email without domain', () => {
      const result = validateEmail('test@');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    });
  });

  describe('validatePassword', () => {
    it('should return valid for strong password', () => {
      const result = validatePassword('Password123!');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password is required');
    });

    it('should return invalid for password less than 8 characters', () => {
      const result = validatePassword('Pass1!');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters long');
    });

    it('should return invalid for password without uppercase', () => {
      const result = validatePassword('password123!');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must contain at least one uppercase letter');
    });

    it('should return invalid for password without lowercase', () => {
      const result = validatePassword('PASSWORD123!');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must contain at least one lowercase letter');
    });

    it('should return invalid for password without number', () => {
      const result = validatePassword('Password!');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must contain at least one number');
    });

    it('should return invalid for password without special character', () => {
      const result = validatePassword('Password123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must contain at least one special character');
    });
  });

  describe('validateConfirmPassword', () => {
    it('should return valid when passwords match', () => {
      const result = validateConfirmPassword('Password123!', 'Password123!');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for empty confirm password', () => {
      const result = validateConfirmPassword('Password123!', '');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please confirm your password');
    });

    it('should return invalid when passwords do not match', () => {
      const result = validateConfirmPassword('Password123!', 'Password456!');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Passwords do not match');
    });
  });

  describe('validateName', () => {
    it('should return valid for correct name', () => {
      const result = validateName('John', 'First name');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for name with hyphen', () => {
      const result = validateName('Mary-Jane', 'First name');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for name with apostrophe', () => {
      const result = validateName("O'Connor", 'Last name');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for empty name', () => {
      const result = validateName('', 'First name');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('First name is required');
    });

    it('should return invalid for name with only 1 character', () => {
      const result = validateName('J', 'First name');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('First name must be at least 2 characters long');
    });

    it('should return invalid for name with numbers', () => {
      const result = validateName('John123', 'First name');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'First name can only contain letters, spaces, hyphens, and apostrophes'
      );
    });
  });

  describe('validatePhoneNumber', () => {
    it('should return valid for 10 digit phone number', () => {
      const result = validatePhoneNumber('1234567890');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for formatted phone number', () => {
      const result = validatePhoneNumber('+1 (234) 567-8900');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for 15 digit phone number', () => {
      const result = validatePhoneNumber('123456789012345');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for empty phone number', () => {
      const result = validatePhoneNumber('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });

    it('should return invalid for phone number with less than 10 digits', () => {
      const result = validatePhoneNumber('123456789');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid phone number (10-15 digits)');
    });

    it('should return invalid for phone number with more than 15 digits', () => {
      const result = validatePhoneNumber('1234567890123456');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid phone number (10-15 digits)');
    });
  });
});
