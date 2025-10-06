import { test, expect } from '@playwright/test';
import './test-utils/custom-matchers';

const THIRD_PARTY_BLOCK = [
  'googletagmanager.com',
  'google-analytics.com',
  'doubleclick.net',
  'facebook.net',
  'static.cloudflareinsights.com',
  'hotjar.com',
  'fullstory.com',
  'segment.com',
];

test.describe.configure({ mode: 'parallel' });

test.beforeEach(async ({ page }, testInfo) => {
  // Block noisy/slow third-party calls to reduce flakiness
  await page.route(
    (url) => THIRD_PARTY_BLOCK.some((d) => url.hostname.includes(d)),
    (route) => route.abort()
  );

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

test.describe('DAMP Smart Drinkware – Full User Journey', () => {
  test('complete user journey (landing → product → cart → checkout)', async ({ page }) => {
    // 1) Homepage
    await test.step('Visit homepage', async () => {
      await page.goto('/', { waitUntil: 'networkidle' });
      // Prefer accessible roles when possible, fallback to class hooks from your original test
      await expect(page.getByRole('heading', { name: /damp smart drinkware/i })).toBeVisible({ timeout: 15_000 });
      await expect(page.locator('.product-grid')).toBeVisible();
      await expect(page.locator('nav.main-navigation')).toBeVisible();
    });

    // 2) About
    await test.step('Navigate to About page', async () => {
      await Promise.all([
        page.waitForLoadState('networkidle'),
        page.getByRole('navigation').getByRole('link', { name: /about/i }).click(),
      ]);
      await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();
      await expect(page.locator('.about-content')).toBeVisible();
    });

    // 3) Products
    await test.step('Navigate to Products page', async () => {
      await Promise.all([
        page.waitForLoadState('networkidle'),
        page.getByRole('navigation').getByRole('link', { name: /products/i }).click(),
      ]);
      await expect(page.locator('.product-grid')).toBeVisible();
      // Fix: Use .count() and expect().toBeGreaterThan(0)
      const productCount = await page.locator('.product-card').count();
      expect(productCount).toBeGreaterThan(0);
    });

    // 4) Filter/Sort (best-effort)
    await test.step('Apply optional sorting', async () => {
      const filter = page.locator('.filter-options select, [data-testid="sort-select"]');
      if (await filter.first().isVisible().catch(() => false)) {
        await filter.first().selectOption({ label: 'Price: Low to High' }).catch(() => {});
        await page.waitForTimeout(600); // allow re-render
      }
    });

    // 5) Open product
    let productTitle = '';
    await test.step('Open first product', async () => {
      const firstProduct = page.locator('.product-card').first();
      await expect(firstProduct).toBeVisible();
      productTitle = (await firstProduct.locator('h3, h2, [data-testid="product-title"]').first().textContent() || '').trim();
      await firstProduct.click();
      await expect(page.locator('.product-details')).toBeVisible({ timeout: 15_000 });
      if (productTitle) await expect(page.getByText(productTitle, { exact: false })).toBeVisible();
      await expect(page.locator('.product-price')).toBeVisible();
      await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
    });

    // 6) Add to cart
    await test.step('Add product to cart', async () => {
      const cartCount = page.locator('.cart-count');
      const before = (await cartCount.textContent())?.trim();
      const beforeNum = Number.parseInt(before || '0', 10) || 0;

      await page.getByRole('button', { name: /add to cart/i }).click();

      await expect.poll(async () => {
        const txt = (await cartCount.textContent())?.trim();
        const n = Number.parseInt(txt || '0', 10) || 0;
        return n;
      }, { timeout: 5_000, intervals: [200, 400, 800, 1200, 2400] }).toBe(beforeNum + 1);
    });

    // 7) Open cart
    await test.step('Open cart drawer', async () => {
      await page.locator('.cart-icon, [data-testid="cart-button"]').click();
      await expect(page.locator('.cart-drawer.is-active, [data-testid="cart-drawer"].is-active')).toBeVisible();
      if (productTitle) await expect(page.getByText(productTitle, { exact: false })).toBeVisible();
      await expect(page.locator('.cart-item-price')).toBeVisible();
      await expect(page.locator('.cart-total')).toBeVisible();
    });

    // 8) Update quantity
    await test.step('Increase quantity', async () => {
      const qtyInput = page.locator('.quantity-input, [name="quantity"]');
      const incBtn = page.locator('.quantity-increase, [data-testid="qty-increase"], button[aria-label*="increase"]');
      await incBtn.click();
      await expect.poll(async () => Number(await qtyInput.inputValue().catch(() => '0'))).toBe(2);
    });

    // 9) Checkout
    await test.step('Proceed to checkout', async () => {
      await Promise.all([
        page.waitForLoadState('networkidle'),
        page.locator('button.proceed-to-checkout, [data-testid="proceed-to-checkout"], a[href*="checkout"]').click(),
      ]);
      await expect(page.getByRole('heading', { name: /checkout/i })).toBeVisible();
      await expect(page.locator('form.checkout-form')).toBeVisible();
    });

    // 10) Fill form (no real purchase)
    await test.step('Fill checkout form (dummy)', async () => {
      const fillIfVisible = async (sel: string, value: string) => {
        const loc = page.locator(sel);
        if (await loc.first().isVisible().catch(() => false)) await loc.fill(value);
      };
      await fillIfVisible('#email,[name="email"]', 'test@example.com');
      await fillIfVisible('#firstName,[name="firstName"]', 'Test');
      await fillIfVisible('#lastName,[name="lastName"]', 'User');
      await fillIfVisible('#address,[name="address"]', '123 Test St');
      await fillIfVisible('#city,[name="city"]', 'Test City');
      await fillIfVisible('#state,[name="state"]', 'CA');
      await fillIfVisible('#zip,[name="zip"]', '12345');
    });

    // 11) Trigger payment flow (assert Stripe iframe appears)
    await test.step('Open payment iframe (Stripe)', async () => {
      const stripeFramePromise = page.waitForSelector('iframe[name*="stripe" i], iframe[src*="stripe" i]');
      await page.locator('button.place-order, [data-testid="place-order"]').click({ trial: true }).catch(() => {});
      const stripeFrame = await stripeFramePromise;
      await expect(stripeFrame).toBeTruthy();
    });
  });
});

test.describe('Mobile responsiveness', () => {
  test('mobile nav & cart drawer fits viewport', async ({ page }) => {
    // If running under a desktop project, set a mobile-ish viewport.
    const isMobileProject = !!(test.info().project.use as any).isMobile;
    if (!isMobileProject) await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/', { waitUntil: 'networkidle' });

    const hamburger = page.locator('.hamburger-menu, [data-testid="hamburger"]');
    await expect(hamburger).toBeVisible();
    await hamburger.click();

    const mobileMenu = page.locator('.mobile-menu.is-active, [data-testid="mobile-menu"].is-active');
    await expect(mobileMenu).toBeVisible();
    await expect(mobileMenu.getByRole('link', { name: /products/i })).toBeVisible();

    // Grid fits viewport
    const productWidth = await page.evaluate(() => {
      const el = document.querySelector('.product-card') as HTMLElement | null;
      return el ? el.getBoundingClientRect().width : 0;
    });
    expect(productWidth).toBeGreaterThan(0);
    expect(productWidth).toBeLessThanOrEqual(375);

    // Cart drawer fits viewport
    await page.locator('.cart-icon, [data-testid="cart-button"]').click();
    const drawerWidth = await page.evaluate(() => {
      const el = document.querySelector('.cart-drawer') as HTMLElement | null;
      return el ? el.getBoundingClientRect().width : 0;
    });
    expect(drawerWidth).toBeGreaterThan(0);
    expect(drawerWidth).toBeLessThanOrEqual(375);
  });
});

test.describe('Error states & validation', () => {
  test('invalid product route shows not-found UX', async ({ page }) => {
    await page.goto('/products/nonexistent', { waitUntil: 'networkidle' });
    // Be flexible: various "not found" copy
    await expect(
      page.getByText(/(product not found|not found|404)/i, { exact: false })
    ).toBeVisible();
  });

  test('invalid cart quantity is rejected', async ({ page }) => {
    await page.goto('/products/smart-cup', { waitUntil: 'networkidle' });
    const qty = page.locator('.quantity-input, [name="quantity"]');
    await qty.fill('999999');
    await page.getByRole('button', { name: /add to cart/i }).click();
    await expect(page.getByText(/invalid quantity|max|too many/i)).toBeVisible();
  });

  test('checkout requires required fields', async ({ page }) => {
    await page.goto('/checkout', { waitUntil: 'networkidle' });
    await page.locator('button.place-order, [data-testid="place-order"]').click();
    await expect(page.locator('.error-message, [role="alert"]')).toBeVisible();
  });
});

