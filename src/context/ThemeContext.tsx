import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { StatusBar } from 'react-native';
import { StorageService } from '../services/storage.service';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  card: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;

  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Status colors
  success: string;
  error: string;
  warning: string;
  info: string;

  // Border and divider
  border: string;
  divider: string;

  // Input colors
  inputBackground: string;
  inputBorder: string;
  inputFocus: string;

  // Button colors
  buttonText: string;
  buttonDisabled: string;

  // Shadow
  shadow: string;
}

export const lightTheme: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F9FAFB',
  card: '#FFFFFF',

  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',

  primary: '#3B82F6',
  primaryLight: '#93C5FD',
  primaryDark: '#1E40AF',

  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  border: '#E5E7EB',
  divider: '#E5E7EB',

  inputBackground: '#FFFFFF',
  inputBorder: '#D1D5DB',
  inputFocus: '#3B82F6',

  buttonText: '#FFFFFF',
  buttonDisabled: '#9CA3AF',

  shadow: '#000000',
};

export const darkTheme: ThemeColors = {
  background: '#111827',
  surface: '#1F2937',
  card: '#374151',

  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',

  primary: '#60A5FA',
  primaryLight: '#93C5FD',
  primaryDark: '#2563EB',

  success: '#34D399',
  error: '#F87171',
  warning: '#FBBF24',
  info: '#60A5FA',

  border: '#4B5563',
  divider: '#4B5563',

  inputBackground: '#1F2937',
  inputBorder: '#4B5563',
  inputFocus: '#60A5FA',

  buttonText: '#FFFFFF',
  buttonDisabled: '#6B7280',

  shadow: '#000000',
};

interface ThemeContextType {
  theme: ThemeColors;
  mode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  mode: 'light',
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedMode = await StorageService.getThemeMode();
      if (savedMode) {
        setMode(savedMode);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemeMode = async (newMode: ThemeMode) => {
    try {
      await StorageService.setThemeMode(newMode);
      setMode(newMode);
      StatusBar.setBarStyle(newMode === 'dark' ? 'light-content' : 'dark-content');
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    await setThemeMode(newMode);
  };

  const theme = mode === 'light' ? lightTheme : darkTheme;

  // Update status bar when theme changes
  useEffect(() => {
    StatusBar.setBarStyle(mode === 'dark' ? 'light-content' : 'dark-content');
  }, [mode]);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
