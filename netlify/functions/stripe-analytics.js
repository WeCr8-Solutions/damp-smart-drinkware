// Netlify serverless function to fetch real Stripe sales data
// DAMP Smart Drinkware - Real Sales Analytics

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_LIVE_SECRET_KEY);

exports.handler = async (event, context) => {
    // Handle CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Get successful payment intents from last 30 days
        const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
        
        // Fetch successful charges
        const charges = await stripe.charges.list({
            limit: 100,
            created: { gte: thirtyDaysAgo }
        });

        // Calculate real statistics
        const successfulCharges = charges.data.filter(charge => charge.status === 'succeeded');
        
        const analytics = {
            totalPreOrders: successfulCharges.length,
            totalRevenue: successfulCharges.reduce((sum, charge) => sum + charge.amount, 0) / 100, // Convert cents to dollars
            averageOrderValue: successfulCharges.length > 0 
                ? (successfulCharges.reduce((sum, charge) => sum + charge.amount, 0) / successfulCharges.length / 100).toFixed(2)
                : 0,
            lastOrderDate: successfulCharges.length > 0 
                ? new Date(successfulCharges[0].created * 1000).toISOString()
                : null,
            productBreakdown: {},
            recentOrders: successfulCharges.slice(0, 5).map(charge => ({
                id: charge.id,
                amount: charge.amount / 100,
                date: new Date(charge.created * 1000).toISOString(),
                currency: charge.currency
            }))
        };

        // Get product-specific data from payment intents
        try {
            const paymentIntents = await stripe.paymentIntents.list({
                limit: 100,
                created: { gte: thirtyDaysAgo }
            });

            // Analyze metadata for product breakdown
            const productCounts = {};
            paymentIntents.data.forEach(intent => {
                if (intent.status === 'succeeded' && intent.metadata) {
                    const products = intent.metadata.cart_items || intent.metadata.products;
                    if (products) {
                        try {
                            const parsedProducts = JSON.parse(products);
                            Object.keys(parsedProducts).forEach(productId => {
                                productCounts[productId] = (productCounts[productId] || 0) + parsedProducts[productId];
                            });
                        } catch (e) {
                            // Skip if can't parse
                        }
                    }
                }
            });

            analytics.productBreakdown = productCounts;
        } catch (error) {
            console.error('Error fetching payment intents:', error);
        }

        console.log('✅ Real Stripe analytics fetched:', {
            orders: analytics.totalPreOrders,
            revenue: analytics.totalRevenue
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: analytics,
                timestamp: new Date().toISOString(),
                dataSource: 'stripe_live'
            })
        };

    } catch (error) {
        console.error('❌ Stripe analytics error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to fetch analytics',
                message: error.message
            })
        };
    }
};

