const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS request (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    console.log('📊 Fetching Stripe checkout sessions...');

    // Get all successful checkout sessions
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      status: 'complete',
    });

    console.log(`✅ Found ${sessions.data.length} completed sessions`);

    // Count total sales and by product
    let totalSales = 0;
    const productSales = {
      'cup-sleeve': 0,
      'silicone-bottom': 0,
      'damp-handle': 0,
    };

    for (const session of sessions.data) {
      totalSales++;
      
      // Get line items to see which products were purchased
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          limit: 10,
        });

        for (const item of lineItems.data) {
          const description = (item.description || '').toLowerCase();
          
          if (description.includes('cup sleeve')) {
            productSales['cup-sleeve'] += item.quantity;
          } else if (description.includes('silicone bottom')) {
            productSales['silicone-bottom'] += item.quantity;
          } else if (description.includes('handle')) {
            productSales['damp-handle'] += item.quantity;
          }
        }
      } catch (lineItemError) {
        console.warn('⚠️ Could not fetch line items for session:', session.id);
      }
    }

    console.log('📊 Sales Stats:', { totalSales, productSales });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        totalSales,
        productSales,
        lastUpdated: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('❌ Error fetching sales stats:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch sales statistics',
        totalSales: 0,
        productSales: {
          'cup-sleeve': 0,
          'silicone-bottom': 0,
          'damp-handle': 0,
        },
      }),
    };
  }
};

