# Setup & Installation Guide

Complete guide to set up and run the TestProject React Native application on your local machine.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Running the App](#running-the-app)
4. [Face ID / Touch ID Setup](#face-id--touch-id-setup)
5. [Development Workflow](#development-workflow)
6. [Troubleshooting](#troubleshooting)
7. [Testing](#testing)

---

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18.0.0 or higher
   ```
   Download from: https://nodejs.org/

2. **npm** or **yarn**
   ```bash
   npm --version   # Should be 9.0.0 or higher
   ```

3. **Git**
   ```bash
   git --version
   ```

### Platform-Specific Requirements

#### For iOS Development (macOS only)

1. **macOS** (Monterey 12.0 or higher recommended)

2. **Xcode** (14.0 or higher)
   - Install from Mac App Store
   - After installation, open Xcode and accept license agreements
   - Install Command Line Tools:
     ```bash
     xcode-select --install
     ```

3. **CocoaPods** (for iOS dependencies)
   ```bash
   sudo gem install cocoapods
   pod --version  # Should be 1.12.0 or higher
   ```

4. **Watchman** (recommended for file watching)
   ```bash
   brew install watchman
   ```

#### For Android Development

1. **Android Studio** (Electric Eel or higher)
   - Download from: https://developer.android.com/studio

2. **Android SDK** (API Level 33 or higher)
   - Install via Android Studio → SDK Manager
   - Required SDK Components:
     - Android SDK Platform 33
     - Android SDK Build-Tools
     - Android Emulator
     - Android SDK Platform-Tools

3. **Set Environment Variables** (add to `~/.zshrc` or `~/.bash_profile`):
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   ```

4. **Java Development Kit (JDK) 17**
   ```bash
   brew install --cask zulu@17
   ```

---

## Installation

### 1. Clone or Navigate to the Project

```bash
cd /path/to/TestProject
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React Native 0.81.5
- Expo SDK 54.0.22
- React Navigation 7
- React Hook Form
- Expo SecureStore
- Expo Local Authentication (Face ID/Touch ID)
- All development dependencies (TypeScript, ESLint, Jest, etc.)

**Expected output:**
```
added 1112 packages in 30s
```

### 3. Verify Installation

```bash
# Check for TypeScript errors
npm run type-check

# Check for ESLint errors
npm run lint

# Run tests
npm test
```

All commands should complete without errors ✅

---

## Running the App

### Option 1: iOS (Recommended for Face ID Testing)

#### A. Using iOS Simulator

**Quick Start (Development Build):**
```bash
npm run ios
```

This starts Metro bundler and opens the iOS Simulator automatically.

**First-time Build (Required for Face ID):**
```bash
npx expo run:ios
```

This creates a native iOS build with Face ID permissions. Takes 3-5 minutes on first run.

**Choose Specific Simulator:**
```bash
npx expo run:ios --simulator="iPhone 15 Pro"
```

**Available Simulators:**
- iPhone 15 Pro (Face ID)
- iPhone 15 (Face ID)
- iPhone 14 Pro (Face ID)
- iPhone SE (Touch ID)
- iPad Pro 12.9-inch

#### B. Using Physical iPhone

**Requirements:**
- iPhone running iOS 13.4 or higher
- USB cable connected to Mac
- iPhone in Developer Mode
- Mac and iPhone on the same WiFi network

**Automated Method (Recommended):**

```bash
npm run ios:device
```

This single command automatically:
1. Detects your Mac's LAN IP address
2. Configures Metro bundler for device connectivity
3. Starts Metro with `--lan` flag
4. Waits for Metro to be ready
5. Builds and installs the app on your connected device

**Manual Method (if automated script fails):**

**Steps:**

1. **Enable Developer Mode on iPhone:**
   - Settings → Privacy & Security → Developer Mode → ON
   - Restart iPhone when prompted

2. **Connect iPhone via USB**

3. **Start Metro Bundler First:**
   ```bash
   # Terminal 1: Start Metro with LAN support
   npm run start:lan
   ```
   Wait until you see the Metro bundler URL with your LAN IP

4. **Build and Install (in a new terminal):**
   ```bash
   # Terminal 2: Build and run on device
   npx expo run:ios --device
   ```

5. **Trust Developer Certificate:**
   - On iPhone: Settings → General → VPN & Device Management
   - Tap your Apple ID → Trust

6. **App launches automatically** on your iPhone

**Important Notes:**
- **Metro must be running BEFORE the app launches** for the first time
- Both Mac and iPhone must be on the same WiFi network
- The `ios/.xcode.env.local` file is auto-generated with your Mac's IP
- If you get "No script URL provided" error, use `npm run ios:device` instead

**For Face ID to work on physical device:**
- The build must use `npx expo run:ios --device` (not Expo Go)
- Face ID must be set up in Settings → Face ID & Passcode

### Option 2: Android

#### A. Using Android Emulator

**Quick Start:**
```bash
npm run android
```

**First-time Build:**
```bash
npx expo run:android
```

**Requirements:**
- Android Emulator must be running before executing command
- Open Android Studio → Virtual Device Manager → Start Emulator

**Recommended Emulator:**
- Device: Pixel 7 Pro
- System Image: Android 13 (API 33)
- Storage: 4GB+

#### B. Using Physical Android Device

**Steps:**

1. **Enable Developer Options:**
   - Settings → About Phone → Tap "Build Number" 7 times

2. **Enable USB Debugging:**
   - Settings → Developer Options → USB Debugging → ON

3. **Connect via USB**

4. **Verify Connection:**
   ```bash
   adb devices
   # Should show: List of devices attached
   #              XXXXXXXXXXXXXX device
   ```

5. **Build and Install:**
   ```bash
   npx expo run:android --device
   ```

**For Fingerprint to work on physical device:**
- Fingerprint must be enrolled in Settings → Security → Fingerprint

### Option 3: Web (Quick Testing Only)

```bash
npm run web
```

**Note:** Biometric authentication will NOT work on web. Use for quick UI testing only.

### Option 4: Development Server (Manual Device Selection)

```bash
npm start
```

Opens Expo Dev Tools in terminal with options:
- Press `i` → Open iOS Simulator
- Press `a` → Open Android Emulator
- Press `w` → Open in Web Browser
- Scan QR code with Expo Go app (limited features)

---

## Face ID / Touch ID Setup

### Why Biometric Auth Requires Native Build

**Expo Go app does NOT support Face ID/Touch ID** because it uses generic permissions. You MUST use a development build:

```bash
npx expo run:ios --device    # For physical iPhone
npx expo run:ios             # For simulator
```

### iOS Simulator Setup

**Enable Face ID in Simulator:**

1. **Launch Simulator**
2. **Enroll Face ID:**
   - Simulator Menu → Features → Face ID → Enrolled ✓

3. **Test Authentication:**
   - In app, tap "Login with Face ID"
   - Simulator Menu → Features → Face ID → Matching Face ✓

**Simulate Failed Authentication:**
- Simulator Menu → Features → Face ID → Non-matching Face

### Physical iPhone Setup

**Requirements:**
- iPhone X or later (Face ID)
- iPhone 5s to iPhone 8 (Touch ID)
- Biometric enrolled in Settings

**Steps:**

1. **Ensure Face ID is set up:**
   - Settings → Face ID & Passcode → Set Up Face ID

2. **Build app with native build:**
   ```bash
   npx expo run:ios --device
   ```

3. **First launch - Grant Permission:**
   - When you tap "Login with Face ID" for the first time
   - iOS prompts: "TestProject would like to use Face ID"
   - **Tap "Allow"** ✅

4. **Face ID is now active!**
   - Enable toggle in app Settings
   - Login screen shows "Login with Face ID" button

### Testing Biometric Flow

**Complete Test Scenario:**

1. **Register a new account:**
   - Email: test@example.com
   - Password: Test123!@#
   - Fill all required fields
   - Tap "Create Account"

2. **On Home Screen - Enable Biometric:**
   - See "Settings" card
   - Toggle "Face ID" → ON
   - Alert: "Biometric Login Enabled"

3. **Logout:**
   - Tap "Logout" button
   - Confirm logout

4. **Login with Face ID:**
   - On Login screen, tap "Login with Face ID"
   - Face ID prompt appears
   - Authenticate → Logged in instantly! ✅

---

## Development Workflow

### Code Quality Checks

**Before committing code, always run:**

```bash
# 1. Type checking (must pass)
npm run type-check

# 2. Linting (must pass)
npm run lint

# 3. Auto-fix linting errors
npm run lint:fix

# 4. Format code
npm run format

# 5. Run tests
npm test
```

### Hot Reload

When app is running, changes to source files automatically reload:

- **JavaScript/TypeScript changes** → Fast Refresh (instant)
- **Style changes** → Fast Refresh (instant)
- **Asset changes** → Reload required
- **Native code changes** → Full rebuild required

**Force reload:**
- iOS Simulator: Cmd + R
- Android Emulator: Double-tap R
- Physical Device: Shake device → Reload

### Clear Cache

If you encounter strange errors:

```bash
# Clear Metro bundler cache
npx expo start --clear

# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Clear iOS build
rm -rf ios
npx expo prebuild --clean

# Clear Android build
rm -rf android
npx expo prebuild --clean
```

### Debugging

**React Native Debugger:**

1. Install React Native Debugger:
   ```bash
   brew install --cask react-native-debugger
   ```

2. In running app, open Dev Menu:
   - iOS Simulator: Cmd + D
   - Android Emulator: Cmd + M

3. Select "Debug Remote JS"

**Console Logs:**

View logs in terminal where you ran `npm start`:
```bash
# Filter for errors
npm start | grep ERROR

# Filter for your console.log
npm start | grep "MY_TAG"
```

**Chrome DevTools:**

1. Open Dev Menu → "Debug Remote JS"
2. Opens Chrome at http://localhost:8081/debugger-ui
3. Open Chrome DevTools (Cmd + Option + I)
4. View Console, Network, etc.

---

## Troubleshooting

### Common Issues

#### 1. "Metro bundler not starting"

**Solution:**
```bash
# Kill existing Metro processes
lsof -ti:8081 | xargs kill -9

# Start fresh
npm start
```

#### 2. "Module not found" errors

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear cache and restart
npx expo start --clear
```

#### 3. "No script URL provided" error on physical device

**Cause:** Metro bundler not running or device can't connect to it

**Solution:**
```bash
# Use the automated script
npm run ios:device
```

**If still failing:**
1. Ensure Mac and iPhone are on the same WiFi network
2. Check firewall allows connections on port 8081
3. Verify `ios/.xcode.env.local` exists and has correct IP
4. Kill any existing Metro processes:
   ```bash
   lsof -ti :8081 | xargs kill -9
   ```
5. Try again with `npm run ios:device`

#### 4. "Face ID asks for passcode instead of Face ID"

**Cause:** App built with Expo Go (doesn't support Face ID permissions)

**Solution:**
```bash
# Must use native build
npx expo run:ios --device
# OR use the automated script
npm run ios:device
```

**Verify permissions are added:**
```bash
cat app.json | grep NSFaceIDUsageDescription
# Should show: "NSFaceIDUsageDescription": "This app uses Face ID..."
```

#### 5. "Build failed - CocoaPods error"

**Solution:**
```bash
# Update CocoaPods
sudo gem install cocoapods

# Clean and reinstall pods
cd ios
pod cache clean --all
pod deintegrate
pod install
cd ..

# Rebuild
npx expo run:ios
```

#### 6. "Android build fails - SDK not found"

**Solution:**
```bash
# Verify ANDROID_HOME is set
echo $ANDROID_HOME
# Should show: /Users/yourusername/Library/Android/sdk

# If empty, add to ~/.zshrc:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Reload shell
source ~/.zshrc
```

#### 7. "TypeScript errors after npm install"

**Solution:**
```bash
# Rebuild TypeScript
npm run type-check

# If errors persist, check tsconfig.json:
cat tsconfig.json
# Should extend "expo/tsconfig.base"
```

#### 8. "Simulator not opening"

**Solution:**
```bash
# Open Xcode
open -a Xcode

# Open Simulator from Xcode
Xcode → Window → Devices and Simulators → Simulators

# Or open directly
open -a Simulator

# Then run:
npm run ios
```

#### 9. "App crashes on launch"

**Check console for errors:**
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

**Common causes:**
- Missing dependency (run `npm install`)
- Cache issue (run `npx expo start --clear`)
- Native code change (rebuild with `npx expo run:ios`)

#### 10. "Package version warnings"

**Solution:**
```bash
# Ensure packages match Expo SDK 54
npm install react-native-screens@~4.16.0
npm install @types/jest@29.5.14
npm install jest@~29.7.0
```

---

## Testing

### Run All Tests

```bash
npm test
```

**Output:**
```
PASS  src/utils/__tests__/validation.test.ts
PASS  src/services/__tests__/auth.service.test.ts

Test Suites: 2 passed, 2 total
Tests:       48 passed, 48 total
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

Auto-reruns tests when files change.

### Run Specific Test File

```bash
npm test validation.test.ts
npm test auth.service.test.ts
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

**Output:**
```
File                    | % Stmts | % Branch | % Funcs | % Lines |
------------------------|---------|----------|---------|---------|
src/utils/validation.ts |   100   |   100    |   100   |   100   |
src/services/auth.service.ts | 95 | 90 | 100 | 95 |
```

---

## Project Scripts Reference

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run start:lan` | Start Metro with LAN support for physical devices |
| `npm run ios` | Run on iOS simulator (quick start) |
| `npm run ios:device` | **Automated script** - Build and run on physical iPhone with Metro setup |
| `npm run android` | Run on Android emulator (quick start) |
| `npm run web` | Run in web browser |
| `npx expo run:ios` | Build native iOS app (required for Face ID) |
| `npx expo run:ios --device` | Build and install on physical iPhone (manual) |
| `npx expo run:android` | Build native Android app |
| `npm test` | Run all Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run type-check` | Check TypeScript types (0 errors required) |
| `npm run lint` | Check ESLint rules (0 errors required) |
| `npm run lint:fix` | Auto-fix ESLint errors |
| `npm run format` | Format code with Prettier |

---

## Next Steps

After successful installation:

1. ✅ **Register your first account** in the app
2. ✅ **Enable Face ID** in Settings (on Home screen)
3. ✅ **Logout and login again** using Face ID
4. ✅ **Test failed login lockout** (5 attempts = 5 min lockout)
5. ✅ **Test session persistence** (close app, reopen → still logged in)

---

## Additional Resources

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Documentation**: https://reactnative.dev/docs/getting-started
- **React Navigation**: https://reactnavigation.org/docs/getting-started
- **React Hook Form**: https://react-hook-form.com/get-started
- **TypeScript**: https://www.typescriptlang.org/docs/

---

## Support

If you encounter issues not covered in this guide:

1. **Check console logs** for detailed error messages
2. **Clear cache and reinstall dependencies** (often fixes 80% of issues)
3. **Verify all prerequisites are installed** with correct versions
4. **For Face ID issues**: Ensure you're using `npx expo run:ios` (not Expo Go)

---

**Last Updated:** January 2025
**Tested on:** macOS Sonoma 14.x, Xcode 15.x, iOS 17.x, Android 13
