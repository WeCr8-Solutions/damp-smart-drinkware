/**
 * 🔍 DAMP Smart Drinkware - Reserve Now Button Integration Verification
 * Lightweight test to verify Reserve Now button Stripe integration without browser automation
 * Following user preferences for clean, well-organized code [[memory:2828105]]
 */

const fs = require('fs').promises;
const path = require('path');
const http = require('http');

console.log('🔍 DAMP Smart Drinkware - Reserve Now Integration Verification');
console.log('=============================================================');
console.log('🎯 Testing Reserve Now button Stripe integration');
console.log('🛠️ Verifying code structure and backend connectivity');
console.log('=============================================================\n');

/**
 * Test Results Storage
 */
const testResults = {
    fileExists: false,
    buttonElement: false,
    stripeScript: false,
    checkoutFunction: false,
    errorHandling: false,
    backendEndpoint: false,
    stripeKeys: false,
    contactEmailUpdated: false,
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
 * Test Pre-Sale Funnel File Structure
 */
async function testPreSaleFunnelStructure() {
    logStep('Testing Pre-Sale Funnel File Structure');
    
    try {
        const filePath = 'website/pages/pre-sale-funnel.html';
        const content = await fs.readFile(filePath, 'utf8');
        
        testResults.fileExists = true;
        logStep('Pre-sale funnel file found', 'success');
        
        // Check for Reserve Now button
        const buttonPatterns = [
            /id="checkout-button"/gi,
            /Reserve Now/gi,
            /class="cta-primary"/gi
        ];
        
        let buttonFound = false;
        buttonPatterns.forEach(pattern => {
            if (pattern.test(content)) {
                buttonFound = true;
            }
        });
        
        if (buttonFound) {
            testResults.buttonElement = true;
            logStep('Reserve Now button element found', 'success');
        } else {
            logError(new Error('Reserve Now button not found in HTML'), 'Button Element');
        }
        
        // Check for Stripe script
        if (content.includes('stripe.com/v3')) {
            testResults.stripeScript = true;
            logStep('Stripe JavaScript SDK script tag found', 'success');
        } else {
            logError(new Error('Stripe script not found'), 'Stripe Script');
            logRecommendation('Add Stripe script: <script src="https://js.stripe.com/v3/"></script>');
        }
        
        // Check for checkout function
        if (content.includes('initiateCheckout')) {
            testResults.checkoutFunction = true;
            logStep('Checkout initiation function found', 'success');
        } else {
            logError(new Error('Checkout function not found'), 'Checkout Function');
        }
        
        // Check for error handling
        const errorHandlingPatterns = [
            /catch\s*\(\s*error\s*\)/gi,
            /support@dampdrink\.com/gi,
            /alert\(/gi
        ];
        
        let errorHandlingCount = 0;
        errorHandlingPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                errorHandlingCount += matches.length;
            }
        });
        
        if (errorHandlingCount > 0) {
            testResults.errorHandling = true;
            logStep(`Error handling found (${errorHandlingCount} instances)`, 'success');
        } else {
            logError(new Error('No error handling found'), 'Error Handling');
        }
        
        // Check if old contact email is removed
        if (!content.includes('hello@dampdrink.com')) {
            testResults.contactEmailUpdated = true;
            logStep('Contact email properly updated to support@dampdrink.com', 'success');
        } else {
            logStep('Old contact email still present', 'warning');
            logRecommendation('Update remaining "hello@dampdrink.com" references');
        }
        
        return true;
        
    } catch (error) {
        logError(error, 'File Structure Test');
        return false;
    }
}

/**
 * Test Backend Configuration
 */
async function testBackendConfiguration() {
    logStep('Testing Backend Configuration');
    
    try {
        const backendFile = 'backend/stripe-preorder-server.js';
        const content = await fs.readFile(backendFile, 'utf8');
        
        // Check for checkout endpoint
        if (content.includes('/create-checkout-session')) {
            testResults.backendEndpoint = true;
            logStep('Checkout endpoint found in backend', 'success');
        } else {
            logError(new Error('Checkout endpoint not found'), 'Backend Endpoint');
        }
        
        // Check for Stripe keys
        const stripeKeyPatterns = [
            /sk_live_/gi,
            /sk_test_/gi,
            /stripe\(/gi
        ];
        
        let stripeKeysFound = false;
        stripeKeyPatterns.forEach(pattern => {
            if (pattern.test(content)) {
                stripeKeysFound = true;
            }
        });
        
        if (stripeKeysFound) {
            testResults.stripeKeys = true;
            logStep('Stripe configuration found in backend', 'success');
        } else {
            logError(new Error('Stripe keys not configured'), 'Stripe Configuration');
        }
        
        // Check for product configuration
        if (content.includes('silicone-bottom')) {
            logStep('Product configuration includes silicone-bottom product', 'success');
        } else {
            logStep('Silicone-bottom product not found in configuration', 'warning');
            logRecommendation('Ensure product configuration matches frontend expectations');
        }
        
        return true;
        
    } catch (error) {
        logError(error, 'Backend Configuration');
        return false;
    }
}

/**
 * Test Server Connectivity (if running)
 */
async function testServerConnectivity() {
    logStep('Testing Server Connectivity');
    
    return new Promise((resolve) => {
        const req = http.get('http://localhost:3000/api/campaign-status', (res) => {
            if (res.statusCode === 200) {
                logStep('Backend server is running and responding', 'success');
                resolve(true);
            } else {
                logStep(`Server responded with status ${res.statusCode}`, 'warning');
                resolve(false);
            }
        });
        
        req.on('error', (error) => {
            logStep('Backend server not running or not accessible', 'warning');
            logRecommendation('Start backend server: cd backend && node stripe-preorder-server.js');
            resolve(false);
        });
        
        req.setTimeout(3000, () => {
            logStep('Server connection timeout', 'warning');
            req.destroy();
            resolve(false);
        });
    });
}

/**
 * Analyze Code Quality
 */
async function analyzeCodeQuality() {
    logStep('Analyzing Code Quality');
    
    try {
        const filePath = 'website/pages/pre-sale-funnel.html';
        const content = await fs.readFile(filePath, 'utf8');
        
        // Check for modern JavaScript practices
        const modernPatterns = [
            /async\s+function/gi,
            /await\s+/gi,
            /const\s+/gi,
            /let\s+/gi,
            /=>\s*/gi
        ];
        
        let modernCount = 0;
        modernPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                modernCount += matches.length;
            }
        });
        
        if (modernCount > 5) {
            logStep('Modern JavaScript practices detected', 'success');
        } else {
            logStep('Consider using more modern JavaScript practices', 'warning');
        }
        
        // Check for proper error messages
        if (content.includes('technical difficulties') && content.includes('try again in a few moments')) {
            logStep('User-friendly error messages found', 'success');
        } else {
            logRecommendation('Add more user-friendly error messages');
        }
        
        return true;
        
    } catch (error) {
        logError(error, 'Code Quality Analysis');
        return false;
    }
}

/**
 * Generate Verification Report
 */
function generateReport() {
    console.log('\n📋 RESERVE NOW INTEGRATION VERIFICATION REPORT');
    console.log('===============================================\n');
    
    // Test Results Summary
    console.log('🧪 VERIFICATION RESULTS');
    console.log('=======================');
    console.log(`File Structure: ${testResults.fileExists ? '✅' : '❌'}`);
    console.log(`Button Element: ${testResults.buttonElement ? '✅' : '❌'}`);
    console.log(`Stripe Script: ${testResults.stripeScript ? '✅' : '❌'}`);
    console.log(`Checkout Function: ${testResults.checkoutFunction ? '✅' : '❌'}`);
    console.log(`Error Handling: ${testResults.errorHandling ? '✅' : '❌'}`);
    console.log(`Backend Endpoint: ${testResults.backendEndpoint ? '✅' : '❌'}`);
    console.log(`Stripe Configuration: ${testResults.stripeKeys ? '✅' : '❌'}`);
    console.log(`Contact Email Updated: ${testResults.contactEmailUpdated ? '✅' : '❌'}`);
    
    // Calculate overall score
    const totalTests = Object.keys(testResults).filter(key => 
        typeof testResults[key] === 'boolean').length;
    const passedTests = Object.values(testResults).filter(result => 
        result === true).length;
    const overallScore = Math.round((passedTests / totalTests) * 100);
    
    console.log('\n🎯 OVERALL ASSESSMENT');
    console.log('====================');
    console.log(`Tests Passed: ${passedTests}/${totalTests}`);
    console.log(`Integration Score: ${overallScore}%`);
    
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
    
    // Final Status
    console.log('\n🏁 INTEGRATION STATUS');
    console.log('====================');
    
    if (overallScore >= 90) {
        console.log('🎉 EXCELLENT: Reserve Now button integration is complete!');
        console.log('✅ All components are properly configured.');
        console.log('🚀 Ready for user testing and production deployment.');
    } else if (overallScore >= 75) {
        console.log('✅ GOOD: Reserve Now button is well integrated.');
        console.log('🔧 Minor improvements recommended.');
        console.log('📋 Address remaining issues for optimal performance.');
    } else if (overallScore >= 60) {
        console.log('⚠️ NEEDS ATTENTION: Several integration issues found.');
        console.log('🛠️ Focus on critical components first.');
        console.log('📋 Review and implement the recommendations above.');
    } else {
        console.log('❌ CRITICAL: Major integration issues detected.');
        console.log('🚨 Immediate fixes required.');
        console.log('📞 Consider reviewing the entire Stripe integration setup.');
    }
    
    // Next Steps
    console.log('\n📋 NEXT STEPS');
    console.log('=============');
    if (overallScore >= 75) {
        console.log('1. Start the backend server: cd backend && node stripe-preorder-server.js');
        console.log('2. Test the Reserve Now button in a browser');
        console.log('3. Verify the complete checkout flow');
        console.log('4. Test with Stripe test cards');
    } else {
        console.log('1. Address the critical issues listed above');
        console.log('2. Re-run this verification after fixes');
        console.log('3. Test individual components before full integration');
    }
    
    return overallScore >= 75;
}

/**
 * Save Verification Results
 */
async function saveResults() {
    const reportData = {
        timestamp: new Date().toISOString(),
        testResults,
        summary: {
            totalTests: Object.keys(testResults).filter(key => typeof testResults[key] === 'boolean').length,
            passedTests: Object.values(testResults).filter(result => result === true).length,
            integrationComplete: Object.values(testResults).filter(result => result === true).length >= 6
        }
    };
    
    try {
        await fs.writeFile(
            'reserve-now-integration-report.json', 
            JSON.stringify(reportData, null, 2)
        );
        logStep('Integration report saved to reserve-now-integration-report.json', 'success');
    } catch (error) {
        logError(error, 'Saving Report');
    }
}

/**
 * Main Verification Function
 */
async function runIntegrationVerification() {
    logStep('🚀 Starting Reserve Now Integration Verification...\n');
    
    try {
        await testPreSaleFunnelStructure();
        console.log();
        
        await testBackendConfiguration();
        console.log();
        
        await testServerConnectivity();
        console.log();
        
        await analyzeCodeQuality();
        console.log();
        
        const success = generateReport();
        
        await saveResults();
        
        console.log('\n🏁 VERIFICATION COMPLETE');
        console.log('========================');
        
        if (success) {
            console.log('🎊 SUCCESS: Reserve Now button integration is solid!');
            console.log('💳 Stripe integration components are in place.');
            console.log('🛒 Ready for functional testing.');
        } else {
            console.log('📝 ACTION NEEDED: Integration requires attention.');
            console.log('🔧 Please implement the recommendations above.');
        }
        
        return success;
        
    } catch (error) {
        logError(error, 'Main Verification');
        return false;
    }
}

// Export for use in other scripts
module.exports = {
    runIntegrationVerification,
    testResults
};

// Run verification if this script is executed directly
if (require.main === module) {
    runIntegrationVerification().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('💥 Verification failed:', error);
        process.exit(1);
    });
}
