import { test, expect } from '@playwright/test';
import './_expect-extensions';

/* global window, document, MutationObserver */

const THIRD_PARTY_BLOCK = [
  'googletagmanager.com',
  'google-analytics.com',
  'doubleclick.net',
  'facebook.net',
  'static.cloudflareinsights.com',
  'hotjar.com',
  'fullstory.com',
  'segment.com'
];

test.describe.configure({ mode: 'parallel' });

// Page Navigation Constants
const PAGE_ROUTES = {
  HOME: '/',
  PRODUCT: '/product',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ABOUT: '/about',
  CONTACT: '/contact'
};

// Critical Homepage Elements
const HOME_SELECTORS = {
  navbar: 'nav.main-navigation',
  hamburgerMenu: 'button.hamburger-menu',
  heroSection: 'section.hero-section',
  ctaButton: 'a.cta-button',
  productShowcase: 'section.product-showcase',
  featuresGrid: 'div.features-grid',
  testimonials: 'section.testimonials',
  newsletter: 'form.newsletter-signup',
  footer: 'footer.site-footer'
};

test('Homepage structure and critical elements test', async ({ page }) => {
  // Start at homepage
  await page.goto('/', { waitUntil: 'networkidle' });

  // Verify homepage structure
  const homePage = PRIORITY_PAGES.find(p => p.path === '/');
  await homePage.verify(page);

  // Test responsive menu behavior
  await test.step('responsive menu test', async () => {
    // Verify hamburger menu on mobile
    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1440, height: 900 } // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(300); // Allow for responsive changes
      
      const hamburger = page.locator(HOME_SELECTORS.hamburgerMenu);
      const navbar = page.locator(HOME_SELECTORS.navbar);
      
      if (viewport.width < 768) {
        await expect(hamburger).toBeVisible();
        await hamburger.click();
        await expect(navbar).toHaveClass(/active/);
      } else {
        await expect(navbar).toBeVisible();
        await expect(hamburger).not.toBeVisible();
      }
    }
  });
});

test.beforeEach(async ({ page }, testInfo) => {
  // Block noisy/slow third-party calls and problematic services
  await page.route(
    (url) => THIRD_PARTY_BLOCK.some((d) => url.hostname.includes(d)) || 
             url.pathname.endsWith('sw.js') ||
             url.pathname.endsWith('adsense-manager.js') ||
             url.pathname.endsWith('firebase-services.js'),
    (route) => route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        // Mock Firebase and services
        window.require = () => ({});
        window.firebase = {
          initializeApp: () => ({}),
          auth: () => ({
            onAuthStateChanged: () => {},
            currentUser: null
          }),
          messaging: () => ({
            getToken: () => Promise.resolve(),
            onMessage: () => {}
          }),
          analytics: () => ({
            logEvent: () => {}
          })
        };
        // Mock Performance Monitor
        class DAMPPerformanceMonitor {
          constructor() {}
          init() {}
          destroy() {}
        }
        window.DAMPPerformanceMonitor = DAMPPerformanceMonitor;
      `
    })
  );
  
  test.setTimeout(120000); // Double the default timeout  
  
  // Mock service worker registration and Firebase initialization
  await page.addInitScript(() => {
    if (typeof window !== 'undefined') {
      // Mock service worker
      window.navigator.serviceWorker = {
        register: () => Promise.resolve({ scope: '/' }),
        ready: Promise.resolve({ active: true })
      };

      // Mock Firebase
      window.require = () => ({});
      window.firebase = {
        initializeApp: () => ({}),
        auth: () => ({ 
          onAuthStateChanged: () => {}, 
          currentUser: null 
        }),
        messaging: () => ({
          getToken: () => Promise.resolve(),
          onMessage: () => {}
        }),
        analytics: () => ({
          logEvent: () => {}
        })
      };
      window.initializeAnalytics = () => {};
    }
  });

  // Helpful diagnostics in the report
  page.on('console', (msg) => {
    if (msg.type() === 'error') testInfo.attach('console-error', { body: msg.text(), contentType: 'text/plain' });
  });
  page.on('pageerror', (err) => {
    testInfo.attach('pageerror', { body: String(err?.stack || err), contentType: 'text/plain' });
  });
  page.on('response', (res) => {
    if (!res.ok()) {
      testInfo.attach('http-error', { body: `${res.status()} ${res.url()}`, contentType: 'text/plain' });
    }
  });
});

test.describe('Simple User Journey Test', () => {
  test('complete basic user journey', async ({ page }) => {
    // Start with homepage
    await test.step('Visit homepage and verify core elements', async () => {
      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
      await page.goto(`${baseUrl}/`, { 
        timeout: 60000, 
        waitUntil: 'networkidle',
        referer: 'playwright-test'
      });
      
      // Wait for critical resources to load
      await page.waitForFunction(() => {
        return document.readyState === 'complete' && 
               (!document.querySelector('.loading-indicator, .spinner') || 
                getComputedStyle(document.querySelector('.loading-indicator, .spinner')).display === 'none');
      }, { timeout: 30000 });

      // Check main heading
      const mainHeadingLocator = page.locator('h1, [role="heading"][aria-level="1"]').first();
      await expect(mainHeadingLocator).toBeVisible({ timeout: 30000 });
      
      // Verify navigation exists
      const nav = page.locator('nav');
      await expect(nav).toBeVisible({ timeout: 30000 });
    });

    console.log('Test completed successfully!');
  });
});