# Production Deployment Checklist

## Pre-Deployment Verification

### 1. Verify Configuration
```bash
npm run production:verify
```

This checks:
- ✅ All Firebase config files have correct API key
- ✅ Remote Config template is complete
- ✅ firebase.json is properly configured
- ✅ All required files exist

### 2. Push Remote Config
```bash
npm run remoteconfig:push
```

This pushes all client-safe configuration values to Firebase Remote Config.

### 3. Verify Firebase Authentication
- [ ] Firebase Auth is enabled in Firebase Console
- [ ] Email/Password provider is enabled
- [ ] Google OAuth is configured (if using)
- [ ] Authorized domains include your production domain

## Deployment Steps

### Option 1: Deploy Everything
```bash
npm run production:deploy
```

This deploys:
- Remote Config
- Website (Firebase Hosting)
- Cloud Functions

### Option 2: Deploy Individual Services
```bash
# Deploy only website
npm run production:deploy:hosting

# Deploy only functions
npm run production:deploy:functions

# Push only Remote Config
npm run remoteconfig:push
```

## Post-Deployment Verification

### 1. Test Authentication
- [ ] Visit live site: https://damp-smart-drinkware.web.app
- [ ] Test user signup
- [ ] Test user login
- [ ] Test password reset
- [ ] Verify user profile creation in Firestore

### 2. Verify Remote Config
- [ ] Go to Firebase Console > Remote Config
- [ ] Verify all parameters are present
- [ ] Check that values match production config

### 3. Test Cloud Functions
- [ ] Test API endpoints
- [ ] Verify user profile creation trigger
- [ ] Test Stripe webhook (if applicable)

### 4. Check Console Logs
- [ ] Check Firebase Console for errors
- [ ] Check browser console for errors
- [ ] Verify no CORS issues

## Production Configuration Values

### Firebase Configuration
- **API Key**: `AIzaSyAKkZEf6c3mTzDdOoDT6xmhhsmx1RP_G8w`
- **Auth Domain**: `damp-smart-drinkware.firebaseapp.com`
- **Project ID**: `damp-smart-drinkware`
- **Storage Bucket**: `damp-smart-drinkware.firebasestorage.app`
- **Messaging Sender ID**: `309818614427`
- **App ID**: `1:309818614427:web:db15a4851c05e58aa25c3e`
- **Measurement ID**: `G-YW2BN4SVPQ`
- **Database URL**: `https://damp-smart-drinkware-default-rtdb.firebaseio.com`

### Live URLs
- **Firebase Hosting**: https://damp-smart-drinkware.web.app
- **Firebase Hosting (Alt)**: https://damp-smart-drinkware.firebaseapp.com
- **Custom Domain** (if configured): https://dampdrink.com

## Troubleshooting

### Authentication Not Working
1. Check Firebase Console > Authentication > Settings
2. Verify authorized domains include your production domain
3. Check browser console for errors
4. Verify API key is correct in client code

### Remote Config Not Loading
1. Verify Remote Config is pushed: `npm run remoteconfig:push`
2. Check Firebase Console > Remote Config
3. Verify client code fetches from Remote Config
4. Check network tab for Remote Config requests

### Functions Not Working
1. Check Firebase Console > Functions for errors
2. Verify functions are deployed: `firebase functions:list`
3. Check function logs in Firebase Console
4. Verify environment variables are set

## Security Checklist

- [ ] Firebase API key is in Remote Config (not hardcoded)
- [ ] Stripe publishable key is in Remote Config
- [ ] No secret keys in client code
- [ ] CORS is properly configured
- [ ] CSP headers are set correctly
- [ ] HTTPS is enforced

## Monitoring

After deployment, monitor:
- Firebase Console > Usage and billing
- Firebase Console > Performance
- Browser console for client errors
- Function logs for server errors

## Rollback Plan

If issues occur:
1. Check Firebase Console > Hosting > Releases
2. Rollback to previous version if needed
3. Check function logs for errors
4. Verify Remote Config values

## Support

For issues:
- Check Firebase Console logs
- Review browser console errors
- Check function execution logs
- Verify configuration values

