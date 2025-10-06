const { test, expect } = require('@playwright/test');
const { PRODUCTS, SUBSCRIPTION_PLANS } = require('../../verify-cart-checkout-process');

test.describe('Full User Journey Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage
    await page.goto('/');
  });

  test('Complete user journey from discovery to checkout', async ({ page }) => {
    // 1. Homepage Navigation & Product Discovery
    await test.step('Homepage exploration', async () => {
      await expect(page).toHaveTitle(/DAMP Smart Drinkware/);
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('.hero-section')).toBeVisible();
    });

    // 2. Product Browsing
    await test.step('Browse products', async () => {
      await page.click('text=Shop');
      await expect(page).toHaveURL(/.*store/);
      
      // Verify all products are displayed
      for (const [id, product] of Object.entries(PRODUCTS)) {
        await expect(page.locator(`[data-product-id="${id}"]`)).toBeVisible();
        await expect(page.locator(`text=${product.name}`)).toBeVisible();
        await expect(page.locator(`text=$${(product.price / 100).toFixed(2)}`)).toBeVisible();
      }
    });

    // 3. Product Details Interaction
    await test.step('Product detail interaction', async () => {
      // Click on DAMP Handle product
      await page.click('text=DAMP Handle');
      await expect(page).toHaveURL(/.*damp-handle/);
      
      // Verify product details
      await expect(page.locator('.product-title')).toContainText('DAMP Handle');
      await expect(page.locator('.product-price')).toContainText('49.99');
      await expect(page.locator('.delivery-estimate')).toContainText('2025');
    });

    // 4. Add to Cart Interaction
    await test.step('Add to cart', async () => {
      await page.click('button:has-text("Add to Cart")');
      await expect(page.locator('.cart-notification')).toBeVisible();
      await expect(page.locator('.cart-count')).toContainText('1');
    });

    // 5. Cart Review
    await test.step('Cart review', async () => {
      await page.click('.cart-icon');
      await expect(page).toHaveURL(/.*cart/);
      
      // Verify cart contents
      await expect(page.locator('.cart-item')).toBeVisible();
      await expect(page.locator('.cart-total')).toContainText('49.99');
      
      // Test quantity adjustment
      await page.click('.quantity-increase');
      await expect(page.locator('.cart-total')).toContainText('99.98');
    });

    // 6. Checkout Process Initiation
    await test.step('Start checkout', async () => {
      await page.click('button:has-text("Proceed to Checkout")');
      
      // Verify redirect to Stripe checkout
      await expect(page).toHaveURL(/.*stripe.com/);
    });

    // 7. Mobile Responsiveness
    await test.step('Mobile responsiveness', async () => {
      // Test on mobile viewport
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');
      
      // Verify mobile navigation
      await expect(page.locator('.hamburger-menu')).toBeVisible();
      await page.click('.hamburger-menu');
      await expect(page.locator('nav.mobile-nav')).toBeVisible();
    });

    // 8. DAMP+ Subscription Flow
    await test.step('Subscription flow', async () => {
      await page.goto('/subscription');
      
      // Verify subscription plans
      for (const [id, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
        await expect(page.locator(`[data-plan-id="${id}"]`)).toBeVisible();
        await expect(page.locator(`text=${plan.name}`)).toBeVisible();
        await expect(page.locator(`text=$${(plan.price / 100).toFixed(2)}`)).toBeVisible();
      }
    });

    // 9. Account Features
    await test.step('Account features', async () => {
      // Login process
      await page.click('text=Login');
      await expect(page).toHaveURL(/.*login/);
      
      // Fill login form
      await page.fill('[name="email"]', 'test@example.com');
      await page.fill('[name="password"]', 'testpassword123');
      await page.click('button:has-text("Login")');
      
      // Verify account dashboard
      await expect(page.locator('.account-dashboard')).toBeVisible();
      await expect(page.locator('.order-history')).toBeVisible();
    });

    // 10. Error Handling
    await test.step('Error handling', async () => {
      // Test invalid coupon
      await page.goto('/cart');
      await page.fill('[name="coupon"]', 'INVALID');
      await page.click('button:has-text("Apply")');
      await expect(page.locator('.error-message')).toBeVisible();
      
      // Test out of stock handling
      await page.goto('/store');
      await expect(page.locator('.out-of-stock')).toBeVisible();
    });
  });

  // Additional user flows
  test('Pre-order specific flow', async ({ page }) => {
    await test.step('Pre-order process', async () => {
      await page.goto('/store');
      await page.click('text=DAMP Baby Bottle');
      
      // Verify pre-order elements
      await expect(page.locator('.pre-order-badge')).toBeVisible();
      await expect(page.locator('.estimated-delivery')).toContainText('2026');
      
      // Add to cart and verify pre-order messaging
      await page.click('button:has-text("Pre-Order Now")');
      await expect(page.locator('.pre-order-notice')).toBeVisible();
    });
  });

  test('Mobile app redirect flow', async ({ page }) => {
    await test.step('Mobile app detection', async () => {
      // Set mobile user agent
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
      });
      
      await page.goto('/');
      
      // Verify mobile app prompt
      await expect(page.locator('.app-download-prompt')).toBeVisible();
      await expect(page.locator('a[href*="app-store"]')).toBeVisible();
    });
  });
});