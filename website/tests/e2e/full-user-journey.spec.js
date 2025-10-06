/**
 * End-to-end test for DAMP Smart Drinkware website
 * Tests complete user journey from landing to checkout
 */

import puppeteer from 'puppeteer';
import { jest, describe, beforeAll, beforeEach, afterAll, afterEach, test, expect } from '@jest/globals';
import path from 'path';
import fs from 'fs';
import logger from '../utils/test-logger.js';

// Custom expect matchers for Puppeteer
expect.extend({
    async toMatch(page, text) {
        try {
            await page.evaluate((expectedText) => {
                return document.body.textContent.includes(expectedText);
            }, text);
            return { pass: true };
        } catch (error) {
            return {
                pass: false,
                message: () => `Expected page to contain text "${text}"`,
            };
        }
    },
    async toMatchElement(page, selector) {
        try {
            await page.waitForSelector(selector);
            return { pass: true };
        } catch (error) {
            return {
                pass: false,
                message: () => `Expected to find element "${selector}"`,
            };
        }
    }
});

// Helper function to take screenshots on failure
async function saveFailureScreenshot(page, testName) {
    const screenshotsDir = path.join(process.cwd(), 'logs', 'e2e-tests', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(screenshotsDir, `failure-${testName}-${timestamp}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    logger.logScreenshot(screenshotPath);
    return screenshotPath;
}

describe('Full User Journey', () => {
    let browser;
    let page;
    let testFailed;

    // Increase timeout for full E2E test
    jest.setTimeout(60000);

    beforeAll(async () => {
        logger.log('Starting E2E test suite');
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        page = await browser.newPage();

        // Setup logging for various browser events
        page.on('console', message => logger.logConsole(message.text()));
        page.on('pageerror', error => logger.logError(error));
        page.on('requestfailed', request => logger.log(`Failed request: ${request.url()}`, 'NETWORK_ERROR'));
        page.on('response', response => {
            if (!response.ok()) {
                logger.log(`Failed response: ${response.url()} (${response.status()})`, 'NETWORK_ERROR');
            }
        });

        // Track navigation events
        page.on('framenavigated', frame => {
            if (frame === page.mainFrame()) {
                logger.logNavigation(frame.url());
            }
        });
    });

    afterAll(async () => {
        logger.log('Ending E2E test suite');
        await browser.close();
        logger.saveLog();
    });

    afterEach(async () => {
        if (testFailed) {
            const testName = expect.getState().currentTestName;
            await saveFailureScreenshot(page, testName);
            logger.log(`Test failed: ${testName}`, 'FAILURE');
        }
    });

    beforeEach(() => {
        testFailed = false;
    });

    test('complete user journey', async () => {
        // 1. Visit Homepage
        await page.goto('https://www.dampdrink.com', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Verify homepage elements
        await expect(page).toMatch('DAMP Smart Drinkware');
        await expect(page).toMatchElement('.product-grid');
        await expect(page).toMatchElement('nav.main-navigation');

        // 2. Navigate to About Page
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click('nav a[href*="about"]')
        ]);

        // Verify about page content
        await expect(page).toMatch('About Us');
        await expect(page).toMatchElement('.about-content');

        // 3. Navigate to Products Page
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click('nav a[href*="products"]')
        ]);

        // Verify products page
        await expect(page).toMatchElement('.product-grid');
        const products = await page.$$('.product-card');
        expect(products.length).toBeGreaterThan(0);

        // 4. Test Product Filtering/Sorting (if available)
        if (await page.$('.filter-options')) {
            await page.click('.filter-options select');
            await page.select('.filter-options select', 'price-low-to-high');
            await page.waitForTimeout(1000); // Wait for sort to apply
        }

        // 5. Select a Product
        const firstProduct = await page.$('.product-card');
        const productTitle = await firstProduct.$eval('h3', el => el.textContent);
        await firstProduct.click();
        await page.waitForSelector('.product-details');

        // Verify product details page
        await expect(page).toMatch(productTitle);
        await expect(page).toMatchElement('.product-price');
        await expect(page).toMatchElement('button.add-to-cart');

        // 6. Add to Cart
        const cartCountBefore = await page.$eval('.cart-count', el => parseInt(el.textContent));
        await page.click('button.add-to-cart');
        await page.waitForTimeout(1000);
        const cartCountAfter = await page.$eval('.cart-count', el => parseInt(el.textContent));
        expect(cartCountAfter).toBe(cartCountBefore + 1);

        // 7. Open Cart
        await page.click('.cart-icon');
        await page.waitForSelector('.cart-drawer.is-active');

        // Verify cart contents
        await expect(page).toMatch(productTitle);
        await expect(page).toMatchElement('.cart-item-price');
        await expect(page).toMatchElement('.cart-total');

        // 8. Update Cart Quantity
        await page.click('.quantity-increase');
        await page.waitForTimeout(500);
        const quantity = await page.$eval('.quantity-input', el => parseInt(el.value));
        expect(quantity).toBe(2);

        // 9. Proceed to Checkout
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click('button.proceed-to-checkout')
        ]);

        // Verify on checkout page
        await expect(page).toMatch('Checkout');
        await expect(page).toMatchElement('form.checkout-form');

        // 10. Fill Checkout Form
        await page.type('#email', 'test@example.com');
        await page.type('#firstName', 'Test');
        await page.type('#lastName', 'User');
        await page.type('#address', '123 Test St');
        await page.type('#city', 'Test City');
        await page.type('#state', 'CA');
        await page.type('#zip', '12345');

        // 11. Submit Order (Stop before actual payment)
        const stripeIframePromise = page.waitForSelector('iframe[name^="__privateStripeFrame"]');
        await page.click('button.place-order');
        
        // Verify Stripe iframe appears
        const stripeIframe = await stripeIframePromise;
        expect(stripeIframe).toBeTruthy();
    });

    test('mobile responsiveness', async () => {
        // Test mobile viewport
        await page.setViewport({ width: 375, height: 812 }); // iPhone X dimensions

        // 1. Visit Homepage
        await page.goto('https://www.dampdrink.com', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Verify mobile menu
        await expect(page).toMatchElement('.hamburger-menu');
        await page.click('.hamburger-menu');
        await page.waitForSelector('.mobile-menu.is-active');

        // Test mobile navigation
        await expect(page).toMatchElement('.mobile-menu a[href*="products"]');

        // Verify product grid adjusts
        const productWidth = await page.evaluate(() => {
            const el = document.querySelector('.product-card');
            return el.getBoundingClientRect().width;
        });
        expect(productWidth).toBeLessThanOrEqual(375);

        // Test mobile cart interaction
        await page.click('.cart-icon');
        await page.waitForSelector('.cart-drawer.is-active');
        expect(await page.evaluate(() => {
            const el = document.querySelector('.cart-drawer');
            return el.getBoundingClientRect().width;
        })).toBeLessThanOrEqual(375);
    });

    test('error handling', async () => {
        // 1. Test invalid product URL
        await page.goto('https://www.dampdrink.com/products/nonexistent', {
            waitUntil: 'networkidle0'
        });
        await expect(page).toMatch('Product not found');

        // 2. Test cart with invalid quantity
        await page.goto('https://www.dampdrink.com/products/smart-cup');
        await page.type('.quantity-input', '999999');
        await page.click('button.add-to-cart');
        await expect(page).toMatch('Invalid quantity');

        // 3. Test checkout with invalid data
        await page.goto('https://www.dampdrink.com/checkout');
        await page.click('button.place-order');
        await expect(page).toMatchElement('.error-message');
    });
});