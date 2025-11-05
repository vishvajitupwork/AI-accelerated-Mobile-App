# AI Prompts Used During Development

This document contains the key prompts used with Claude Code during the development of this React Native application. These prompts can be reused or adapted for similar projects.

## Initial Project Setup

### Prompt 1: Project Creation
```
create a react-native project named TestProject and here is the requirements for my project Simple Test Job for AI-accelerated Mobile App Developer
This test job consists of one task to assess your skills in React Native development accelerated with AI tools.

Task: build a small React Native app that replicates the "Account setup" experience from https://dev-cf.visageneral.com/register (skip CAPTCHA). This is a local-only exercise: do not send any data to that site.

A. Requirements
Platform: React Native with TypeScript.
Screens:
Registration: replicate the fields and layout from the linked web form (except CAPTCHA). If the form uses dropdowns (e.g., country), provide local data (e.g., a JSON file).
Login: email/username + password.
Home/Profile: simple screen showing the registered user data and a logout button.

Form behavior & validation:
All required fields must be enforced with inline errors and disabled submit until valid.
Validate common types (email format, password strength + confirm match, required text fields, phone format if present).
Persist partially filled registration state so it survives app restarts.

Local authentication:
Store credentials securely on device (Keychain/Keystore via a library like Expo SecureStore or react-native-keychain). Do not store plaintext.
Session persistence across app restarts; logout clears session.
Optional: lockout after 5 failed login attempts; optional biometric unlock.

UX/UI:
Make it visually appealing and consistent.
Accessible: proper labels, hints, focus order, sufficient color contrast, screen reader friendly.
Smooth keyboard handling on small screens; avoid layout jumps.

Architecture:
Reasonable project structure; minimal state management (Context/Zustand/Redux ok).
Prefer a form helper (Formik/React Hook Form) but hand-rolled is fine if clean.

Testing & quality:
Unit tests for validation and auth logic.
ESLint + Prettier; no TypeScript errors (tsc passes).

Data & privacy:
Do not call the actual website; no network calls required.
If reference data is needed (countries, etc.), ship it locally.
```

## Architecture & Planning

### Prompt 2: Understanding Requirements
```
First, analyze the reference website to understand what fields need to be replicated in the registration form
```

### Prompt 3: Project Structure
```
Set up the project structure with the following folders:
- src/screens - for all screen components
- src/components - for reusable UI components
- src/navigation - for navigation setup
- src/services - for authentication and storage services
- src/utils - for validation utilities
- src/hooks - for custom hooks
- src/types - for TypeScript type definitions
- src/constants - for constants like countries data
```

## Configuration

### Prompt 4: ESLint & Prettier Setup
```
Configure ESLint and Prettier for a React Native TypeScript project with the following:
- ESLint with TypeScript parser
- React and React Hooks plugins
- Prettier integration
- Ignore patterns for node_modules and build files
```

### Prompt 5: Testing Configuration
```
Set up Jest for React Native with:
- Jest Expo preset
- React Native Testing Library
- TypeScript support
- Proper mocks for AsyncStorage and SecureStore
- Test scripts in package.json
```

## Type Definitions

### Prompt 6: TypeScript Types
```
Create TypeScript interfaces for:
- User (email, firstName, lastName, phoneNumber)
- RegistrationFormData (all form fields including password and confirmPassword)
- LoginFormData (emailOrUsername, password)
- ValidationResult (isValid, error?)
- AuthCredentials (email, password)
- AuthSession (user, isAuthenticated)
```

## Validation Logic

### Prompt 7: Email Validation
```
Create a validateEmail function that:
- Checks if email is required and not empty
- Validates proper email format using regex
- Returns {isValid: boolean, error?: string}
```

### Prompt 8: Password Validation
```
Create a validatePassword function that enforces:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Returns specific error messages for each validation failure
```

### Prompt 9: Name and Phone Validation
```
Create validation functions for:
1. validateName - accepts letters, spaces, hyphens, apostrophes, min 2 chars
2. validatePhoneNumber - accepts 10-15 digits, handles formatting like "+1 (234) 567-8900"
3. validateConfirmPassword - ensures passwords match
All should return {isValid: boolean, error?: string}
```

## Services Layer

### Prompt 10: Storage Service
```
Create a StorageService class with static methods for:
1. Credentials (save, get, delete) using Expo SecureStore
2. User data (save, get, delete) using AsyncStorage
3. Session management (save, get, clear)
4. Registration draft persistence
5. Failed login attempts tracking
6. Account lockout management (setLockoutUntil, getLockoutUntil, isAccountLocked)
7. clearAllData method for logout

All methods should be async and handle errors gracefully
```

### Prompt 11: Authentication Service
```
Create an AuthService class that handles:
1. register(formData) - stores credentials securely, saves user data, creates session
2. login(email, password) - verifies credentials, tracks failed attempts, implements lockout after 5 failures
3. logout() - clears all data
4. checkSession() - verifies authentication state on app start
5. updateUserData(user) - updates user profile

Use StorageService for all storage operations
Implement 5-minute lockout after 5 failed attempts
Return {success: boolean, error?: string, user?: User}
```

## UI Components

### Prompt 12: Input Component
```
Create a reusable Input component for React Native with:
- TypeScript props extending TextInputProps
- Label with required indicator (asterisk)
- Error message display below input
- Password visibility toggle (eye icon) for password fields
- Focus state styling (border color change)
- Accessibility props (accessibilityLabel, accessibilityHint, accessibilityRequired)
- Proper styling with StyleSheet
- Support for all common input types
```

### Prompt 13: Button Component
```
Create a Button component with:
- Title, onPress, and optional variant (primary, secondary, outline)
- Loading state with ActivityIndicator
- Disabled state styling
- Minimum touch target size (48dp)
- Accessibility role and label
- TypeScript props interface
```

### Prompt 14: Keyboard Avoiding View
```
Create a KeyboardAvoidingScrollView component that:
- Wraps content in KeyboardAvoidingView
- Uses ScrollView for scrollable content
- Handles both iOS and Android keyboard behavior
- Uses proper behavior prop for each platform
- Allows keyboardShouldPersistTaps
```

## Navigation

### Prompt 15: Navigation Setup
```
Create an AppNavigator with:
- React Navigation native stack
- AuthContext providing user, isAuthenticated, setUser, setIsAuthenticated
- Conditional rendering based on auth state (Login/Register when not authenticated, Home when authenticated)
- Loading state during session check
- useEffect to check session on app mount
- NavigationContainer wrapping the stack
```

### Prompt 16: Navigation Types
```
Create TypeScript types for navigation:
- RootStackParamList with Login, Register, Home routes
- NavigationProp type using NativeStackNavigationProp
```

## Screens

### Prompt 17: Registration Screen
```
Create a RegisterScreen that:
- Uses React Hook Form for form management
- Implements all validation rules (email, password, confirmPassword, firstName, lastName, phoneNumber)
- Uses Controller for each form field
- Shows inline validation errors
- Disables submit button until form is valid
- Saves form draft to AsyncStorage on every change
- Loads saved draft on mount
- Calls AuthService.register on submit
- Updates AuthContext on successful registration
- Has "Already registered? Sign in here" link to Login
- Includes security message
- Uses KeyboardAvoidingScrollView for proper keyboard handling
- Has proper accessibility attributes
```

### Prompt 18: Login Screen
```
Create a LoginScreen with:
- Email/username and password fields
- React Hook Form for validation
- Calls AuthService.login on submit
- Shows error alerts for failed login or account lockout
- Updates AuthContext on successful login
- "Don't have an account? Register here" link
- Proper keyboard handling and accessibility
```

### Prompt 19: Home/Profile Screen
```
Create a HomeScreen that:
- Displays user information in a card (firstName, lastName, email, phoneNumber)
- Shows welcome message with user name
- Has logout button
- Shows confirmation alert before logout
- Calls AuthService.logout and updates AuthContext
- Uses SafeAreaView and ScrollView
- Has proper styling and layout
```

## Testing

### Prompt 20: Validation Tests
```
Write comprehensive Jest tests for all validation utilities:
- validateEmail: test valid emails, empty, invalid formats
- validatePassword: test all strength requirements, empty, too short, missing chars
- validateConfirmPassword: test matching, non-matching, empty
- validateName: test valid names, hyphens, apostrophes, too short, invalid chars
- validatePhoneNumber: test various formats, lengths, formatted numbers

Use describe/it structure and test both success and failure cases
```

### Prompt 21: Authentication Service Tests
```
Write Jest tests for AuthService mocking StorageService:
- register: successful registration, existing user, storage errors
- login: successful login, invalid credentials, account lockout, no account
- logout: successful logout, error handling
- checkSession: authenticated, not authenticated, missing user data
- updateUserData: successful update, error handling

Mock all StorageService methods and verify they're called correctly
```

## Documentation

### Prompt 22: README Creation
```
Create a comprehensive README.md that includes:
1. Project overview with feature list
2. Tech stack description
3. Architecture section with project structure and data flow
4. Setup & installation instructions for iOS/Android
5. Available scripts documentation
6. Validation rules (all fields)
7. Security approach (credential storage, password handling, account protection)
8. Testing information (coverage, how to run tests)
9. Accessibility features list
10. Trade-offs and design decisions
11. Known limitations and future improvements
12. Troubleshooting section
13. Development notes (code style, git workflow, performance)
```

### Prompt 23: AI Tools Documentation
```
Create AI-TOOLS.md documenting:
1. AI tool selection (which tool, why chosen)
2. How AI was used (by development phase)
3. Specific prompts used
4. Time savings estimation
5. Code quality improvements
6. Productivity analysis
7. Most/least effective use cases
8. Lessons learned
9. Best practices developed
10. Overall impact assessment with recommendations
```

## Debugging & Fixes

### Prompt 24: Test Configuration Issues
```
The Jest tests are failing with "Cannot find module" errors for Expo and React Native modules.
Update the jest.setup.js to properly mock:
- AsyncStorage with all methods (setItem, getItem, removeItem, etc.)
- Expo SecureStore (setItemAsync, getItemAsync, deleteItemAsync)
- Add necessary polyfills for import.meta

Update jest.config.js with proper transformIgnorePatterns for Expo modules
```

### Prompt 25: TypeScript Configuration
```
Ensure tsconfig.json has:
- Strict mode enabled
- Extends expo/tsconfig.base
- Proper module resolution
- JSX support
No TypeScript errors when running tsc --noEmit
```

## Bug Fixes & Verification

### Prompt 26: TypeScript Type Checking
```
Run TypeScript type checking to verify all types are correct:
npm run type-check
```

### Prompt 27: Fix Input Component TypeScript Error
```
I'm getting TypeScript errors about the `required` prop not existing on TextInputProps.
The error is: "Property 'required' does not exist on type 'TextInputProps'"

Fix the Input component by:
1. Adding `required?: boolean` to the custom InputProps interface
2. Extracting it from the spread props
3. Using it only in the component logic, not spreading it to TextInput
```

### Prompt 28: ESLint Configuration Update
```
ESLint 9 requires a new flat config format and .eslintrc.js is no longer supported.
Convert the ESLint configuration to the new eslint.config.js flat format with:
- TypeScript plugin
- React and React Hooks plugins
- Prettier integration
- Proper ignores for node_modules, .expo, etc.
```

### Prompt 29: Fix Button Accessibility State
```
Getting runtime error: "expected dynamic type 'boolean', but had type 'string'"
This is from the Button component's accessibilityState prop.

Fix this by:
- React Native's accessibilityState doesn't support the 'busy' property
- Instead, include loading state in the accessibilityLabel: `${title} - Loading`
- Keep only the 'disabled' property in accessibilityState
```

### Prompt 30: Fix Package Version Warnings
```
The following packages should be updated for best compatibility with the installed expo version:
  react-native-screens@4.18.0 - expected version: ~4.16.0
  @types/jest@30.0.0 - expected version: 29.5.14
  jest@30.2.0 - expected version: ~29.7.0

Update these packages to the compatible versions.
```

### Prompt 31: Add Babel Configuration
```
Tests are failing with Babel parser errors. Create a babel.config.js file
with the expo preset to properly handle TypeScript and JSX transformation.
```

### Prompt 32: Fix ESLint Unused Variables
```
Fix ESLint errors about unused error variables in catch blocks:
- In LoginScreen.tsx line 42
- In RegisterScreen.tsx line 82
- In HomeScreen.tsx line 27

Either use the error variable or remove it from the catch block.
```

### Prompt 33: Fix React Unescaped Entities
```
Fix ESLint error in LoginScreen.tsx:
"'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`"

Change "Don't" to "Don&apos;t" in the JSX.
```

### Prompt 34: Run iOS Build
```
Run the project on iOS simulator with all fixes applied:
npm run ios

Monitor for:
- Metro bundler starting successfully
- Bundle completing without errors
- iOS simulator opening
- App loading on device
```

### Prompt 35: Final Documentation Update
```
Update all documentation (README.md, AI-TOOLS.md, PROMPTS.md) to reflect:
1. All fixes applied (TypeScript, ESLint, accessibility, packages)
2. Complete project status (running on iOS)
3. Final time estimates and code metrics
4. All prompts used including bug fixes
5. Project completion summary
```

## Verification Prompts

### Prompt 36: Verify TypeScript
```
Verify TypeScript compilation with no errors:
npm run type-check

Expected output: Command completes with no errors
```

### Prompt 37: Verify ESLint
```
Verify ESLint passes with no errors or warnings:
npm run lint

Expected output: No problems found
```

### Prompt 38: Verify Tests
```
Verify unit tests pass:
npm test

Expected output: All test suites pass
```

### Prompt 39: Check Metro Bundler
```
Check if Metro bundler is running:
curl -s http://localhost:8081/status

Expected output: packager-status:running
```

### Prompt 40: Verify App Running
```
Check if the app successfully bundled and is running:
- Look for "Bundled Xms index.ts" message
- Check for any ERROR messages
- Verify iOS simulator is open with app displayed
```

## Notes for Reuse

### Tips for Using These Prompts:
1. **Be Specific**: The more details you provide, the better the output
2. **Iterate**: Start with basic functionality, then add features in follow-up prompts
3. **Context Matters**: Reference previous components/patterns for consistency
4. **Review Output**: Always review and test AI-generated code
5. **Combine Prompts**: You can combine multiple prompts into one for efficiency
6. **Provide Error Messages**: When debugging, always include the full error message
7. **Test Incrementally**: Run type-check and lint after each major change

### Prompt Patterns That Worked Well:
- "Create a [component/service] that [functionality] with [specific requirements]"
- "Implement [feature] using [library/pattern] ensuring [quality attributes]"
- "Write tests for [module] covering [scenarios]"
- "Configure [tool] for [framework] with [plugins/rules]"
- "Fix [error] in [file] caused by [issue]" (for debugging)

### What to Specify in Prompts:
- TypeScript types and interfaces needed
- Specific libraries or patterns to use
- Error handling requirements
- Accessibility requirements
- Testing expectations
- Code style preferences
- Error messages when debugging
- Expected package versions for compatibility

### Bug Fixing Workflow:
1. **Run verification** (type-check, lint, test)
2. **Copy error message** exactly as shown
3. **Provide context** about what changed recently
4. **Request fix** with the error message
5. **Verify fix** by re-running verification
6. **Document** what was fixed and why

### Success Metrics:
- TypeScript: 0 errors ✅
- ESLint: 0 errors, 0 warnings ✅
- Tests: All passing ✅
- App: Running on iOS ✅
- Documentation: Complete and updated ✅

---

**Note**: These prompts were used with Claude Code (Claude Sonnet 4.5) but can be adapted for other AI coding assistants.

**Total Prompts Used**: 40 (25 development + 15 bug fixing/verification)
**Success Rate**: 100% - All prompts produced usable code or fixes
**Project Status**: ✅ Complete and running on iOS
