// Netlify serverless function for creating Stripe checkout sessions
// DAMP Smart Drinkware Pre-Order System

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_LIVE_SECRET_KEY);

exports.handler = async (event, context) => {
    // Handle CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { line_items, mode, success_url, cancel_url, metadata, shipping_address_collection } = body;

        // Validate required fields
        if (!line_items || line_items.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'No line items provided' })
            };
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: mode || 'payment',
            success_url: success_url || `${process.env.URL}/pages/order-success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancel_url || `${process.env.URL}/pages/pre-sale-funnel.html`,
            shipping_address_collection: shipping_address_collection || {
                allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH']
            },
            billing_address_collection: 'required',
            metadata: {
                ...metadata,
                order_type: 'pre_order',
                estimated_delivery: 'Q2 2025',
                environment: process.env.CONTEXT || 'production'
            },
            payment_intent_data: {
                // For pre-orders - capture when ready to ship
                capture_method: 'manual',
                metadata: {
                    order_type: 'pre_order',
                    ...metadata
                }
            },
            phone_number_collection: {
                enabled: true
            },
            custom_text: {
                submit: {
                    message: 'Pre-order payment - Authorization only, charged at shipping'
                }
            },
            expires_at: Math.floor(Date.now() / 1000) + (30 * 60) // 30 minutes
        });

        console.log('✅ Checkout session created:', session.id);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                sessionId: session.id,
                id: session.id,
                url: session.url
            })
        };

    } catch (error) {
        console.error('❌ Stripe checkout error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message || 'Failed to create checkout session',
                support_email: 'support@dampdrink.com'
            })
        };
    }
};

