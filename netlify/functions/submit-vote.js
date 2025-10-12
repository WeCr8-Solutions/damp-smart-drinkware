/**
 * Netlify Function: Submit Vote
 * Handles both public and authenticated voting with duplicate prevention
 * Firebase is ONLY used for auth verification, NOT for vote storage
 */

// In-memory voting data (will be replaced with a database in production)
// For production, use: Netlify Blob Storage, Redis, or external DB
const votingData = {
  products: {
    handle: { votes: 0, name: 'DAMP Handle v1.0' },
    siliconeBottom: { votes: 0, name: 'Silicone Bottom v1.0' },
    cupSleeve: { votes: 0, name: 'Cup Sleeve v1.0' },
    babyBottle: { votes: 0, name: 'Baby Bottle v1.0' }
  },
  votes: new Map(), // fingerprint/userId -> { productId, timestamp, type }
  totalVotes: 0
};

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
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
    const { productId, fingerprint, userId, voteType } = JSON.parse(event.body);

    // Validate input
    if (!productId || !['handle', 'siliconeBottom', 'cupSleeve', 'babyBottle'].includes(productId)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid product ID' })
      };
    }

    if (voteType !== 'public' && voteType !== 'authenticated') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid vote type' })
      };
    }

    // Determine voter identifier
    const voterId = voteType === 'authenticated' ? userId : fingerprint;

    if (!voterId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing voter identifier' })
      };
    }

    // Check for duplicate vote
    if (votingData.votes.has(voterId)) {
      const existingVote = votingData.votes.get(voterId);
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          error: 'Already voted',
          message: `You already voted for ${votingData.products[existingVote.productId].name}`,
          existingVote
        })
      };
    }

    // Record the vote
    const voteRecord = {
      productId,
      timestamp: Date.now(),
      type: voteType,
      userAgent: event.headers['user-agent'] || 'unknown'
    };

    votingData.votes.set(voterId, voteRecord);
    votingData.products[productId].votes += 1;
    votingData.totalVotes += 1;

    console.log(`✅ Vote recorded: ${productId} (${voteType}) - Total: ${votingData.totalVotes}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Vote recorded for ${votingData.products[productId].name}`,
        vote: voteRecord,
        stats: {
          productVotes: votingData.products[productId].votes,
          totalVotes: votingData.totalVotes
        }
      })
    };

  } catch (error) {
    console.error('❌ Vote submission error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

