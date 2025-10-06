const stripe = require('stripe')('sk_test_51SEUgTEKvbimQFE20tNoUgGvSwSiNXC6L1BhEX69lZclAUcqjChvaYIN8xzbu46uWXEAZ12Yqp9H2UtnVAR48wDY00XYFKB1eW');

async function createTestProducts() {
    try {
        // Create DAMP Handle v1.0 product
        const handleProduct = await stripe.products.create({
            name: 'DAMP Handle v1.0',
            description: 'Smart handle for your favorite drinkware',
            default_price_data: {
                currency: 'usd',
                unit_amount: 4999, // $49.99
            },
            metadata: {
                type: 'hardware',
                version: '1.0'
            }
        });

        console.log('✅ Created product:', handleProduct.name);
        console.log('Product ID:', handleProduct.id);
        console.log('Price ID:', handleProduct.default_price);

        // Create DAMP Silicone Bottom product
        const bottomProduct = await stripe.products.create({
            name: 'DAMP Silicone Bottom v1.0',
            description: 'Smart bottom for your drinkware',
            default_price_data: {
                currency: 'usd',
                unit_amount: 2999, // $29.99
            },
            metadata: {
                type: 'hardware',
                version: '1.0'
            }
        });

        console.log('\n✅ Created product:', bottomProduct.name);
        console.log('Product ID:', bottomProduct.id);
        console.log('Price ID:', bottomProduct.default_price);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createTestProducts();