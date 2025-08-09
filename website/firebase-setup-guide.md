# 🔥 DAMP Firebase Authentication Setup Guide

## Current Firebase Project Configuration

- **Project ID**: `damp-smart-drinkware`
- **Auth Domain**: `damp-smart-drinkware.firebaseapp.com`
- **API Key**: `AIzaSyCGXLp2Xm1UtPZmjFBKjQDLNGz8J3tZQxs`

## ⚠️ Common Issues Causing Sign-Up Failures

### 1. **Email/Password Authentication Not Enabled**
**Most Common Issue** - Check Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/project/damp-smart-drinkware/authentication/providers)
2. Navigate to **Authentication > Sign-in method**
3. Ensure **Email/Password** is **ENABLED**
4. Make sure **Email link (passwordless sign-in)** is configured if needed

### 2. **Authorized Domains Configuration**
Check authorized domains in Firebase Console:

1. Go to **Authentication > Settings > Authorized domains**
2. Ensure these domains are added:
   - `dampdrink.com`
   - `www.dampdrink.com`
   - `localhost` (for testing)
   - Any Netlify preview domains

### 3. **API Key Restrictions**
Check if API key has restrictions:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your project: `damp-smart-drinkware`
3. Check if the API key has HTTP referrer restrictions
4. Ensure `dampdrink.com/*` is allowed

### 4. **Quota and Billing Issues**
Check if you've hit Firebase limits:

1. Go to **Authentication > Usage**
2. Check daily/monthly authentication limits
3. Verify billing is set up if needed

## 🧪 Testing Checklist

### Before Testing Sign-Up:

- [ ] Email/Password authentication is enabled in Firebase Console
- [ ] Current domain is in authorized domains list
- [ ] API key is not restricted or includes current domain
- [ ] Browser allows cookies and local storage
- [ ] No ad blockers interfering with Firebase requests
- [ ] Network allows connections to `*.googleapis.com`

### Test URLs:

1. **Configuration Checker**: `https://dampdrink.com/firebase-config-checker.html`
2. **Authentication Tester**: `https://dampdrink.com/test-firebase-auth.html`

## 🔍 Debugging Steps

### 1. Check Browser Console
Look for these error patterns:
```
- auth/operation-not-allowed
- auth/invalid-api-key
- auth/app-not-authorized
- auth/network-request-failed
```

### 2. Network Tab Analysis
Check for failed requests to:
```
- identitytoolkit.googleapis.com
- firestore.googleapis.com
- securetoken.googleapis.com
```

### 3. Firebase Console Logs
Check Authentication logs in Firebase Console for:
- Failed sign-up attempts
- API key usage
- Error patterns

## 🛠️ Quick Fixes

### Fix 1: Enable Email/Password Auth
```bash
# Using Firebase CLI
firebase auth:import --project damp-smart-drinkware
```

### Fix 2: Add Authorized Domain
1. Firebase Console > Authentication > Settings
2. Add domain to "Authorized domains" list
3. Save changes

### Fix 3: Update API Key Restrictions
1. Google Cloud Console > APIs & Credentials
2. Edit API key restrictions
3. Add HTTP referrer: `dampdrink.com/*`

## 📋 Firebase Console Quick Links

- [Authentication Overview](https://console.firebase.google.com/project/damp-smart-drinkware/authentication/users)
- [Sign-in Methods](https://console.firebase.google.com/project/damp-smart-drinkware/authentication/providers)
- [Settings & Authorized Domains](https://console.firebase.google.com/project/damp-smart-drinkware/authentication/settings)
- [Usage & Quotas](https://console.firebase.google.com/project/damp-smart-drinkware/authentication/usage)

## 🚨 Emergency Troubleshooting

If sign-up still fails after checking above:

1. **Test with curl**:
```bash
curl -X POST \
  'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCGXLp2Xm1UtPZmjFBKjQDLNGz8J3tZQxs' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "returnSecureToken": true
  }'
```

2. **Check Firebase Status**: [Firebase Status Page](https://status.firebase.google.com/)

3. **Verify Project Settings**: Ensure project is active and not suspended

## 📞 Next Steps

1. **Run Configuration Checker**: Visit the config checker page
2. **Check Firebase Console**: Verify all settings above
3. **Test Authentication**: Use the test page with detailed logging
4. **Review Error Messages**: Check browser console for specific error codes

---

*Last Updated: $(date)*
*Project: DAMP Smart Drinkware*
*Contact: zach@wecr8.info*
