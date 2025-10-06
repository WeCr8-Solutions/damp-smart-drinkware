/* global console */
const { test, expect } = require('@playwright/test');

const ACTION_RX = /reserve|pre-?order|buy|shop|order now/i;
const RECOMMENDED_PATHS = [
  '/pages/pre-sale-funnel.html',
  '/pages/pre-order.html',
  '/pages/products.html',
];

test.describe('Smoke Tests @smoke', () => {
  const getTimestamp = () => new Date().toISOString();

  test.afterEach(async ({ page }, testInfo) => {
    const status = testInfo.status;
    const symbol = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️';
    const timestamp = getTimestamp();
    console.log(`[${timestamp}] ${symbol} Test "${testInfo.title}" ${status}`);
    
    // Capture more detailed information for the HTML report
    const testData = {
      timing: {
        start: testInfo.startTime.toISOString(),
        end: new Date().toISOString(),
        duration: Date.now() - testInfo.startTime.getTime()
      },
      browser: {
        name: testInfo.project.name,
        platform: process.platform,
        viewport: await page.viewportSize()
      },
      results: {
        status,
        retry: testInfo.retry,
        duration: Date.now() - testInfo.startTime.getTime(),
        workerIndex: testInfo.workerIndex
      }
    };

    if (testInfo.error) {
      console.error(`[${timestamp}] Error in "${testInfo.title}":\n   ${testInfo.error.message}`);
      testData.error = {
        message: testInfo.error.message,
        stack: testInfo.error.stack,
        location: testInfo.error.location
      };
      
      // Capture a screenshot on failure
      try {
        const screenshot = await page.screenshot({ timeout: 5000 });
        await testInfo.attach('failure-screenshot', { body: screenshot, contentType: 'image/png' });
      } catch (e) {
        console.warn('Failed to capture failure screenshot:', e.message);
      }
    }
    
    // Enhanced logging with more context
    testInfo.annotations.push(
      {
        type: 'log',
        description: `Test completed at ${timestamp} with status: ${status}`
      },
      {
        type: 'metadata',
        description: JSON.stringify(testData, null, 2)
      }
    );
  });

  test.beforeEach(async ({ page }, testInfo) => {
    console.log(`\n📋 Setting up test: ${testInfo.title}`);
    
    // Desktop viewport for consistent layout
    await page.setViewportSize({ width: 1280, height: 720 });

    // Helpful logging (console + network failures)
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`Page Error: ${msg.text()}`);
      }
    });
    page.on('requestfailed', (request) => {
      const failure = request.failure();
      console.log(`Failed request: ${request.url()} - ${failure ? failure.errorText : 'unknown error'}`);
    });

    // Go to baseURL home (from Playwright config)
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Log test start in results
    testInfo.annotations.push({
      type: 'setup',
      description: `Test started at ${getTimestamp()}`
    });
  });

  test('Homepage loads and main elements are visible', async ({ page }) => {
    console.log('🚀 Starting test: Homepage loads and main elements are visible');
    // Wait for custom element definition (runs in browser)
    await page.waitForFunction(() => !!(window.customElements && window.customElements.get('damp-header')));

    // Quick structure probe (returned to Node for logging)
    const pageStructure = await page.evaluate(() => ({
      hasHeader: !!document.querySelector('damp-header'),
      hasBanner: !!document.querySelector('.banner, .header, [role="banner"]'),
      hasNav: !!document.querySelector('nav, [role="navigation"]'),
      hasMain: !!document.querySelector('main'),
      hasFooter: !!document.querySelector('footer'),
      hasSkipLinks: !!document.querySelector('.skip-link, .skip-to-content'),
      mainElements: Array.from(document.body.children).map((el) => ({
        tag: el.tagName.toLowerCase(),
        class: el.className,
        role: el.getAttribute('role'),
        id: el.id,
      })),
    }));
    console.log('Page Structure:', pageStructure);

    // Accessibility & layout checks
    await expect(page.locator('.skip-link, .skip-to-content').first()).toBeAttached();
    await expect(page.locator('damp-header').first()).toBeAttached();
    await expect(page.locator('nav, [role="navigation"]').first()).toBeVisible();
    await expect(page.locator('main#main-content')).toBeVisible();

    // Shadow DOM is auto-pierced by locators, but keep this debug log:
    await page.evaluate(() => {
      const header = document.querySelector('damp-header');
      const h1 = header?.shadowRoot?.querySelector('h1');
      if (h1) console.log('Found h1 in shadow DOM:', h1.textContent);
    });

    // Links available
    const links = await page.locator('a:not(.skip-link):not(.skip-to-content)').allTextContents();
    console.log('Available links:', links);

    // Action links (role-first, text regex)
    const actionLinks = page.getByRole('link', { name: ACTION_RX });
    const actionLinksCount = await actionLinks.count();
    expect(actionLinksCount).toBeGreaterThan(0);

    // Auth modal exists (hidden by default is fine)
    await expect(page.locator('#authModal')).toBeAttached();
    console.log('✅ Test completed: Homepage loads and main elements are visible');
  });

  test('Navigation menu works @smoke', async ({ page }) => {
    console.log('🚀 Starting test: Navigation menu works');
    // Try to parse sitemap (optional)
    let sitemapUrls = [];
    try {
      await page.goto('/sitemap.xml', { waitUntil: 'domcontentloaded' });
      sitemapUrls = await page.$$eval('url > loc', (els) => els.map((el) => el.textContent || '').filter(Boolean));
    } catch (error) {
      test.info().annotations.push({
        type: 'warning',
        description: `Could not load sitemap: ${error.message}`,
      });
    }

    // Return home
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Header present
    await expect(page.locator('damp-header')).toBeAttached();

    // Collect nav links (shadow + light DOM are both visible to querySelector thanks to open shadow; locators already pierce though)
    const links = await page.evaluate(() => {
      const all = [];
      // Shadow
      const header = document.querySelector('damp-header');
      const shadowNav = header?.shadowRoot?.querySelector('nav');
      shadowNav?.querySelectorAll('a').forEach((a) => {
        if (getComputedStyle(a).display !== 'none') all.push({ text: (a.textContent || '').trim(), href: a.href });
      });
      // Light DOM
      document.querySelectorAll('nav a').forEach((a) => {
        if (getComputedStyle(a).display !== 'none') all.push({ text: (a.textContent || '').trim(), href: a.href });
      });
      return all;
    });

    console.log('Navigation links:', links);
    expect(links.length).toBeGreaterThan(0);

    // Validate visibility and href presence
    for (const { text, href } of links) {
      if (!text || !href || href.includes('#')) continue;
      // Prefer role selectors for accessibility/stability
      const linkByRole = page.getByRole('link', { name: new RegExp(`^${escapeRegex(text)}$`, 'i') });
      await expect(linkByRole).toBeVisible();
      expect(href).toBeTruthy();
    }
    console.log('✅ Test completed: Navigation menu works');
  });

  test('Reserve Now flow functions @smoke', async ({ page }) => {
    console.log('🚀 Starting test: Reserve Now flow functions');
    await page.goto('/sitemap.xml', { waitUntil: 'domcontentloaded' }).catch(() => {});
    const sitemapUrls = await page.$$eval('url > loc', (els) => els.map((el) => el.textContent || '').filter(Boolean)).catch(() => []);
    
    // Back home
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    test.info().annotations.push({
      type: 'debug',
      description: `Available sitemap URLs: ${JSON.stringify(sitemapUrls, null, 2)}`,
    });

    // Find a visible action button/link anywhere (shadow/light DOM)
    const candidates = page.locator('a, button').filter({ hasText: ACTION_RX });
    const count = await candidates.count();
    expect(count).toBeGreaterThan(0);unt();
    expect(count).toBeGreaterThan(0);
    // Choose the first visible candidate and gather info
    const btn = candidates.first();
    const tagName = (await btn.evaluate((el) => el.tagName)).toLowerCase();
    const text = (await btn.textContent() || '').trim();
    const href = tagName === 'a' ? await btn.getAttribute('href') : null;

    // Recommended path check
    let recommended = false;
    if (href) {
      const absolute = new URL(href, page.url());
      recommended = RECOMMENDED_PATHS.some(
        (p) => absolute.pathname.endsWith(p) || absolute.pathname.includes(p.replace('.html', ''))
      );
    }

    test.info().annotations.push({
      type: 'debug',
      description: `Found action button: ${JSON.stringify({ text, href, tagName, recommended }, null, 2)}`,
    });

    if (!recommended) {
      test.info().annotations.push({
        type: 'warning',
        description: 'Button href does not match recommended paths',
      });
    }

    // Click & expect navigation toward a commerce route
    await Promise.all([
      btn.click(),
      page.waitForURL(/(?:reserve|shop|product|order)/i, { timeout: 7_500 }),
    ]);
    // Expect either a form or product details
    const formExists = await page.locator('form').isVisible().catch(() => false);
    const productExists = await page.locator('[data-testid="product-details"]').isVisible().catch(() => false);
    
    if (formExists) {
      const formDetails = await page.evaluate(() => {
        const form = document.querySelector('form');
        return form ? {
          action: form.action,
          method: form.method,
          fields: Array.from(form.elements).map((el) => ({
            type: el.type,
            name: el.name,
            required: !!el.required,
            id: el.id
          }))
        } : null;
      });
      test.info().annotations.push({
        type: 'debug',
        description: `Form structure: ${JSON.stringify(formDetails, null, 2)}`,
      });
    } else if (productExists) {
      const details = await page.locator('[data-testid="product-details"]').textContent();
      test.info().annotations.push({
        type: 'debug',
        description: `Product details: ${details}`,
      });
    } else {
      throw new Error('Expected to find either a form or product details');
    }
    console.log('✅ Test completed: Reserve Now flow functions');
  });
});

/** Escapes a string for use in a RegExp */
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
