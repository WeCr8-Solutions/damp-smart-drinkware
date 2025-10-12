# 🔧 Netlify Dashboard Fix - Clear Build Command

## ✅ You Have Pro Enabled - Good!

Now we just need to clear the conflicting build command in the Netlify dashboard.

---

## 📍 Current Problem

The build output shows:
```
Build command from Netlify app
────────────────────────────────────────────────────────────────
$ expo export -p web
CommandError: Platform "web" is not configured...

command: expo export -p web
commandOrigin: ui    <-- This is set in the UI dashboard
```

**The Issue**: The UI build command (`expo export -p web`) overrides your `netlify.toml` configuration.

**The Fix**: Delete this command from the dashboard.

---

## 🎯 Step-by-Step Fix

### Step 1: Open Build Settings

Click this link (or navigate manually):
```
https://app.netlify.com/sites/damp-smart-drinkware/settings/deploys#build-settings
```

**Manual Navigation**:
1. Go to Netlify dashboard
2. Click on your site: **damp-smart-drinkware**
3. Click **Site settings** (in the top menu)
4. Click **Build & deploy** (in the left sidebar)
5. Scroll to **Build settings** section

---

### Step 2: Edit Build Settings

You'll see a section that looks like:

```
┌─────────────────────────────────────┐
│ Build settings                       │
├─────────────────────────────────────┤
│ Build command: expo export -p web   │  <-- DELETE THIS
│ Publish directory: website          │  <-- KEEP THIS
│ Functions directory: netlify/functions │
└─────────────────────────────────────┘
```

**Actions**:
1. Click **Edit settings** button
2. Find the **"Build command"** field
3. **Delete everything** in that field (make it completely empty)
4. Leave **"Publish directory"** as `website`
5. Leave **"Functions directory"** as `netlify/functions`
6. Click **Save** button

---

### Step 3: Verify It's Empty

After saving, the **Build command** should show:
```
Build command: (not set)
```

or just be empty. That's correct!

---

### Step 4: (Optional) Disable Lighthouse Plugin

**Why**: We have Lighthouse configured in `netlify.toml`. Having it enabled in both places can cause conflicts.

**How**:
1. In the same Netlify dashboard, go to **Integrations** tab (top menu)
2. Find `@netlify/plugin-lighthouse` in the list
3. Click the **⋮** (three dots) or **Settings** button
4. Click **Disable** or **Remove**
5. Confirm

**Note**: If you want Lighthouse reports, we can re-enable it later after the build succeeds.

---

### Step 5: Trigger New Build

Come back to your terminal and run:

```powershell
# Option 1: Use the script
.\trigger-build.ps1

# Option 2: Manual commands
git commit --allow-empty -m "chore: trigger build after dashboard fix"
git push origin main
```

---

## 📊 What Will Happen

After you push, Netlify will:

1. **Detect new commit** (instant)
2. **Start build** (5 seconds)
3. **Read netlify.toml** (our configuration)
4. **Skip build command** (because it's empty - static site)
5. **Copy website/ directory** (15 seconds)
6. **Bundle functions** (10 seconds)
7. **Apply headers & redirects** (from netlify.toml)
8. **Deploy to production** (5 seconds)

**Total Time**: ~30-40 seconds

---

## ✅ Success Indicators

### In Netlify Dashboard

Build log will show:
```
✓ Starting Netlify Build
✓ Node version: 18.19.0
✓ Installing dependencies
✓ Packaging Functions
  - create-checkout-session.js
  - get-sales-stats.js
✓ Functions packaged successfully  
✓ Deploying site
✓ Site is live
```

**No** `expo export` errors  
**No** "Build command failed" messages

### On Your Website

Visit: https://dampdrink.com

Browser console (F12) should show:
```
✓ All JavaScript files load
✓ All CSS files load
✓ No MIME type errors
✓ Service worker registers
✓ Firebase initializes
✓ Analytics tracks pageview
```

---

## 🆘 If Build Still Fails

### Check #1: Build Command Really Empty?
- Go back to Build settings
- Verify "Build command" field is truly empty
- If not, clear it again and save

### Check #2: Lighthouse Plugin Disabled?
- Go to Integrations tab
- Verify Lighthouse is not active
- If it is, disable it

### Check #3: Try Manual Deploy
```powershell
npx netlify deploy --prod --dir=website --functions=netlify/functions
```

This bypasses the git hook and deploys directly.

---

## 🎉 After Success

Once build succeeds:

### Immediate
- ✅ Visit https://dampdrink.com
- ✅ Test navigation
- ✅ Test cart functionality
- ✅ Check browser console (no errors)

### Within 1 Hour
- ✅ Check GA4 for page views
- ✅ Verify service worker caching
- ✅ Test checkout flow

### Within 24-48 Hours
- ✅ Check Google AdSense for impressions
- ✅ Review Netlify analytics
- ✅ Monitor performance metrics

---

## 📝 Summary

**Problem**: Build command in UI (`expo export -p web`) overriding netlify.toml  
**Solution**: Clear build command in dashboard  
**Action**: Edit build settings → Delete build command → Save  
**Result**: Build uses netlify.toml (no build command = static site)  
**Time**: 2 minutes to fix, 30 seconds to build  

---

## 🔗 Quick Links

- **Build Settings**: https://app.netlify.com/sites/damp-smart-drinkware/settings/deploys#build-settings
- **Integrations**: https://app.netlify.com/sites/damp-smart-drinkware/integrations
- **Deploys**: https://app.netlify.com/sites/damp-smart-drinkware/deploys
- **Live Site**: https://dampdrink.com

---

**Ready?** Go clear that build command in the dashboard, then come back and run `.\trigger-build.ps1`!

🚀 Your site will be live in 30 seconds!

