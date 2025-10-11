# Netlify Configuration Fix - October 11, 2025

## Critical Issues Fixed

### 1. ✅ Redirects Order Corrected
**Problem:** API redirects were placed AFTER the SPA fallback, causing all `/api/*` requests to route to `index.html` instead of Netlify Functions.

**Fix:** Moved API redirects to the TOP of the redirects section.

**Before:**
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

**After:**
```toml
# API redirects for serverless functions (MUST BE FIRST)
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

# ... other redirects ...

# SPA routing fallback (MUST BE LAST)
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. ✅ Removed Next.js Plugin
**Problem:** The `@netlify/plugin-nextjs` plugin was causing Edge Functions bundling errors because this is a static site, not a Next.js application.

**Fix:** Removed the Next.js plugin completely and removed `NETLIFY_NEXT_PLUGIN_SKIP` environment variable.

**Before:**
```toml
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**After:**
```toml
# Removed - not needed for static site
```

### 3. ✅ Added Functions Directory
**Problem:** Functions directory was not explicitly defined.

**Fix:** Added `functions = "netlify/functions"` to build configuration.

```toml
[build]
  command = "echo 'Building website directory - no build needed for static site'"
  publish = "website"
  functions = "netlify/functions"  # ADDED
```

### 4. ✅ Added Netlify Dev Configuration
**Problem:** Netlify Dev had no configuration, causing issues with local development.

**Fix:** Added complete `[dev]` section for local testing.

```toml
[dev]
  command = ""
  targetPort = 8888
  port = 8888
  publish = "website"
  functionsPort = 34567
  framework = "#static"
```

## Why These Changes Matter

### API Redirects Order
Netlify processes redirects in order. When the SPA fallback (`/*`) was before the API redirect, it would match ALL requests including `/api/*`, preventing Stripe checkout from working.

**Impact:** Stripe checkout will now work correctly in production.

### Next.js Plugin Removal
The plugin was trying to bundle Edge Functions for Next.js features that don't exist in this static site, causing deployment failures.

**Impact:** Deployments will now complete successfully without Edge Functions errors.

### Functions Directory
Explicitly defining the functions directory ensures Netlify knows where to find serverless functions.

**Impact:** `create-checkout-session.js` will be properly deployed.

### Dev Configuration
Proper dev configuration enables seamless local testing with Netlify Dev.

**Impact:** Local Stripe testing works correctly with `netlify dev`.

## Testing Instructions

### 1. Test Local Development
```bash
netlify dev
```

Should start on port 8888 with functions on port 34567.

### 2. Test API Routes Locally
```bash
curl -X POST http://localhost:8888/.netlify/functions/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"line_items":[{"price_data":{"currency":"usd","product_data":{"name":"Test"},"unit_amount":2999},"quantity":1}],"mode":"payment","success_url":"http://localhost:8888/success","cancel_url":"http://localhost:8888/cancel"}'
```

Should return a Stripe session ID.

### 3. Test Production Deployment
After deploying, test:
- https://dampdrink.com/api/create-checkout-session (should process POST requests)
- https://dampdrink.com/pages/pre-sale-funnel.html (should load correctly)
- Complete a full checkout flow

## Configuration Summary

### Build Settings
- **Publish directory:** `website`
- **Functions directory:** `netlify/functions`
- **Build command:** Static site (no build needed)
- **Node version:** 18

### Dev Settings
- **Port:** 8888
- **Functions port:** 34567
- **Framework:** Static

### Plugins
- ✅ `@netlify/plugin-lighthouse` (performance monitoring)
- ❌ `@netlify/plugin-nextjs` (REMOVED - not needed)

### Redirects (in order)
1. API routes → Netlify Functions
2. HTTPS enforcement
3. WWW removal
4. Legacy redirects
5. SPA fallback (LAST)

## Deployment Impact

These changes will:
- ✅ Fix Stripe checkout in production
- ✅ Enable proper API routing
- ✅ Remove Edge Functions errors
- ✅ Improve local development experience
- ✅ Ensure functions are properly deployed

## Related Files

- `netlify.toml` - Main configuration file
- `netlify/functions/create-checkout-session.js` - Stripe checkout function
- `STRIPE_LOCAL_TESTING_GUIDE.md` - Local testing guide
- `start-dev-with-stripe.ps1` - Automated setup script

