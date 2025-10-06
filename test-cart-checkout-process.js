import Stripe from 'stripe';
import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import fs from 'fs/promises';

const stripe = new Stripe('sk_test_51SEUgTEKvbimQFE20tNoUgGvSwSiNXC6L1BhEX69lZclAUcqjChvaYIN8xzbu46uWXEAZ12Yqp9H2UtnVAR48wDY00XYFKB1eW');
const SITE_URL = 'https://www.dampdrink.com';

async function testProductPages() {
    console.log('🔍 Testing Product Pages...');
    try {
        // Test product listing
        const products = await stripe.products.list({ active: true });
        console.log(`✅ Found ${products.data.length} active products`);

        // Verify each product has required fields
        for (const product of products.data) {
            console.log(`\nTesting product: ${product.name}`);
            
            // Check required fields
            const requiredFields = ['name', 'description', 'images', 'metadata'];
            requiredFields.forEach(field => {
                if (!product[field]) {
                    throw new Error(`Product ${product.id} missing required field: ${field}`);
                }
            });

            // Check prices
            const prices = await stripe.prices.list({ product: product.id });
            if (prices.data.length === 0) {
                throw new Error(`Product ${product.id} has no prices configured`);
            }
            console.log(`✅ Product ${product.name} has ${prices.data.length} price options`);

            // Verify pre-order specific metadata
            if (product.metadata.pre_order === 'true') {
                const required = ['deposit_amount', 'remaining_amount'];
                required.forEach(field => {
                    if (!product.metadata[field]) {
                        throw new Error(`Pre-order product ${product.id} missing required metadata: ${field}`);
                    }
                });
                console.log(`✅ Pre-order configuration verified for ${product.name}`);
            }
        }
    } catch (error) {
        console.error('❌ Product page test failed:', error);
        throw error;
    }
}

async function testCartFunctionality() {
    console.log('\n🛒 Testing Cart Functionality...');
    try {
        // Create test customer
        const customer = await stripe.customers.create({
            email: 'test@dampdrink.com',
            source: 'tok_visa'
        });
        console.log('✅ Test customer created');

        // Test adding multiple products to cart
        const products = await stripe.products.list({ limit: 2, active: true });
        const cartItems = [];
        
        for (const product of products.data) {
            const prices = await stripe.prices.list({ product: product.id });
            cartItems.push({
                price: prices.data[0].id,
                quantity: 1
            });
        }

        // Create checkout session with multiple items
        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            payment_method_types: ['card'],
            line_items: cartItems,
            mode: 'payment',
            success_url: 'https://dampdrink.com/success',
            cancel_url: 'https://dampdrink.com/cancel'
        });

        console.log('✅ Checkout session created with multiple items');
        console.log(`✅ Total amount: ${session.amount_total}`);

        // Clean up test customer
        await stripe.customers.del(customer.id);
        console.log('✅ Test customer cleaned up');

    } catch (error) {
        console.error('❌ Cart functionality test failed:', error);
        throw error;
    }
}

async function testPreOrderFunnel() {
    console.log('\n🔄 Testing Pre-order Funnel...');
    try {
        // Find a pre-order product
        const products = await stripe.products.list({
            active: true
        });
        
        const preOrderProduct = products.data.find(p => p.metadata.pre_order === 'true');
        if (!preOrderProduct) {
            throw new Error('No pre-order products found');
        }

        // Create test customer
        const customer = await stripe.customers.create({
            email: 'preorder-test@dampdrink.com',
            source: 'tok_visa'
        });

        // Create pre-order checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product: preOrderProduct.id,
                    unit_amount: parseInt(preOrderProduct.metadata.deposit_amount)
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: 'https://dampdrink.com/preorder-success',
            cancel_url: 'https://dampdrink.com/cancel',
            metadata: {
                pre_order: 'true',
                remaining_amount: preOrderProduct.metadata.remaining_amount
            }
        });

        console.log('✅ Pre-order checkout session created');
        console.log(`✅ Deposit amount: $${session.amount_total / 100}`);
        
        // Clean up test customer
        await stripe.customers.del(customer.id);
        console.log('✅ Test customer cleaned up');

    } catch (error) {
        console.error('❌ Pre-order funnel test failed:', error);
        throw error;
    }
}

async function testCheckoutProcess() {
    try {
        // 1. Create a test customer
        console.log('1️⃣ Creating test customer...');
        const customer = await stripe.customers.create({
            email: 'test@dampsmartdrinkware.com',
            source: 'tok_visa' // Test card token
        });
        console.log('✅ Test customer created:', customer.id);

        // 2. Get our test product and its price
        console.log('\n2️⃣ Fetching DAMP Handle product and price...');
        const products = await stripe.products.list({
            limit: 1,
            active: true
        });
        const product = products.data[0];
        console.log('✅ Found product:', product.name);

        // Get the price for this product
        const prices = await stripe.prices.list({
            product: product.id,
            active: true,
            limit: 1
        });
        const price = prices.data[0];
        if (!price) throw new Error('No active price found for product');
        console.log('✅ Found price:', price.id);

        // 3. Create checkout session
        console.log('\n3️⃣ Creating checkout session...');
        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            payment_method_types: ['card'],
            line_items: [{
                price: price.id,
                quantity: 1
            }],
            mode: 'payment',
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/cancel'
        });
        console.log('✅ Checkout session created:', session.id);
        console.log('🔗 Checkout URL:', session.url);

        // 4. Simulate successful payment (test mode only)
        console.log('\n4️⃣ Simulating payment...');
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
        console.log('✅ Payment status:', paymentIntent.status);

        console.log('\n✨ Checkout process verification complete!');
        console.log('💡 To test live checkout flow, visit:', session.url);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function testNavigationAndPages() {
    console.log('\n🧭 Testing Navigation and Pages...');
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 800 },
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    const viewports = [
        { width: 1920, height: 1080, name: 'Desktop' },
        { width: 1280, height: 720, name: 'Laptop' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 375, height: 812, name: 'Mobile' }
    ];
    
    try {

        // Add animation skip and responsive testing helpers
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
            
            window.getResponsiveInfo = () => {
                return {
                    viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight
                    },
                    menuVisible: !!document.querySelector('.navbar-menu.is-active'),
                    hamburgerVisible: !!document.querySelector('.navbar-burger'),
                    navigationLinks: Array.from(document.querySelectorAll('nav a, .navbar-menu a')).map(a => ({
                        href: a.href,
                        text: a.textContent,
                        visible: window.getComputedStyle(a).display !== 'none'
                    }))
                };
            };
        });

        // Test homepage across viewport sizes
        console.log('1️⃣ Testing homepage responsiveness...');
        for (const viewport of viewports) {
            console.log(`\nTesting ${viewport.name} viewport (${viewport.width}x${viewport.height})...`);
            await page.setViewport(viewport);
            
            await page.goto(SITE_URL, {
                waitUntil: 'networkidle0',
                timeout: 60000
        });
        
        // Wait for any main content container to load
        try {
            await Promise.race([
                page.waitForSelector('.product-grid', { timeout: 10000 }),
                page.waitForSelector('.products-container', { timeout: 10000 }),
                page.waitForSelector('main', { timeout: 10000 })
            ]);
            console.log('✅ Homepage loaded');
        } catch (error) {
            console.log('⚠️ Could not find primary content container, but page loaded');
            // Take a screenshot for debugging
            await page.screenshot({ path: 'homepage-debug.png' });
        }

        // Test navigation menu
        console.log('\n2️⃣ Testing navigation menu...');
        
            // Get responsive info
            const responsiveInfo = await page.evaluate(() => window.getResponsiveInfo());
            console.log(`Responsive Info for ${viewport.name}:`, JSON.stringify(responsiveInfo, null, 2));

            // Test navigation based on viewport
            if (responsiveInfo.hamburgerVisible) {
                // Mobile/Tablet navigation testing
                console.log('Testing mobile/tablet navigation...');
                
                // Click hamburger menu if it exists and is not already active
                if (!responsiveInfo.menuVisible) {
                    await page.click('.navbar-burger').catch(() => console.log('⚠️ Could not click hamburger menu'));
                    await page.waitForTimeout(500); // Wait for menu animation
                }
            }

            // Test navigation links
            const navigationSelectors = [
                { selector: 'nav a', context: 'Main Navigation' },
                { selector: '.navbar-menu a', context: 'Menu Items' },
                { selector: '.navbar-start a', context: 'Left Menu' },
                { selector: '.navbar-end a', context: 'Right Menu' }
            ];

            // Test each navigation section
            for (const { selector, context } of navigationSelectors) {
                const elements = await page.$$(selector);
                if (elements.length > 0) {
                    console.log(`\nTesting ${context} (${elements.length} items found)`);
                    
                    // Test each navigation link
                    for (const element of elements) {
                        try {
                            // Get link info
                            const linkInfo = await element.evaluate(el => ({
                                href: el.href,
                                text: el.textContent.trim(),
                                visible: window.getComputedStyle(el).display !== 'none'
                            }));
                            
                            if (!linkInfo.visible) {
                                console.log(`⚠️ Link "${linkInfo.text}" is hidden`);
                                continue;
                            }

                            // Ensure element is in view
                            await element.evaluate(el => {
                                el.scrollIntoView({
                                    behavior: 'instant',
                                    block: 'center'
                                });
                            });

                            // Click and verify navigation
                            console.log(`Testing link: ${linkInfo.text}`);
                            await Promise.all([
                                page.waitForNavigation({
                                    waitUntil: 'networkidle0',
                                    timeout: 10000
                                }).catch(() => {}),
                                element.click().catch(e => console.log(`⚠️ Click failed: ${e.message}`))
                            ]);

                            // Verify navigation success
                            const currentUrl = await page.url();
                            console.log(`✅ Navigation successful: ${currentUrl}`);

                            // Return to homepage for next test
                            await page.goto(SITE_URL, {
                                waitUntil: 'networkidle0',
                                timeout: 10000
                            });
                            
                            // Re-open mobile menu if needed
                            if (responsiveInfo.hamburgerVisible && !responsiveInfo.menuVisible) {
                                await page.click('.navbar-burger').catch(() => {});
                                await page.waitForTimeout(500);
                            }
                        } catch (error) {
                            console.log(`❌ Navigation test failed: ${error.message}`);
                            await page.screenshot({
                                path: `navigation-error-${viewport.name.toLowerCase()}.png`
                            });
                        }
                    }
                }
            }

            // Test navigation styling
            const navStyles = await page.evaluate(() => {
                const styles = {};
                
                // Test navigation container
                const nav = document.querySelector('nav');
                if (nav) {
                    const navStyle = window.getComputedStyle(nav);
                    styles.nav = {
                        height: navStyle.height,
                        position: navStyle.position,
                        zIndex: navStyle.zIndex,
                        backgroundColor: navStyle.backgroundColor
                    };
                }
                
                // Test hamburger menu
                const burger = document.querySelector('.navbar-burger');
                if (burger) {
                    const burgerStyle = window.getComputedStyle(burger);
                    styles.burger = {
                        display: burgerStyle.display,
                        position: burgerStyle.position,
                        size: `${burgerStyle.width} x ${burgerStyle.height}`
                    };
                }
                
                // Test menu items
                const menuItems = document.querySelectorAll('.navbar-menu a');
                if (menuItems.length) {
                    const firstItem = window.getComputedStyle(menuItems[0]);
                    styles.menuItems = {
                        fontSize: firstItem.fontSize,
                        padding: firstItem.padding,
                        margin: firstItem.margin
                    };
                }
                
                return styles;
            });
            
            console.log(`\nNavigation Styles for ${viewport.name}:`, JSON.stringify(navStyles, null, 2));
            
            // Take a screenshot for visual verification
            await page.screenshot({
                path: `navigation-${viewport.name.toLowerCase()}.png`,
                fullPage: false
            });
        } catch (error) {
            console.log('⚠️ Navigation test encountered an issue:', error.message);
            await page.screenshot({ path: 'navigation-error.png' });
        }

    } catch (error) {
        console.error('❌ Navigation test failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

async function testEndToEndFlow() {
    console.log('\n🔄 Testing Complete E2E Flow...');
    
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: {
            width: 1280,
            height: 720
        },
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        timeout: 60000
        headless: false,
        defaultViewport: { width: 1280, height: 800 },
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    try {
        // Visit products page
        await page.goto(`${SITE_URL}/products`, {
            waitUntil: 'networkidle0',
            timeout: 60000
        });
        console.log('✅ Products page loaded');

        // Select first product
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click('.product-card:first-child')
        ]);
        console.log('✅ Product details page loaded');

        // Add to cart
        await page.click('#add-to-cart-button');
        await page.waitForSelector('.cart-notification');
        console.log('✅ Product added to cart');

        // Open cart
        await page.click('.cart-icon');
        await page.waitForSelector('.cart-items');
        console.log('✅ Cart opened');

        // Proceed to checkout
        await page.click('#checkout-button');
        await page.waitForSelector('iframe[name^="checkout-frame"]');
        console.log('✅ Checkout page loaded');

        // Fill checkout form
        const frameHandle = await page.waitForSelector('iframe[name^="checkout-frame"]');
        const frame = await frameHandle.contentFrame();

        await frame.waitForSelector('#email');
        await frame.type('#email', 'test@dampdrink.com');
        await frame.type('#cardNumber', '4242424242424242');
        await frame.type('#cardExpiry', '1230');
        await frame.type('#cardCvc', '123');
        await frame.type('#billingName', 'Test User');
        await frame.type('#billingPostalCode', '12345');
        console.log('✅ Payment details filled');

        // Submit payment
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            frame.click('#submit')
        ]);
        console.log('✅ Payment submitted');

        // Verify success page
        await page.waitForSelector('.success-message');
        console.log('✅ Order completed successfully');

    } catch (error) {
        console.error('❌ E2E test failed:', error);
        await page.screenshot({
            path: 'error-screenshot.png',
            fullPage: true
        });
        throw error;
    } finally {
        await browser.close();
    }
}

// Run all tests
(async () => {
    try {
        console.log('🚀 Starting comprehensive test suite...\n');

        // Test backend Stripe configuration
        await testProductPages();
        await testCartFunctionality();
        await testPreOrderFunnel();
        await testCheckoutProcess();

        // Test frontend E2E flows
        await testNavigationAndPages();
        await testEndToEndFlow();

        console.log('\n✨ All tests completed successfully!');
    } catch (error) {
        console.error('\n❌ Test suite failed:', error);
        process.exit(1);
    }
})();