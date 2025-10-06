import puppeteer from 'puppeteer';

const SITE_URL = 'https://www.dampdrink.com';

async function testNavigationAndPages() {
    console.log('\n🧭 Testing Navigation and Pages...');
    
    const viewports = [
        { width: 1920, height: 1080, name: 'Desktop' },
        { width: 1280, height: 720, name: 'Laptop' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 375, height: 812, name: 'Mobile' }
    ];

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1');

        // Add test helpers
        await page.evaluateOnNewDocument(() => {
            window.skipAnimations = () => {
                const style = document.createElement('style');
                style.textContent = '* { animation-duration: 0s !important; transition-duration: 0s !important; }';
                document.head.appendChild(style);
            };
            
            window.getResponsiveInfo = () => {
                const menuVisible = !!document.querySelector('.navbar-menu.is-active');
                const hamburgerVisible = !!document.querySelector('.navbar-burger:not(.is-hidden)');
                const isMobile = window.innerWidth < 768;
                
                // Only check visible links based on viewport
                const navLinks = Array.from(document.querySelectorAll('nav a, .navbar-menu a'))
                    .filter(a => {
                        if (isMobile) {
                            // On mobile, links should only be visible if menu is open
                            return menuVisible || a.closest('.navbar-brand');
                        }
                        return true;
                    })
                    .map(a => ({
                        href: a.href,
                        text: a.textContent.trim(),
                        visible: window.getComputedStyle(a).display !== 'none',
                        group: a.closest('.navbar-start, .navbar-end, .navbar-brand')?.className || 'other'
                    }));

                return {
                    viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight
                    },
                    menuVisible,
                    hamburgerVisible,
                    isMobile,
                    navigationLinks: navLinks
                };
            };

            window.getNavigationMetrics = () => {
                const nav = document.querySelector('nav');
                const navStyle = window.getComputedStyle(nav);
                const metrics = {
                    height: navStyle.height,
                    position: navStyle.position,
                    zIndex: navStyle.zIndex,
                    backgroundColor: navStyle.backgroundColor
                };

                // Check for proper mobile nav height
                if (window.innerWidth < 768) {
                    const mobileMaxHeight = '80px';
                    if (parseFloat(navStyle.height) > parseFloat(mobileMaxHeight)) {
                        metrics.mobileHeightIssue = `Navigation height (${navStyle.height}) exceeds recommended mobile max (${mobileMaxHeight})`;
                    }
                }

                // Check for fixed positioning
                if (navStyle.position !== 'fixed') {
                    metrics.positionIssue = 'Navigation should use fixed positioning';
                }

                // Check proper z-index
                const zIndex = parseInt(navStyle.zIndex);
                if (zIndex < 1000) {
                    metrics.zIndexIssue = `Z-index (${zIndex}) should be at least 1000`;
                }

                return metrics;
            };
        });

        // Test each viewport size
        for (const viewport of viewports) {
            console.log(`\nTesting ${viewport.name} viewport (${viewport.width}x${viewport.height})...`);
            
            try {
                await page.setViewport(viewport);
                await page.goto(SITE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
                await page.evaluate(() => window.skipAnimations());

                // Get responsive info
                const responsiveInfo = await page.evaluate(() => window.getResponsiveInfo());
                console.log('Responsive Info:', JSON.stringify(responsiveInfo, null, 2));

                // Test mobile navigation
                if (viewport.width < 768) {
                    console.log('\nTesting mobile navigation...');
                    
                    // Verify hamburger menu
                    const hasHamburger = await page.$('.navbar-burger');
                    if (!hasHamburger) {
                        console.log('❌ Missing hamburger menu on mobile');
                    } else {
                        console.log('✅ Hamburger menu present');
                        
                        // Test menu toggle
                        await page.click('.navbar-burger');
                        await page.waitForTimeout(300);
                        
                        const menuVisible = await page.$('.navbar-menu.is-active');
                        if (!menuVisible) {
                            console.log('❌ Mobile menu not showing after burger click');
                        } else {
                            console.log('✅ Mobile menu toggles correctly');
                        }
                    }
                }

                // Verify navigation height
                const navMetrics = await page.evaluate(() => window.getNavigationMetrics());
                console.log('\nNavigation Metrics:', JSON.stringify(navMetrics, null, 2));

                // Group testing
                const groups = ['navbar-brand', 'navbar-start', 'navbar-end'];
                for (const group of groups) {
                    const links = responsiveInfo.navigationLinks.filter(link => link.group.includes(group));
                    if (links.length) {
                        console.log(`\nTesting ${group} links (${links.length} items)...`);
                        
                        for (const link of links) {
                            if (!link.href) {
                                console.log(`⚠️ Link "${link.text}" missing href`);
                                continue;
                            }

                            try {
                                // Create new context for each navigation
                                const context = await browser.createIncognitoBrowserContext();
                                const newPage = await context.newPage();
                                await newPage.setViewport(viewport);
                                await newPage.goto(SITE_URL);

                                // Find and click the same link in new context
                                const selector = `a[href="${link.href}"]`;
                                await newPage.waitForSelector(selector);
                                
                                // Only try to click if link should be visible
                                if (link.visible) {
                                    await newPage.click(selector);
                                    const url = await newPage.url();
                                    console.log(`✅ Navigation successful: ${url}`);
                                }

                                await context.close();
                            } catch (error) {
                                console.log(`❌ Navigation failed for "${link.text}": ${error.message}`);
                                
                                // Take error screenshot
                                await page.screenshot({
                                    path: `error-${viewport.name.toLowerCase()}-${link.text.replace(/[^a-z0-9]/gi, '_')}.png`,
                                    fullPage: false
                                });
                            }
                        }
                    }
                }

                // Take viewport screenshot
                await page.screenshot({
                    path: `navigation-${viewport.name.toLowerCase()}.png`,
                    fullPage: false
                });

            } catch (error) {
                console.log(`❌ Viewport test failed: ${error.message}`);
                await page.screenshot({
                    path: `error-${viewport.name.toLowerCase()}.png`,
                    fullPage: false
                });
            }
        }
    } catch (error) {
        console.error('❌ Navigation testing failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

testNavigationAndPages().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
});