const { test, expect } = require('@playwright/test');

describe('DAMP Smart Drinkware Purchase Flow', () => {
  // Pre-sale funnel flow (highest priority path)
  test('should complete purchase through pre-sale funnel', async ({ page }) => {
    // Start from homepage
    await page.goto('https://dampdrink.com/');
    
    // Navigate to pre-sale funnel
    await page.click('a[href="/pages/pre-sale-funnel.html"]');
    await expect(page).toHaveURL('/pages/pre-sale-funnel.html');
    
    // Verify pre-sale content is loaded
    await expect(page.locator('h1')).toContainText('Pre-Sale');
    
    // Click reserve now button
    await page.click('button#reserve-now');
    await expect(page).toHaveURL('/pages/pre-order.html');
    
    // Add product to cart
    await page.click('button#add-to-cart');
    await expect(page.locator('#cart-count')).toHaveText('1');
    
    // Navigate to cart
    await page.click('a[href="/pages/cart.html"]');
    await expect(page).toHaveURL('/pages/cart.html');
    
    // Verify cart contents
    await expect(page.locator('.cart-item')).toBeVisible();
    
    // Proceed to checkout
    await page.click('button#checkout');
    await expect(page).toHaveURL('/pages/stripe-checkout.html');
  });

  // Product catalog flow
  test('should complete purchase through product catalog', async ({ page }) => {
    // Start from homepage
    await page.goto('https://dampdrink.com/');
    
    // Navigate to products page
    await page.click('a[href="/pages/products.html"]');
    await expect(page).toHaveURL('/pages/products.html');
    
    // Select main product (Damp Handle v1.0)
    await page.click('a[href="/pages/damp-handle-v1.0.html"]');
    await expect(page).toHaveURL('/pages/damp-handle-v1.0.html');
    
    // Verify product details
    await expect(page.locator('h1')).toContainText('Damp Handle v1.0');
    
    // Add to cart
    await page.click('button#add-to-cart');
    await expect(page.locator('#cart-count')).toHaveText('1');
    
    // Navigate to cart
    await page.click('a[href="/pages/cart.html"]');
    await expect(page).toHaveURL('/pages/cart.html');
    
    // Proceed to checkout
    await page.click('button#checkout');
    await expect(page).toHaveURL('/pages/stripe-checkout.html');
  });

  // Stanley variant purchase flow
  test('should complete purchase of Stanley variant', async ({ page }) => {
    // Start from homepage
    await page.goto('https://dampdrink.com/');
    
    // Navigate directly to Stanley variant
    await page.goto('/pages/damp-handle-v1.0-stanley.html');
    
    // Verify Stanley-specific content
    await expect(page.locator('h1')).toContainText('Stanley');
    
    // Select variant options if available
    await page.selectOption('select#stanley-model', 'standard');
    
    // Add to cart
    await page.click('button#add-to-cart');
    await expect(page.locator('#cart-count')).toHaveText('1');
    
    // Navigate to cart
    await page.click('a[href="/pages/cart.html"]');
    await expect(page).toHaveURL('/pages/cart.html');
    
    // Verify Stanley variant in cart
    await expect(page.locator('.cart-item')).toContainText('Stanley');
    
    // Proceed to checkout
    await page.click('button#checkout');
    await expect(page).toHaveURL('/pages/stripe-checkout.html');
  });
});