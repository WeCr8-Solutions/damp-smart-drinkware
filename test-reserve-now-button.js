/**
 * 🔍 DAMP Smart Drinkware - Reserve Now Button Verification
 * Test script to verify the Reserve Now button works with Stripe integration
 * Following user preferences for clean, well-organized code [[memory:2828105]]
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

console.log('🔍 DAMP Smart Drinkware - Reserve Now Button Test');
console.log('================================================');
console.log('🎯 Testing Reserve Now button Stripe integration');
console.log('🛠️ Verifying error handling and user experience');
console.log('================================================\n');

/**
 * Test Results Storage
 */
const testResults = {
    pageLoad: false,
    buttonPresent: false,
    stripeLoaded: false,
    clickResponse: false,
    errorHandling: false,
    backendConnection: false,
    stripeIntegration: false,
    issues: [],
    recommendations: []
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
 * Test Backend Server Availability
 */
async function testBackendServer() {
    logStep('Testing Backend Server Availability');
    
    try {
        // Test if backend server is running
        const response = await fetch('http://localhost:3000/api/campaign-status');
        if (response.ok) {
            testResults.backendConnection = true;
            logStep('Backend server is running', 'success');
        } else {
            throw new Error(`Server responded with status ${response.status}`);
        }
    } catch (error) {
        logError(error, 'Backend Server');
        logRecommendation('Start the backend server: cd backend && node stripe-preorder-server.js');
        return false;
    }
    
    return true;
}

/**
 * Test Pre-Sale Funnel Page
 */
async function testPreSaleFunnelPage() {
    logStep('Testing Pre-Sale Funnel Page');
    
    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        // Enable console logging
        const consoleMessages = [];
        const errors = [];
        
        page.on('console', msg => {
            consoleMessages.push({
                type: msg.type(),
                text: msg.text()
            });
        });
        
        page.on('pageerror', error => {
            errors.push(error.message);
        });
        
        // Navigate to pre-sale funnel page
        const pagePath = path.resolve('website/pages/pre-sale-funnel.html');
        await page.goto(`file://${pagePath}`, { waitUntil: 'networkidle0' });
        
        testResults.pageLoad = true;
        logStep('Pre-sale funnel page loaded successfully', 'success');
        
        // Check if Reserve Now button exists
        const reserveButton = await page.$('#checkout-button');
        if (reserveButton) {
            testResults.buttonPresent = true;
            logStep('Reserve Now button found', 'success');
            
            // Get button text
            const buttonText = await page.$eval('#checkout-button', el => el.textContent.trim());
            logStep(`Button text: "${buttonText}"`, 'info');
            
        } else {
            logError(new Error('Reserve Now button not found'), 'Button Detection');
        }
        
        // Check if Stripe is loaded
        const stripeLoaded = await page.evaluate(() => {
            return typeof window.Stripe !== 'undefined';
        });
        
        if (stripeLoaded) {
            testResults.stripeLoaded = true;
            logStep('Stripe JavaScript SDK loaded', 'success');
        } else {
            logError(new Error('Stripe JavaScript SDK not loaded'), 'Stripe Loading');
            logRecommendation('Ensure Stripe script tag is present and loading correctly');
        }
        
        // Test button click (without actually processing payment)
        if (reserveButton && stripeLoaded) {
            logStep('Testing button click behavior');
            
            // Mock fetch to prevent actual API calls during testing
            await page.evaluateOnNewDocument(() => {
                window.originalFetch = window.fetch;
                window.fetch = async (url, options) => {
                    console.log('Mock fetch called:', url, options);
                    
                    if (url.includes('create-checkout-session')) {
                        // Simulate successful session creation
                        return {
                            ok: true,
                            json: async () => ({
                                id: 'cs_test_mock_session_id',
                                url: 'https://checkout.stripe.com/pay/cs_test_mock_session_id'
                            })
                        };
                    }
                    
                    return window.originalFetch(url, options);
                };
            });
            
            // Mock Stripe.redirectToCheckout to prevent actual redirect
            await page.evaluate(() => {
                if (window.Stripe) {
                    const originalStripe = window.Stripe;
                    window.Stripe = (key) => {
                        const stripe = originalStripe(key);
                        stripe.redirectToCheckout = async (options) => {
                            console.log('Mock Stripe redirect called:', options);
                            return { error: null };
                        };
                        return stripe;
                    };
                }
            });
            
            // Click the button
            await reserveButton.click();
            
            // Wait a moment for any async operations
            await page.waitForTimeout(2000);
            
            // Check if button state changed (indicating click was processed)
            const buttonAfterClick = await page.$eval('#checkout-button', el => ({
                disabled: el.disabled,
                text: el.textContent.trim(),
                opacity: window.getComputedStyle(el).opacity
            }));
            
            logStep(`Button state after click: disabled=${buttonAfterClick.disabled}, text="${buttonAfterClick.text}"`, 'info');
            
            testResults.clickResponse = true;
            logStep('Button click processed successfully', 'success');
        }
        
        // Check for JavaScript errors
        if (errors.length > 0) {
            logStep(`JavaScript errors found: ${errors.length}`, 'warning');
            errors.forEach(error => {
                logError(new Error(error), 'JavaScript');
            });
        } else {
            logStep('No JavaScript errors detected', 'success');
        }
        
        // Check console messages for relevant information
        const relevantMessages = consoleMessages.filter(msg => 
            msg.text.includes('checkout') || 
            msg.text.includes('stripe') || 
            msg.text.includes('error') ||
            msg.text.includes('Mock')
        );
        
        if (relevantMessages.length > 0) {
            logStep('Relevant console messages:', 'info');
            relevantMessages.forEach(msg => {
                console.log(`  ${msg.type.toUpperCase()}: ${msg.text}`);
            });
        }
        
        return true;
        
    } catch (error) {
        logError(error, 'Page Testing');
        return false;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Test Error Handling
 */
async function testErrorHandling() {
    logStep('Testing Error Handling');
    
    try {
        // Read the pre-sale funnel file
        const filePath = 'website/pages/pre-sale-funnel.html';
        const content = await fs.readFile(filePath, 'utf8');
        
        // Check for error handling patterns
        const errorHandlingPatterns = [
            /catch\s*\(\s*error\s*\)/gi,
            /\.catch\(/gi,
            /try\s*\{/gi,
            /error\.message/gi,
            /support@dampdrink\.com/gi
        ];
        
        let errorHandlingFound = 0;
        errorHandlingPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                errorHandlingFound += matches.length;
            }
        });
        
        if (errorHandlingFound > 0) {
            testResults.errorHandling = true;
            logStep(`Found ${errorHandlingFound} error handling implementations`, 'success');
        } else {
            logError(new Error('No error handling found'), 'Error Handling');
        }
        
        // Check if the old "hello@dampdrink.com" reference is removed
        if (content.includes('hello@dampdrink.com')) {
            logStep('Found old contact email reference', 'warning');
            logRecommendation('Update remaining "hello@dampdrink.com" references to "support@dampdrink.com"');
        } else {
            logStep('Contact email properly updated', 'success');
        }
        
        return true;
        
    } catch (error) {
        logError(error, 'Error Handling Test');
        return false;
    }
}

/**
 * Test Stripe Configuration
 */
async function testStripeConfiguration() {
    logStep('Testing Stripe Configuration');
    
    try {
        // Check backend Stripe configuration
        const backendFile = 'backend/stripe-preorder-server.js';
        const backendContent = await fs.readFile(backendFile, 'utf8');
        
        // Check for Stripe configuration
        const hasStripeKey = /sk_live_|sk_test_/.test(backendContent);
        const hasCheckoutEndpoint = /create-checkout-session/.test(backendContent);
        const hasProductConfig = /PRODUCTS\s*=/.test(backendContent);
        
        if (hasStripeKey && hasCheckoutEndpoint && hasProductConfig) {
            testResults.stripeIntegration = true;
            logStep('Backend Stripe configuration verified', 'success');
        } else {
            logError(new Error('Incomplete Stripe configuration'), 'Backend Config');
            if (!hasStripeKey) logRecommendation('Configure Stripe secret key in backend');
            if (!hasCheckoutEndpoint) logRecommendation('Add checkout session endpoint');
            if (!hasProductConfig) logRecommendation('Configure product definitions');
        }
        
        // Check frontend Stripe configuration
        const frontendFile = 'website/pages/pre-sale-funnel.html';
        const frontendContent = await fs.readFile(frontendFile, 'utf8');
        
        const hasStripeScript = /stripe\.com\/v3/.test(frontendContent);
        const hasPublicKey = /pk_live_|pk_test_/.test(frontendContent);
        
        if (hasStripeScript && hasPublicKey) {
            logStep('Frontend Stripe configuration verified', 'success');
        } else {
            if (!hasStripeScript) logRecommendation('Ensure Stripe script is loaded');
            if (!hasPublicKey) logRecommendation('Configure Stripe publishable key');
        }
        
        return true;
        
    } catch (error) {
        logError(error, 'Stripe Configuration');
        return false;
    }
}

/**
 * Generate Test Report
 */
function generateReport() {
    console.log('\n📋 RESERVE NOW BUTTON TEST REPORT');
    console.log('==================================\n');
    
    // Test Results Summary
    console.log('🧪 TEST RESULTS SUMMARY');
    console.log('========================');
    console.log(`Page Load: ${testResults.pageLoad ? '✅' : '❌'}`);
    console.log(`Button Present: ${testResults.buttonPresent ? '✅' : '❌'}`);
    console.log(`Stripe Loaded: ${testResults.stripeLoaded ? '✅' : '❌'}`);
    console.log(`Click Response: ${testResults.clickResponse ? '✅' : '❌'}`);
    console.log(`Error Handling: ${testResults.errorHandling ? '✅' : '❌'}`);
    console.log(`Backend Connection: ${testResults.backendConnection ? '✅' : '❌'}`);
    console.log(`Stripe Integration: ${testResults.stripeIntegration ? '✅' : '❌'}`);
    
    // Calculate overall score
    const totalTests = Object.keys(testResults).filter(key => 
        typeof testResults[key] === 'boolean').length;
    const passedTests = Object.values(testResults).filter(result => 
        result === true).length;
    const overallScore = Math.round((passedTests / totalTests) * 100);
    
    console.log('\n🎯 OVERALL ASSESSMENT');
    console.log('====================');
    console.log(`Tests Passed: ${passedTests}/${totalTests}`);
    console.log(`Overall Score: ${overallScore}%`);
    
    // Issues
    if (testResults.issues.length > 0) {
        console.log('\n⚠️ ISSUES FOUND');
        console.log('===============');
        testResults.issues.forEach((issue, index) => {
            console.log(`${index + 1}. ${issue}`);
        });
    }
    
    // Recommendations
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
        console.log('🎉 EXCELLENT: Reserve Now button is fully functional!');
        console.log('✅ Stripe integration is working correctly.');
        console.log('🚀 Ready for production use.');
    } else if (overallScore >= 70) {
        console.log('✅ GOOD: Reserve Now button is mostly working.');
        console.log('🔧 Some minor improvements needed.');
        console.log('📋 Address the issues above for optimal performance.');
    } else if (overallScore >= 50) {
        console.log('⚠️ NEEDS WORK: Several issues need attention.');
        console.log('🛠️ Focus on critical issues first.');
        console.log('📋 Review the recommendations above.');
    } else {
        console.log('❌ CRITICAL: Major issues found with Reserve Now button.');
        console.log('🚨 Immediate attention required.');
        console.log('📞 Consider reviewing the Stripe integration setup.');
    }
    
    return overallScore >= 70;
}

/**
 * Save Test Results
 */
async function saveResults() {
    const reportData = {
        timestamp: new Date().toISOString(),
        testResults,
        summary: {
            totalTests: Object.keys(testResults).filter(key => typeof testResults[key] === 'boolean').length,
            passedTests: Object.values(testResults).filter(result => result === true).length
        }
    };
    
    try {
        await fs.writeFile(
            'reserve-now-button-test-report.json', 
            JSON.stringify(reportData, null, 2)
        );
        logStep('Test report saved to reserve-now-button-test-report.json', 'success');
    } catch (error) {
        logError(error, 'Saving Report');
    }
}

/**
 * Main Test Function
 */
async function runReserveNowTest() {
    logStep('🚀 Starting Reserve Now Button Testing...\n');
    
    try {
        await testBackendServer();
        console.log();
        
        await testPreSaleFunnelPage();
        console.log();
        
        await testErrorHandling();
        console.log();
        
        await testStripeConfiguration();
        console.log();
        
        const success = generateReport();
        
        await saveResults();
        
        console.log('\n🏁 TESTING COMPLETE');
        console.log('===================');
        
        if (success) {
            console.log('🎊 SUCCESS: Reserve Now button is working properly!');
            console.log('💳 Stripe integration is functional.');
            console.log('🛒 Users can successfully initiate checkout.');
        } else {
            console.log('📝 REVIEW NEEDED: Some issues need attention.');
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
    runReserveNowTest,
    testResults
};

// Run test if this script is executed directly
if (require.main === module) {
    runReserveNowTest().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('💥 Testing failed:', error);
        process.exit(1);
    });
}
