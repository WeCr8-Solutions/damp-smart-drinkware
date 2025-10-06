import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51SEUgTEKvbimQFE20tNoUgGvSwSiNXC6L1BhEX69lZclAUcqjChvaYIN8xzbu46uWXEAZ12Yqp9H2UtnVAR48wDY00XYFKB1eW');

const products = [
    {
        name: 'DAMP Smart Handle - Early Bird',
        description: 'Be among the first to experience the DAMP Smart Handle. Pre-order now at a special early bird price.',
        images: ['https://dampdrink.com/assets/images/handle-v1.jpg'],
        metadata: {
            pre_order: 'true',
            deposit_amount: '2500', // $25.00
            remaining_amount: '2500', // $25.00
            total_amount: '5000',    // $50.00
            estimated_delivery: '2025-12-01'
        }
    },
    {
        name: 'DAMP Smart Bottle - Limited Edition',
        description: 'Pre-order the limited edition DAMP Smart Bottle. Features exclusive design and early access to advanced features.',
        images: ['https://dampdrink.com/assets/images/bottle-limited.jpg'],
        metadata: {
            pre_order: 'true',
            deposit_amount: '3500', // $35.00
            remaining_amount: '3500', // $35.00
            total_amount: '7000',    // $70.00
            estimated_delivery: '2025-12-01'
        }
    },
    {
        name: 'DAMP Bundle - Early Access',
        description: 'Get the complete DAMP experience with this exclusive bundle. Includes Smart Handle and Smart Bottle.',
        images: ['https://dampdrink.com/assets/images/bundle.jpg'],
        metadata: {
            pre_order: 'true',
            deposit_amount: '5000', // $50.00
            remaining_amount: '5000', // $50.00
            total_amount: '10000',   // $100.00
            estimated_delivery: '2025-12-01'
        }
    }
];

async function createTestProducts() {
    try {
        console.log('🚀 Creating test pre-order products...\n');

        for (const productData of products) {
            // Create product
            const product = await stripe.products.create({
                name: productData.name,
                description: productData.description,
                images: productData.images,
                metadata: productData.metadata
            });

            console.log(`✅ Created product: ${product.name}`);

            // Create deposit price
            const depositPrice = await stripe.prices.create({
                product: product.id,
                unit_amount: parseInt(productData.metadata.deposit_amount),
                currency: 'usd',
                metadata: {
                    type: 'deposit'
                }
            });

            console.log(`  💰 Deposit price created: $${depositPrice.unit_amount / 100}`);

            // Create full price
            const fullPrice = await stripe.prices.create({
                product: product.id,
                unit_amount: parseInt(productData.metadata.total_amount),
                currency: 'usd',
                metadata: {
                    type: 'full'
                }
            });

            console.log(`  💰 Full price created: $${fullPrice.unit_amount / 100}\n`);
        }

        console.log('✨ All test products created successfully!');

    } catch (error) {
        console.error('❌ Error creating test products:', error);
        process.exit(1);
    }
}

createTestProducts();