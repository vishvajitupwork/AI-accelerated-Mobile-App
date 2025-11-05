import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
  ...touchableProps
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      {...touchableProps}
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.button, styles[variant], isDisabled && styles.disabled, style]}
      accessibilityRole="button"
      accessibilityLabel={isLoading ? `${title} - Loading` : title}
      accessibilityState={{ disabled: isDisabled }}>
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'outline' ? '#3B82F6' : '#FFFFFF'}
          accessibilityLabel="Loading"
        />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`], isDisabled && styles.disabledText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: '#3B82F6',
  },
  secondary: {
    backgroundColor: '#6B7280',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#3B82F6',
  },
  disabledText: {
    opacity: 0.7,
  },
});

export default Button;
