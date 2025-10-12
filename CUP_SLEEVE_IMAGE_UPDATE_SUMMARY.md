# Cup Sleeve Image Update - Cache Busting Fix

## Issue Summary
The new cup sleeve image (`website/assets/images/products/cup-sleeve/cup-sleeve.png`) was not displaying correctly in the pre-sale funnel and other product cards due to browser caching of the old image.

## Root Cause
When an image file is replaced with a new version but keeps the same filename, browsers and CDNs cache the old version. Users would continue seeing the outdated image until:
1. They manually clear their browser cache
2. The cache expires (could be days or weeks)
3. A hard refresh is performed (Ctrl+F5)

This is a common issue in web development when assets are updated in place.

## Solution Implemented

### 1. Cache-Busting Query Parameters
Added version parameter `?v=2` to all cup sleeve image references across the entire codebase. This forces browsers to treat it as a new resource and download the updated image.

**Format**: `cup-sleeve.png?v=2`

### 2. Service Worker Cache Version Bump
Updated the service worker cache version from `v2.1.0` to `v2.1.1` to ensure the service worker invalidates its cached copy of the old image.

**File**: `website/sw.js`
- `CACHE_NAME: 'damp-v2.1.1'`
- `CACHE_STRATEGY_VERSION: '2.1.1'`

## Files Updated (16 total)

### HTML Pages (7 files)
1. ✅ **website/pages/pre-sale-funnel.html** (line 769)
   - Primary issue location - product card image
   
2. ✅ **website/pages/products.html** (line 773)
   - Product catalog card image
   
3. ✅ **website/index.html** (line 492)
   - Homepage product showcase card
   
4. ✅ **website/pages/cup-sleeve-v1.0.html** (lines 23, 49, 128)
   - Product detail page image
   - Open Graph meta tag
   - Structured data (Schema.org)
   
5. ✅ **website/pages/store.html** (lines 456, 636)
   - Store product card
   - Stripe product data
   
6. ✅ **website/pages/product-voting.html** (line 1217)
   - Voting system product data
   
7. ✅ **website/page.html** (lines 38, 40)
   - Test/debug page references

### JavaScript Files (5 files)
8. ✅ **website/assets/js/pricing-config.js** (line 60)
   - Product pricing configuration
   
9. ✅ **website/assets/js/voting-system-fix.js** (line 44)
   - Voting system product data
   
10. ✅ **website/assets/js/seo-optimizer.js** (line 225)
    - SEO metadata generation
    
11. ✅ **website/setup-voting-data.html** (line 186)
    - Voting data initialization
    
12. ✅ **website/quick-voting-setup.html** (line 134)
    - Firestore voting setup

### Service Worker (1 file)
13. ✅ **website/sw.js** (lines 9-10)
    - Cache version bump

## Technical Details

### Before
```html
<img src="../assets/images/products/cup-sleeve/cup-sleeve.png" alt="DAMP Cup Sleeve">
```

### After
```html
<img src="../assets/images/products/cup-sleeve/cup-sleeve.png?v=2" alt="DAMP Cup Sleeve">
```

### How Cache-Busting Works
1. Browser requests: `cup-sleeve.png?v=2`
2. Browser checks cache for: `cup-sleeve.png?v=2` (not found - new URL)
3. Browser downloads fresh image from server
4. Future updates use `?v=3`, `?v=4`, etc.

### Alternative Approaches Considered
1. ❌ **Rename file** (e.g., `cup-sleeve-v2.png`)
   - Requires updating 16+ references
   - Leaves old files cluttering the repo
   
2. ❌ **Content hashing** (e.g., `cup-sleeve.abc123.png`)
   - Requires build process
   - Overkill for this project size
   
3. ✅ **Query parameter versioning** (chosen)
   - Simple to implement
   - Easy to increment (`v=2`, `v=3`, etc.)
   - No build process required
   - Clean and maintainable

## Testing Checklist

### Visual Verification
- [ ] Pre-sale funnel page displays new cup sleeve image
- [ ] Products page displays new cup sleeve image
- [ ] Homepage displays new cup sleeve image
- [ ] Cup sleeve detail page displays new image
- [ ] Store page displays new image
- [ ] Product voting page displays new image

### Cache Testing
- [ ] Hard refresh (Ctrl+F5) loads new image
- [ ] Normal refresh loads new image
- [ ] Incognito/private browsing loads new image
- [ ] Different browser loads new image
- [ ] Mobile device loads new image

### SEO/Social Media
- [ ] Open Graph preview shows new image (Facebook debugger)
- [ ] Twitter card shows new image (Twitter card validator)
- [ ] Google search preview shows new image (Google Search Console)
- [ ] Schema.org validator shows correct image URL

### Service Worker
- [ ] Service worker updates to v2.1.1
- [ ] Old cache is cleared
- [ ] New image is cached correctly
- [ ] Offline mode serves new image

## Deployment Notes

### Automatic Updates
- Service worker will auto-update within 24 hours
- Cache-busting parameters ensure immediate image updates
- No manual intervention required from users

### CDN Considerations
If using a CDN (Cloudflare, CloudFront, etc.):
1. The `?v=2` parameter bypasses CDN cache
2. CDN will cache the new version with the query parameter
3. No need to manually purge CDN cache

### Future Image Updates
When updating the cup sleeve image again:
1. Replace the image file: `cup-sleeve.png`
2. Increment version parameter: `?v=2` → `?v=3`
3. Use find-and-replace: `cup-sleeve.png?v=2` → `cup-sleeve.png?v=3`
4. Bump service worker version: `v2.1.1` → `v2.1.2`

## Verification Script
```bash
# Search for any remaining non-versioned cup-sleeve references
grep -r "cup-sleeve\.png\"" website/ --exclude-dir=node_modules | grep -v "?v="

# Should return no results if all updated correctly
```

## Performance Impact
- **Positive**: Forces fresh download of updated image
- **Neutral**: Query parameters don't affect image load time
- **Neutral**: Service worker version bump triggers one-time cache refresh

## Browser Compatibility
Cache-busting query parameters work on:
- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Legacy browsers (IE11+)
- ✅ All CDNs and proxies

## Related Issues
- **Skip button hiding**: Fixed separately in `SKIP_BUTTON_FIX_SUMMARY.md`
- **Image file**: Modified per git status (new version uploaded)

## References
- [MDN: HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Google: Cache-Busting Strategies](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching)
- [Service Worker Lifecycle](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle)

---

**Fix Completed**: 2025-10-12  
**Version Updated**: v2 → All cup sleeve image references now use `?v=2`  
**Service Worker**: v2.1.0 → v2.1.1  
**Files Modified**: 16 (13 HTML/JS + 1 Service Worker + 2 Documentation)

