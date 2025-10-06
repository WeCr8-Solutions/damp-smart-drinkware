const { test, expect } = require('@playwright/test');

test('completes purchase through pre-sale funnel', async ({ page }) => {
  // Start from homepage
  await page.goto('/');
  
  // Navigate to pre-sale funnel
  await page.click('a[href="/pages/pre-sale-funnel.html"]');
  await expect(page).toHaveURL('/pages/pre-sale-funnel.html');
  
  // Verify pre-sale content and proceed
  await expect(page.locator('h1')).toContainText('Pre-Sale');
  await page.click('button#reserve-now');
  
  // Add to cart and verify
  await page.click('button#add-to-cart');
  await expect(page.locator('#cart-count')).toHaveText('1');
  
  // Complete checkout flow
  await page.click('a[href="/pages/cart.html"]');
  await expect(page.locator('.cart-item')).toBeVisible();
  await page.click('button#checkout');
});

test('completes purchase through product catalog', async ({ page }) => {
  // Start from homepage
  await page.goto('/');
  
  // Navigate through product catalog
  await page.click('a[href="/pages/products.html"]');
  await page.click('a[href="/pages/damp-handle-v1.0.html"]');
  
  // Verify product and add to cart
  await expect(page.locator('h1')).toContainText('Damp Handle');
  await page.click('button#add-to-cart');
  
  // Complete checkout flow
  await page.click('a[href="/pages/cart.html"]');
  await expect(page.locator('.cart-item')).toBeVisible();
  await page.click('button#checkout');
});

test('completes purchase of Stanley variant', async ({ page }) => {
  // Start from homepage
  await page.goto('/');
  
  // Go to Stanley variant page
  await page.goto('/pages/damp-handle-v1.0-stanley.html');
  await expect(page.locator('h1')).toContainText('Stanley');
  
  // Configure product if options exist
  const modelSelector = page.locator('select#stanley-model');
  if (await modelSelector.isVisible()) {
    await modelSelector.selectOption('standard');
  }
  
  // Add to cart and verify
  await page.click('button#add-to-cart');
  await expect(page.locator('#cart-count')).toHaveText('1');
  
  // Complete checkout flow
  await page.click('a[href="/pages/cart.html"]');
  await expect(page.locator('.cart-item')).toContainText('Stanley');
  await page.click('button#checkout');
});