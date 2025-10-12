# 🚨 BUILD COMMAND STILL SET - Need to Clear It Properly

## ❌ The Problem

The build command `expo export -p web` is **STILL active** in Netlify!

Even though you said you cleared it, the build log shows:
```
Build command from Netlify app
$ expo export -p web
commandOrigin: ui    <-- Coming from dashboard UI
```

This means it didn't save properly or there's a caching issue.

---

## ✅ Fix It Properly (Step by Step)

### Step 1: Open Build Settings
The page should be opening now, or go to:
```
https://app.netlify.com/sites/damp-smart-drinkware/settings/deploys
```

### Step 2: Scroll to "Build Settings" Section
Look for a section that says **"Build settings"**

### Step 3: Click "Edit settings" Button
You should see a button that says **"Edit settings"** - click it

### Step 4: Clear ALL Build-Related Fields
You'll see these fields:
- **Build command**: Should show `expo export -p web`
- **Publish directory**: Should show `website`
- **Functions directory**: Might show `netlify/functions`

**Actions**:
1. **Build command**: DELETE `expo export -p web` completely (leave blank)
2. **Publish directory**: KEEP as `website` (don't change)
3. **Functions directory**: KEEP as `netlify/functions` (don't change)

### Step 5: Click "Save" and WAIT
1. Click the **"Save"** button
2. **Wait 5 seconds** for the save to complete
3. Look for a success message (usually green)
4. **Refresh the page** (F5 or Ctrl+R)
5. Verify "Build command" now shows **(not set)** or is empty

### Step 6: Also Disable Lighthouse Plugin
This plugin is causing conflicts. While on the settings page:

1. Click **"Integrations"** tab (at the top)
2. Find `@netlify/plugin-lighthouse` in the list
3. Click the **three dots (⋮)** or **Settings** button
4. Click **"Disable"** or **"Remove"**
5. Confirm

---

## ⚡ After You've Done Both

Come back here and tell me:
- "cleared and saved"

Then I'll trigger a new build that will work!

---

## 🎯 Why This Matters

**Current**: Build tries to run `expo export -p web` → FAILS  
**After Fix**: Build skips command (static site) → SUCCEEDS

This is the ONLY thing blocking your deployment!

---

**Go do it now:**
1. ✅ Clear "Build command" field
2. ✅ Click "Save" and wait
3. ✅ Refresh page to verify
4. ✅ Disable Lighthouse plugin
5. ✅ Tell me "done"

