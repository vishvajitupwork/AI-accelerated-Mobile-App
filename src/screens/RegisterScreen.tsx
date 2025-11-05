import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../components/Input';
import Button from '../components/Button';
import KeyboardAvoidingScrollView from '../components/KeyboardAvoidingScrollView';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { RegistrationFormData } from '../types';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateName,
  validatePhoneNumber,
} from '../utils/validation';
import { NavigationProp } from '../navigation/types';
import { AuthContext } from '../context/AuthContext';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { setUser, setIsAuthenticated } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<RegistrationFormData>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
    },
  });

  const password = watch('password');

  // Load saved draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      const draft = await StorageService.getRegistrationDraft();
      if (draft) {
        Object.entries(draft).forEach(([key, value]) => {
          setValue(key as keyof RegistrationFormData, value || '');
        });
      }
    };
    loadDraft();
  }, [setValue]);

  // Save draft whenever form changes
  useEffect(() => {
    const subscription = watch(async formData => {
      await StorageService.saveRegistrationDraft(formData);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    try {
      const result = await AuthService.register(data);

      if (result.success) {
        const session = await AuthService.checkSession();
        if (session.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        }
      } else {
        Alert.alert('Registration Failed', result.error || 'An error occurred during registration');
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="button"
            accessibilityLabel="Go back to login">
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Account setup</Text>
            <Text style={styles.subtitle}>Create your account to get started</Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              rules={{
                validate: value => {
                  const result = validateEmail(value);
                  return result.isValid || result.error || 'Invalid email';
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email address"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  required
                  testID="email-input"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              rules={{
                validate: value => {
                  const result = validatePassword(value);
                  return result.isValid || result.error || 'Invalid password';
                },
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
                  autoComplete="password-new"
                  textContentType="newPassword"
                  required
                  testID="password-input"
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                validate: value => {
                  const result = validateConfirmPassword(password, value);
                  return result.isValid || result.error || 'Passwords do not match';
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  isPassword
                  autoCapitalize="none"
                  autoComplete="password-new"
                  textContentType="newPassword"
                  required
                  testID="confirm-password-input"
                />
              )}
            />

            <Controller
              control={control}
              name="firstName"
              rules={{
                validate: value => {
                  const result = validateName(value, 'First name');
                  return result.isValid || result.error || 'Invalid first name';
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="First name"
                  placeholder="Enter your first name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.firstName?.message}
                  autoCapitalize="words"
                  autoComplete="name-given"
                  textContentType="givenName"
                  required
                  testID="first-name-input"
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              rules={{
                validate: value => {
                  const result = validateName(value, 'Last name');
                  return result.isValid || result.error || 'Invalid last name';
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Last Name"
                  placeholder="Enter your last name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.lastName?.message}
                  autoCapitalize="words"
                  autoComplete="name-family"
                  textContentType="familyName"
                  required
                  testID="last-name-input"
                />
              )}
            />

            <Controller
              control={control}
              name="phoneNumber"
              rules={{
                validate: value => {
                  const result = validatePhoneNumber(value);
                  return result.isValid || result.error || 'Invalid phone number';
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Phone number"
                  placeholder="Enter your phone number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phoneNumber?.message}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  required
                  testID="phone-input"
                />
              )}
            />
          </View>

          <View style={styles.footer}>
            <Button
              title="save & start"
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || isLoading}
              isLoading={isLoading}
              testID="submit-button"
            />

            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already registered? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                accessibilityRole="link"
                accessibilityLabel="Navigate to sign in screen">
                <Text style={styles.signInLink}>Sign in here</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.securityText}>
              🔒 Our server is encrypted with 128bit encryption
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
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  header: {
    marginBottom: 32,
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
    flex: 1,
  },
  footer: {
    marginTop: 24,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  signInText: {
    fontSize: 14,
    color: '#6B7280',
  },
  signInLink: {
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

export default RegisterScreen;
