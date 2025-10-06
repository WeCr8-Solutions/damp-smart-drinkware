import { test, expect } from '@playwright/test';

test('homepage has title and links', async ({ page }) => {
  await page.goto('/');
  
  // Basic page verification
  await expect(page).toHaveTitle(/DAMP Smart Drinkware/);
  
  // Verify navigation links are present
  await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
  
  // Check for product card custom element
  await expect(page.locator('product-card')).toBeVisible();
});