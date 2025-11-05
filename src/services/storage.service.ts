import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthCredentials, RegistrationFormData } from '../types';

const CREDENTIALS_KEY = 'user_credentials';
const USER_DATA_KEY = 'user_data';
const SESSION_KEY = 'auth_session';
const REGISTRATION_DRAFT_KEY = 'registration_draft';
const FAILED_ATTEMPTS_KEY = 'failed_login_attempts';
const LOCKOUT_UNTIL_KEY = 'lockout_until';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const THEME_MODE_KEY = 'theme_mode';

export class StorageService {
  // Secure credential storage using SecureStore (Keychain/Keystore)
  static async saveCredentials(credentials: AuthCredentials): Promise<void> {
    try {
      const credentialsJSON = JSON.stringify(credentials);
      await SecureStore.setItemAsync(CREDENTIALS_KEY, credentialsJSON);
    } catch (error) {
      console.error('Error saving credentials:', error);
      throw new Error('Failed to save credentials securely');
    }
  }

  static async getCredentials(): Promise<AuthCredentials | null> {
    try {
      const credentialsJSON = await SecureStore.getItemAsync(CREDENTIALS_KEY);
      if (!credentialsJSON) return null;
      return JSON.parse(credentialsJSON);
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      return null;
    }
  }

  static async deleteCredentials(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
    } catch (error) {
      console.error('Error deleting credentials:', error);
    }
  }

  // User data storage
  static async saveUserData(user: User): Promise<void> {
    try {
      const userJSON = JSON.stringify(user);
      await AsyncStorage.setItem(USER_DATA_KEY, userJSON);
    } catch (error) {
      console.error('Error saving user data:', error);
      throw new Error('Failed to save user data');
    }
  }

  static async getUserData(): Promise<User | null> {
    try {
      const userJSON = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userJSON) return null;
      return JSON.parse(userJSON);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  static async deleteUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error('Error deleting user data:', error);
    }
  }

  // Session management
  static async saveSession(isAuthenticated: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(isAuthenticated));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  static async getSession(): Promise<boolean> {
    try {
      const session = await AsyncStorage.getItem(SESSION_KEY);
      return session ? JSON.parse(session) : false;
    } catch (error) {
      console.error('Error retrieving session:', error);
      return false;
    }
  }

  static async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  // Registration form draft persistence
  static async saveRegistrationDraft(formData: Partial<RegistrationFormData>): Promise<void> {
    try {
      const draftJSON = JSON.stringify(formData);
      await AsyncStorage.setItem(REGISTRATION_DRAFT_KEY, draftJSON);
    } catch (error) {
      console.error('Error saving registration draft:', error);
    }
  }

  static async getRegistrationDraft(): Promise<Partial<RegistrationFormData> | null> {
    try {
      const draftJSON = await AsyncStorage.getItem(REGISTRATION_DRAFT_KEY);
      if (!draftJSON) return null;
      return JSON.parse(draftJSON);
    } catch (error) {
      console.error('Error retrieving registration draft:', error);
      return null;
    }
  }

  static async clearRegistrationDraft(): Promise<void> {
    try {
      await AsyncStorage.removeItem(REGISTRATION_DRAFT_KEY);
    } catch (error) {
      console.error('Error clearing registration draft:', error);
    }
  }

  // Failed login attempts tracking
  static async getFailedAttempts(): Promise<number> {
    try {
      const attempts = await AsyncStorage.getItem(FAILED_ATTEMPTS_KEY);
      return attempts ? parseInt(attempts, 10) : 0;
    } catch (error) {
      console.error('Error retrieving failed attempts:', error);
      return 0;
    }
  }

  static async incrementFailedAttempts(): Promise<number> {
    try {
      const currentAttempts = await this.getFailedAttempts();
      const newAttempts = currentAttempts + 1;
      await AsyncStorage.setItem(FAILED_ATTEMPTS_KEY, newAttempts.toString());
      return newAttempts;
    } catch (error) {
      console.error('Error incrementing failed attempts:', error);
      return 0;
    }
  }

  static async clearFailedAttempts(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FAILED_ATTEMPTS_KEY);
    } catch (error) {
      console.error('Error clearing failed attempts:', error);
    }
  }

  // Account lockout management
  static async setLockoutUntil(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(LOCKOUT_UNTIL_KEY, timestamp.toString());
    } catch (error) {
      console.error('Error setting lockout timestamp:', error);
    }
  }

  static async getLockoutUntil(): Promise<number | null> {
    try {
      const timestamp = await AsyncStorage.getItem(LOCKOUT_UNTIL_KEY);
      return timestamp ? parseInt(timestamp, 10) : null;
    } catch (error) {
      console.error('Error retrieving lockout timestamp:', error);
      return null;
    }
  }

  static async clearLockout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LOCKOUT_UNTIL_KEY);
    } catch (error) {
      console.error('Error clearing lockout:', error);
    }
  }

  static async isAccountLocked(): Promise<boolean> {
    try {
      const lockoutUntil = await this.getLockoutUntil();
      if (!lockoutUntil) return false;

      const now = Date.now();
      if (now >= lockoutUntil) {
        // Lockout period has expired, clear it
        await this.clearLockout();
        await this.clearFailedAttempts();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking account lock status:', error);
      return false;
    }
  }

  // Biometric authentication preference
  static async setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, JSON.stringify(enabled));
    } catch (error) {
      console.error('Error setting biometric preference:', error);
    }
  }

  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      return enabled ? JSON.parse(enabled) : false;
    } catch (error) {
      console.error('Error retrieving biometric preference:', error);
      return false;
    }
  }

  // Theme mode preference
  static async setThemeMode(mode: 'light' | 'dark'): Promise<void> {
    try {
      await AsyncStorage.setItem(THEME_MODE_KEY, mode);
    } catch (error) {
      console.error('Error setting theme mode:', error);
    }
  }

  static async getThemeMode(): Promise<'light' | 'dark' | null> {
    try {
      const mode = await AsyncStorage.getItem(THEME_MODE_KEY);
      return mode as 'light' | 'dark' | null;
    } catch (error) {
      console.error('Error retrieving theme mode:', error);
      return null;
    }
  }

  // Clear session data (for logout) - keeps credentials and user data on device
  static async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        // DO NOT delete credentials - they should persist on device for future logins
        // DO NOT delete user data - it should persist on device
        // DO NOT clear biometric preference - user preference should persist
        this.clearSession(),
        this.clearFailedAttempts(),
        this.clearLockout(),
      ]);
    } catch (error) {
      console.error('Error clearing session data:', error);
    }
  }
}
