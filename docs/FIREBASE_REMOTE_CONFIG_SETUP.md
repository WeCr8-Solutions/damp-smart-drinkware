# Firebase Remote Config Setup Guide

## Overview

Firebase Remote Config allows you to store client-safe configuration values in Firebase, which can be updated without redeploying your application. This is ideal for:

- Firebase API keys (safe for client-side)
- Stripe publishable keys
- Feature flags
- App configuration values
- Analytics IDs

## Prerequisites

1. Firebase CLI installed and authenticated:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. Firebase project initialized:
   ```bash
   firebase use damp-smart-drinkware
   ```

## Pushing Configuration to Firebase

### Step 1: Update Remote Config Template

Edit `remoteconfig.template.json` to include all client-safe configuration values:

```json
{
  "parameters": {
    "firebase_api_key": {
      "defaultValue": {
        "value": "AIzaSyAKkZEf6c3mTzDdOoDT6xmhhsmx1RP_G8w"
      },
      "description": "Firebase Web API Key"
    },
    "stripe_publishable_key": {
      "defaultValue": {
        "value": "pk_test_your_publishable_key"
      },
      "description": "Stripe Publishable Key"
    }
  }
}
```

### Step 2: Push to Firebase

Run the push script:

```bash
npm run remoteconfig:push
```

Or manually:

```bash
firebase deploy --only remoteconfig --project damp-smart-drinkware
```

### Step 3: Verify in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `damp-smart-drinkware`
3. Navigate to **Remote Config**
4. Verify all parameters are present

## Using Remote Config in Client Code

### Web Platform

```javascript
import { getRemoteConfigValue } from './assets/js/firebase-services.js';

// Get a single value
const apiKey = await getRemoteConfigValue('firebase_api_key');

// Get Firebase config
import { getFirebaseConfigFromRemote } from './scripts/get-config-from-remote.js';
const firebaseConfig = await getFirebaseConfigFromRemote();
```

### Mobile Platform

```typescript
import { getRemoteConfig } from 'firebase/remote-config';
import { fetchAndActivate, getValue } from 'firebase/remote-config';

const remoteConfig = getRemoteConfig(app);
await fetchAndActivate(remoteConfig);

const apiKey = getValue(remoteConfig, 'firebase_api_key').asString();
```

## Configuration Values in Remote Config

### Firebase Configuration
- `firebase_api_key` - Firebase Web API Key
- `firebase_auth_domain` - Firebase Auth Domain
- `firebase_project_id` - Firebase Project ID
- `firebase_storage_bucket` - Firebase Storage Bucket
- `firebase_messaging_sender_id` - Firebase Messaging Sender ID
- `firebase_app_id` - Firebase App ID
- `firebase_measurement_id` - Firebase Analytics Measurement ID
- `firebase_database_url` - Firebase Realtime Database URL

### Payment Configuration
- `stripe_publishable_key` - Stripe Publishable Key (safe for client-side)

### Analytics
- `google_analytics_id` - Google Analytics Measurement ID

### App Configuration
- `alert_distance_threshold` - Default distance threshold for alerts
- `battery_warning_threshold` - Battery warning threshold
- `notification_cooldown_minutes` - Notification cooldown period
- `app_maintenance_mode` - Maintenance mode flag
- `support_contact_email` - Support email address
- `firmware_update_url` - Firmware update URL

## Updating Values

### Via Firebase Console

1. Go to Firebase Console > Remote Config
2. Click on a parameter to edit
3. Update the value
4. Click **Publish changes**

### Via Script

1. Update `remoteconfig.template.json`
2. Run `npm run remoteconfig:push`

## Best Practices

1. **Never store secrets**: Only store values that are safe to expose client-side
2. **Use defaults**: Always provide default values in code as fallback
3. **Validate values**: Check that fetched values are valid before using
4. **Cache appropriately**: Remote Config values are cached (1 hour by default)
5. **Test changes**: Test Remote Config changes in staging before production

## Security Notes

⚠️ **Important**: The following are safe for client-side use:
- Firebase API keys (they're meant to be public)
- Stripe publishable keys (they're meant to be public)
- Analytics IDs
- Feature flags

❌ **Never store in Remote Config**:
- Stripe secret keys
- Database connection strings
- API secret keys
- JWT secrets
- Encryption keys

## Troubleshooting

### Remote Config not loading

1. Check Firebase initialization:
   ```javascript
   const firebase = await initializeFirebase();
   console.log('Remote Config:', firebase.remoteConfig);
   ```

2. Verify Remote Config is enabled in Firebase Console

3. Check network connectivity

4. Verify default values are set in code

### Values not updating

1. Remote Config caches values for 1 hour by default
2. Force fetch: `await fetchAndActivate(remoteConfig)`
3. Check if changes were published in Firebase Console

## Related Files

- `remoteconfig.template.json` - Remote Config template
- `scripts/push-remote-config.js` - Script to push config to Firebase
- `website/assets/js/firebase-services.js` - Remote Config initialization
- `scripts/get-config-from-remote.js` - Helper functions to fetch config

