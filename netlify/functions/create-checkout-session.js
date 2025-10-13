const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
    // Enable CORS - Updated with new Stripe key
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        console.log('📡 Netlify Function: Creating Stripe checkout session...');
        
        const { line_items, mode, success_url, cancel_url, metadata, shipping_address_collection } = JSON.parse(event.body);

        if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
            throw new Error('Invalid line items');
        }

        console.log('📦 Line items:', JSON.stringify(line_items, null, 2));
        console.log('🔐 Using Stripe key:', process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET');

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: mode || 'payment',
            success_url,
            cancel_url,
            billing_address_collection: 'required',
            shipping_address_collection: shipping_address_collection || {
                allowed_countries: ['US'],
            },
            metadata: {
                ...metadata,
                timestamp: new Date().toISOString()
            },
            allow_promotion_codes: true,
            phone_number_collection: {
                enabled: true,
            },
            automatic_tax: {
                enabled: false, // Set to true if you have Stripe Tax enabled
            }
        });

        console.log('✅ Checkout session created:', session.id);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                sessionId: session.id,
                url: session.url 
            })
        };

    } catch (error) {
        console.error('❌ Error creating checkout session:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Unable to create checkout session',
                details: error.message
            })
        };
    }
};

