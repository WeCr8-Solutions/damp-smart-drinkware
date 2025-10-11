# Stripe Checkout Local Testing Guide
**Date:** October 10, 2025  
**Network:** Testing at http://192.168.1.6:3000/pages/pre-sale-funnel.html

## Option 1: Netlify Dev (Recommended) ✅

Netlify Dev allows you to run your Netlify Functions locally with proper environment variables.

### Setup Steps:

1. **Install Netlify CLI** (if not already installed):
```bash
npm install -g netlify-cli
```

2. **Link your project** (first time only):
```bash
netlify link
```

3. **Set environment variables** (first time only):
```bash
# Set Stripe test secret key
netlify env:set STRIPE_SECRET_KEY sk_test_YOUR_TEST_SECRET_KEY

# Verify it's set
netlify env:list
```

4. **Run Netlify Dev**:
```bash
netlify dev
```

This will:
- Start a local server (usually on port 8888)
- Make your Netlify Functions available at `/.netlify/functions/*`
- Inject environment variables from Netlify
- Support hot-reloading

5. **Access your site**:
- Local machine: http://localhost:8888/pages/pre-sale-funnel.html
- Network access: http://192.168.1.6:8888/pages/pre-sale-funnel.html

### Netlify Dev Configuration

Your `netlify.toml` should already be configured, but verify:

```toml
[dev]
  command = ""
  targetPort = 8888
  port = 8888
  publish = "website"
  functionsPort = 34567
  framework = "#static"

[build]
  publish = "website"
  functions = "netlify/functions"
```

---

## Option 2: Update Local Detection

If Netlify Dev doesn't work, we can update the code to detect your local network IP.

### Update pre-sale-funnel.html:

Replace the `isLocal` check (around line 1668):

```javascript
// Detect local/dev environment
const isLocal = window.location.hostname === 'localhost' 
    || window.location.hostname === '127.0.0.1'
    || window.location.hostname.startsWith('192.168.')  // Local network
    || window.location.hostname.startsWith('10.')       // Private network
    || window.location.port === '3000'                  // Dev port
    || window.location.port === '8080'                  // Alternative dev port
    || window.location.port === '8888';                 // Netlify dev port
```

Then use the Netlify Functions endpoint for local testing:

```javascript
if (isLocal) {
    const apiEndpoint = `http://${window.location.hostname}:34567/.netlify/functions/create-checkout-session`;
    console.log(`📡 PreSaleFunnel: LOCAL DEV - Using endpoint: ${apiEndpoint}`);
    
    const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData)
    });
    // ... rest of the code
}
```

---

## Option 3: Use Stripe Test Cards Directly

For quick testing without backend:

1. Get your Stripe test publishable key from: https://dashboard.stripe.com/test/apikeys

2. Use Stripe's Payment Element directly in the frontend (requires creating a Payment Intent on your backend first)

---

## Testing Checklist

Once Netlify Dev is running:

### 1. Verify Netlify Functions are available:
```bash
curl http://localhost:8888/.netlify/functions/create-checkout-session
```

Should return: `{"error":"Method not allowed"}` (405) - this is correct for GET

### 2. Test with actual POST:
```bash
curl -X POST http://localhost:8888/.netlify/functions/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"line_items":[{"price_data":{"currency":"usd","product_data":{"name":"Test"},"unit_amount":2999},"quantity":1}],"mode":"payment","success_url":"http://localhost:8888/success","cancel_url":"http://localhost:8888/cancel"}'
```

Should return a session ID and URL.

### 3. Test in browser:
- Open: http://192.168.1.6:8888/pages/pre-sale-funnel.html
- Add items to cart
- Click "Proceed to Checkout"
- Should redirect to Stripe Checkout
- Use test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

### 4. Verify webhook (optional):
If you have webhooks set up, use Stripe CLI:
```bash
stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook
```

---

## Stripe Test Cards

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 9995 | Declined |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |
| 4000 0000 0000 0002 | Generic decline |

All test cards:
- Use any future expiry date (e.g., 12/34)
- Use any 3-digit CVC (e.g., 123)
- Use any ZIP code (e.g., 12345)

---

## Troubleshooting

### Issue: "STRIPE_SECRET_KEY not set"
**Solution:** Set environment variable in Netlify:
```bash
netlify env:set STRIPE_SECRET_KEY sk_test_YOUR_KEY
```

### Issue: "Functions not found"
**Solution:** Ensure you're running from project root:
```bash
cd C:\Users\Zach\Documents\Projects\damp-smart-drinkware
netlify dev
```

### Issue: "CORS error"
**Solution:** Netlify Dev handles CORS automatically. If using http-server, you need to proxy through Netlify Dev.

### Issue: "Port 8888 already in use"
**Solution:** Change port in netlify.toml or kill existing process:
```bash
netstat -ano | findstr :8888
taskkill /PID <PID> /F
```

### Issue: Network access not working (192.168.1.6)
**Solution:** 
1. Check Windows Firewall allows the port
2. Use `--host 0.0.0.0` flag:
```bash
netlify dev --host 0.0.0.0
```

---

## Environment Variables Needed

### Required:
- `STRIPE_SECRET_KEY` - Your Stripe test secret key (starts with `sk_test_`)

### Optional:
- `STRIPE_WEBHOOK_SECRET` - For webhook signature verification
- `STRIPE_PUBLISHABLE_KEY` - Already in frontend code

Get your test keys from:
https://dashboard.stripe.com/test/apikeys

---

## Quick Start Commands

```bash
# Navigate to project
cd C:\Users\Zach\Documents\Projects\damp-smart-drinkware

# Set Stripe key (first time only)
netlify env:set STRIPE_SECRET_KEY sk_test_YOUR_KEY_HERE

# Start Netlify Dev
netlify dev

# In another terminal, forward webhooks (optional)
stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook
```

Then open: http://192.168.1.6:8888/pages/pre-sale-funnel.html

---

## Production Testing

Once local testing works, deploy to Netlify for production testing:

```bash
# Deploy to production
netlify deploy --prod

# Your site will be at: https://dampdrink.com
```

Ensure production environment variables are set in Netlify dashboard:
1. Go to: https://app.netlify.com/sites/YOUR_SITE/settings/env
2. Add `STRIPE_SECRET_KEY` with your **live** key (starts with `sk_live_`)

