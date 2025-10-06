const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });

exports.createCheckoutSession = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        try {
            const { line_items, mode, success_url, cancel_url, metadata } = req.body;

            if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
                throw new Error('Invalid line items');
            }

            // Create checkout session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items,
                mode: mode || 'payment',
                success_url,
                cancel_url,
                billing_address_collection: 'required',
                shipping_address_collection: {
                    allowed_countries: ['US'], // Expand as needed
                },
                metadata: {
                    ...metadata,
                    timestamp: new Date().toISOString()
                },
                shipping_options: [
                    {
                        shipping_rate_data: {
                            type: 'fixed_amount',
                            fixed_amount: {
                                amount: 999, // $9.99
                                currency: 'usd',
                            },
                            display_name: 'Standard Shipping',
                            delivery_estimate: {
                                minimum: {
                                    unit: 'business_day',
                                    value: 5,
                                },
                                maximum: {
                                    unit: 'business_day',
                                    value: 7,
                                },
                            },
                        },
                    },
                    {
                        shipping_rate_data: {
                            type: 'fixed_amount',
                            fixed_amount: {
                                amount: 0,
                                currency: 'usd',
                            },
                            display_name: 'Free Shipping',
                            delivery_estimate: {
                                minimum: {
                                    unit: 'business_day',
                                    value: 5,
                                },
                                maximum: {
                                    unit: 'business_day',
                                    value: 7,
                                },
                            },
                        },
                    },
                ],
                allow_promotion_codes: true,
                phone_number_collection: {
                    enabled: true,
                },
                automatic_tax: {
                    enabled: true,
                }
            });

            return res.status(200).json({ sessionId: session.id });
        } catch (error) {
            console.error('Error creating checkout session:', error);
            return res.status(500).json({
                error: 'Unable to create checkout session',
                details: error.message
            });
        }
    });
});