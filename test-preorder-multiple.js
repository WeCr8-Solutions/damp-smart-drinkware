import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51SEUgTEKvbimQFE20tNoUgGvSwSiNXC6L1BhEX69lZclAUcqjChvaYIN8xzbu46uWXEAZ12Yqp9H2UtnVAR48wDY00XYFKB1eW');

async function testPreOrderFlowWithMultipleProducts() {
    try {
        console.log('🚀 Testing Pre-order Flow with Multiple Products...\n');

        // 1. Create test customer
        console.log('1️⃣ Creating test customer...');
        const customer = await stripe.customers.create({
            email: 'test-preorder@dampdrink.com',
            source: 'tok_visa'
        });
        console.log(`✅ Test customer created: ${customer.id}`);

        // 2. Get pre-order products
        console.log('\n2️⃣ Fetching pre-order products...');
        const products = await stripe.products.list({
            active: true,
            limit: 3
        });

        const preOrderProducts = products.data.filter(p => p.metadata.pre_order === 'true');
        console.log(`✅ Found ${preOrderProducts.length} pre-order products`);

        if (preOrderProducts.length === 0) {
            throw new Error('No pre-order products found');
        }

        // 3. Create cart with multiple pre-order items
        console.log('\n3️⃣ Creating cart with multiple items...');
        const lineItems = preOrderProducts.map(product => ({
            price_data: {
                currency: 'usd',
                product: product.id,
                unit_amount: parseInt(product.metadata.deposit_amount)
            },
            quantity: 1
        }));

        // 4. Create checkout session
        console.log('\n4️⃣ Creating checkout session...');
        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: 'https://dampdrink.com/preorder-success',
            cancel_url: 'https://dampdrink.com/cancel',
            metadata: {
                pre_order: 'true',
                total_items: preOrderProducts.length.toString()
            }
        });

        console.log(`✅ Checkout session created: ${session.id}`);
        console.log(`✅ Total deposit amount: $${session.amount_total / 100}`);

        // 5. Calculate total remaining balance
        const totalRemainingBalance = preOrderProducts.reduce((sum, product) => 
            sum + parseInt(product.metadata.remaining_amount), 0);
        console.log(`✅ Total remaining balance: $${totalRemainingBalance / 100}`);

        // Clean up
        await stripe.customers.del(customer.id);
        console.log('\n✨ Test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testPreOrderFlowWithMultipleProducts();