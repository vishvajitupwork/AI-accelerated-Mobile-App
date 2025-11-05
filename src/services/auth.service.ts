import { StorageService } from './storage.service';
import { User, AuthCredentials, RegistrationFormData } from '../types';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export class AuthService {
  static async register(
    formData: RegistrationFormData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user already exists
      const existingCredentials = await StorageService.getCredentials();
      if (existingCredentials && existingCredentials.email === formData.email) {
        return { success: false, error: 'An account with this email already exists' };
      }

      // Create user object (excluding password fields)
      const user: User = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
      };

      // Save credentials securely
      const credentials: AuthCredentials = {
        email: formData.email,
        password: formData.password, // In a real app, this would be hashed
      };

      await StorageService.saveCredentials(credentials);
      await StorageService.saveUserData(user);
      await StorageService.saveSession(true);
      await StorageService.clearRegistrationDraft();

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }

  static async login(
    emailOrUsername: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      // Check if account is locked
      const isLocked = await StorageService.isAccountLocked();
      if (isLocked) {
        const lockoutUntil = await StorageService.getLockoutUntil();
        if (lockoutUntil) {
          const remainingTime = Math.ceil((lockoutUntil - Date.now()) / 1000 / 60);
          return {
            success: false,
            error: `Account is locked due to too many failed attempts. Please try again in ${remainingTime} minute(s).`,
          };
        }
      }

      // Get stored credentials
      const credentials = await StorageService.getCredentials();
      if (!credentials) {
        return { success: false, error: 'No account found. Please register first.' };
      }

      // Verify credentials
      if (credentials.email !== emailOrUsername || credentials.password !== password) {
        // Increment failed attempts
        const failedAttempts = await StorageService.incrementFailedAttempts();

        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
          const lockoutUntil = Date.now() + LOCKOUT_DURATION;
          await StorageService.setLockoutUntil(lockoutUntil);
          return {
            success: false,
            error: `Too many failed attempts. Account locked for ${LOCKOUT_DURATION / 1000 / 60} minutes.`,
          };
        }

        const remainingAttempts = MAX_FAILED_ATTEMPTS - failedAttempts;
        return {
          success: false,
          error: `Invalid credentials. ${remainingAttempts} attempt(s) remaining.`,
        };
      }

      // Successful login - clear failed attempts and set session
      await StorageService.clearFailedAttempts();
      await StorageService.clearLockout();
      await StorageService.saveSession(true);

      const user = await StorageService.getUserData();
      if (!user) {
        return { success: false, error: 'User data not found' };
      }

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  static async logout(): Promise<void> {
    try {
      await StorageService.clearAllData();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  static async checkSession(): Promise<{ isAuthenticated: boolean; user?: User }> {
    try {
      const isAuthenticated = await StorageService.getSession();
      if (!isAuthenticated) {
        return { isAuthenticated: false };
      }

      const user = await StorageService.getUserData();
      if (!user) {
        await StorageService.clearSession();
        return { isAuthenticated: false };
      }

      return { isAuthenticated: true, user };
    } catch (error) {
      console.error('Session check error:', error);
      return { isAuthenticated: false };
    }
  }

  static async updateUserData(user: User): Promise<{ success: boolean; error?: string }> {
    try {
      await StorageService.saveUserData(user);
      return { success: true };
    } catch (error) {
      console.error('Update user data error:', error);
      return { success: false, error: 'Failed to update user data' };
    }
  }
}
