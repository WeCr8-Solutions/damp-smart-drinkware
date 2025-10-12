# DAMP Authentication Debugging Guide

**Last Updated:** October 12, 2025

## Quick Start - Enable Debugging

Open your browser console and run:

```javascript
// Enable all debugging
DAMP_DEBUG.enable()

// Enable auth debugging only
DAMP_DEBUG.enable('auth')

// Enable multiple modules
DAMP_DEBUG.enable('auth,firebase,stripe')

// Disable debugging
DAMP_DEBUG.disable()

// View debug history
DAMP_DEBUG.history()

// Get help
DAMP_DEBUG.help()
```

## Available Debug Categories

- **auth** - Authentication flows (sign in, sign up, sign out)
- **firebase** - Firebase initialization and operations
- **stripe** - Payment processing
- **analytics** - GA4 and analytics tracking
- **cart** - Shopping cart operations
- **performance** - Performance monitoring
- **adsense** - AdSense integration
- **general** - General application events

## Auth Debug Logger Features

### 1. Comprehensive Auth Logging

The auth system now logs:
- ✅ Authentication service initialization
- ✅ Auth state changes (sign in/out)
- ✅ Sign up attempts with validation steps
- ✅ Sign in attempts with error details
- ✅ User profile creation/updates
- ✅ Google/Facebook OAuth flows
- ✅ Password reset requests
- ✅ Email verification
- ✅ Performance timing for all operations

### 2. Color-Coded Log Levels

- 🔴 **ERROR** (red) - Critical failures
- 🟠 **WARN** (orange) - Warnings and validation failures
- 🟢 **INFO** (green) - Successful operations
- 🔵 **DEBUG** (blue) - Detailed flow information
- ⚫ **TRACE** (gray) - Very detailed execution traces

### 3. Structured Data Logging

Every log includes:
- Timestamp
- Log level
- Module/category
- Message
- Associated data (when relevant)
- Context (when provided)

## Common Debugging Scenarios

### Scenario 1: User Can't Sign Up

```javascript
// Enable auth debugging
DAMP_DEBUG.enable('auth')

// Try to sign up through the UI
// Watch the console for:
// [AUTH] Sign up attempt started
// [AUTH] Creating user with Firebase Auth...
// [AUTH] User created successfully
// [AUTH] Creating user profile in Firestore...
// [AUTH] Email verification sent
```

**Expected Flow:**
1. Form data collected and validated
2. Firebase Auth createUser called
3. User profile created in Firestore
4. Email verification sent
5. Success message shown

**Common Issues:**
- ❌ Invalid email format (caught at validation)
- ❌ Password too short (< 6 chars)
- ❌ Email already in use (Firebase error code: auth/email-already-in-use)
- ❌ Terms not accepted (caught at validation)

### Scenario 2: User Can't Sign In

```javascript
// Enable auth debugging
DAMP_DEBUG.enable('auth')

// Try to sign in through the UI
// Watch the console for:
// [AUTH] Sign in attempt started
// [AUTH] Authenticating with Firebase...
// [AUTH] Sign in successful or Sign in failed
```

**Expected Flow:**
1. Email and password validated
2. Firebase Auth signIn called
3. Auth state changes to authenticated
4. User profile loaded
5. Success message shown

**Common Issues:**
- ❌ Invalid credentials (auth/wrong-password, auth/user-not-found)
- ❌ Email not verified
- ❌ Account disabled
- ❌ Network error

### Scenario 3: Auth State Not Persisting

```javascript
// Enable auth debugging
DAMP_DEBUG.enable('auth')

// Refresh the page
// Watch the console for:
// [AUTH] AuthService initializing...
// [AUTH] Setting up auth state listener
// [AUTH] Auth state changed
```

**Expected Flow:**
1. AuthService initializes
2. Auth state listener set up
3. Firebase checks for existing session
4. If session exists, user is restored
5. UI updates to show signed-in state

**Common Issues:**
- ❌ Local storage disabled/cleared
- ❌ Third-party cookies blocked
- ❌ Firebase session expired
- ❌ Auth state listener not triggering

## Debug Logger API

### Basic Usage

```javascript
// Get a logger for your module
const logger = window.debugLogger.createModuleLogger('mymodule');

// Log at different levels
logger.info('Operation started');
logger.debug('Detailed info', { data: 'value' });
logger.warn('Warning condition', { reason: 'something' });
logger.error('Operation failed', { error: 'details' });

// Track performance
const key = logger.time('operation-name');
// ... do work ...
logger.timeEnd(key);
```

### In Auth Service (auth-service.js)

The auth service automatically logs:
```javascript
// Initialization
this.logger.info('AuthService initializing...');

// Operations
this.logger.debug('Creating user with Firebase Auth...');
this.logger.info('User created successfully', { uid, email });

// Errors
this.logger.error('Sign up failed', { code, message, email });

// Performance
const timerKey = this.logger.time('signUpWithEmail');
// ... operation ...
this.logger.timeEnd(timerKey);
```

### In Auth Modal (auth-modal.js)

The modal logs user interactions:
```javascript
// Form submissions
this.logger.info('Sign in form submitted', { email });

// Validation
this.logger.warn('Invalid email format', { email });

// Results
this.logger.info('Sign in successful, showing success message');
this.logger.warn('Sign in failed', { error, message });
```

## Advanced Debugging

### View Debug History

```javascript
// Get all logged events
const history = DAMP_DEBUG.history();

// Filter by category
const authLogs = history.filter(log => log.category === 'auth');

// Find errors
const errors = history.filter(log => log.level === 'ERROR');

// Export for analysis
console.table(authLogs);
```

### Performance Analysis

```javascript
// Enable auth debugging
DAMP_DEBUG.enable('auth');

// Sign up a test user
// Watch for timing logs:
// ⏱️ Performance: signUpWithEmail - 1234.56ms

// View all performance logs
const perfLogs = DAMP_DEBUG.history().filter(log => 
  log.message.includes('Performance')
);
```

### Clear Debug History

```javascript
// Clear accumulated logs
DAMP_DEBUG.clear();
```

## Testing Authentication Flows

### Manual Testing with Debug Mode

1. **Enable debugging:**
   ```javascript
   DAMP_DEBUG.enable('auth');
   ```

2. **Open the auth modal** (click Sign In/Create Account)

3. **Fill out the form** and watch console output

4. **Check for:**
   - ✅ Form validation messages
   - ✅ Firebase API calls
   - ✅ Success/error responses
   - ✅ Auth state changes
   - ✅ UI updates

### Automated Debug Script

Use the existing Firebase debug script:

```javascript
// Run comprehensive debug test
window.debugFirebaseAuth();

// Test sign up with specific credentials
window.testFirebaseSignUp('test@example.com', 'password123');

// Check Firebase services status
window.checkFirebaseServices();
```

## Troubleshooting Guide

### Issue: No Debug Logs Appearing

**Cause:** Debug mode not enabled or script not loaded

**Solution:**
1. Check if debug logger loaded: `console.log(window.debugLogger)`
2. Enable debugging: `DAMP_DEBUG.enable('auth')`
3. Verify script tag in HTML: `<script src="assets/js/debug-logger.js"></script>`

### Issue: Auth Service Not Available

**Cause:** Firebase not initialized or auth service not created

**Solution:**
1. Check Firebase init: `console.log(window.firebaseServices)`
2. Check auth service: `console.log(window.firebaseServices?.authService)`
3. Enable Firebase debugging: `DAMP_DEBUG.enable('firebase')`

### Issue: Can't See Detailed Logs

**Cause:** Wrong log level or category filtering

**Solution:**
1. Enable all categories: `DAMP_DEBUG.enable('*')`
2. Check browser console filters (Info, Warnings, Errors all enabled)
3. Clear console and try again

## Production vs Development

### Development Mode

Debug logging is **disabled by default** to avoid exposing sensitive data.

To enable in development:
```javascript
localStorage.setItem('DAMP_DEBUG', 'auth');
// or
DAMP_DEBUG.enable('auth');
```

### Production Safety

- Logs are only shown when explicitly enabled
- No performance impact when disabled
- Sensitive data (passwords) never logged
- User emails only logged when debugging enabled
- All logs stored in memory (not sent to server)

## Console Commands Reference

```javascript
// Enable/Disable
DAMP_DEBUG.enable()           // Enable all
DAMP_DEBUG.enable('auth')     // Auth only
DAMP_DEBUG.disable()          // Disable

// View Data
DAMP_DEBUG.history()          // All logs
DAMP_DEBUG.categories()       // Available categories

// Utility
DAMP_DEBUG.clear()            // Clear history
DAMP_DEBUG.help()             // Show help

// Legacy Firebase Debug
debugFirebaseAuth()           // Comprehensive test
testFirebaseSignUp(email, pw) // Test sign up
checkFirebaseServices()       // Check status
```

## Files Modified

### New Files
- `website/assets/js/debug-logger.js` - Centralized debug logger

### Updated Files
- `website/assets/js/auth-service.js` - Added comprehensive auth logging
- `website/assets/js/auth-modal.js` - Added UI interaction logging
- `website/index.html` - Added debug logger script tag

### Existing Debug Tools
- `website/assets/js/firebase-debug.js` - Firebase-specific debugging

## Next Steps

1. **Enable debugging in your development environment**
2. **Test all auth flows** (sign up, sign in, sign out)
3. **Report issues** with debug log output for faster troubleshooting
4. **Add debugging to other modules** as needed

## Support

If you encounter auth issues:

1. **Enable debug mode:** `DAMP_DEBUG.enable('auth')`
2. **Reproduce the issue**
3. **Copy console output** (`DAMP_DEBUG.history()`)
4. **Report with details:**
   - What you were trying to do
   - What happened
   - Debug log output
   - Browser and version

---

**Debug Mode Status:** Check with `localStorage.getItem('DAMP_DEBUG')`  
**Logger Available:** Check with `!!window.debugLogger`  
**Auth Service:** Check with `!!window.firebaseServices?.authService`

