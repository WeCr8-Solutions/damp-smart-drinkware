// Stripe Configuration for DAMP Smart Drinkware
// This file provides Stripe keys for client-side checkout

const STRIPE_CONFIG = {
    // Use test keys for development/testing
    publishableKey: 'pk_test_51SEUgTEKvbimQFE20tNoUgGvSwSiNXC6L1BhEX69lZclAUcqjChvaYIN8xzbu46uWXEAZ12Yqp9H2UtnVAR48wDY00XYFKB1eW',
    
    // Product Price IDs from Stripe
    priceIds: {
        'damp-handle': 'price_1S4fcaCcrIDahSGRrRnzNYg5',
        'silicone-bottom': 'price_1S4fcMCcrIDahSGRwxsErFa0',
        'cup-sleeve': 'price_sleeve_preorder_id',
        'baby-bottle': 'price_baby_preorder_id'
    },
    
    // API endpoint for creating checkout sessions
    apiEndpoint: '/api/create-checkout-session',
    
    // Success and cancel URLs
    successUrl: window.location.origin + '/pages/success.html',
    cancelUrl: window.location.origin + '/pages/cart.html'
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = STRIPE_CONFIG;
}

