import { test, expect } from '@playwright/test';

// Purchase Flow Test Suite
test.describe('Purchase Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start at homepage using baseURL from config
    await page.goto('/');
    // Wait for the navigation menu to be loaded
    await page.waitForSelector('nav', { state: 'visible' });
  });

  test('Pre-sale funnel flow - direct purchase path', async ({ page }) => {
    // Navigate to pre-sale funnel
    await page.goto('/pages/pre-sale-funnel.html');
    await page.waitForLoadState('networkidle');

    // First check that the product card is visible
    const productCard = page.locator('.product-card.model-card').first();
    await expect(productCard).toBeVisible({ timeout: 10000 });

    // Find quantity buttons for DAMP Handle
    const plusButton = page.locator('.quantity-btn').filter({ hasText: '+' }).first();
    await expect(plusButton).toBeVisible({ timeout: 10000 });
    await plusButton.click({ clickCount: 2 }); // Increment quantity by 2

    // Add to cart
    const addButton = page.locator('.btn.btn-secondary').first();
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();

    // Check for checkout button and wait for it to be enabled
    const checkoutButton = page.locator('#checkout-button');
    await expect(checkoutButton).toBeEnabled({ timeout: 10000 });
    await checkoutButton.click();

    // Verify cart update
    const cartCount = page.locator('#cart-count');
    await expect(cartCount).toBeVisible();
    await expect(cartCount).toHaveText('1');

    // Navigate to cart
    await page.goto('/pages/cart.html');
    await page.waitForLoadState('networkidle');

    // Proceed to checkout
    const checkoutButton2 = page.locator('#proceed-to-checkout');
    await expect(checkoutButton2).toBeVisible({ timeout: 10000 });
    await checkoutButton2.click();

    // Verify redirect to Stripe checkout
    await page.waitForURL(/.*stripe-checkout.html/);
  });

  test('Product catalog flow - browse and purchase', async ({ page }) => {
    // Navigate to products page
    await page.goto('/pages/products.html');
    await page.waitForLoadState('networkidle');

    // Open mobile menu if it's hidden (mobile view)
    const menuButton = page.locator('button.mobile-menu-toggle');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      // Wait for menu animation
      await page.waitForTimeout(500);
    }

    // Click on main product
    const productCard = page.locator('.product-card.model-card').first();
    await expect(productCard).toBeVisible({ timeout: 10000 });
    await productCard.click();

    await page.waitForLoadState('networkidle');

    // Increment quantity first
    const plusButton = page.locator('.quantity-btn').filter({ hasText: '+' }).first();
    await expect(plusButton).toBeVisible({ timeout: 10000 });
    await plusButton.click();

    // Add to cart
    const addButton = page.locator('#checkout-button');
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();

    // Check for cart update
    const cartCount = page.locator('#cart-count');
    await expect(cartCount).toBeVisible();
    await expect(cartCount).toHaveText('1');

    // Go to cart
    await page.goto('/pages/cart.html');
    await page.waitForLoadState('networkidle');
  });

  test('Stanley variant flow - specific product purchase', async ({ page }) => {
    // Direct to Stanley variant page
    await page.goto('/pages/damp-handle-v1.0-stanley.html');
    await page.waitForLoadState('networkidle');

    // Check Stanley-specific options
    const modelSelect = page.locator('select#stanley-model');
    if (await modelSelect.isVisible()) {
      await modelSelect.selectOption('standard');
    }

    // Increment quantity first
    const plusButton = page.locator('.quantity-btn').filter({ hasText: '+' }).first();
    await expect(plusButton).toBeVisible({ timeout: 10000 });
    await plusButton.click();

    // Add to cart using Pre-Order for Stanley model
    const addButton = page.locator('.btn.btn-primary').first();
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();

    // Check for cart update
    const cartCount = page.locator('#cart-count');
    await expect(cartCount).toBeVisible();
    await expect(cartCount).toHaveText('1');

    // Navigate to cart
    await page.goto('/pages/cart.html');
    await page.waitForLoadState('networkidle');
  });

  test('Cart functionality', async ({ page }) => {
    // Go to a product page
    await page.goto('/pages/damp-handle-v1.0.html');
    await page.waitForLoadState('networkidle');
    
    // Increment quantity first
    const plusButton = page.locator('.quantity-btn').filter({ hasText: '+' }).first();
    await expect(plusButton).toBeVisible({ timeout: 10000 });
    await plusButton.click();

    // Add to cart
    const addButton = page.locator('.btn.btn-secondary').first();
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();
    
    // Wait for cart count update
    const cartCount = page.locator('#cart-count');
    await expect(cartCount).toBeVisible();
    await expect(cartCount).toHaveText('1');
    
    // Open cart
    await page.goto('/pages/cart.html');
    await page.waitForLoadState('networkidle');
    
    // Test quantity adjustment using + button in cart
    const cartPlusButton = page.locator('.quantity-controls button').filter({ hasText: '+' });
    await expect(cartPlusButton).toBeVisible({ timeout: 10000 });
    await cartPlusButton.click();
    
    // Verify quantity updated
    const quantity = page.locator('.quantity');
    await expect(quantity).toHaveText('2');
    
    // Check order summary update
    const orderTotal = page.locator('#order-summary');
    await expect(orderTotal).toBeVisible();
    
    // Remove item
    const removeButton = page.locator('button').filter({ hasText: /^Remove$/ });
    await expect(removeButton).toBeVisible();
    await removeButton.click();
    
    // Verify cart is empty
    const emptyCart = page.locator('#empty-cart');
    await expect(emptyCart).toBeVisible({ timeout: 10000 });
  });
});