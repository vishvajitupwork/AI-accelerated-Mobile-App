import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import Input from '../components/Input';
import Button from '../components/Button';
import KeyboardAvoidingScrollView from '../components/KeyboardAvoidingScrollView';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { LoginFormData } from '../types';
import { NavigationProp } from '../navigation/types';
import { AuthContext } from '../context/AuthContext';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { setUser, setIsAuthenticated } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    mode: 'onChange',
    defaultValues: {
      emailOrUsername: '',
      password: '',
    },
  });

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const biometricEnabled = await StorageService.isBiometricEnabled();
      const hasCredentials = await StorageService.getCredentials();

      if (compatible && enrolled && biometricEnabled && hasCredentials) {
        setIsBiometricAvailable(true);
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Touch ID');
        } else {
          setBiometricType('Biometric');
        }
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await AuthService.login(data.emailOrUsername, data.password);

      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
      } else {
        Alert.alert('Login Failed', result.error || 'An error occurred during login');
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Login with ${biometricType}`,
        fallbackLabel: 'Use password instead',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        // Get stored credentials and login
        const credentials = await StorageService.getCredentials();
        if (credentials) {
          setIsLoading(true);
          const loginResult = await AuthService.login(credentials.email, credentials.password);

          if (loginResult.success && loginResult.user) {
            setUser(loginResult.user);
            setIsAuthenticated(true);
          } else {
            Alert.alert('Login Failed', loginResult.error || 'An error occurred during login');
          }
          setIsLoading(false);
        } else {
          Alert.alert('Error', 'No saved credentials found. Please login with your password.');
        }
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert('Authentication Error', 'Failed to authenticate. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="emailOrUsername"
              rules={{
                required: 'Email or username is required',
                validate: value => value.trim().length > 0 || 'Email or username cannot be empty',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email or Username"
                  placeholder="Enter your email or username"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.emailOrUsername?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  required
                  testID="email-username-input"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
                validate: value => value.trim().length > 0 || 'Password cannot be empty',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  isPassword
                  autoCapitalize="none"
                  autoComplete="password"
                  textContentType="password"
                  required
                  testID="password-input"
                />
              )}
            />
          </View>

          <View style={styles.footer}>
            <Button
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || isLoading}
              isLoading={isLoading}
              testID="signin-button"
            />

            {isBiometricAvailable && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button
                  title={`Login with ${biometricType}`}
                  onPress={handleBiometricLogin}
                  variant="outline"
                  disabled={isLoading}
                  testID="biometric-button"
                />
              </>
            )}

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don&apos;t have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                accessibilityRole="link"
                accessibilityLabel="Navigate to registration screen">
                <Text style={styles.registerLink}>Register here</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.securityText}>
              🔒 Your credentials are stored securely on your device
            </Text>
          </View>
        </View>
      </KeyboardAvoidingScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  form: {
    marginBottom: 24,
  },
  footer: {
    marginTop: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  registerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  registerLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  securityText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default LoginScreen;
