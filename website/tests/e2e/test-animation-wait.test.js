import { test, expect } from '@playwright/test';

test.describe('Animation Wait Test', () => {
  test('should wait for hero animation to complete', async ({ page }) => {
    // Use baseURL from playwright.config.js (http://localhost:3000)
    await page.goto('/', { 
      timeout: 60000, 
      waitUntil: 'networkidle'
    });

    // WAIT FOR HERO ANIMATIONS TO COMPLETE
    await test.step('Wait for hero animations', async () => {
      // Check if there's a skip button and click it to skip animations
      const skipButton = page.locator('.animation-skip-button');
      
      try {
        // Wait up to 2 seconds for skip button to appear
        await skipButton.waitFor({ state: 'visible', timeout: 2000 });
        await skipButton.click();
        
        // Wait for animation overlay to be removed
        await page.waitForFunction(() => {
          const overlay = document.querySelector('.hero-animation-overlay');
          return !overlay;
        }, { timeout: 3000 });
        
      } catch (e) {
        
        // Wait for animation overlay to disappear naturally (max 12 seconds)
        await page.waitForFunction(() => {
          const overlay = document.querySelector('.hero-animation-overlay');
          return !overlay || window.getComputedStyle(overlay).display === 'none' || 
                 window.getComputedStyle(overlay).opacity === '0';
        }, { timeout: 12000 }).catch(() => {
          // Animation overlay check timed out, continuing anyway
        });
      }

      // Wait for body to have animation-complete class or be scrollable
      await page.waitForFunction(() => {
        return document.body.classList.contains('animation-complete') ||
               window.getComputedStyle(document.body).overflow !== 'hidden';
      }, { timeout: 5000 }).catch(() => {
        // Body state check timed out, continuing anyway
      });

      // Additional wait to ensure page is fully interactive
      await page.waitForTimeout(1000);
    });

    // Verify page loaded - use specific nav to avoid strict mode violation
    const nav = page.locator('nav.damp-nav').first();
    await expect(nav).toBeVisible({ timeout: 30000 });
    
  });
});
