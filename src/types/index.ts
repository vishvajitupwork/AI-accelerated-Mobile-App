export interface User {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface RegistrationFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface LoginFormData {
  emailOrUsername: string;
  password: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  user: User;
  isAuthenticated: boolean;
}
