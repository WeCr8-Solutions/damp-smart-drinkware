const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow GET
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { session_id } = event.queryStringParameters || {};

        if (!session_id) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing session_id parameter' })
            };
        }

        console.log('📡 Retrieving Stripe session:', session_id);

        // Retrieve the checkout session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id, {
            expand: ['line_items', 'customer', 'payment_intent']
        });

        console.log('✅ Session retrieved successfully');

        // Return session details (safe for client)
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                id: session.id,
                amount_total: session.amount_total,
                currency: session.currency,
                customer_email: session.customer_details?.email || session.customer_email,
                customer_details: {
                    email: session.customer_details?.email,
                    name: session.customer_details?.name
                },
                payment_status: session.payment_status,
                status: session.status,
                created: session.created,
                metadata: session.metadata,
                line_items: session.line_items?.data.map(item => ({
                    id: item.id,
                    description: item.description,
                    amount_total: item.amount_total,
                    quantity: item.quantity,
                    price: item.price?.unit_amount
                })) || []
            })
        };

    } catch (error) {
        console.error('❌ Error retrieving session:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to retrieve order details',
                details: error.message
            })
        };
    }
};

