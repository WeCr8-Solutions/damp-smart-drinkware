const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
    // Enable CORS - Updated with working Standard key
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

        // Create checkout session with email receipts enabled
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: mode || 'payment',
            success_url,
            cancel_url,
            billing_address_collection: 'required',
            shipping_address_collection: shipping_address_collection || {
                allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH'],
            },
            metadata: {
                ...metadata,
                timestamp: new Date().toISOString(),
                source: metadata?.source || 'website'
            },
            allow_promotion_codes: true,
            phone_number_collection: {
                enabled: true,
            },
            automatic_tax: {
                enabled: false,
            },
            // Enable Stripe's automatic email receipts
            consent_collection: {
                terms_of_service: 'required'
            },
            // Stripe will send receipt automatically to customer_email
            customer_creation: 'always',
            // After successful payment, Stripe sends receipt email automatically
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

