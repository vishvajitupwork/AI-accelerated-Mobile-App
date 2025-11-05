# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Native mobile app (Expo) with TypeScript that implements a local-only account registration and authentication system. The app demonstrates secure credential storage, form validation, session management, and account lockout protection.

## Development Commands

### Running the App
```bash
npm run ios          # Launch on iOS simulator
npm run ios:device   # Build and run on physical iOS device (auto-starts Metro with LAN)
npm run android      # Launch on Android emulator
npm run web          # Launch in web browser
npm start            # Start Expo dev server (manual device selection)
npm run start:lan    # Start Metro bundler with LAN support for physical devices
```

### Code Quality
```bash
npm run type-check # TypeScript type checking (must pass with 0 errors)
npm run lint       # ESLint (must pass with 0 errors)
npm run lint:fix   # Auto-fix ESLint issues
npm run format     # Format with Prettier
```

### Testing
```bash
npm test           # Run all Jest tests
npm run test:watch # Run tests in watch mode
```

**Pre-commit checklist**: Always run `npm run type-check` and `npm run lint` before commits. Both must pass with 0 errors.

## Architecture

### Authentication Flow

The app uses a **Context-based authentication system** where navigation is conditionally rendered based on auth state:

1. **App Launch**: `AppNavigator` (src/navigation/AppNavigator.tsx) checks session via `AuthService.checkSession()`
2. **Session Found**: Shows `HomeScreen` (authenticated state)
3. **No Session**: Shows `LoginScreen` and `RegisterScreen` (unauthenticated state)
4. **Authentication Change**: Screens update `AuthContext` → triggers navigation re-render

**Critical**: The `AuthContext` is defined in `AppNavigator.tsx` and provides global auth state. Screens consume this context using `useContext(AuthContext)` to access and update authentication status.

### Theme System

The app includes a **complete dark mode implementation** with theme switching:

1. **ThemeContext** (src/context/ThemeContext.tsx)
   - Provides light and dark color schemes
   - Theme state persisted in AsyncStorage
   - Accessed via `useTheme()` hook

2. **Theme Structure**:
   ```typescript
   {
     background: string,      // Main background color
     surface: string,        // Card/surface background
     text: string,           // Primary text color
     textSecondary: string,  // Secondary text color
     primary: string,        // Primary brand color
     error: string,         // Error state color
     border: string,        // Border color
     inputBackground: string // Input field background
   }
   ```

3. **Theme Toggle**: `ThemeToggle` component in HomeScreen allows users to switch between light/dark modes

4. **App Structure**: `ThemeProvider` wraps the entire app in `App.tsx`, making theme available to all screens

**Why separate from AuthContext**: Theme state is app-wide and independent of authentication, preventing unnecessary re-renders.

### Biometric Authentication

The app supports **Face ID (iOS) and Touch ID/Fingerprint (Android)**:

1. **Package**: `expo-local-authentication` v17.0.7
2. **Permissions**: iOS `NSFaceIDUsageDescription` in `app.json`
3. **Storage**: Biometric preference stored in AsyncStorage via `StorageService.setBiometricEnabled()`
4. **Flow**:
   - User enables biometric in Settings (HomeScreen)
   - On next login, "Login with Face ID/Touch ID" button appears
   - Tapping button triggers biometric authentication
   - On success, auto-fills credentials and logs in

**Important**: Biometric authentication requires a native build (`npx expo run:ios --device`), not Expo Go, because it needs native permissions configured.

### Storage Architecture

**Two-tier storage pattern**:

1. **SecureStore** (Expo SecureStore → iOS Keychain / Android Keystore)
   - Used for: Authentication credentials only
   - Encryption: OS-level hardware-backed encryption
   - Location: `StorageService.saveCredentials()` / `getCredentials()`

2. **AsyncStorage** (Unencrypted local storage)
   - Used for: User profile data, session flags, form drafts, failed login attempts, lockout timestamps, theme preference, biometric preference
   - Location: All other `StorageService` methods

**Why this split**: Credentials need encryption, but other data doesn't. This follows security best practices for React Native.

### Account Lockout Mechanism

Implemented in `AuthService.login()` (src/services/auth.service.ts):

- Tracks failed login attempts in AsyncStorage
- After 5 failed attempts → account locked for 5 minutes
- Lockout timestamp persists across app restarts
- Auto-unlocks after duration expires
- Cleared on successful login

**Implementation**: `StorageService.isAccountLocked()` checks timestamp on each login attempt. If current time < lockout timestamp, login is blocked.

### Form State Persistence

**Registration form only** (src/screens/RegisterScreen.tsx):
- Auto-saves draft to AsyncStorage on every field change using React Hook Form's `watch()`
- Loads draft on screen mount
- Clears draft on successful registration
- Survives app restarts

**Why not login form**: Login fields are sensitive and shouldn't be persisted.

## Important Implementation Details

### React Hook Form Integration

All forms use React Hook Form with `Controller` components for validation:

```tsx
<Controller
  control={control}
  name="email"
  rules={{ validate: (value) => validateEmail(value).isValid || validateEmail(value).error }}
  render={({ field: { onChange, value }, fieldState: { error } }) => (
    <Input value={value} onChangeText={onChange} error={error} />
  )}
/>
```

Validation logic is in `src/utils/validation.ts`. Each validator returns `{ isValid: boolean, error?: string }`.

### TypeScript Strict Mode

The project uses strict TypeScript (`tsconfig.json` extends `expo/tsconfig.base` with `strict: true`):

- **No `any` types allowed**
- All service methods must have explicit return types
- React Hook Form types must be properly generic: `useForm<RegistrationFormData>()`
- Navigation types defined in `src/navigation/types.ts`

### ESLint 9 Flat Config

**Critical**: This project uses ESLint 9 with the new flat config format (`eslint.config.js`), not `.eslintrc.js`. When adding ESLint rules, update `eslint.config.js` using the flat config structure.

### Accessibility Requirements

All interactive components must have:
- `accessibilityLabel` (descriptive text for screen readers)
- `accessibilityRole` (e.g., "button", "link")
- Touch targets ≥ 48x48dp
- Color contrast meeting WCAG AA standards

Input components automatically handle this via the `Input` component (src/components/Input.tsx).

### Package Version Constraints

This project requires specific package versions compatible with Expo SDK 54:
- `react-native-screens`: ~4.16.0 (NOT 4.18.0+)
- `jest`: ~29.7.0 (NOT 30.x)
- `@types/jest`: 29.5.14 (NOT 30.x)

**When adding packages**: Check Expo SDK 54 compatibility at https://docs.expo.dev/versions/v54.0.0/

### Physical iOS Device Development

When developing on a physical iPhone (not simulator):

1. **Metro Configuration**: The project includes `metro.config.js` for proper Metro bundler setup
2. **iOS Device Script**: Use `npm run ios:device` which automatically:
   - Detects your Mac's LAN IP address
   - Creates/updates `ios/.xcode.env.local` with the IP
   - Starts Metro bundler with `--lan` flag
   - Waits for Metro to be ready
   - Builds and installs the app on your connected device

3. **Manual Workflow** (if script doesn't work):
   ```bash
   # Terminal 1: Start Metro with LAN support
   npm run start:lan

   # Terminal 2: Build and run on device
   npx expo run:ios --device
   ```

4. **Network Requirements**:
   - Mac and iPhone must be on the same WiFi network
   - Firewall must allow connections on port 8081
   - Device must be in Developer Mode (Settings → Privacy & Security → Developer Mode)

5. **Configuration File**: `ios/.xcode.env.local` is auto-generated and contains:
   ```bash
   export RCT_METRO_PORT=8081
   export RCT_METRO_HOST=192.168.x.x  # Your Mac's LAN IP
   ```
   This file is in `.gitignore` as it's machine-specific.

**Troubleshooting**: If you see "No script URL provided" error:
- Ensure Metro is running before the app launches
- Verify both devices are on the same WiFi
- Check `ios/.xcode.env.local` has the correct IP
- Run `npm run ios:device` instead of manual commands

## Testing

### Mocking Strategy

Jest setup (`jest.setup.js`) mocks:
- `@react-native-async-storage/async-storage` → Returns Promises with test data
- `expo-secure-store` → Returns Promises with test data

When writing new tests that use these modules, **import the actual modules and mock them in the test file**:

```typescript
jest.mock('../services/storage.service');
const MockedStorageService = StorageService as jest.Mocked<typeof StorageService>;
```

### Test Organization

- Validation tests: `src/utils/__tests__/validation.test.ts`
- Service tests: `src/services/__tests__/auth.service.test.ts`

Each test file should cover both success and failure cases.

## Common Pitfalls

1. **Input Component `required` Prop**: React Native's `TextInput` doesn't have a `required` prop (that's HTML). The custom `Input` component handles this in its own props interface, don't pass it to the underlying `TextInput`.

2. **Accessibility State**: React Native's `accessibilityState` only supports `disabled`, `selected`, `checked`, and `busy` on iOS only. Don't use `busy` on cross-platform code - include loading state in `accessibilityLabel` instead.

3. **Babel Config**: The `babel.config.js` file is **required** for both Jest and Metro bundler. Don't delete it.

4. **Navigation Context**: The `AuthContext` is created in `AppNavigator.tsx`, not in a separate file. This is intentional to avoid circular dependencies. Access it via `useContext(AuthContext)`.

5. **Password Storage**: This is a **local-only demo app**. Passwords are stored in SecureStore for demonstration purposes. In production, passwords should NEVER be stored locally - only on the server after hashing.

## File References

Key files to understand the architecture:
- `src/navigation/AppNavigator.tsx` - Auth context and conditional navigation
- `src/context/ThemeContext.tsx` - Theme provider with light/dark modes
- `src/services/auth.service.ts` - Registration, login, logout, session management, biometric auth
- `src/services/storage.service.ts` - Two-tier storage (SecureStore + AsyncStorage)
- `src/utils/validation.ts` - All form validation logic
- `src/types/index.ts` - TypeScript interfaces for User, FormData, etc.
- `src/components/ThemeToggle.tsx` - Theme switching component
- `scripts/ios-device.sh` - Automated iOS physical device development script
- `metro.config.js` - Metro bundler configuration
- `ios/.xcode.env.local` - Auto-generated file with Mac's LAN IP (gitignored)
