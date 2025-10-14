const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const sig = event.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_LIVE_WEBHOOK_SECRET;

        let stripeEvent;

        // Verify webhook signature if secret is available
        if (webhookSecret) {
            try {
                stripeEvent = stripe.webhooks.constructEvent(
                    event.body,
                    sig,
                    webhookSecret
                );
                console.log('✅ Webhook signature verified');
            } catch (err) {
                console.error('❌ Webhook signature verification failed:', err.message);
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Webhook signature verification failed' })
                };
            }
        } else {
            // Parse body without verification (for testing)
            console.warn('⚠️ No webhook secret - processing without verification');
            stripeEvent = JSON.parse(event.body);
        }

        console.log('📡 Stripe webhook event:', stripeEvent.type);

        // Handle different event types
        switch (stripeEvent.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(stripeEvent.data.object);
                break;

            case 'payment_intent.succeeded':
                await handlePaymentSucceeded(stripeEvent.data.object);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentFailed(stripeEvent.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${stripeEvent.type}`);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ received: true })
        };

    } catch (error) {
        console.error('❌ Webhook error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Webhook handler error', details: error.message })
        };
    }
};

async function handleCheckoutCompleted(session) {
    console.log('✅ Checkout completed:', session.id);
    console.log('📧 Customer email:', session.customer_details?.email || session.customer_email);
    console.log('💰 Amount:', session.amount_total / 100, session.currency.toUpperCase());
    
    try {
        // Send confirmation email
        await sendOrderConfirmationEmail(session);
        
        // Save order to database (if you have one)
        await saveOrderToDatabase(session);
        
        console.log('✅ Order processed successfully');
        
    } catch (error) {
        console.error('❌ Error processing order:', error);
    }
}

async function handlePaymentSucceeded(paymentIntent) {
    console.log('✅ Payment succeeded:', paymentIntent.id);
    console.log('💰 Amount:', paymentIntent.amount / 100, paymentIntent.currency.toUpperCase());
}

async function handlePaymentFailed(paymentIntent) {
    console.log('❌ Payment failed:', paymentIntent.id);
    console.error('Failure reason:', paymentIntent.last_payment_error?.message);
}

async function sendOrderConfirmationEmail(session) {
    console.log('📧 Sending order confirmation email...');
    
    const customerEmail = session.customer_details?.email || session.customer_email;
    
    if (!customerEmail) {
        console.warn('⚠️ No customer email found - skipping email');
        return;
    }
    
    // Email details with refund policy information
    const emailData = {
        to: customerEmail,
        subject: `Order Confirmation - DAMP Smart Drinkware (Order #${session.id.substring(0, 12)})`,
        orderNumber: session.id,
        customerName: session.customer_details?.name || 'Valued Customer',
        orderDate: new Date(session.created * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        totalAmount: (session.amount_total / 100).toFixed(2),
        currency: session.currency.toUpperCase(),
        items: session.line_items?.data || [],
        metadata: session.metadata || {},
        refundPolicy: {
            fullRefundIf: 'Goal not met or within 30 days before production',
            processingTime: '5-10 business days',
            expectedDelivery: '90-120 days after 500 reservations reached',
            contactEmail: 'support@dampdrink.com',
            policyUrl: 'https://dampdrink.com/pages/terms.html#refund-policy'
        },
        deliveryTimeline: {
            manufacturing: '30-45 days',
            qualityTesting: '14-21 days',
            shipping: '30-45 days',
            total: '90-120 days after goal met'
        }
    };
    
    // TODO: Integrate with email service (SendGrid, Postmark, etc.)
    // For now, log the email data
    console.log('📧 Email data prepared:', {
        to: emailData.to,
        subject: emailData.subject,
        orderNumber: emailData.orderNumber.substring(0, 20) + '...',
        amount: emailData.totalAmount
    });
    
    // Note: Actual email sending would go here
    // Example: await sendgrid.send(emailData);
    
    return emailData;
}

async function saveOrderToDatabase(session) {
    console.log('💾 Saving order to database...');
    
    const orderData = {
        orderId: session.id,
        customerId: session.customer,
        customerEmail: session.customer_details?.email || session.customer_email,
        amount: session.amount_total,
        currency: session.currency,
        status: session.payment_status,
        metadata: session.metadata,
        createdAt: new Date(session.created * 1000).toISOString(),
        items: session.line_items?.data || []
    };
    
    // TODO: Save to your database (Firebase, Supabase, etc.)
    // For now, just log it
    console.log('💾 Order data prepared for storage:', {
        orderId: orderData.orderId.substring(0, 20) + '...',
        email: orderData.customerEmail,
        amount: orderData.amount / 100
    });
    
    return orderData;
}

