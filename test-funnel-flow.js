import puppeteer from 'puppeteer';
import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51SEUgTEKvbimQFE20tNoUgGvSwSiNXC6L1BhEX69lZclAUcqjChvaYIN8xzbu46uWXEAZ12Yqp9H2UtnVAR48wDY00XYFKB1eW');

async function testProductionSite() {
  console.log('🚀 Starting production site test...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--start-maximized']
  });

  const page = await browser.newPage();

  // Add helper to skip animations
  await page.evaluateOnNewDocument(() => {
    window.skipAnimations = () => {
      const style = document.createElement('style');
      style.textContent = `
        * {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `;
      document.head.appendChild(style);
    };
    
    // Add keyboard shortcut for animation skip
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'k') {
        window.skipAnimations();
      }
    });
  });

  try {
    // 1. Visit homepage
    console.log('1️⃣ Visiting homepage...');
    await page.goto('https://www.dampdrink.com', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    // Wait for main content
    await page.waitForSelector('.product-grid', { timeout: 60000 });
    console.log('✅ Homepage loaded successfully');

    // Test navigation menu
    console.log('\nTesting navigation menu...');
    await page.evaluate(() => {
      const hamburger = document.querySelector('.hamburger-menu');
      if (hamburger) hamburger.click();
    });
    await page.waitForTimeout(1000); // Wait for menu animation
    console.log('✅ Navigation menu opened');

    // Test menu navigation
    console.log('\nTesting menu navigation...');
    const navigationLinks = [
      { selector: 'a[href="/products"]', name: 'Products' },
      { selector: 'a[href="/about"]', name: 'About' },
      { selector: 'a[href="/contact"]', name: 'Contact' }
    ];

    for (const link of navigationLinks) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        page.click(link.selector)
      ]);
      console.log(`✅ Navigated to ${link.name} page`);
      
      // Test animation skip with Ctrl+K
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyK');
      await page.keyboard.up('Control');
      
      await page.waitForTimeout(1000); // Brief pause to verify page
    }

    // Return to products page
    await page.goto('https://www.dampdrink.com/products', {
      waitUntil: 'networkidle0'
    });
    await page.waitForSelector('.product-grid');
    console.log('✅ Returned to products page');

    // Close browser
    await browser.close();
    console.log('\n✨ Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    // Take screenshot on failure
    await page.screenshot({
      path: 'error-screenshot.png',
      fullPage: true
    });
    await browser.close();
    process.exit(1);
  }
}

// Run the test
testProductionSite();
