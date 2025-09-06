/**
 * 🍔 DAMP Smart Drinkware - Hamburger Menu Verification
 * Comprehensive test for mobile and desktop hamburger menu functionality
 * Following user preferences for clean, well-organized code [[memory:2828105]]
 */

const fs = require('fs').promises;
const path = require('path');

console.log('🍔 DAMP Smart Drinkware - Hamburger Menu Analysis');
console.log('================================================');
console.log('🎯 Testing hamburger menu functionality across all devices');
console.log('📱 Verifying responsive behavior and navigation links');
console.log('================================================\n');

/**
 * Test Results Storage
 */
const testResults = {
    hamburgerImplementation: false,
    mobileMenuStructure: false,
    responsiveCSS: false,
    navigationLinks: [],
    brokenLinks: [],
    deviceBreakpoints: [],
    jsEventHandlers: false,
    accessibility: false,
    touchSupport: false,
    keyboardSupport: false,
    issues: [],
    recommendations: []
};

/**
 * Expected Navigation Structure
 */
const expectedPages = {
    primary: [
        'index.html',
        'pages/how-it-works.html',
        'pages/products.html',
        'pages/about.html',
        'pages/support.html'
    ],
    products: [
        'pages/damp-handle-v1.0.html',
        'pages/silicone-bottom.html',
        'pages/cup-sleeve.html',
        'pages/baby-bottle.html'
    ],
    actions: [
        'pages/pre-sale-funnel.html',
        'pages/product-voting.html',
        'pages/cart.html',
        'pages/auth.html'
    ],
    user: [
        'pages/profile.html',
        'pages/orders.html',
        'pages/devices.html',
        'pages/dashboard.html'
    ]
};

/**
 * Device Breakpoints to Test
 */
const deviceBreakpoints = {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    large: '1200px'
};

/**
 * Utility Functions
 */
function logStep(step, status = 'info') {
    const icons = { info: '📋', success: '✅', error: '❌', warning: '⚠️' };
    console.log(`${icons[status]} ${step}`);
}

function logError(error, context = '') {
    console.error(`❌ Error ${context}:`, error.message);
    testResults.issues.push(`${context}: ${error.message}`);
}

function logRecommendation(recommendation) {
    console.log(`💡 Recommendation: ${recommendation}`);
    testResults.recommendations.push(recommendation);
}

/**
 * Test Hamburger Menu Implementation
 */
async function testHamburgerImplementation() {
    logStep('Testing Hamburger Menu Implementation');
    
    try {
        const headerFile = 'website/assets/js/components/header.js';
        const content = await fs.readFile(headerFile, 'utf8');
        
        // Check for hamburger button structure
        const hasHamburgerButton = /class="hamburger"/.test(content);
        const hasHamburgerLines = /hamburger-line/.test(content);
        const hasClickHandler = /hamburger.*click|toggleMobileMenu/.test(content);
        
        if (hasHamburgerButton && hasHamburgerLines && hasClickHandler) {
            testResults.hamburgerImplementation = true;
            logStep('Hamburger button implementation found', 'success');
        } else {
            logError(new Error('Incomplete hamburger implementation'), 'Hamburger Button');
            if (!hasHamburgerButton) logRecommendation('Add hamburger button with proper class');
            if (!hasHamburgerLines) logRecommendation('Add hamburger line elements');
            if (!hasClickHandler) logRecommendation('Add click event handler');
        }
        
        // Check for mobile menu structure
        const hasMobileMenu = /mobile-menu/.test(content);
        const hasMenuSections = /mobile-nav-section/.test(content);
        const hasCloseButton = /mobile-close/.test(content);
        
        if (hasMobileMenu && hasMenuSections && hasCloseButton) {
            testResults.mobileMenuStructure = true;
            logStep('Mobile menu structure complete', 'success');
        } else {
            logError(new Error('Incomplete mobile menu structure'), 'Mobile Menu');
        }
        
        return true;
        
    } catch (error) {
        logError(error, 'Hamburger Implementation');
        return false;
    }
}

/**
 * Test Responsive CSS
 */
async function testResponsiveCSS() {
    logStep('Testing Responsive CSS');
    
    try {
        const cssFile = 'website/assets/css/navigation.css';
        const content = await fs.readFile(cssFile, 'utf8');
        
        // Check for responsive breakpoints
        const breakpointPattern = /@media[^{]*\([^)]*width[^)]*\)[^{]*{/g;
        const breakpoints = content.match(breakpointPattern) || [];
        
        testResults.deviceBreakpoints = breakpoints.map(bp => {
            const widthMatch = bp.match(/(\d+)px/);
            return widthMatch ? widthMatch[1] + 'px' : bp;
        });
        
        if (breakpoints.length >= 2) {
            testResults.responsiveCSS = true;
            logStep(`Found ${breakpoints.length} responsive breakpoints`, 'success');
        } else {
            logError(new Error('Insufficient responsive breakpoints'), 'Responsive CSS');
            logRecommendation('Add breakpoints for mobile (768px) and tablet (1024px)');
        }
        
        // Check for hamburger visibility controls
        const hasHamburgerDisplay = /\.hamburger\s*{[^}]*display\s*:\s*flex/.test(content);
        const hasNavLinksHidden = /\.nav-links\s*{[^}]*display\s*:\s*none/.test(content);
        
        if (hasHamburgerDisplay && hasNavLinksHidden) {
            logStep('Hamburger visibility controls found', 'success');
        } else {
            logStep('Hamburger visibility controls missing', 'warning');
            logRecommendation('Ensure hamburger shows and nav-links hide on mobile');
        }
        
        return true;
        
    } catch (error) {
        logError(error, 'Responsive CSS');
        return false;
    }
}

/**
 * Test Navigation Links
 */
async function testNavigationLinks() {
    logStep('Testing Navigation Links');
    
    try {
        const headerFile = 'website/assets/js/components/header.js';
        const content = await fs.readFile(headerFile, 'utf8');
        
        // Extract all href attributes
        const hrefPattern = /href="([^"]+)"/g;
        const links = [];
        let match;
        
        while ((match = hrefPattern.exec(content)) !== null) {
            const href = match[1];
            if (href.includes('.html') || href.startsWith('pages/')) {
                links.push(href);
            }
        }
        
        testResults.navigationLinks = [...new Set(links)]; // Remove duplicates
        
        // Check if files exist
        for (const link of testResults.navigationLinks) {
            let filePath = link;
            
            // Handle relative paths
            if (link.startsWith('../')) {
                filePath = link.replace('../', '');
            }
            if (!filePath.startsWith('website/')) {
                filePath = path.join('website', filePath);
            }
            
            try {
                await fs.access(filePath);
                logStep(`✅ Link exists: ${link}`, 'success');
            } catch {
                testResults.brokenLinks.push(link);
                logStep(`❌ Broken link: ${link}`, 'error');
            }
        }
        
        // Check for expected pages
        const allExpectedPages = [
            ...expectedPages.primary,
            ...expectedPages.products,
            ...expectedPages.actions,
            ...expectedPages.user
        ];
        
        const missingPages = allExpectedPages.filter(page => {
            return !testResults.navigationLinks.some(link => 
                link.includes(page.replace('pages/', ''))
            );
        });
        
        if (missingPages.length > 0) {
            logStep(`Missing navigation links: ${missingPages.length}`, 'warning');
            missingPages.forEach(page => {
                logRecommendation(`Add navigation link for ${page}`);
            });
        }
        
        return true;
        
    } catch (error) {
        logError(error, 'Navigation Links');
        return false;
    }
}

/**
 * Test JavaScript Event Handlers
 */
async function testJavaScriptHandlers() {
    logStep('Testing JavaScript Event Handlers');
    
    try {
        const files = [
            'website/assets/js/components/header.js',
            'website/assets/js/navigation.js',
            'website/assets/js/scripts.js'
        ];
        
        let eventHandlersFound = 0;
        let touchSupportFound = false;
        let keyboardSupportFound = false;
        
        for (const file of files) {
            try {
                const content = await fs.readFile(file, 'utf8');
                
                // Check for event handlers
                const clickHandlers = (content.match(/addEventListener.*click|onclick/g) || []).length;
                const touchHandlers = (content.match(/addEventListener.*touch|ontouchstart|touchstart|touchend/g) || []).length;
                const keyHandlers = (content.match(/addEventListener.*key|onkeydown/g) || []).length;
                
                eventHandlersFound += clickHandlers;
                if (touchHandlers > 0) touchSupportFound = true;
                if (keyHandlers > 0) keyboardSupportFound = true;
                
                if (clickHandlers > 0) {
                    logStep(`Found ${clickHandlers} click handlers in ${path.basename(file)}`, 'success');
                }
                
            } catch (error) {
                // File doesn't exist, skip
            }
        }
        
        testResults.jsEventHandlers = eventHandlersFound > 0;
        testResults.touchSupport = touchSupportFound;
        testResults.keyboardSupport = keyboardSupportFound;
        
        if (eventHandlersFound > 0) {
            logStep(`Total event handlers found: ${eventHandlersFound}`, 'success');
        } else {
            logError(new Error('No event handlers found'), 'JavaScript Handlers');
        }
        
        if (touchSupportFound) {
            logStep('Touch event support found', 'success');
        } else {
            logRecommendation('Add touch event support for better mobile experience');
        }
        
        if (keyboardSupportFound) {
            logStep('Keyboard event support found', 'success');
        } else {
            logRecommendation('Add keyboard support (Escape key to close menu)');
        }
        
        return true;
        
    } catch (error) {
        logError(error, 'JavaScript Handlers');
        return false;
    }
}

/**
 * Test Accessibility Features
 */
async function testAccessibility() {
    logStep('Testing Accessibility Features');
    
    try {
        const headerFile = 'website/assets/js/components/header.js';
        const content = await fs.readFile(headerFile, 'utf8');
        
        // Check for ARIA attributes
        const ariaLabels = (content.match(/aria-label/g) || []).length;
        const ariaExpanded = (content.match(/aria-expanded/g) || []).length;
        const ariaControls = (content.match(/aria-controls/g) || []).length;
        const roleAttributes = (content.match(/role="/g) || []).length;
        
        const accessibilityScore = ariaLabels + ariaExpanded + ariaControls + roleAttributes;
        
        if (accessibilityScore >= 4) {
            testResults.accessibility = true;
            logStep(`Accessibility features found: ${accessibilityScore} attributes`, 'success');
        } else {
            logStep(`Limited accessibility: ${accessibilityScore} attributes`, 'warning');
            logRecommendation('Add more ARIA attributes for better accessibility');
        }
        
        // Check for screen reader support
        const screenReaderSupport = /sr-only|screen-reader/.test(content);
        if (screenReaderSupport) {
            logStep('Screen reader support found', 'success');
        } else {
            logRecommendation('Add screen reader only text for better accessibility');
        }
        
        return true;
        
    } catch (error) {
        logError(error, 'Accessibility Testing');
        return false;
    }
}

/**
 * Generate Comprehensive Report
 */
function generateReport() {
    console.log('\n📋 HAMBURGER MENU VERIFICATION REPORT');
    console.log('=====================================\n');
    
    // Test Results Summary
    console.log('🧪 TEST RESULTS SUMMARY');
    console.log('=======================');
    console.log(`Hamburger Implementation: ${testResults.hamburgerImplementation ? '✅' : '❌'}`);
    console.log(`Mobile Menu Structure: ${testResults.mobileMenuStructure ? '✅' : '❌'}`);
    console.log(`Responsive CSS: ${testResults.responsiveCSS ? '✅' : '❌'}`);
    console.log(`JavaScript Handlers: ${testResults.jsEventHandlers ? '✅' : '❌'}`);
    console.log(`Touch Support: ${testResults.touchSupport ? '✅' : '❌'}`);
    console.log(`Keyboard Support: ${testResults.keyboardSupport ? '✅' : '❌'}`);
    console.log(`Accessibility: ${testResults.accessibility ? '✅' : '❌'}`);
    
    // Navigation Analysis
    console.log('\n🔗 NAVIGATION ANALYSIS');
    console.log('======================');
    console.log(`Total Navigation Links: ${testResults.navigationLinks.length}`);
    console.log(`Broken Links: ${testResults.brokenLinks.length}`);
    console.log(`Responsive Breakpoints: ${testResults.deviceBreakpoints.length}`);
    
    if (testResults.brokenLinks.length > 0) {
        console.log('\n❌ BROKEN LINKS:');
        testResults.brokenLinks.forEach(link => {
            console.log(`  - ${link}`);
        });
    }
    
    if (testResults.deviceBreakpoints.length > 0) {
        console.log('\n📱 RESPONSIVE BREAKPOINTS:');
        testResults.deviceBreakpoints.forEach(bp => {
            console.log(`  - ${bp}`);
        });
    }
    
    // Calculate overall score
    const totalTests = 7; // Number of main test categories
    const passedTests = [
        testResults.hamburgerImplementation,
        testResults.mobileMenuStructure,
        testResults.responsiveCSS,
        testResults.jsEventHandlers,
        testResults.touchSupport,
        testResults.keyboardSupport,
        testResults.accessibility
    ].filter(result => result === true).length;
    
    const overallScore = Math.round((passedTests / totalTests) * 100);
    
    console.log('\n🎯 OVERALL ASSESSMENT');
    console.log('====================');
    console.log(`Tests Passed: ${passedTests}/${totalTests}`);
    console.log(`Menu Functionality Score: ${overallScore}%`);
    
    // Issues and Recommendations
    if (testResults.issues.length > 0) {
        console.log('\n⚠️ ISSUES FOUND');
        console.log('===============');
        testResults.issues.forEach((issue, index) => {
            console.log(`${index + 1}. ${issue}`);
        });
    }
    
    if (testResults.recommendations.length > 0) {
        console.log('\n💡 RECOMMENDATIONS');
        console.log('==================');
        testResults.recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. ${rec}`);
        });
    }
    
    // Final Assessment
    console.log('\n🏁 FINAL ASSESSMENT');
    console.log('==================');
    
    if (overallScore >= 90) {
        console.log('🎉 EXCELLENT: Hamburger menu is fully functional!');
        console.log('✅ All major components working correctly.');
        console.log('📱 Ready for all device sizes.');
    } else if (overallScore >= 75) {
        console.log('✅ GOOD: Hamburger menu is mostly functional.');
        console.log('🔧 Minor improvements recommended.');
        console.log('📋 Address issues above for optimal experience.');
    } else if (overallScore >= 60) {
        console.log('⚠️ NEEDS WORK: Several menu issues found.');
        console.log('🛠️ Focus on critical functionality first.');
        console.log('📋 Review recommendations above.');
    } else {
        console.log('❌ CRITICAL: Major menu issues detected.');
        console.log('🚨 Immediate fixes required.');
        console.log('📞 Consider reviewing entire navigation system.');
    }
    
    // Device-Specific Recommendations
    console.log('\n📱 DEVICE-SPECIFIC STATUS');
    console.log('========================');
    console.log('Mobile (< 768px): ', testResults.responsiveCSS && testResults.touchSupport ? '✅ Ready' : '⚠️ Needs work');
    console.log('Tablet (768-1024px): ', testResults.responsiveCSS ? '✅ Ready' : '⚠️ Needs work');
    console.log('Desktop (> 1024px): ', testResults.hamburgerImplementation ? '✅ Ready' : '⚠️ Needs work');
    
    return overallScore >= 75;
}

/**
 * Save Test Results
 */
async function saveResults() {
    const reportData = {
        timestamp: new Date().toISOString(),
        testResults,
        summary: {
            totalTests: 7,
            passedTests: [
                testResults.hamburgerImplementation,
                testResults.mobileMenuStructure,
                testResults.responsiveCSS,
                testResults.jsEventHandlers,
                testResults.touchSupport,
                testResults.keyboardSupport,
                testResults.accessibility
            ].filter(result => result === true).length,
            navigationLinks: testResults.navigationLinks.length,
            brokenLinks: testResults.brokenLinks.length
        }
    };
    
    try {
        await fs.writeFile(
            'hamburger-menu-test-report.json', 
            JSON.stringify(reportData, null, 2)
        );
        logStep('Test report saved to hamburger-menu-test-report.json', 'success');
    } catch (error) {
        logError(error, 'Saving Report');
    }
}

/**
 * Main Test Function
 */
async function runHamburgerMenuTest() {
    logStep('🚀 Starting Hamburger Menu Testing...\n');
    
    try {
        await testHamburgerImplementation();
        console.log();
        
        await testResponsiveCSS();
        console.log();
        
        await testNavigationLinks();
        console.log();
        
        await testJavaScriptHandlers();
        console.log();
        
        await testAccessibility();
        console.log();
        
        const success = generateReport();
        
        await saveResults();
        
        console.log('\n🏁 TESTING COMPLETE');
        console.log('===================');
        
        if (success) {
            console.log('🎊 SUCCESS: Hamburger menu is functional!');
            console.log('📱 Ready for all device sizes.');
            console.log('🔗 Navigation links properly organized.');
        } else {
            console.log('📝 REVIEW NEEDED: Menu requires attention.');
            console.log('🔧 Please address the issues and recommendations above.');
        }
        
        return success;
        
    } catch (error) {
        logError(error, 'Main Test');
        return false;
    }
}

// Export for use in other scripts
module.exports = {
    runHamburgerMenuTest,
    testResults,
    expectedPages,
    deviceBreakpoints
};

// Run test if this script is executed directly
if (require.main === module) {
    runHamburgerMenuTest().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('💥 Testing failed:', error);
        process.exit(1);
    });
}
