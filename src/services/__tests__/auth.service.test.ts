import { AuthService } from '../auth.service';
import { StorageService } from '../storage.service';
import { RegistrationFormData, User } from '../../types';

// Mock the StorageService
jest.mock('../storage.service');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockFormData: RegistrationFormData = {
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
    };

    it('should successfully register a new user', async () => {
      (StorageService.getCredentials as jest.Mock).mockResolvedValue(null);
      (StorageService.saveCredentials as jest.Mock).mockResolvedValue(undefined);
      (StorageService.saveUserData as jest.Mock).mockResolvedValue(undefined);
      (StorageService.saveSession as jest.Mock).mockResolvedValue(undefined);
      (StorageService.clearRegistrationDraft as jest.Mock).mockResolvedValue(undefined);

      const result = await AuthService.register(mockFormData);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(StorageService.saveCredentials).toHaveBeenCalledWith({
        email: mockFormData.email,
        password: mockFormData.password,
      });
      expect(StorageService.saveUserData).toHaveBeenCalledWith({
        email: mockFormData.email,
        firstName: mockFormData.firstName,
        lastName: mockFormData.lastName,
        phoneNumber: mockFormData.phoneNumber,
      });
      expect(StorageService.saveSession).toHaveBeenCalledWith(true);
      expect(StorageService.clearRegistrationDraft).toHaveBeenCalled();
    });

    it('should fail if user already exists', async () => {
      (StorageService.getCredentials as jest.Mock).mockResolvedValue({
        email: 'test@example.com',
        password: 'OldPassword123!',
      });

      const result = await AuthService.register(mockFormData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('An account with this email already exists');
      expect(StorageService.saveCredentials).not.toHaveBeenCalled();
    });

    it('should handle registration errors', async () => {
      (StorageService.getCredentials as jest.Mock).mockResolvedValue(null);
      (StorageService.saveCredentials as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await AuthService.register(mockFormData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Registration failed. Please try again.');
    });
  });

  describe('login', () => {
    const mockUser: User = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
    };

    beforeEach(() => {
      (StorageService.isAccountLocked as jest.Mock).mockResolvedValue(false);
      (StorageService.getCredentials as jest.Mock).mockResolvedValue({
        email: 'test@example.com',
        password: 'Password123!',
      });
      (StorageService.getUserData as jest.Mock).mockResolvedValue(mockUser);
      (StorageService.clearFailedAttempts as jest.Mock).mockResolvedValue(undefined);
      (StorageService.clearLockout as jest.Mock).mockResolvedValue(undefined);
      (StorageService.saveSession as jest.Mock).mockResolvedValue(undefined);
    });

    it('should successfully login with valid credentials', async () => {
      const result = await AuthService.login('test@example.com', 'Password123!');

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeUndefined();
      expect(StorageService.clearFailedAttempts).toHaveBeenCalled();
      expect(StorageService.clearLockout).toHaveBeenCalled();
      expect(StorageService.saveSession).toHaveBeenCalledWith(true);
    });

    it('should fail login with invalid credentials', async () => {
      (StorageService.incrementFailedAttempts as jest.Mock).mockResolvedValue(1);

      const result = await AuthService.login('test@example.com', 'WrongPassword');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid credentials');
      expect(result.user).toBeUndefined();
      expect(StorageService.incrementFailedAttempts).toHaveBeenCalled();
    });

    it('should lock account after max failed attempts', async () => {
      (StorageService.incrementFailedAttempts as jest.Mock).mockResolvedValue(5);
      (StorageService.setLockoutUntil as jest.Mock).mockResolvedValue(undefined);

      const result = await AuthService.login('test@example.com', 'WrongPassword');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Too many failed attempts');
      expect(StorageService.setLockoutUntil).toHaveBeenCalled();
    });

    it('should prevent login when account is locked', async () => {
      (StorageService.isAccountLocked as jest.Mock).mockResolvedValue(true);
      (StorageService.getLockoutUntil as jest.Mock).mockResolvedValue(Date.now() + 300000);

      const result = await AuthService.login('test@example.com', 'Password123!');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Account is locked');
    });

    it('should fail login when no account exists', async () => {
      (StorageService.getCredentials as jest.Mock).mockResolvedValue(null);

      const result = await AuthService.login('test@example.com', 'Password123!');

      expect(result.success).toBe(false);
      expect(result.error).toBe('No account found. Please register first.');
    });
  });

  describe('logout', () => {
    it('should clear all data on logout', async () => {
      (StorageService.clearAllData as jest.Mock).mockResolvedValue(undefined);

      await AuthService.logout();

      expect(StorageService.clearAllData).toHaveBeenCalled();
    });

    it('should throw error if logout fails', async () => {
      const mockError = new Error('Storage error');
      (StorageService.clearAllData as jest.Mock).mockRejectedValue(mockError);

      await expect(AuthService.logout()).rejects.toThrow(mockError);
    });
  });

  describe('checkSession', () => {
    const mockUser: User = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
    };

    it('should return authenticated session with user data', async () => {
      (StorageService.getSession as jest.Mock).mockResolvedValue(true);
      (StorageService.getUserData as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.checkSession();

      expect(result.isAuthenticated).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should return unauthenticated when session is false', async () => {
      (StorageService.getSession as jest.Mock).mockResolvedValue(false);

      const result = await AuthService.checkSession();

      expect(result.isAuthenticated).toBe(false);
      expect(result.user).toBeUndefined();
    });

    it('should clear session if user data not found', async () => {
      (StorageService.getSession as jest.Mock).mockResolvedValue(true);
      (StorageService.getUserData as jest.Mock).mockResolvedValue(null);
      (StorageService.clearSession as jest.Mock).mockResolvedValue(undefined);

      const result = await AuthService.checkSession();

      expect(result.isAuthenticated).toBe(false);
      expect(StorageService.clearSession).toHaveBeenCalled();
    });
  });

  describe('updateUserData', () => {
    const mockUser: User = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
    };

    it('should successfully update user data', async () => {
      (StorageService.saveUserData as jest.Mock).mockResolvedValue(undefined);

      const result = await AuthService.updateUserData(mockUser);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(StorageService.saveUserData).toHaveBeenCalledWith(mockUser);
    });

    it('should handle update errors', async () => {
      (StorageService.saveUserData as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await AuthService.updateUserData(mockUser);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update user data');
    });
  });
});
