import { test, expect } from '@playwright/test';

test.describe('Debug Tests @debug', () => {
  test.beforeEach(async ({ page }) => {
    // Catch and log all console messages
    page.on('console', msg => {
      console.log(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Log network errors
    page.on('requestfailed', request => {
      console.log(`[Network Error] ${request.url()} - ${request.failure().errorText}`);
    });

    // Log navigation events
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) {
        console.log(`[Navigation] ${frame.url()}`);
      }
    });
  });

  test('Debug Service Worker', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check if service worker file exists
    const swResponse = await page.request.get('http://localhost:3000/sw.js').catch(() => null);
    console.log('Service Worker Response:', swResponse ? 'Found' : 'Not Found');

    // Check service worker registration
    const swRegistered = await page.evaluate(async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration ? true : false;
      } catch (e) {
        return `Error: ${e.message}`;
      }
    });
    console.log('Service Worker Registration:', swRegistered);
  });

  test('Debug Navigation Links', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Get all navigation links
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('nav a'), a => ({
        text: a.textContent,
        href: a.href,
        visible: a.offsetParent !== null
      }));
    });
    console.log('Navigation Links:', links);
  });

  test('Debug Reserve Now Flow', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Try to find the reserve now button
    const reserveButton = page.getByRole('link', { name: /reserve now/i });
    const isVisible = await reserveButton.isVisible().catch(() => false);
    console.log('Reserve Button Visible:', isVisible);

    if (isVisible) {
      // Get button details
      const buttonDetails = await reserveButton.evaluate(el => ({
        href: el.href,
        text: el.textContent,
        enabled: !el.disabled,
        classes: el.className
      }));
      console.log('Reserve Button Details:', buttonDetails);

      // Try to click it
      await reserveButton.click().catch(e => console.log('Click Error:', e.message));
      
      // Check where we landed
      console.log('Current URL:', page.url());
    }
  });

  test('Debug Form Elements', async ({ page }) => {
    await page.goto('http://localhost:3000/reserve');
    
    // Check form presence
    const form = page.locator('form');
    const formPresent = await form.isVisible().catch(() => false);
    console.log('Form Present:', formPresent);

    if (formPresent) {
      // List all form fields
      const fields = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('form input, form select, form textarea'), 
          el => ({
            type: el.type || el.tagName.toLowerCase(),
            name: el.name,
            id: el.id,
            required: el.required,
            visible: el.offsetParent !== null
          })
        );
      });
      console.log('Form Fields:', fields);
    }
  });
});