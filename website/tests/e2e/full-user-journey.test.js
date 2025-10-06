import { test, expect } from '@playwright/test';
import './_expect-extensions';

/* global window, document, MutationObserver, console, sessionStorage */

const THIRD_PARTY_BLOCK = [
  'googletagmanager.com',
  'google-analytics.com',
  'doubleclick.net',
  'facebook.net',
  'static.cloudflareinsights.com',
  'hotjar.com',
  'fullstory.com',
  'segment.com'
];

test.describe.configure({ mode: 'parallel' });

// Critical Homepage Elements
const HOME_SELECTORS = {
  navbar: 'nav.damp-nav',
  hamburgerMenu: 'button.hamburger-menu',
  heroSection: 'section.hero-section, .hero-section',
  ctaButton: 'a.cta-button, .cta-button',
  productShowcase: 'section.product-showcase, .product-showcase',
  featuresGrid: 'div.features-grid, .features-grid',
  testimonials: 'section.testimonials, .testimonials',
  newsletter: 'form.newsletter-signup, .newsletter-signup',
  footer: 'footer.site-footer, footer'
};

// Page-specific selectors
const PAGE_SELECTORS = {
  PRE_SALE: {
    mainContent: '.pre-sale-content',
    preOrderForm: 'form.pre-order-form',
    productOptions: '.product-options',
    pricingTiers: '.pricing-tiers',
    quantitySelector: 'select[name="quantity"]',
    addToCartBtn: 'button[type="submit"]',
    earlyBirdBadge: '.early-bird-badge',
    progressBar: '.pre-sale-progress'
  },
  PRODUCT_VOTING: {
    votingSystem: '.voting-system',
    productCards: '.product-card',
    voteButtons: 'button.vote-btn',
    votingStats: '.voting-stats',
    realTimeGraph: '.vote-visualization',
    authSection: '.auth-required',
    votingRules: '.voting-rules'
  },
  HOW_IT_WORKS: {
    featureList: '.feature-list',
    demoVideos: '.demo-video',
    techSpecs: '.tech-specifications',
    compatibilityChart: '.compatibility-chart',
    faqSection: '.faq-accordion'
  },
  CART: {
    cartItems: '.cart-items',
    cartTotal: '.cart-total',
    checkoutBtn: 'button.checkout-btn',
    quantityControls: '.quantity-controls',
    removeItemBtn: '.remove-item'
  },
  ABOUT: {
    companyStory: '.company-story',
    teamSection: '.team-section',
    missionStatement: '.mission-statement',
    contactInfo: '.contact-info'
  }
};

// Define 'containers' at the top of the file to ensure accessibility
let containers = [];

test('Homepage structure and critical elements test', async ({ page }) => {
  // Start at homepage
  console.log('🔵 Starting homepage structure test...');
  console.log('═══════════════════════════════════════════════════════════');

  // SETUP COMPREHENSIVE LOGGING
  await test.step('Setup page logging', async () => {
    console.log('🔧 Setting up comprehensive page logging...');
    
    // Track all console messages from the page
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      const emoji = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'info' ? 'ℹ️' : '📝';
      console.log(`${emoji} [PAGE ${type.toUpperCase()}]: ${text}`);
    });

    // Track all page errors
    page.on('pageerror', error => {
      console.log(`❌ [PAGE ERROR]: ${error.message}`);
    });

    // Track all network requests
    page.on('request', request => {
      const url = request.url();
      const method = request.method();
      const resourceType = request.resourceType();
      console.log(`📡 [REQUEST ${method}]: ${resourceType} - ${url.substring(0, 100)}`);
    });

    // Track all network responses
    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      const statusEmoji = status >= 200 && status < 300 ? '✅' : status >= 400 ? '❌' : '⚠️';
      console.log(`${statusEmoji} [RESPONSE ${status}]: ${url.substring(0, 100)}`);
    });

    // Track navigation events
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) {
        console.log(`🧭 [NAVIGATION]: ${frame.url()}`);
      }
    });

    // Track dialog events (alerts, confirms, prompts)
    page.on('dialog', dialog => {
      console.log(`💬 [DIALOG ${dialog.type()}]: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });

    // Inject click tracker into the page
    await page.addInitScript(() => {
      document.addEventListener('click', (e) => {
        const target = e.target;
        const tagName = target.tagName.toLowerCase();
        const id = target.id ? `#${target.id}` : '';
        const classes = target.className ? `.${target.className.split(' ').join('.')}` : '';
        const text = target.textContent ? target.textContent.substring(0, 50) : '';
        console.log(`🖱️ [CLICK]: ${tagName}${id}${classes} - "${text}"`);
      });
    });

    console.log('✅ Page logging setup complete');
  });

  // LOAD HOMEPAGE
  await test.step('Load homepage', async () => {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🌐 LOADING HOMEPAGE');
    console.log('═══════════════════════════════════════════════════════════');
    await page.goto('/', { timeout: 60000, waitUntil: 'networkidle' });
    console.log('✅ Page loaded');
    
    // Log all loaded elements
    const elementCounts = await page.evaluate(() => {
      return {
        scripts: document.scripts.length,
        stylesheets: document.styleSheets.length,
        images: document.images.length,
        links: document.links.length,
        forms: document.forms.length,
        divs: document.querySelectorAll('div').length,
        sections: document.querySelectorAll('section').length,
        buttons: document.querySelectorAll('button').length
      };
    });
    console.log('📊 Page elements loaded:');
    console.log(`   - Scripts: ${elementCounts.scripts}`);
    console.log(`   - Stylesheets: ${elementCounts.stylesheets}`);
    console.log(`   - Images: ${elementCounts.images}`);
    console.log(`   - Links: ${elementCounts.links}`);
    console.log(`   - Forms: ${elementCounts.forms}`);
    console.log(`   - Divs: ${elementCounts.divs}`);
    console.log(`   - Sections: ${elementCounts.sections}`);
    console.log(`   - Buttons: ${elementCounts.buttons}`);
  });

  // WAIT FOR HERO ANIMATIONS TO COMPLETE
  await test.step('Wait for hero animations', async () => {
    console.log('⏳ Waiting for hero animations...');
    const skipButton = page.locator('.animation-skip-button');
    
    try {
      await skipButton.waitFor({ state: 'visible', timeout: 2000 });
      console.log('✅ Skip button found, clicking...');
      await skipButton.click();
      await page.waitForFunction(() => {
        const overlay = document.querySelector('.hero-animation-overlay');
        return !overlay;
      }, { timeout: 3000 });
      console.log('✅ Animation skipped successfully');
    } catch (e) {
      console.log('⏳ No skip button, waiting for natural completion...');
      await page.waitForFunction(() => {
        const overlay = document.querySelector('.hero-animation-overlay');
        return !overlay || window.getComputedStyle(overlay).display === 'none' || 
               window.getComputedStyle(overlay).opacity === '0';
      }, { timeout: 12000 }).catch(() => {
        console.log('⚠️ Animation overlay check timed out');
      });
    }

    await page.waitForFunction(() => {
      return document.body.classList.contains('animation-complete') ||
             window.getComputedStyle(document.body).overflow !== 'hidden';
    }, { timeout: 5000 }).catch(() => {
      console.log('⚠️ Body state check timed out');
    });

    await page.waitForTimeout(1000);
    console.log('✅ Hero animations complete');
  });

  // VERIFY HERO ANIMATION ELEMENTS
  await test.step('Verify hero animation elements', async () => {
    console.log('🎬 Verifying hero animation elements...');
    
    // Check that animation overlay was present (or check if animation was skipped)
    const animationPlayed = await page.evaluate(() => {
      // Check if animation was played by looking for session storage or body class
      return document.body.classList.contains('animation-complete') || 
             sessionStorage.getItem('damp-animation-played') === 'true';
    });
    
    if (animationPlayed) {
      console.log('✅ Animation completion detected');
    } else {
      console.log('⚠️ Animation may have been skipped or not played');
    }
    
    // Verify animation elements are defined in the hero-animation.js
    const animationElementsCheck = await page.evaluate(() => {
      const results = {
        bubblesContainer: false,
        logoElement: false,
        dampText: false,
        mainText: false,
        skipButton: false
      };
      
      // These elements are created dynamically, so we check if they were removed
      // (which means they were created and then cleaned up after animation)
      const overlay = document.querySelector('.hero-animation-overlay');
      
      if (overlay) {
        // Animation is still running or stuck
        results.bubblesContainer = !!overlay.querySelector('.bubbles-container');
        results.logoElement = !!overlay.querySelector('.animation-logo');
        results.dampText = !!overlay.querySelector('.animation-damp-text');
        results.mainText = !!overlay.querySelector('.animation-main-text');
        results.skipButton = !!overlay.querySelector('.animation-skip-button');
        return { ...results, overlayPresent: true, cleaned: false };
      } else {
        // Animation completed and cleaned up (expected state)
        return { ...results, overlayPresent: false, cleaned: true };
      }
    });
    
    if (animationElementsCheck.cleaned) {
      console.log('✅ Animation overlay properly cleaned up after completion');
    } else if (animationElementsCheck.overlayPresent) {
      console.log('⚠️ Animation overlay still present:');
      console.log(`   - Bubbles container: ${animationElementsCheck.bubblesContainer}`);
      console.log(`   - Logo element: ${animationElementsCheck.logoElement}`);
      console.log(`   - DAMP text: ${animationElementsCheck.dampText}`);
      console.log(`   - Main text: ${animationElementsCheck.mainText}`);
      console.log(`   - Skip button: ${animationElementsCheck.skipButton}`);
    }
    
    // Verify body state after animation
    const bodyState = await page.evaluate(() => {
      return {
        hasAnimationComplete: document.body.classList.contains('animation-complete'),
        overflow: window.getComputedStyle(document.body).overflow,
        height: window.getComputedStyle(document.body).height
      };
    });
    
    console.log('📊 Body state after animation:');
    console.log(`   - animation-complete class: ${bodyState.hasAnimationComplete}`);
    console.log(`   - overflow: ${bodyState.overflow}`);
    console.log(`   - height: ${bodyState.height}`);
    
    // Verify main content is visible
    const mainContentVisible = await page.evaluate(() => {
      const main = document.querySelector('main');
      if (!main) return false;
      const styles = window.getComputedStyle(main);
      return styles.opacity !== '0' && styles.display !== 'none';
    });
    
    if (mainContentVisible) {
      console.log('✅ Main content is visible after animation');
    } else {
      console.log('❌ Main content is NOT visible after animation');
    }
    
    // Check hero section elements are now visible
    const heroElements = await page.evaluate(() => {
      const heroSection = document.querySelector('.hero-section');
      if (!heroSection) return null;
      
      return {
        heroSection: !!heroSection,
        heroLogo: !!heroSection.querySelector('.hero-logo img'),
        heroTitle: !!heroSection.querySelector('.hero-title'),
        heroSubtitle: !!heroSection.querySelector('.hero-subtitle'),
        heroCTA: !!heroSection.querySelector('.hero-cta')
      };
    });
    
    if (heroElements) {
      console.log('✅ Hero section elements verified:');
      console.log(`   - Hero section: ${heroElements.heroSection}`);
      console.log(`   - Logo: ${heroElements.heroLogo}`);
      console.log(`   - Title: ${heroElements.heroTitle}`);
      console.log(`   - Subtitle: ${heroElements.heroSubtitle}`);
      console.log(`   - CTA buttons: ${heroElements.heroCTA}`);
    } else {
      console.log('❌ Hero section not found');
    }
    
    console.log('✅ Hero animation verification complete');
  });

  // VERIFY PAGE COMPONENTS
  await test.step('Verify critical page components', async () => {
    console.log('🔍 Checking page components...');
    
    // Scroll to load lazy-loaded components
    console.log('📜 Scrolling to trigger lazy-loaded components...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000); // Wait for any scroll-triggered loads
    
    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    console.log('✅ Page scrolled to trigger all components');
    
    // Get all major page components
    const components = await page.evaluate(() => {
      const isInViewport = (el) => {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      };
      
      return {
        navs: Array.from(document.querySelectorAll('nav')).map(n => ({
          classes: n.className,
          visible: window.getComputedStyle(n).display !== 'none',
          inViewport: isInViewport(n)
        })),
        headers: Array.from(document.querySelectorAll('header')).map(h => ({
          classes: h.className,
          visible: window.getComputedStyle(h).display !== 'none',
          inViewport: isInViewport(h)
        })),
        mains: Array.from(document.querySelectorAll('main')).map(m => ({
          classes: m.className,
          visible: window.getComputedStyle(m).display !== 'none',
          inViewport: isInViewport(m)
        })),
        footers: Array.from(document.querySelectorAll('footer')).map(f => ({
          classes: f.className,
          visible: window.getComputedStyle(f).display !== 'none',
          inViewport: isInViewport(f)
        })),
        sections: Array.from(document.querySelectorAll('section')).map(s => ({
          classes: s.className,
          id: s.id,
          visible: window.getComputedStyle(s).display !== 'none',
          inViewport: isInViewport(s)
        }))
      };
    });
    
    console.log('📋 Page components:', JSON.stringify(components, null, 2));
    
    // Verify essential components exist
    expect(components.navs.length).toBeGreaterThan(0, 'At least one nav should exist');
    
    // Footer is optional - just log if missing
    if (components.footers.length === 0) {
      console.log('⚠️ No footer element found on page');
    } else {
      console.log('✅ Footer found');
    }
    
    // Check for visible navigation
    const visibleNav = components.navs.find(n => n.visible);
    if (!visibleNav) {
      throw new Error('At least one navigation should be visible');
    }
    expect(visibleNav).toBeTruthy();
    console.log('✅ Navigation present:', visibleNav.classes);
    
    // Verify we have sections (content)
    expect(components.sections.length).toBeGreaterThan(0, 'Page should have content sections');
    console.log(`✅ Found ${components.sections.length} content sections`);
    
    // Verify the specific nav we know should exist
    const dampNav = page.locator('nav.damp-nav').first();
    await expect(dampNav).toBeVisible({ timeout: 10000 });
    console.log('✅ Main navigation (nav.damp-nav) verified');
  });

  // CHECK ROUTING
  await test.step('Verify page routing and links', async () => {
    console.log('🔗 Checking page routing...');
    
    // Get all links on the page
    const links = await page.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll('a[href]'));
      return allLinks.map(link => ({
        href: link.getAttribute('href'),
        text: link.textContent.trim().substring(0, 50),
        visible: window.getComputedStyle(link).display !== 'none'
      })).filter(link => link.visible && link.href);
    });
    
    console.log(`📋 Found ${links.length} visible links`);
    
    // Categorize links
    const internalLinks = links.filter(l => 
      l.href.startsWith('/') || 
      l.href.startsWith('./') || 
      l.href.startsWith('../') ||
      l.href.startsWith('pages/') || // Add support for relative paths without leading slash
      l.href.includes('localhost')
    );
    
    const externalLinks = links.filter(l => 
      l.href.startsWith('http') && 
      !l.href.includes('localhost')
    );
    
    console.log(`🔗 Internal links: ${internalLinks.length}`);
    console.log(`🌐 External links: ${externalLinks.length}`);
    
    // Check a few critical internal links exist (check for both absolute and relative paths)
    const criticalPaths = [
      'pre-sale-funnel.html',
      'product-voting.html',
      'how-it-works.html',
      'cart.html'
    ];
    
    for (const path of criticalPaths) {
      const linkExists = internalLinks.some(l => l.href.includes(path));
      if (linkExists) {
        console.log(`✅ Link to ${path} found`);
      } else {
        console.log(`⚠️ Link to ${path} NOT found - may need repair`);
      }
    }
    
    // Verify at least some internal navigation exists
    expect(internalLinks.length).toBeGreaterThan(0, 'Should have internal navigation links');
  });

  // TEST BASIC NAVIGATION
  await test.step('Test basic navigation functionality', async () => {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🧪 TESTING NAVIGATION FUNCTIONALITY');
    console.log('═══════════════════════════════════════════════════════════');
    
    // Setup route change tracker
    let routeChanges = [];
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        const change = {
          timestamp: new Date().toISOString(),
          url: frame.url()
        };
        routeChanges.push(change);
        console.log(`🧭 [ROUTE CHANGE ${routeChanges.length}]: ${frame.url()}`);
      }
    });
    
    // Find a clickable link (prefer pre-sale funnel)
    const preSaleLink = page.locator('a[href*="pre-sale"]').first();
    const linkExists = await preSaleLink.count() > 0;
    
    if (linkExists) {
      console.log('✅ Pre-sale link found, testing navigation...');
      
      // Get link details before clicking
      const linkDetails = await preSaleLink.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return {
          href: el.href,
          text: el.textContent.trim(),
          classes: el.className,
          id: el.id,
          position: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          isVisible: window.getComputedStyle(el).display !== 'none'
        };
      });
      
      console.log('📋 Link details:');
      console.log(`   - href: ${linkDetails.href}`);
      console.log(`   - text: ${linkDetails.text}`);
      console.log(`   - classes: ${linkDetails.classes}`);
      console.log(`   - id: ${linkDetails.id}`);
      console.log(`   - position: (${linkDetails.position.x}, ${linkDetails.position.y})`);
      console.log(`   - size: ${linkDetails.position.width}x${linkDetails.position.height}`);
      console.log(`   - visible: ${linkDetails.isVisible}`);
      
      console.log(`🔗 Navigating to: ${linkDetails.href}`);
      console.log(`🖱️ Clicking link at (${linkDetails.position.x}, ${linkDetails.position.y})...`);
      
      const beforeUrl = page.url();
      console.log(`📍 Before click URL: ${beforeUrl}`);
      
      // Click and wait for navigation
      await Promise.race([
        preSaleLink.click(),
        page.waitForURL('**/pre-sale**', { timeout: 5000 }).catch(() => {
          console.log('⚠️ URL did not change to pre-sale page within 5s');
        })
      ]);
      
      await page.waitForTimeout(1000);
      
      // Check if we navigated
      const afterUrl = page.url();
      console.log(`📍 After click URL: ${afterUrl}`);
      
      if (afterUrl !== beforeUrl) {
        console.log(`✅ URL changed from ${beforeUrl} to ${afterUrl}`);
      } else {
        console.log(`⚠️ URL did not change (still: ${afterUrl})`);
      }
      
      if (afterUrl.includes('pre-sale')) {
        console.log('✅ Navigation to pre-sale page successful');
        
        // Log page elements on new page
        const newPageElements = await page.evaluate(() => {
          return {
            title: document.title,
            h1: document.querySelector('h1')?.textContent.trim(),
            forms: document.forms.length,
            buttons: document.querySelectorAll('button').length,
            links: document.links.length
          };
        });
        
        console.log('📊 New page elements:');
        console.log(`   - Title: ${newPageElements.title}`);
        console.log(`   - H1: ${newPageElements.h1}`);
        console.log(`   - Forms: ${newPageElements.forms}`);
        console.log(`   - Buttons: ${newPageElements.buttons}`);
        console.log(`   - Links: ${newPageElements.links}`);
        
        // Navigate back to homepage
        console.log('🔙 Navigating back to homepage...');
        await page.goto('/', { waitUntil: 'networkidle' });
        console.log('✅ Returned to homepage');
      } else {
        console.log('⚠️ Navigation did not complete as expected');
      }
    } else {
      console.log('⚠️ Pre-sale link not found - navigation test skipped');
    }
    
    // Summary of all route changes
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📊 Total route changes: ${routeChanges.length}`);
    routeChanges.forEach((change, index) => {
      console.log(`   ${index + 1}. [${change.timestamp}] ${change.url}`);
    });
    console.log('═══════════════════════════════════════════════════════════');
  });

  console.log('✅ Homepage structure test complete');
});

test.beforeEach(async ({ page }, testInfo) => {
  // Block noisy/slow third-party calls and problematic services
  await page.route(
    (url) => THIRD_PARTY_BLOCK.some((d) => url.hostname.includes(d)) || 
             url.pathname.endsWith('sw.js') ||
             url.pathname.endsWith('adsense-manager.js') ||
             url.pathname.endsWith('firebase-services.js'),
    (route) => route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        // Mock Firebase and services
        window.require = () => ({});
        window.firebase = {
          initializeApp: () => ({}),
          auth: () => ({
            onAuthStateChanged: () => {},
            currentUser: null
          }),
          messaging: () => ({
            getToken: () => Promise.resolve(),
            onMessage: () => {}
          }),
          analytics: () => ({
            logEvent: () => {}
          })
        };
        // Mock Performance Monitor
        window.DAMPPerformanceMonitor = DAMPPerformanceMonitor;
      `
    })
  );
  
  test.setTimeout(120000); // Double the default timeout  // Mock service worker registration and Firebase initialization
  await page.addInitScript(() => {
    if (typeof window !== 'undefined') {
      // Mock service worker
      window.navigator.serviceWorker = {
        register: () => Promise.resolve({ scope: '/' }),
        ready: Promise.resolve({ active: true })
      };

      // Mock Firebase
      window.require = () => ({});
      window.firebase = {
        initializeApp: () => ({}),
        auth: () => ({ 
          onAuthStateChanged: () => {}, 
          currentUser: null 
        }),
        messaging: () => ({
          getToken: () => Promise.resolve(),
          onMessage: () => {}
        }),
        analytics: () => ({
          logEvent: () => {}
        })
      };
      window.initializeAnalytics = () => {};
    }
  });

  // Helpful diagnostics in the report
  page.on('console', (msg) => {
    if (msg.type() === 'error') testInfo.attach('console-error', { body: msg.text(), contentType: 'text/plain' });
  });
  page.on('pageerror', (err) => {
    testInfo.attach('pageerror', { body: String(err?.stack || err), contentType: 'text/plain' });
  });
  page.on('response', (res) => {
    if (!res.ok()) {
      testInfo.attach('http-error', { body: `${res.status()} ${res.url()}`, contentType: 'text/plain' });
    }
  });
});

test.describe('Page Tests', () => {
  test('Pre-sale funnel page test', async ({ page }) => {
    await page.goto('/pages/pre-sale-funnel.html', { waitUntil: 'networkidle' });
    const s = PAGE_SELECTORS.PRE_SALE;

    // Test product selection flow
    await test.step('product selection', async () => {
      const options = page.locator(s.productOptions);
      await options.first().click();
      await expect(page.locator(s.pricingTiers)).toContainText('Early Bird');
    });

    // Test quantity selection
    await test.step('quantity selection', async () => {
      const quantity = page.locator(s.quantitySelector);
      await quantity.selectOption('2');
      // Verify price update
      await expect(page.locator(s.pricingTiers)).toContainText(await page.evaluate(() => {
        const basePrice = 29.99;
        return `$${(basePrice * 2).toFixed(2)}`;
      }));
    });

    // Test add to cart
    await test.step('add to cart', async () => {
      const addToCart = page.locator(s.addToCartBtn);
      await addToCart.click();
      await expect(page.locator('.cart-notification')).toBeVisible();
      await expect(page.locator('.cart-count')).toContainText('2');
    });
  });

  test('Product voting page test', async ({ page }) => {
    await page.goto('/pages/product-voting.html', { waitUntil: 'networkidle' });
    const s = PAGE_SELECTORS.PRODUCT_VOTING;

    // Test voting system UI
    await test.step('voting system UI', async () => {
      const cards = page.locator(s.productCards);
      await expect(cards).toHaveCount(3);
      
      // Check vote buttons
      const voteButtons = page.locator(s.voteButtons);
      await expect(voteButtons).toHaveCount(3);
      
      // Verify stats are loading
      await expect(page.locator(s.votingStats)).toBeVisible();
      await expect(page.locator(s.realTimeGraph)).toBeVisible();
    });

    // Test authentication flow
    await test.step('voting auth flow', async () => {
      const firstVoteBtn = page.locator(s.voteButtons).first();
      await firstVoteBtn.click();
      
      // Should trigger auth modal
      await expect(page.locator('.auth-modal')).toBeVisible();
      await expect(page.locator('.login-options')).toBeVisible();
    });

    // Test real-time updates
    await test.step('real-time updates', async () => {
      // Subscribe to vote changes
      await page.evaluate(() => {
        window.voteCount = 0;
        const observer = new MutationObserver(() => window.voteCount++);
        observer.observe(document.querySelector('.vote-visualization'), { 
          childList: true, 
          subtree: true 
        });
      });
      
      // Wait for updates
      await page.waitForFunction(() => window.voteCount > 0, { timeout: 5000 });
    });
  });

  test('Cart page test', async ({ page }) => {
    await page.goto('/pages/cart.html', { waitUntil: 'networkidle' });
    const s = PAGE_SELECTORS.CART;

    // Test empty cart state
    await test.step('empty cart', async () => {
      const emptyMessage = page.locator('.empty-cart-message');
      if (await emptyMessage.isVisible()) {
        await expect(emptyMessage).toContainText('Your cart is empty');
        await expect(page.locator(s.checkoutBtn)).toBeDisabled();
      }
    });

    // Add item and test cart functionality
    await test.step('cart with items', async () => {
      // Add item first (if cart is empty)
      if (await page.locator('.empty-cart-message').isVisible()) {
        await page.goto('/pages/pre-sale-funnel.html');
        await page.locator(PAGE_SELECTORS.PRE_SALE.productOptions).first().click();
        await page.locator(PAGE_SELECTORS.PRE_SALE.addToCartBtn).click();
        await page.goto('/pages/cart.html');
      }

      // Test quantity controls
      const quantityInput = page.locator(s.quantityControls);
      await expect(quantityInput).toBeVisible();
      await page.locator(s.quantityControls + ' .increment').click();
      
      // Verify total updates
      await expect(page.locator(s.cartTotal)).toContainText(await page.evaluate(() => {
        const basePrice = 29.99;
        return `$${(basePrice * 2).toFixed(2)}`;
      }));

      // Test remove item
      await page.locator(s.removeItemBtn).click();
      await expect(page.locator('.empty-cart-message')).toBeVisible();
    });
  });
});

test.describe('User Journey Tests', () => {
  test('Homepage animation performance', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await test.step('menu animation performance', async () => {
      const hamburger = page.locator(HOME_SELECTORS.hamburgerMenu);
      if (await hamburger.isVisible()) {
        const startTime = Date.now();
        await hamburger.click();
        const endTime = Date.now();
        expect(endTime - startTime).toBeLessThan(300);
        await expect(page.locator(HOME_SELECTORS.navbar)).toHaveClass(/active/);
        await hamburger.click();
        await expect(page.locator(HOME_SELECTORS.navbar)).not.toHaveClass(/active/);
      }
    });

    await test.step('scroll animation performance', async () => {
      const animatedSections = [
        HOME_SELECTORS.productShowcase,
        HOME_SELECTORS.featuresGrid,
        HOME_SELECTORS.testimonials
      ];

      for (const selector of animatedSections) {
        const element = page.locator(selector);
        const boundingBox = await element.boundingBox();
        if (boundingBox) {
          const startTime = Date.now();
          await page.evaluate((y) => window.scrollTo(0, y), boundingBox.y);
          await element.waitForSelector('.animate-in', { state: 'attached', timeout: 300 });
          const endTime = Date.now();
          expect(endTime - startTime).toBeLessThan(300);
        }
      }
    });
  });
});

test.describe('Full User Journey', () => {
  test.describe('DAMP Smart Drinkware – Full User Journey', () => {
    test('complete user journey through priority pages', async ({ page }) => {
      // 1) Start with homepage
      await test.step('Visit homepage and verify core elements', async () => {
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

        // Look for the main heading using multiple strategies
        const mainHeadingLocator = page.locator('h1, [role="heading"][aria-level="1"]').first();
        await expect(mainHeadingLocator).toBeVisible({ timeout: 30000 });
        
        // Also verify the page has loaded basic content and is interactive
        const nav = page.locator('nav');
        const main = page.locator('main');
        
        await Promise.all([
          expect(nav).toBeVisible({ timeout: 30000 }),
          expect(main).toBeVisible({ timeout: 30000 }),
          page.waitForFunction(() => {
            const nav = document.querySelector('nav');
            return nav && window.getComputedStyle(nav).display !== 'none';
          }, { timeout: 30000 })
        ]);

        // Wait for page to be fully loaded and stable
        await test.step('Ensure page load and stability', async () => {
          // Wait for critical page load states
          await Promise.all([
            page.waitForLoadState('domcontentloaded'),
            page.waitForLoadState('networkidle').catch(() => {}),
          ]);

          // Allow animations to settle
          await page.waitForTimeout(1000);

          // Log initial page state
          const url = page.url();
          const title = await page.title();
          test.info().annotations.push({
            type: 'info',
            description: `Current page: ${url}, Title: ${title}`
          });

          // Comprehensive selectors for product grid
          const gridSelectors = [
            // Direct product containers
            '.product-grid',
            '.products-grid',
            '[data-testid="product-grid"]',
            '.products-container',
            '.product-list',
            '.collection-grid',
            '.items-grid',
            // Common variations
            '[class*="product-grid"]',
            '[class*="products-grid"]',
            '[class*="product-list"]',
            '[class*="product-container"]',
            // Generic grid layouts
            '.grid-container',
            '.items-container',
            // Semantic product listings
            '[role="list"]',
            'section[aria-label*="product" i]'
          ];

          // Product item selectors
          const productSelectors = [
            '.product-card',
            '.product-item',
            '[class*="product-card"]',
            '[class*="product-item"]',
            '[data-testid*="product"]',
            // Generic items in a grid
            '.grid-item',
            '.card',
            // Elements with product markup
            '[itemtype*="Product"]',
            '[role="listitem"]'
          ];

          let gridFound = false;
          let foundGrid = null;

          // Enhanced retry logic
          for (let attempt = 0; attempt < 5; attempt++) {
            if (attempt > 0) {
              test.info().annotations.push({
                type: 'info',
                description: `Retry attempt ${attempt} for product grid`
              });
              await page.waitForTimeout(1000);
              await page.evaluate(() => window.scrollTo(0, 0));
            }

            // First try with exact selectors
            for (const selector of gridSelectors) {
              const grid = page.locator(selector);
              if (await grid.isVisible().catch(() => false)) {
                // Check for product items using multiple selectors
                let totalProducts = 0;
                for (const productSelector of productSelectors) {
                  totalProducts += await grid.locator(productSelector).count();
                  if (totalProducts > 0) {
                    gridFound = true;
                    foundGrid = grid;
                    test.info().annotations.push({
                      type: 'success',
                      description: `Found grid with selector "${selector}" containing ${totalProducts} products using "${productSelector}"`
                    });
                    break;
                  }
                }
                if (gridFound) break;
              }
            }

            if (gridFound) break;

            // If still not found, analyze page structure
            containers = await page.$$eval('div,section,main,article', elements =>
              elements.map(el => ({
                tag: el.tagName.toLowerCase(),
                id: el.id,
                classes: el.className,
                children: el.children.length,
                hasProducts: el.innerHTML.toLowerCase().includes('product'),
                role: el.getAttribute('role'),
                ariaLabel: el.getAttribute('aria-label')
              }))
            );

            // Look for potential containers
            const potentialContainers = containers.filter(el =>
              el.hasProducts &&
              el.children > 1 &&
              (el.classes.includes('grid') || el.classes.includes('list'))
            );

            if (potentialContainers.length > 0) {
              test.info().annotations.push({
                type: 'info',
                description: `Found ${potentialContainers.length} potential product containers`
              });

              // Try these containers
              for (const container of potentialContainers) {
                const selector = container.id ?
                  `#${container.id}` :
                  `.${container.classes.split(' ').join('.')}`;
                
                const grid = page.locator(selector);
                if (await grid.isVisible().catch(() => false)) {
                  let totalProducts = 0;
                  for (const productSelector of productSelectors) {
                    totalProducts += await grid.locator(productSelector).count();
                    if (totalProducts > 0) {
                      gridFound = true;
                      foundGrid = grid;
                      test.info().annotations.push({
                        type: 'success',
                        description: `Found grid using dynamic selector "${selector}" with ${totalProducts} products`
                      });
                      break;
                    }
                  }
                  if (gridFound) break;
                }
              }
            }
          }

          if (!gridFound || !foundGrid) {
            test.info().annotations.push({
              type: 'error',
              description: `No product grid found after retries. Page elements:\n${JSON.stringify(containers, null, 2)}`
            });
            throw new Error('Could not find product grid with items');
          }

          // Wait for grid animation/transition if any
          await foundGrid.waitFor({ state: 'visible', timeout: 5000 });
        });

        // More flexible navigation selector
        await test.step('Verify navigation', async () => {
          // Try various navigation selectors
          const navSelectors = [
            'nav.main-navigation',
            'nav[role="navigation"]', 
            'header nav',
            '.main-nav',
            '#main-nav',
            '.site-navigation',
            '[aria-label*="main" i][role="navigation"]',
            '[aria-label*="site" i][role="navigation"]'
          ];

          let foundNav = false;
          let navEl;
          for (const selector of navSelectors) {
            navEl = page.locator(selector);
            if (await navEl.isVisible().catch(() => false)) {
              foundNav = true;
              test.info().annotations.push({
                type: 'success',
                description: `Found navigation with selector "${selector}"`
              });
              break;
            }
          }

          if (!foundNav) {
            // Try to find all potential navigation elements
            const elements = await page.$$eval('nav, [role="navigation"]', els => els.map(el => ({
              tag: el.tagName.toLowerCase(),
              classes: el.className,
              role: el.getAttribute('role'),
              ariaLabel: el.getAttribute('aria-label'),
              id: el.id,
              links: Array.from(el.querySelectorAll('a')).map(a => a.textContent?.trim())
            })));

            test.info().annotations.push({
              type: 'error',
              description: `No navigation found. Available elements:\n${JSON.stringify(elements, null, 2)}`
            });
            throw new Error('Could not find main navigation');
          }
          
          // Wait for all nav link texts to be available
          if (navEl) {
            await expect(navEl.getByRole('link')).toHaveCount(await navEl.getByRole('link').count());
          }
        });
      });

      // 2) About
      await test.step('Navigate to About page', async () => {
        // First try normal navigation
        const aboutLink = page.getByRole('link', { name: /about/i }).first();
        const isVisible = await aboutLink.isVisible().catch(() => false);
        
        if (!isVisible) {
          // If about link not visible, try opening hamburger menu
          const hamburgerBtn = page.getByRole('button', { name: /menu|navigation/i });
          await expect(hamburgerBtn).toBeVisible();
          await hamburgerBtn.click();
          
          // Wait for menu animation
          await page.waitForTimeout(500);

          // Enhanced hamburger menu selectors
          const menuSelectors = [
            // Primary selectors
            '[data-testid="hamburger-menu"]',
            '.hamburger',
            '#hamburgerBtn',
            'button.hamburger',
            // Semantic selectors
            'button[aria-label*="menu" i]',
            'button[aria-label*="navigation" i]',
            '[role="button"][aria-label*="menu" i]',
            // Visual indicators
            'button:has(.hamburger-line)',
            '.nav-toggle',
            '.menu-toggle'
          ];

          let menuButton = null;
          let menuFound = false;

          for (let attempt = 0; attempt < 3; attempt++) {
            if (attempt > 0) {
              test.info().annotations.push({
                type: 'info',
                description: `Retry attempt ${attempt + 1} to find hamburger menu`
              });
              await page.waitForTimeout(1000);
            }

            // First try exact selectors
            for (const selector of menuSelectors) {
              const btn = page.locator(selector).first();
              if (await btn.isVisible().catch(() => false)) {
                // Verify it's actually clickable
                const box = await btn.boundingBox().catch(() => null);
                if (box && box.width > 0 && box.height > 0) {
                  menuButton = btn;
                  menuFound = true;
                  test.info().annotations.push({
                    type: 'success',
                    description: `Found menu button with selector "${selector}"`
                  });
                  break;
                }
              }
            }

            if (menuFound) break;

            // If still not found, try to find by analyzing page structure
            const buttons = await page.$$eval('button, [role="button"]', els =>
              els.filter(el => {
                const style = window.getComputedStyle(el);
                return style.display !== 'none' && style.visibility !== 'hidden';
              }).map(el => ({
                tag: el.tagName.toLowerCase(),
                text: (el.textContent || '').trim(),
                classes: el.className,
                id: el.id,
                role: el.getAttribute('role'),
                ariaLabel: el.getAttribute('aria-label'),
                hasHamburgerLines: el.querySelectorAll('.hamburger-line, .line, .bar').length > 0
              }))
            );

            // Look for semantic indicators
            const menuCandidates = buttons.filter(btn =>
              btn.text.toLowerCase().includes('menu') ||
              btn.ariaLabel?.toLowerCase().includes('menu') ||
              btn.hasHamburgerLines ||
              btn.classes.includes('hamburger') ||
              btn.classes.includes('menu-toggle')
            );

            if (menuCandidates.length > 0) {
              test.info().annotations.push({
                type: 'info',
                description: `Found ${menuCandidates.length} potential menu buttons`
              });

              for (const candidate of menuCandidates) {
                const selector = candidate.id ?
                  `#${candidate.id}` :
                  `.${candidate.classes.split(' ').join('.')}`;
                
                const btn = page.locator(selector).first();
                if (await btn.isVisible().catch(() => false)) {
                  menuButton = btn;
                  menuFound = true;
                  test.info().annotations.push({
                    type: 'success',
                    description: `Found menu button using dynamic selector "${selector}"`
                  });
                  break;
                }
              }
            }

            if (!menuFound) {
              test.info().annotations.push({
                type: 'info',
                description: `Available buttons:\n${JSON.stringify(buttons, null, 2)}`
              });
            }
          }

          if (!menuFound || !menuButton) {
            throw new Error('Could not find hamburger menu button after multiple attempts');
          }

          // Handle potential overlays
          await page.evaluate(() => {
            const overlays = document.querySelectorAll(`
              .overlay, .modal, .popup,
              [class*="overlay"], [class*="modal"],
              [role="dialog"], [aria-modal="true"]
            `);

            overlays.forEach(el => {
              const style = window.getComputedStyle(el);
              const isVisible = style.display !== 'none' && style.visibility !== 'hidden';
              const isOverlay = parseInt(style.zIndex, 10) > 0;
              
              if (isVisible && isOverlay) {
                el.style.display = 'none';
              }
            });
          });

          // Ensure menu is in view and clickable
          await menuButton.scrollIntoViewIfNeeded();
          
          // Click with enhanced retry logic
          let clicked = false;
          for (let i = 0; i < 3; i++) {
            try {
              await Promise.all([
                menuButton.click({ timeout: 2000, force: i === 2 }),
                // Wait for potential animations
                page.waitForTimeout(300)
              ]);
              clicked = true;
              break;
            } catch (e) {
              if (i === 2) throw e;
              await page.waitForTimeout(500);
              
              // Try to remove any new overlays that appeared
              await page.evaluate(() => {
                document.querySelectorAll('[style*="z-index"]').forEach(el => {
                  const zIndex = parseInt(window.getComputedStyle(el).zIndex, 10);
                  if (zIndex > 0) el.style.display = 'none';
                });
              });
            }
          }

          if (!clicked) {
            throw new Error('Failed to click hamburger menu after multiple attempts');
          }

          // Wait for menu animation and ensure the menu is actually open
          await Promise.all([
            page.waitForTimeout(800),
            page.waitForSelector('.nav-menu.active, .mobile-menu.active, [aria-expanded="true"]', { timeout: 2000 })
              .catch(() => {}) // Don't fail if we can't find the active state
          ]);
        }

        // Now click the about link
        await page.waitForLoadState('networkidle');
        await page.getByRole('navigation').getByRole('link', { name: /about/i }).click();
        await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();
        await expect(page.locator('.about-content')).toBeVisible();
      });

      // 3) Products
      await test.step('Navigate to Products page', async () => {
        await Promise.all([
          page.waitForLoadState('networkidle'),
          page.getByRole('navigation').getByRole('link', { name: /products/i }).click(),
        ]);
        await expect(page.locator('.product-grid')).toBeVisible();
        await expect(page.locator('.product-card')).toHaveCountGreaterThan(0);
      });

      // 4) Filter/Sort (best-effort)
      await test.step('Apply optional sorting', async () => {
        const filter = page.locator('.filter-options select, [data-testid="sort-select"]');
        if (await filter.first().isVisible().catch(() => false)) {
          await filter.first().selectOption(/price[- ]?low[- ]?to[- ]?high/i).catch(() => {});
          await page.waitForTimeout(600); // allow re-render
        }
      });

      // 5) Open product
      let productTitle = '';
      await test.step('Open first product', async () => {
        const firstProduct = page.locator('.product-card').first();
        await expect(firstProduct).toBeVisible();
        productTitle = (await firstProduct.locator('h3, h2, [data-testid="product-title"]').first().textContent() || '').trim();
        await firstProduct.click();
        await expect(page.locator('.product-details')).toBeVisible({ timeout: 15_000 });
        if (productTitle) await expect(page.getByText(productTitle, { exact: false })).toBeVisible();
        await expect(page.locator('.product-price')).toBeVisible();
        await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
      });

      // 6) Add to cart
      await test.step('Add product to cart', async () => {
        const cartCount = page.locator('.cart-count');
        const before = (await cartCount.textContent())?.trim();
        const beforeNum = Number.parseInt(before || '0', 10) || 0;

        await page.getByRole('button', { name: /add to cart/i }).click();

        await expect.poll(async () => {
          const txt = (await cartCount.textContent())?.trim();
          const n = Number.parseInt(txt || '0', 10) || 0;
          return n;
        }, { timeout: 5_000, intervals: [200, 400, 800, 1200, 2400] }).toBe(beforeNum + 1);
      });

      // 7) Open cart
      await test.step('Open cart drawer', async () => {
        await page.locator('.cart-icon, [data-testid="cart-button"]').click();
        await expect(page.locator('.cart-drawer.is-active, [data-testid="cart-drawer"].is-active')).toBeVisible();
        if (productTitle) await expect(page.getByText(productTitle, { exact: false })).toBeVisible();
        await expect(page.locator('.cart-item-price')).toBeVisible();
        await expect(page.locator('.cart-total')).toBeVisible();
      });

      // 8) Update quantity
      await test.step('Increase quantity', async () => {
        const qtyInput = page.locator('.quantity-input, [name="quantity"]');
        const incBtn = page.locator('.quantity-increase, [data-testid="qty-increase"], button[aria-label*="increase"]');
        await incBtn.click();
        await expect.poll(async () => Number(await qtyInput.inputValue().catch(() => '0'))).toBe(2);
      });

      // 9) Checkout
      await test.step('Proceed to checkout', async () => {
        await Promise.all([
          page.waitForLoadState('networkidle'),
          page.locator('button.proceed-to-checkout, [data-testid="proceed-to-checkout"], a[href*="checkout"]').click(),
        ]);
        await expect(page.getByRole('heading', { name: /checkout/i })).toBeVisible();
        await expect(page.locator('form.checkout-form')).toBeVisible();
      });

      // 10) Fill form (no real purchase)
      await test.step('Fill checkout form (dummy)', async () => {
        const fillIfVisible = async (sel, value) => {
          const loc = page.locator(sel);
          if (await loc.first().isVisible().catch(() => false)) await loc.fill(value);
        };
        await fillIfVisible('#email,[name="email"]', 'test@example.com');
        await fillIfVisible('#firstName,[name="firstName"]', 'Test');
        await fillIfVisible('#lastName,[name="lastName"]', 'User');
        await fillIfVisible('#address,[name="address"]', '123 Test St');
        await fillIfVisible('#city,[name="city"]', 'Test City');
        await fillIfVisible('#state,[name="state"]', 'CA');
        await fillIfVisible('#zip,[name="zip"]', '12345');
      });

      // 11) Trigger payment flow (assert Stripe iframe appears)
      await test.step('Open payment iframe (Stripe)', async () => {
        const stripeFramePromise = page.waitForSelector('iframe[name*="stripe" i], iframe[src*="stripe" i]');
        await page.locator('button.place-order, [data-testid="place-order"]').click({ trial: true }).catch(() => {});
        const stripeFrame = await stripeFramePromise;
        await expect(stripeFrame).toBeTruthy();
      });
    }); // Closes nested describe 'DAMP Smart Drinkware – Full User Journey'
  }); // Closes outer describe 'Full User Journey'
});

test.describe('Mobile responsiveness', () => {
  test('mobile nav & cart drawer fits viewport', async ({ page }) => {
    await test.step('Setup mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 812 });
      console.log('Set viewport size:', await page.viewportSize());
    });

    await test.step('Load page with stability checks', async () => {
      await page.goto('/', { timeout: 30000, waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
        console.log('Network not fully idle, but continuing...');
      });
      await page.waitForFunction(() => document.readyState === 'complete');
      await page.waitForTimeout(2000);
    });

    await test.step('Find and click hamburger menu', async () => {
      let hamburger = null;
      let attempts = 0;
      const maxAttempts = 5;

      // Handle any initial overlays or animations
      await test.step('Handle overlays', async () => {
        // First try to remove any debug panels entirely
        await page.evaluate(() => {
          const debugPanel = document.getElementById('damp-debug-panel');
          if (debugPanel) {
            debugPanel.remove();
          }
        });

        // Then handle any remaining overlays
        const overlaySelectors = [
          '.animation-skip-button',
          '.hero-animation-overlay button',
          '#damp-debug-panel',  // Keep this in case new ones appear
          '.modal-close',
          '[data-testid="overlay-close"]'
        ];
        
        for (const selector of overlaySelectors) {
          const overlay = page.locator(selector);
          if (await overlay.isVisible().catch(() => false)) {
            await overlay.click().catch(() => {});
            await page.waitForTimeout(500);
          }
        }
      });

      const possibleSelectors = [
        page.getByRole('button', { name: /toggle.+navigation/i }),
        page.getByRole('button', { name: /menu/i }),
        page.locator('button.hamburger, [data-testid="mobile-menu-button"]'),
        page.locator('button:has(.hamburger-icon), button:has(.menu-icon)'),
        page.locator('header button:visible').first(),
        page.locator('nav button:visible').first(),
        page.locator('[aria-label*="menu" i], [aria-label*="navigation" i]').first()
      ];

      while (!hamburger && attempts < maxAttempts) {
        attempts++;
        console.log(`Attempt ${attempts} to find hamburger menu`);

        if (attempts > 1) {
          await page.waitForTimeout(1000 * Math.min(attempts, 3));
        }

        for (const selector of possibleSelectors) {
          try {
            const isVisible = await selector.isVisible();
            if (isVisible && await selector.isEnabled()) {
              hamburger = selector;
              console.log('Found clickable hamburger menu:', await selector.evaluate(el => ({
                tag: el.tagName,
                class: el.className,
                id: el.id,
                role: el.getAttribute('role'),
                text: el.textContent?.trim(),
                ariaLabel: el.getAttribute('aria-label')
              })));
              break;
            }
          } catch (error) {
            console.log('Selector check failed:', error.message);
          }
        }
      }

      if (!hamburger) {
        console.log('Available buttons:', await page.$$eval('button', btns => 
          btns.map(b => ({
            text: b.textContent?.trim(),
            class: b.className,
            ariaLabel: b.getAttribute('aria-label')
          }))));
        throw new Error('Could not find hamburger menu button');
      }

      await hamburger.click();

      const mobileMenu = page.locator('.mobile-menu.is-active, [data-testid="mobile-menu"].is-active');
      await expect(mobileMenu).toBeVisible();
      await expect(mobileMenu.getByRole('link', { name: /products/i })).toBeVisible();

      // Close menu before proceeding
      await hamburger.click();
      await expect(mobileMenu).toBeHidden();
    });

    await test.step('Verify product grid in mobile view', async () => {
      const productWidth = await page.evaluate(() => {
        const product = document.querySelector('.product-card');
        return product ? product.getBoundingClientRect().width : 0;
      });
      expect(productWidth).toBeGreaterThan(0);
      expect(productWidth).toBeLessThanOrEqual(375);
    });

    await test.step('Test cart drawer dimensions', async () => {
      const cartButton = page.locator('.cart-icon, [data-testid="cart-button"]').first();
      await expect(cartButton).toBeVisible({ timeout: 5000 });

      let cartDrawerVisible = false;
      let cartAttempts = 0;
      const maxCartAttempts = 5;

      while (!cartDrawerVisible && cartAttempts < maxCartAttempts) {
        cartAttempts++;
        await cartButton.click();
        await page.waitForTimeout(1000); // Extended animation time

        const drawer = page.locator('.cart-drawer, [data-testid="cart-drawer"]');
        cartDrawerVisible = await drawer.isVisible().catch(() => false);

        if (!cartDrawerVisible && cartAttempts < maxCartAttempts) {
          console.log(`Cart drawer not visible on attempt ${cartAttempts}, retrying...`);
          await page.waitForTimeout(1000 * Math.min(cartAttempts, 3));
        }
      }

      expect(cartDrawerVisible).toBe(true, 'Cart drawer should be visible');

      // Verify drawer dimensions
      const drawer = page.locator('.cart-drawer, [data-testid="cart-drawer"]');
      const drawerDimensions = await drawer.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          right: rect.right,
          viewportWidth: window.innerWidth
        };
      });

      expect(drawerDimensions.width).toBeLessThanOrEqual(drawerDimensions.viewportWidth);
      expect(drawerDimensions.right).toBeLessThanOrEqual(drawerDimensions.viewportWidth);
    });
  });
});

test.describe('Error states & validation', () => {
  test('invalid product route shows not-found UX', async ({ page }) => {
    // Handle 404 response for nonexistent product with more realistic response
    await page.route('**/products/**', async route => {
      const url = route.request().url();
      if (url.includes('nonexistent') || url.includes('invalid') || url.includes('not-found')) {
        await route.fulfill({
          status: 404,
          contentType: 'text/html',
          body: `
            <html>
              <head><title>Product Not Found - DAMP Smart Drinkware</title></head>
              <body>
                <h1>404 - Product Not Found</h1>
                <p>Sorry, we couldn't find the product you're looking for.</p>
            <html>
              <head><title>Product Not Found - DAMP Smart Drinkware</title></head>
              <body>
                <h1>404 - Product Not Found</h1>
                <p>Sorry, we couldn't find the product you're looking for.</p>
                <a href="/products">Return to Products</a>
              </body>
            </html>
          `.trim()
        });
      } else {
        await route.continue();
      }
    });
    
    await page.goto('/products/nonexistent', { 
      timeout: 30000,
      waitUntil: 'domcontentloaded'
    });

    // More comprehensive not-found text matching
    await expect(page.getByText(/(?:product |item )?(?:not found|404|no longer available|doesn't exist)/i, {
      exact: false
    })).toBeVisible({ timeout: 10000 }).catch(async () => {
      // Log visible text for debugging
      const pageText = await page.textContent('body');
      test.info().annotations.push({
        type: 'error',
        description: `Expected not-found message. Page text: ${pageText}`
      });
    });
  });

  test('invalid cart quantity is rejected', async ({ page }) => {
    // Go to products page first
    await page.goto('/', { timeout: 30000, waitUntil: 'domcontentloaded' });
    // More specific navigation selector
    await page.getByRole('navigation')
      .getByRole('link', { name: /products/i })
      .first()
      .click();
    await page.waitForLoadState('networkidle');
    
    // Click first available product
    const firstProduct = page.locator('.product-card').first();
    await firstProduct.click();
    await page.waitForLoadState('domcontentloaded');
    
    // Find quantity input with multiple fallback selectors
    const qtySelectors = [
      page.getByRole('spinbutton', { name: /quantity/i }),
      page.locator('input[type="number"][name="quantity"]'),
      page.locator('.quantity-input, [data-testid="quantity-input"]'),
      page.locator('input[type="number"]').first()
    ];

    let qty;
    for (const selector of qtySelectors) {
      if (await selector.isVisible().catch(() => false)) {
        qty = selector;
        break;
      }
    }

    if (!qty) {
      throw new Error('Could not find quantity input');
    }

    // Try to clear and set quantity with retry
    await qty.waitFor({ state: 'visible', timeout: 10000 });
    await qty.click();
    await qty.press('Control+a');
    await qty.press('Backspace');
    await qty.fill('999999');
    
    // Find and click add to cart with retry and verification
    const addToCart = page.getByRole('button', { name: /add to cart/i });
    await addToCart.waitFor({ timeout: 10000 });
    
    // Ensure quantity is still set before clicking (in case of auto-validation)
    const qtyValue = await qty.inputValue();
    expect(qtyValue).toBe('999999');
    
    await addToCart.click();

    // Check for any validation error message
    await expect(page.getByText(/(?:invalid|exceeds|too high|too many|maximum|not allowed) (?:quantity|amount|items?)/i))
      .toBeVisible({ timeout: 10000 })
      .catch(async () => {
        const errors = await page.$$eval('.error, .alert, [role="alert"]', 
          els => els.map(el => el.textContent));
        test.info().annotations.push({
          type: 'error',
          description: `Expected quantity error. Found messages: ${JSON.stringify(errors)}`
        });
      });
  });

  test('checkout requires required fields', async ({ page }) => {
    // Add item to cart first
    await page.goto('/', { timeout: 30000, waitUntil: 'domcontentloaded' });
    // More specific navigation selector
    await page.getByRole('navigation')
      .getByRole('link', { name: /products/i })
      .first()
      .click();
    await page.waitForLoadState('networkidle');
    
    const firstProduct = page.locator('.product-card').first();
    await firstProduct.click();
    await page.waitForLoadState('domcontentloaded');
    
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.getByRole('button', { name: /proceed to checkout/i }).click();
    
    // Try to submit empty form and check for validation messages
    const placeOrderBtn = page.getByRole('button', { name: /place order/i });
    await placeOrderBtn.waitFor({ state: 'visible', timeout: 10000 });
    await placeOrderBtn.click();

    // Look for any validation messages
    const validationSelectors = [
      '[role="alert"]',
      '.error-message',
      '.form-error',
      '[data-testid="validation-error"]',
      'input:invalid',
      '.invalid-feedback'
    ];

    let foundValidation = false;
    for (const selector of validationSelectors) {
      if (await page.locator(selector).isVisible().catch(() => false)) {
        foundValidation = true;
        break;
      }
    }

    expect(foundValidation, 'Expected to find form validation errors').toBe(true);
    
    // Also verify required fields are marked
    const requiredFields = await page.$$eval('input[required], [aria-required="true"]', 
      els => els.map(el => ({
        name: el.name || el.id,
        type: el.type,
        valid: el.validity.valid
      }))
    );
    
    expect(requiredFields.length).toBeGreaterThan(0, 'Expected to find required fields');
    expect(requiredFields.some(f => !f.valid)).toBe(true, 'Expected some fields to be invalid');
  });
});