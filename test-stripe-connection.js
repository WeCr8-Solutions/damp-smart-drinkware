const stripe = require('stripe')('sk_test_51SEUgTEKvbimQFE20tNoUgGvSwSiNXC6L1BhEX69lZclAUcqjChvaYIN8xzbu46uWXEAZ12Yqp9H2UtnVAR48wDY00XYFKB1eW');

async function verifyStripeConnection() {
    try {
        // Test customers list
        const customers = await stripe.customers.list({ limit: 3 });
        console.log('✅ Stripe connection successful!');
        console.log(`Found ${customers.data.length} customers`);

        // Test products list
        const products = await stripe.products.list({ limit: 5 });
        console.log(`Found ${products.data.length} products`);
        products.data.forEach(product => {
            console.log(`- ${product.name}: ${product.id}`);
        });

        // Test prices
        const prices = await stripe.prices.list({ limit: 5 });
        console.log(`Found ${prices.data.length} prices`);
        prices.data.forEach(price => {
            console.log(`- ${price.nickname || 'Unnamed Price'}: ${(price.unit_amount / 100).toFixed(2)} ${price.currency}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

verifyStripeConnection();