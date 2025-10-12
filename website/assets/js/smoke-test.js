/**
 * DAMP Smart Drinkware - Comprehensive Smoke Test System
 * 
 * Automatically checks pages for common issues and provides detailed reports
 * Enable with: DAMP_SMOKE_TEST.run()
 */

class DAMPSmokeTest {
    constructor() {
        this.results = {
            passed: [],
            warnings: [],
            errors: [],
            info: []
        };
        
        this.tests = [];
        this.logger = window.debugLogger?.createModuleLogger('smoke-test') || console;
        
        this.initTests();
    }
    
    /**
     * Initialize all test suites
     */
    initTests() {
        // Core Infrastructure Tests
        this.addTest('Debug Logger', this.testDebugLogger.bind(this));
        this.addTest('Firebase Services', this.testFirebaseServices.bind(this));
        this.addTest('Auth Service', this.testAuthService.bind(this));
        this.addTest('Analytics', this.testAnalytics.bind(this));
        
        // Page Structure Tests
        this.addTest('Meta Tags', this.testMetaTags.bind(this));
        this.addTest('Images', this.testImages.bind(this));
        this.addTest('Links', this.testLinks.bind(this));
        this.addTest('Forms', this.testForms.bind(this));
        
        // Performance Tests
        this.addTest('Resource Hints', this.testResourceHints.bind(this));
        this.addTest('Lazy Loading', this.testLazyLoading.bind(this));
        this.addTest('Script Loading', this.testScriptLoading.bind(this));
        
        // Security Tests
        this.addTest('CSP', this.testCSP.bind(this));
        this.addTest('HTTPS', this.testHTTPS.bind(this));
        
        // UX Tests
        this.addTest('Accessibility', this.testAccessibility.bind(this));
        this.addTest('Mobile Viewport', this.testMobileViewport.bind(this));
        this.addTest('Navigation', this.testNavigation.bind(this));
    }
    
    addTest(name, testFn) {
        this.tests.push({ name, testFn });
    }
    
    /**
     * Run all smoke tests
     */
    async run() {
        console.log('%c🧪 DAMP Smoke Test Suite', 'font-size: 20px; font-weight: bold; color: #4CAF50');
        console.log('═'.repeat(60));
        console.log(`📄 Page: ${document.title}`);
        console.log(`🔗 URL: ${window.location.href}`);
        console.log(`⏰ Time: ${new Date().toLocaleString()}`);
        console.log('═'.repeat(60));
        
        this.results = { passed: [], warnings: [], errors: [], info: [] };
        
        for (const test of this.tests) {
            try {
                await test.testFn();
            } catch (error) {
                this.addError(test.name, `Test crashed: ${error.message}`);
            }
        }
        
        this.printReport();
        return this.results;
    }
    
    /**
     * Test: Debug Logger
     */
    testDebugLogger() {
        if (!window.debugLogger) {
            this.addError('Debug Logger', 'Debug logger not loaded');
            return;
        }
        
        if (typeof window.DAMP_DEBUG === 'undefined') {
            this.addError('Debug Logger', 'DAMP_DEBUG interface not available');
            return;
        }
        
        this.addPassed('Debug Logger', 'Debug logger loaded and functional');
        this.addInfo('Debug Logger', `Status: ${localStorage.getItem('DAMP_DEBUG') || 'disabled'}`);
    }
    
    /**
     * Test: Firebase Services
     */
    async testFirebaseServices() {
        if (!window.firebaseServices) {
            this.addWarning('Firebase', 'Firebase services not initialized yet');
            return;
        }
        
        if (!window.firebaseServices.authService) {
            this.addError('Firebase', 'Auth service not available');
            return;
        }
        
        this.addPassed('Firebase', 'Firebase services initialized');
    }
    
    /**
     * Test: Auth Service
     */
    testAuthService() {
        if (!window.firebaseServices?.authService) {
            this.addWarning('Auth Service', 'Not yet loaded');
            return;
        }
        
        const authService = window.firebaseServices.authService;
        const currentUser = authService.currentUser;
        
        if (currentUser) {
            this.addPassed('Auth Service', `User signed in: ${currentUser.email}`);
        } else {
            this.addInfo('Auth Service', 'No user signed in (expected for public pages)');
        }
    }
    
    /**
     * Test: Analytics
     */
    testAnalytics() {
        if (typeof gtag === 'undefined') {
            this.addWarning('Analytics', 'Google Analytics not loaded');
            return;
        }
        
        this.addPassed('Analytics', 'GA4 available');
    }
    
    /**
     * Test: Meta Tags
     */
    testMetaTags() {
        const requiredMeta = [
            { name: 'viewport', reason: 'Mobile responsiveness' },
            { name: 'description', reason: 'SEO' },
            { property: 'og:title', reason: 'Social sharing' },
            { property: 'og:description', reason: 'Social sharing' }
        ];
        
        let missing = [];
        
        for (const meta of requiredMeta) {
            const selector = meta.name ? `meta[name="${meta.name}"]` : `meta[property="${meta.property}"]`;
            if (!document.querySelector(selector)) {
                missing.push(`${meta.name || meta.property} (${meta.reason})`);
            }
        }
        
        if (missing.length > 0) {
            this.addWarning('Meta Tags', `Missing: ${missing.join(', ')}`);
        } else {
            this.addPassed('Meta Tags', 'All essential meta tags present');
        }
    }
    
    /**
     * Test: Images
     */
    testImages() {
        const images = document.querySelectorAll('img');
        const issues = [];
        
        images.forEach((img, index) => {
            // Check for alt text
            if (!img.alt) {
                issues.push(`Image #${index + 1} missing alt text`);
            }
            
            // Check for lazy loading on non-critical images
            if (!img.loading && index > 2) {
                issues.push(`Image #${index + 1} not using lazy loading`);
            }
            
            // Check if image has loaded
            if (!img.complete && img.naturalHeight === 0) {
                issues.push(`Image #${index + 1} may have failed to load: ${img.src}`);
            }
        });
        
        if (issues.length > 0) {
            this.addWarning('Images', issues.join('; '));
        } else {
            this.addPassed('Images', `All ${images.length} images OK`);
        }
        
        // Check for optimized images
        const optimizedImages = Array.from(images).filter(img => 
            img.src.includes('/optimized/') || img.closest('picture')
        );
        
        this.addInfo('Images', `${optimizedImages.length}/${images.length} using optimized formats`);
    }
    
    /**
     * Test: Links
     */
    testLinks() {
        const links = document.querySelectorAll('a[href]');
        const broken = [];
        const external = [];
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            
            // Check for broken links
            if (href === '#' && !link.onclick) {
                broken.push(link.textContent || 'unnamed link');
            }
            
            // Check external links
            if (href && (href.startsWith('http://') || href.startsWith('https://')) && !href.includes(window.location.hostname)) {
                if (!link.rel || !link.rel.includes('noopener')) {
                    external.push(href);
                }
            }
        });
        
        if (broken.length > 0) {
            this.addWarning('Links', `${broken.length} placeholder links found`);
        }
        
        if (external.length > 0) {
            this.addInfo('Links', `${external.length} external links (consider adding rel="noopener")`);
        }
        
        if (broken.length === 0) {
            this.addPassed('Links', `${links.length} links checked`);
        }
    }
    
    /**
     * Test: Forms
     */
    testForms() {
        const forms = document.querySelectorAll('form');
        
        if (forms.length === 0) {
            this.addInfo('Forms', 'No forms on this page');
            return;
        }
        
        forms.forEach((form, index) => {
            // Check for submit handler
            if (!form.onsubmit && !form.getAttribute('action')) {
                this.addWarning('Forms', `Form #${index + 1} has no submit handler or action`);
            }
            
            // Check inputs for labels
            const inputs = form.querySelectorAll('input:not([type="hidden"]):not([type="submit"])');
            inputs.forEach(input => {
                if (!input.id || !form.querySelector(`label[for="${input.id}"]`)) {
                    this.addWarning('Forms', `Input missing associated label: ${input.name || input.type}`);
                }
            });
        });
        
        this.addPassed('Forms', `${forms.length} form(s) checked`);
    }
    
    /**
     * Test: Resource Hints
     */
    testResourceHints() {
        const preconnects = document.querySelectorAll('link[rel="preconnect"]');
        const dnsPrefetch = document.querySelectorAll('link[rel="dns-prefetch"]');
        
        const total = preconnects.length + dnsPrefetch.length;
        
        if (total === 0) {
            this.addWarning('Resource Hints', 'No resource hints found');
        } else {
            this.addPassed('Resource Hints', `${total} hints configured (${preconnects.length} preconnect, ${dnsPrefetch.length} dns-prefetch)`);
        }
    }
    
    /**
     * Test: Lazy Loading
     */
    testLazyLoading() {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        const totalImages = document.querySelectorAll('img').length;
        
        if (totalImages > 3 && lazyImages.length === 0) {
            this.addWarning('Lazy Loading', 'Page has images but none are lazy loaded');
        } else if (lazyImages.length > 0) {
            this.addPassed('Lazy Loading', `${lazyImages.length}/${totalImages} images use lazy loading`);
        }
    }
    
    /**
     * Test: Script Loading
     */
    testScriptLoading() {
        const scripts = document.querySelectorAll('script[src]');
        const deferred = document.querySelectorAll('script[defer], script[async]');
        
        const blockingScripts = Array.from(scripts).filter(script => 
            !script.defer && !script.async && !script.type?.includes('module')
        );
        
        if (blockingScripts.length > 0) {
            this.addWarning('Scripts', `${blockingScripts.length} blocking scripts detected`);
        } else {
            this.addPassed('Scripts', 'All scripts are deferred/async or modules');
        }
        
        this.addInfo('Scripts', `${scripts.length} total, ${deferred.length} deferred/async`);
    }
    
    /**
     * Test: CSP
     */
    testCSP() {
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        
        if (cspMeta) {
            this.addPassed('CSP', 'Content Security Policy defined');
        } else {
            this.addInfo('CSP', 'CSP likely set via HTTP headers (recommended)');
        }
    }
    
    /**
     * Test: HTTPS
     */
    testHTTPS() {
        if (window.location.protocol === 'https:') {
            this.addPassed('HTTPS', 'Page served over HTTPS');
        } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.addInfo('HTTPS', 'Local development (HTTP OK)');
        } else {
            this.addError('HTTPS', 'Page not served over HTTPS');
        }
    }
    
    /**
     * Test: Accessibility
     */
    testAccessibility() {
        const issues = [];
        
        // Check for skip links
        const skipLinks = document.querySelectorAll('a[href^="#"][class*="skip"]');
        if (skipLinks.length === 0) {
            issues.push('No skip navigation link found');
        }
        
        // Check for main landmark
        if (!document.querySelector('main')) {
            issues.push('No <main> landmark');
        }
        
        // Check for heading hierarchy
        const h1s = document.querySelectorAll('h1');
        if (h1s.length === 0) {
            issues.push('No h1 heading');
        } else if (h1s.length > 1) {
            issues.push(`Multiple h1 headings (${h1s.length})`);
        }
        
        if (issues.length > 0) {
            this.addWarning('Accessibility', issues.join('; '));
        } else {
            this.addPassed('Accessibility', 'Basic accessibility checks passed');
        }
    }
    
    /**
     * Test: Mobile Viewport
     */
    testMobileViewport() {
        const viewport = document.querySelector('meta[name="viewport"]');
        
        if (!viewport) {
            this.addError('Mobile Viewport', 'No viewport meta tag');
            return;
        }
        
        const content = viewport.getAttribute('content');
        if (content.includes('width=device-width')) {
            this.addPassed('Mobile Viewport', 'Properly configured');
        } else {
            this.addWarning('Mobile Viewport', 'May not be responsive');
        }
    }
    
    /**
     * Test: Navigation
     */
    testNavigation() {
        const nav = document.querySelector('nav, header nav, [role="navigation"]');
        
        if (!nav) {
            this.addWarning('Navigation', 'No navigation element found');
            return;
        }
        
        const links = nav.querySelectorAll('a');
        if (links.length === 0) {
            this.addWarning('Navigation', 'Navigation has no links');
        } else {
            this.addPassed('Navigation', `${links.length} navigation links found`);
        }
    }
    
    /**
     * Add test results
     */
    addPassed(test, message) {
        this.results.passed.push({ test, message });
    }
    
    addWarning(test, message) {
        this.results.warnings.push({ test, message });
    }
    
    addError(test, message) {
        this.results.errors.push({ test, message });
    }
    
    addInfo(test, message) {
        this.results.info.push({ test, message });
    }
    
    /**
     * Print comprehensive report
     */
    printReport() {
        console.log('\n' + '═'.repeat(60));
        console.log('%c📊 SMOKE TEST RESULTS', 'font-size: 18px; font-weight: bold; color: #2196F3');
        console.log('═'.repeat(60));
        
        // Summary
        const total = this.results.passed.length + this.results.warnings.length + this.results.errors.length;
        const score = Math.round((this.results.passed.length / total) * 100);
        
        console.log(`\n📈 Score: ${score}% (${this.results.passed.length}/${total} passed)`);
        console.log(`✅ Passed: ${this.results.passed.length}`);
        console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
        console.log(`❌ Errors: ${this.results.errors.length}`);
        console.log(`ℹ️  Info: ${this.results.info.length}`);
        
        // Errors
        if (this.results.errors.length > 0) {
            console.log('\n%c❌ ERRORS', 'color: #f44336; font-weight: bold');
            this.results.errors.forEach(({ test, message }) => {
                console.log(`  ❌ ${test}: ${message}`);
            });
        }
        
        // Warnings
        if (this.results.warnings.length > 0) {
            console.log('\n%c⚠️  WARNINGS', 'color: #ff9800; font-weight: bold');
            this.results.warnings.forEach(({ test, message }) => {
                console.log(`  ⚠️  ${test}: ${message}`);
            });
        }
        
        // Passed
        if (this.results.passed.length > 0) {
            console.log('\n%c✅ PASSED', 'color: #4CAF50; font-weight: bold');
            this.results.passed.forEach(({ test, message }) => {
                console.log(`  ✅ ${test}: ${message}`);
            });
        }
        
        // Info
        if (this.results.info.length > 0) {
            console.log('\n%cℹ️  INFORMATION', 'color: #2196F3; font-weight: bold');
            this.results.info.forEach(({ test, message }) => {
                console.log(`  ℹ️  ${test}: ${message}`);
            });
        }
        
        console.log('\n' + '═'.repeat(60));
        
        // Recommendations
        if (this.results.errors.length > 0 || this.results.warnings.length > 0) {
            console.log('\n💡 RECOMMENDATIONS');
            console.log('─'.repeat(60));
            
            if (this.results.errors.length > 0) {
                console.log('🔴 Fix errors immediately - they may break functionality');
            }
            
            if (this.results.warnings.length > 0) {
                console.log('🟡 Review warnings - they may affect performance or UX');
            }
            
            console.log('\n📖 Run DAMP_DEBUG.enable() for detailed debugging');
            console.log('🧪 Run DAMP_SMOKE_TEST.run() again after fixes');
        } else {
            console.log('\n%c🎉 ALL TESTS PASSED!', 'font-size: 16px; color: #4CAF50; font-weight: bold');
        }
        
        console.log('\n' + '═'.repeat(60));
    }
}

// Create global instance
const smokeTest = new DAMPSmokeTest();

// Make available globally
window.DAMP_SMOKE_TEST = {
    run: () => smokeTest.run(),
    results: () => smokeTest.results,
    quick: () => {
        console.log('🚀 Running quick smoke test...');
        return smokeTest.run();
    }
};

// Auto-run on page load if enabled
if (localStorage.getItem('DAMP_AUTO_SMOKE_TEST') === 'true') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => smokeTest.run(), 2000);
        });
    } else {
        setTimeout(() => smokeTest.run(), 2000);
    }
}

// Log initialization
console.log('🧪 DAMP Smoke Test loaded. Run DAMP_SMOKE_TEST.run() to test this page');

