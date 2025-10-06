const testConfig = {
  // Browser-based tests
  browserTests: [
    {
      name: 'Cart Flow Test',
      file: 'test-browser-cart-flow.html',
      type: 'browser',
      description: 'Tests the shopping cart flow in browser'
    }
  ],
  
  // Verification tests
  verificationTests: [
    {
      name: 'Cart & Checkout Verification',
      file: 'verify-cart-checkout-process.js',
      type: 'verification',
      description: 'Comprehensive cart and checkout system verification'
    }
  ],
  
  // JavaScript tests
  automatedTests: [
    {
      name: 'Cart Checkout Process',
      file: 'test-cart-checkout-process.js',
      type: 'node',
      description: 'Validates the cart checkout process'
    },
    {
      name: 'Firebase Live Integration',
      file: 'test-firebase-live.js',
      type: 'node',
      description: 'Tests live Firebase integration'
    },
    {
      name: 'Functions Validation',
      file: 'test-functions-validation.js',
      type: 'node',
      description: 'Validates Firebase Functions'
    },
    {
      name: 'Funnel Flow',
      file: 'test-funnel-flow.js',
      type: 'node',
      description: 'Tests the sales funnel flow'
    },
    {
      name: 'Hamburger Menu',
      file: 'test-hamburger-menu.js',
      type: 'node',
      description: 'Tests hamburger menu functionality'
    },
    {
      name: 'Navigation',
      file: 'test-navigation.js',
      type: 'node',
      description: 'Tests site navigation'
    },
    {
      name: 'Preorder Funnel Improvements',
      file: 'test-preorder-funnel-improvements.js',
      type: 'node',
      description: 'Tests improved preorder funnel'
    },
    {
      name: 'Multiple Preorder',
      file: 'test-preorder-multiple.js',
      type: 'node',
      description: 'Tests multiple item preorder functionality'
    },
    {
      name: 'Production Cart Checkout',
      file: 'test-production-cart-checkout.js',
      type: 'node',
      description: 'Tests production cart checkout flow'
    },
    {
      name: 'Reserve Now Button',
      file: 'test-reserve-now-button.js',
      type: 'node',
      description: 'Tests reserve now button functionality'
    }
  ],
  
  // Documentation and workflow tests
  workflowTests: [
    {
      name: 'Lighthouse Workflow',
      file: 'test-lighthouse-workflow.md',
      type: 'doc',
      description: 'Lighthouse testing workflow documentation'
    }
  ]
};

module.exports = testConfig;