/* global console, process, setTimeout */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class TestLogger {
    constructor() {
        this.logDir = path.join(__dirname, '..', '..', 'logs', 'e2e-tests');
        this.setupLogDirectory();
        this.currentTestLog = [];
        this.startTime = new Date();
        this.filename = `e2e-test-${this.startTime.toISOString().replace(/[:.]/g, '-')}.log`;
    }

    setupLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${type}] ${message}`;
        this.currentTestLog.push(logEntry);
        console.log(logEntry);
    }

    saveLog() {
        const logPath = path.join(this.logDir, this.filename);
        fs.writeFileSync(logPath, this.currentTestLog.join('\n'));
        console.log(`Test log saved to: ${logPath}`);
    }
}

async function runTests() {
    const logger = new TestLogger();
    let browser = null;
    let error = null;

    try {
        logger.log('Starting E2E test suite');
        
        // Launch browser
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Setup page event listeners
        page.on('console', msg => logger.log(`Console: ${msg.text()}`, 'BROWSER'));
        page.on('pageerror', err => logger.log(`Error: ${err.toString()}`, 'ERROR'));
        page.on('requestfailed', request => logger.log(`Failed request: ${request.url()}`, 'NETWORK'));

        // Test 1: Homepage
        logger.log('Testing homepage');
        await page.goto('https://www.dampdrink.com');
        const title = await page.title();
        logger.log(`Page title: ${title}`);

        // Test 2: Navigation
        logger.log('Testing navigation');
        const navLinks = await page.$$('nav a');
        logger.log(`Found ${navLinks.length} navigation links`);

        // Test 3: Product Grid
        logger.log('Testing product grid');
        const products = await page.$$('.product-card');
        logger.log(`Found ${products.length} products`);

        // Import and start test server
        logger.log('Starting test server');
        const { startServer } = await import('./server.js');
        const server = await startServer();
        
        // Test 4: Cart Functionality
        logger.log('Testing cart functionality');
        
        // Navigate to the DAMP Handle product page through local server
        logger.log('Navigating to DAMP Handle product page');
        await page.goto('http://localhost:3030/pages/damp-handle-v1.0.html', {
            waitUntil: 'networkidle0'
        });
        
        // Wait for the product cards and their buttons to be visible
        logger.log('Waiting for product cards to load...');
        await page.waitForSelector('.model-card', { visible: true, timeout: 10000 });
        
        logger.log('Page loaded and product cards visible');
        
        // Look for action buttons within each model card
        const validButtons = [];
        const modelCards = await page.$$('.model-card');
        
        for (const card of modelCards) {
            const buttonInfos = await card.$$eval('button:not(.quantity-btn)', buttons => {
                return buttons.map(btn => ({
                    text: btn.innerText.toLowerCase().trim(),
                    onclick: btn.getAttribute('onclick'),
                    container: btn.closest('.model-card').querySelector('.product-name')?.innerText || 'Unknown'
                }));
            });

            for (const btnInfo of buttonInfos) {
                if (btnInfo.onclick?.includes('handleAddToCart') || btnInfo.onclick?.includes('handleCheckout')) {
                    const button = await card.$(`button:not(.quantity-btn)`);
                    validButtons.push({
                        button,
                        text: btnInfo.text,
                        isPreOrder: btnInfo.onclick.includes('handleCheckout'),
                        container: btnInfo.container
                    });
                }
            }
        }
        
        logger.log(`Found ${validButtons.length} action buttons:`, 
            validButtons.map(b => `${b.text} (${b.container})`).join(', '));
        
        if (validButtons.length === 0) {
            throw new Error('No "Add to Cart" or "Pre-order" buttons found on the page');
        }
        
        logger.log(`Found ${validButtons.length} action buttons:`, validButtons.map(b => b.text).join(', '));
        
        // Prefer Add to Cart button if available, otherwise use Pre-order
        const actionButton = validButtons.find(b => !b.isPreOrder)?.button || validButtons[0].button;
        const buttonType = validButtons.find(b => !b.isPreOrder) ? 'Add to Cart' : 'Pre-order';
        logger.log(`Selected universal variant "${buttonType}" button`);

        // Click the button
        logger.log(`Clicking ${buttonType.toLowerCase()} button`);
        await actionButton.click();
        
        // Wait a bit for any cart update animations
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Try to find cart indicator (item count, badge, etc)
        const cartIndicatorSelectors = [
            '.cart-count',
            '#cart-count',
            '.cart-badge',
            '.cart-items-count',
            '[class*="cartCount"]'
        ];

        let cartIndicator = null;
        for (const selector of cartIndicatorSelectors) {
            try {
                cartIndicator = await page.waitForSelector(selector, { timeout: 5000 });
                if (cartIndicator) {
                    logger.log(`Found cart indicator with selector: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (!cartIndicator) {
            logger.log('Could not find cart indicator', 'ERROR');
        } else {
            const cartCount = await cartIndicator.evaluate(el => el.textContent);
            logger.log(`Cart count after adding item: ${cartCount}`);
        }

        // Test 5: Mobile Responsiveness
        logger.log('Testing mobile responsiveness');
        await page.setViewport({ width: 375, height: 812 });
        const mobileMenu = await page.$('.hamburger-menu');
        logger.log(`Mobile menu ${mobileMenu ? 'found' : 'not found'}`);

        logger.log('All tests completed successfully');

    } catch (e) {
        error = e;
        logger.log(`Test failed: ${e.message}`, 'ERROR');
        logger.log(e.stack, 'STACK');

        // Take error screenshot
        if (browser) {
            const pages = await browser.pages();
            if (pages.length > 0) {
                const screenshotPath = path.join(logger.logDir, `error-${Date.now()}.png`);
                await pages[0].screenshot({ path: screenshotPath, fullPage: true });
                logger.log(`Error screenshot saved to: ${screenshotPath}`);
            }
        }
    } finally {
        if (browser) {
            await browser.close();
        }
        if (server) {
            server.close();
            logger.log('Test server stopped');
        }
        logger.log('Test suite finished');
        logger.saveLog();
    }

    if (error) {
        throw error;
    }
}

runTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
});